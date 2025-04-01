
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { format, parseISO, addDays } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { InfoIcon, XIcon, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Papa from "papaparse";

// Import or define the Announcement interface
interface Announcement {
  id: string;
  symbol: string;
  header: string;
  message: string;
  date: string;
  amount: number;
  created_at: string;
}

interface DividendData {
  Symbol: string;
  title: string;
  dividendRate: number;
  previousClose: number;
  currentPrice: number;
  dividendYield: number;
  payoutRatio: number;
  AnnualRate: number;
  message: string;
  ExDividendDate: string;
  DividendDate: string;
  EarningsDate: string;
  PayoutDate: string;
  Message: string;
  buy_date: string;
  insight: string;
  type: string;
  shortname: string;
  quoteType: string;
  Historical: string;
  date: string;
  industry: string;
  employees: number;
  founded: string;
  address: string;
  CEO: string;
  website: string;
  description: string;
  logoUrl: string;
  domain: string;
  announcements?: Announcement[];
}

const Dividend = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get("type") || "buy";
  const [selectedFilter, setSelectedFilter] = useState<string>(typeParam);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
  });
  const [dividendData, setDividendData] = useState<DividendData[]>([]);
  const [filteredData, setFilteredData] = useState<DividendData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof DividendData;
    direction: "ascending" | "descending";
  } | null>(null);
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [cardPosition, setCardPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [hoverInfo, setHoverInfo] = useState<{
    stock: DividendData;
    exDividendDate: string;
    dividendDate: string;
    position: { x: number; y: number };
  } | null>(null);
  
  // Reference for handling outside clicks
  const expandedCardRef = useRef<HTMLDivElement>(null);
  
  // Fetch dividend data from Supabase
  useEffect(() => {
    const fetchDividendData = async () => {
      try {
        const { data, error } = await supabase
          .from("dividend")
          .select("*");
        
        if (error) throw error;
        
        // For each stock, fetch announcements
        const dataWithAnnouncements = await Promise.all(
          data.map(async (stock) => {
            // Fetch announcements for this stock symbol
            const { data: announcements, error: announcementError } = await supabase
              .from("dividend_announcements")
              .select("*")
              .eq("symbol", stock.symbol);
            
            if (announcementError) {
              console.error("Error fetching announcements:", announcementError);
              return {
                ...stock,
                Symbol: stock.symbol,
                title: stock.shortname,
                dividendRate: stock.dividendrate,
                previousClose: stock.previousclose,
                currentPrice: stock.currentprice,
                dividendYield: stock.dividendyield,
                payoutRatio: stock.payoutratio,
                AnnualRate: 0, // Calculate or set default
                message: stock.message || "",
                ExDividendDate: stock.exdividenddate,
                DividendDate: stock.dividenddate,
                EarningsDate: stock.earningsdate,
                PayoutDate: stock.payoutdate,
                Message: stock.message || "",
                buy_date: stock.buy_date,
                insight: stock.insight || "",
                type: "stock",
                shortname: stock.shortname,
                quoteType: stock.quotetype,
                Historical: stock.hist || "",
                date: stock.date || "",
                industry: "",
                employees: 0,
                founded: "",
                address: "",
                CEO: "",
                website: "",
                description: "",
                logoUrl: "",
                domain: stock.domain || "",
              };
            }
            
            return {
              ...stock,
              Symbol: stock.symbol,
              title: stock.shortname,
              dividendRate: stock.dividendrate,
              previousClose: stock.previousclose,
              currentPrice: stock.currentprice,
              dividendYield: stock.dividendyield,
              payoutRatio: stock.payoutratio,
              AnnualRate: 0, // Calculate or set default
              message: stock.message || "",
              ExDividendDate: stock.exdividenddate,
              DividendDate: stock.dividenddate,
              EarningsDate: stock.earningsdate,
              PayoutDate: stock.payoutdate,
              Message: stock.message || "",
              buy_date: stock.buy_date,
              insight: stock.insight || "",
              type: "stock",
              shortname: stock.shortname,
              quoteType: stock.quotetype,
              Historical: stock.hist || "",
              date: stock.date || "",
              industry: "",
              employees: 0,
              founded: "",
              address: "",
              CEO: "",
              website: "",
              description: "",
              logoUrl: "",
              domain: stock.domain || "",
              announcements: announcements,
            };
          })
        );
        
        setDividendData(dataWithAnnouncements);
        filterData(dataWithAnnouncements, selectedFilter, date, searchTerm);
      } catch (error) {
        console.error("Error fetching dividend data:", error);
        toast.error("Failed to load dividend data");
      }
    };
    
    // Also fetch CSV data as a fallback
    const fetchCSVData = () => {
      Papa.parse("/dividends.csv", {
        download: true,
        header: true,
        complete: function (results) {
          const csvData = results.data.map((item: any) => ({
            Symbol: item.Symbol,
            title: item.Name,
            dividendRate: parseFloat(item.DividendRate) || 0,
            previousClose: parseFloat(item.PreviousClose) || 0,
            currentPrice: parseFloat(item.CurrentPrice) || 0,
            dividendYield: parseFloat(item.DividendYield) || 0,
            payoutRatio: parseFloat(item.PayoutRatio) || 0,
            AnnualRate: parseFloat(item.AnnualDividendRate) || 0,
            message: item.Message || "",
            ExDividendDate: item.ExDividendDate,
            DividendDate: item.DividendDate,
            EarningsDate: item.EarningsDate,
            PayoutDate: item.PayoutDate,
            Message: item.Message || "",
            buy_date: item.BuyDate,
            insight: item.Insight || "",
            type: "stock",
            shortname: item.Name,
            quoteType: "EQUITY",
            Historical: "",
            date: "",
            industry: item.Industry || "",
            employees: parseInt(item.Employees) || 0,
            founded: item.Founded || "",
            address: item.Address || "",
            CEO: item.CEO || "",
            website: item.Website || "",
            description: item.Description || "",
            logoUrl: item.LogoURL || "",
            domain: item.Domain || "",
          }));
          
          if (dividendData.length === 0) {
            setDividendData(csvData);
            filterData(csvData, selectedFilter, date, searchTerm);
          }
        },
      });
    };
    
    fetchDividendData();
    fetchCSVData();
  }, []);
  
  // Filter data based on selected filter and date range
  useEffect(() => {
    filterData(dividendData, selectedFilter, date, searchTerm);
  }, [selectedFilter, date, searchTerm]);
  
  // Handle filter change
  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    setSearchParams({ type: value });
  };
  
  // Handle click on stock for expanded view
  const handleStockClick = (symbol: string, event: React.MouseEvent) => {
    setExpandedSymbol(expandedSymbol === symbol ? null : symbol);
    setIsExpanded(expandedSymbol !== symbol);
    setCardPosition({
      x: event.clientX,
      y: event.clientY,
    });
  };
  
  // Handle hover on stock
  const handleStockHover = (stock: DividendData, event: React.MouseEvent) => {
    setHoverInfo({
      stock,
      exDividendDate: stock.ExDividendDate || "N/A",
      dividendDate: stock.DividendDate || "N/A",
      position: {
        x: event.clientX,
        y: event.clientY,
      },
    });
    
    // If the hover device is touching (mobile), this might be a click
    if (window.event && (window.event as any).type === 'touchstart') {
      setExpandedSymbol(stock.Symbol);
      setIsExpanded(true);
      setCardPosition({
        x: event.clientX,
        y: event.clientY,
      });
    }
  };
  
  // Close expanded card when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        expandedCardRef.current &&
        !expandedCardRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
        setExpandedSymbol(null);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Sort data
  const requestSort = (key: keyof DividendData) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    
    const sortedData = [...filteredData].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "ascending" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredData(sortedData);
  };
  
  // Get sort direction for a specific column
  const getSortDirection = (key: keyof DividendData) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="inline h-4 w-4" />
    ) : (
      <ChevronDown className="inline h-4 w-4" />
    );
  };
  
  // Filter data based on filter type, date range, and search term
  const filterData = (
    data: DividendData[],
    filter: string,
    dateRange: DateRange | undefined,
    search: string
  ) => {
    if (!data || data.length === 0) return;
    
    let filtered = [...data];
    
    // Apply search filter
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.Symbol.toLowerCase().includes(searchLower) ||
          item.title.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply date range filter if available
    if (dateRange && dateRange.from) {
      if (filter === "buy") {
        // Filter for stocks where ExDividendDate is within the date range
        filtered = filtered.filter((item) => {
          if (!item.ExDividendDate) return false;
          const exDate = parseISO(item.ExDividendDate);
          return (
            exDate >= dateRange.from! &&
            (!dateRange.to || exDate <= dateRange.to)
          );
        });
      } else if (filter === "paid") {
        // Filter for stocks where DividendDate is within the date range
        filtered = filtered.filter((item) => {
          if (!item.DividendDate) return false;
          const divDate = parseISO(item.DividendDate);
          return (
            divDate >= dateRange.from! &&
            (!dateRange.to || divDate <= dateRange.to)
          );
        });
      }
    }
    
    setFilteredData(filtered);
  };
  
  // Format date string
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid Date";
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dividend Calendar</h1>
          <p className="text-muted-foreground">
            Track upcoming dividend payments and ex-dividend dates.
          </p>
        </div>
        
        <div className="mb-8">
          <Tabs defaultValue={selectedFilter} onValueChange={handleFilterChange}>
            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger value="buy">When should I buy?</TabsTrigger>
              <TabsTrigger value="paid">When will I get paid?</TabsTrigger>
            </TabsList>
            <TabsContent value="buy" className="mt-4">
              <p className="mb-4">
                View upcoming ex-dividend dates to plan your purchases. Buy
                before the ex-dividend date to receive the next dividend payment.
              </p>
            </TabsContent>
            <TabsContent value="paid" className="mt-4">
              <p className="mb-4">
                Track when your dividend payments are scheduled to be distributed
                by the companies in your portfolio.
              </p>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="grid gap-6 md:grid-cols-[1fr_250px] lg:grid-cols-[1fr_300px] mb-8">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by ticker or company name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select
                value={selectedFilter}
                onValueChange={handleFilterChange}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="buy">Ex-Dividend Date</SelectItem>
                    <SelectItem value="paid">Payment Date</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => requestSort("Symbol")}
                      >
                        Symbol {getSortDirection("Symbol")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => requestSort("title")}
                      >
                        Company {getSortDirection("title")}
                      </TableHead>
                      <TableHead
                        className="text-right cursor-pointer"
                        onClick={() => requestSort("dividendRate")}
                      >
                        Amount {getSortDirection("dividendRate")}
                      </TableHead>
                      <TableHead
                        className="text-right cursor-pointer"
                        onClick={() => requestSort("dividendYield")}
                      >
                        Yield {getSortDirection("dividendYield")}
                      </TableHead>
                      <TableHead
                        className="text-right cursor-pointer"
                        onClick={() => requestSort(selectedFilter === "buy" ? "ExDividendDate" : "DividendDate")}
                      >
                        {selectedFilter === "buy" ? "Ex-Date" : "Payment Date"}{" "}
                        {getSortDirection(selectedFilter === "buy" ? "ExDividendDate" : "DividendDate")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length > 0 ? (
                      filteredData.map((stock) => (
                        <TableRow
                          key={stock.Symbol}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={(e) => handleStockClick(stock.Symbol, e)}
                          onMouseEnter={(e) => handleStockHover(stock, e)}
                        >
                          <TableCell className="font-medium">
                            <HoverCard openDelay={200} closeDelay={100}>
                              <HoverCardTrigger asChild>
                                <span className="cursor-pointer text-primary">
                                  {stock.Symbol}
                                </span>
                              </HoverCardTrigger>
                              <HoverCardContent
                                side="right"
                                align="start"
                                className="w-[300px] bg-card border border-border"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">{stock.Symbol}</h4>
                                    <span className="text-sm text-muted-foreground">
                                      {stock.shortname}
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <p className="text-muted-foreground">Current Price</p>
                                      <p>${stock.currentPrice.toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Dividend Yield</p>
                                      <p>{(stock.dividendYield * 100).toFixed(2)}%</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Ex-Dividend Date</p>
                                      <p>{formatDate(stock.ExDividendDate)}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Payment Date</p>
                                      <p>{formatDate(stock.DividendDate)}</p>
                                    </div>
                                  </div>
                                  
                                  {stock.announcements && stock.announcements.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-border">
                                      <p className="font-semibold text-sm">Latest Announcements</p>
                                      {stock.announcements.map((announcement) => (
                                        <div key={announcement.id} className="mt-1 text-sm bg-muted/50 p-2 rounded">
                                          <p className="font-medium">{announcement.header}</p>
                                          <p className="text-xs text-muted-foreground">{announcement.message}</p>
                                          <div className="flex justify-between mt-1 text-xs">
                                            <span>Amount: ${announcement.amount}</span>
                                            <span>{formatDate(announcement.date)}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {stock.message && (
                                    <div className="bg-muted/50 p-2 rounded text-sm">
                                      <p>{stock.message}</p>
                                    </div>
                                  )}
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </TableCell>
                          <TableCell>{stock.title}</TableCell>
                          <TableCell className="text-right">
                            ${stock.dividendRate.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {(stock.dividendYield * 100).toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right">
                            {formatDate(
                              selectedFilter === "buy"
                                ? stock.ExDividendDate
                                : stock.DividendDate
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No dividend data available for the selected criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
          
          <div className="space-y-4">
            <DateRangePicker
              date={date}
              onDateChange={setDate}
              className="w-full"
            />
            
            <Card className="p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <InfoIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                {selectedFilter === "buy"
                  ? "About Ex-Dividend Dates"
                  : "About Payment Dates"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedFilter === "buy"
                  ? "The ex-dividend date is the day on which the stock starts trading without the value of its next dividend payment. To receive the dividend, you must buy the stock before the ex-dividend date."
                  : "The payment date is when the company distributes the dividend to all shareholders. This typically occurs a few weeks after the ex-dividend date."}
              </p>
            </Card>
            
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Dividend Calendar</h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  {date?.from
                    ? date.to
                      ? `${format(date.from, "MMM d, yyyy")} - ${format(
                          date.to,
                          "MMM d, yyyy"
                        )}`
                      : format(date.from, "MMM d, yyyy")
                    : "Select a date range"}
                </span>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Expanded Detail Card */}
        {isExpanded && expandedSymbol && (
          <div
            ref={expandedCardRef}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            style={{
              maxWidth: "90vw",
              width: "600px",
            }}
          >
            <Card className="p-6 shadow-lg border border-border bg-card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    {
                      dividendData.find((item) => item.Symbol === expandedSymbol)
                        ?.title
                    }
                  </h2>
                  <p className="text-lg text-primary">{expandedSymbol}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsExpanded(false);
                    setExpandedSymbol(null);
                  }}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
              
              {dividendData.find((item) => item.Symbol === expandedSymbol) && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Price</p>
                      <p className="text-lg font-semibold">
                        $
                        {dividendData
                          .find((item) => item.Symbol === expandedSymbol)
                          ?.currentPrice.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dividend Rate</p>
                      <p className="text-lg font-semibold">
                        $
                        {dividendData
                          .find((item) => item.Symbol === expandedSymbol)
                          ?.dividendRate.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dividend Yield</p>
                      <p className="text-lg font-semibold">
                        {(
                          dividendData.find(
                            (item) => item.Symbol === expandedSymbol
                          )?.dividendYield * 100
                        ).toFixed(2)}
                        %
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ex-Dividend Date</p>
                      <p className="text-lg font-semibold">
                        {formatDate(
                          dividendData.find(
                            (item) => item.Symbol === expandedSymbol
                          )?.ExDividendDate
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Date</p>
                      <p className="text-lg font-semibold">
                        {formatDate(
                          dividendData.find(
                            (item) => item.Symbol === expandedSymbol
                          )?.DividendDate
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payout Ratio</p>
                      <p className="text-lg font-semibold">
                        {(
                          dividendData.find(
                            (item) => item.Symbol === expandedSymbol
                          )?.payoutRatio * 100
                        ).toFixed(2)}
                        %
                      </p>
                    </div>
                  </div>
                  
                  {/* Announcements section */}
                  {dividendData.find((item) => item.Symbol === expandedSymbol)
                    ?.announcements?.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Announcements</h3>
                      <div className="space-y-2">
                        {dividendData
                          .find((item) => item.Symbol === expandedSymbol)
                          ?.announcements?.map((announcement) => (
                            <Card key={announcement.id} className="p-3">
                              <div className="flex justify-between">
                                <h4 className="font-medium">{announcement.header}</h4>
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(announcement.date)}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{announcement.message}</p>
                              <p className="text-sm text-primary mt-1">
                                Dividend amount: ${announcement.amount}
                              </p>
                            </Card>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Insights</h3>
                    <p className="text-sm">
                      {dividendData.find((item) => item.Symbol === expandedSymbol)
                        ?.insight ||
                        "No specific insights available for this stock at the moment."}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <Button
                      onClick={() =>
                        window.open(
                          `/stock/${expandedSymbol}`,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                      className="w-full"
                    >
                      View Full Stock Details
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dividend;
