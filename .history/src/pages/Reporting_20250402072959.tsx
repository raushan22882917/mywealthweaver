
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  BarChart3, 
  DollarSign, 
  Calendar, 
  ArrowUpDown, 
  Filter, 
  ChevronDown, 
  AlertTriangle,
  ChevronUp, 
  LineChart as LineChartIcon
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  CartesianGrid,
  ReferenceLine
} from "recharts";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import DividendCalendar from "@/components/DividendCalendar";
import { DateRangePicker } from "@/components/DateRangePicker";
import { addDays, subDays } from "date-fns";

interface DividendReport {
  id: string;
  symbol: string;
  dividend_date: string;
  ex_dividend_date: string;
  earnings_date: string;
  earnings_high: number;
  earnings_low: number;
  earnings_average: number;
  revenue_high: number;
  revenue_low: number;
  revenue_average: number;
  price_history?: {
    date: string;
    price: number;
  }[];
  current_price?: number;
  price_status?: 'high' | 'low' | 'medium';
}

interface DateRange {
  from: Date;
  to: Date;
}

const Reporting: React.FC = () => {
  const [reports, setReports] = useState<DividendReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<DividendReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof DividendReport>("symbol");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState("overview");
  const [trackPrices, setTrackPrices] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [viewMode, setViewMode] = useState<"grid" | "graph">("grid");
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [priceHistoryData, setPriceHistoryData] = useState<{date: string, price: number}[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Add pagination logic here
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filteredReports.length / pageSize);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortField, sortDirection]);

  useEffect(() => {
    fetchDividendReports();
  }, []);

  useEffect(() => {
    // Filter and sort reports whenever dependencies change
    const filtered = reports.filter(report =>
      report.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        // Handle dates as strings (convert to Date objects for comparison)
        const aDate = aValue ? new Date(aValue as string).getTime() : 0;
        const bDate = bValue ? new Date(bValue as string).getTime() : 0;
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
      }
    });

    setFilteredReports(sorted);
  }, [reports, searchTerm, sortField, sortDirection]);

  const fetchDividendReports = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("dividend_reports")
        .select("*");

      if (error) {
        throw error;
      }

      // Add mock price history data for demonstration
      const reportsWithPriceData = data.map(report => ({
        ...report,
        current_price: Math.random() * 200 + 50, // Random price between 50 and 250
        price_status: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        price_history: Array.from({ length: 30 }, (_, i) => ({
          date: format(new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          price: Math.random() * 50 + 100 + (i * 0.5) + (Math.random() * 10 - 5)
        }))
      }));

      setReports(reportsWithPriceData);
      setFilteredReports(reportsWithPriceData);
    } catch (err: any) {
      console.error("Error fetching dividend reports:", err);
      setError(err.message || "Failed to load dividend reports");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof DividendReport) => {
    setSortDirection(current => 
      sortField === field && current === 'asc' ? 'desc' : 'asc'
    );
    setSortField(field);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (err) {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (!num) return "N/A";
    return num.toFixed(2);
  };

  const handleViewPriceHistory = (symbol: string) => {
    const report = reports.find(r => r.symbol === symbol);
    if (report && report.price_history) {
      setPriceHistoryData(report.price_history);
      setSelectedSymbol(symbol);
      setShowPriceHistory(true);
    }
  };

  // Prepare data for charts
  const earningsChartData = reports.slice(0, 10).map(report => ({
    symbol: report.symbol,
    "Highest Estimate": report.earnings_high,
    "Average": report.earnings_average,
    "Lowest Estimate": report.earnings_low,
  }));

  const revenueChartData = reports.slice(0, 10).map(report => ({
    symbol: report.symbol,
    "Highest Estimate": report.revenue_high / 1000000000,
    "Average": report.revenue_average / 1000000000,
    "Lowest Estimate": report.revenue_low / 1000000000,
  }));

  const getPriceStatusColor = (status?: 'high' | 'low' | 'medium') => {
    switch (status) {
      case 'high': return 'text-amber-500';
      case 'low': return 'text-green-500';
      case 'medium': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getPriceStatusIndicator = (status?: 'high' | 'low' | 'medium') => {
    return (
      <div className="inline-flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          status === 'high' ? 'bg-amber-500' : 
          status === 'low' ? 'bg-green-500' : 
          'bg-blue-500'
        }`}></div>
        <span className={getPriceStatusColor(status)}>
          {status === 'high' ? 'high' : 
           status === 'low' ? 'low' : 
           'average'}
        </span>
      </div>
    );
  };

  const getFilteredPriceData = (data: any[]) => {
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= dateRange.from && itemDate <= dateRange.to;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-gray-200">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        

        {/* Price Status Alert with improved design */}
        <Card className="mb-8 bg-gray-900/80 backdrop-blur-sm border-gray-800 shadow-lg hover:shadow-xl transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-5 bg-green-500 rounded-sm"></div>
                  <div className="w-2 h-5 bg-yellow-500 rounded-sm"></div>
                  <div className="w-2 h-5 bg-red-500 rounded-sm"></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">Prices are currently</span>
                  <span className="text-amber-500 font-medium">high</span>
                </div>
              </div>
              <Popover open={showPriceHistory} onOpenChange={setShowPriceHistory}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    View price history
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0 bg-gray-900 border-gray-800">
                  <div className="p-4">
                    <h3 className="font-medium text-white mb-2 flex items-center justify-between">
                      Price History {selectedSymbol && `for ${selectedSymbol}`}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400 hover:text-gray-300"
                        onClick={() => setShowPriceHistory(false)}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                    </h3>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={priceHistoryData}>
                          <XAxis 
                            dataKey="date" 
                            tick={{fill: '#9ca3af'}}
                            tickFormatter={(date) => format(new Date(date), 'MMM d')}
                          />
                          <YAxis tick={{fill: '#9ca3af'}} />
                          <Tooltip 
                            formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#e5e7eb' }}
                            labelStyle={{ color: '#e5e7eb' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#3b82f6" 
                            dot={false}
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Price Tracking Controls with improved UI */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 bg-gray-900/80 backdrop-blur-sm p-5 rounded-lg border border-gray-800 shadow-md">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 bg-gray-800/70 p-2 rounded-lg border border-gray-700">
              <LineChartIcon className="h-5 w-5 text-blue-500" />
              <span className="text-white font-medium">Track prices</span>
              <Switch 
                checked={trackPrices} 
                onCheckedChange={setTrackPrices} 
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            
            <DateRangePicker
              date={dateRange}
              onDateChange={setDateRange}
              className="bg-gray-800/70 rounded-lg border border-gray-700"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant={viewMode === "grid" ? "default" : "outline"}
              className={viewMode === "grid" ? "bg-blue-600 hover:bg-blue-700" : "text-gray-300 border-gray-700"}
              onClick={() => setViewMode("grid")}
              size="sm"
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date grid
              </div>
            </Button>
            
            <Button 
              variant={viewMode === "graph" ? "default" : "outline"}
              className={viewMode === "graph" ? "bg-blue-600 hover:bg-blue-700" : "text-gray-300 border-gray-700"}
              onClick={() => setViewMode("graph")}
              size="sm"
            >
              <div className="flex items-center gap-2">
                <LineChartIcon className="h-4 w-4" />
                Price graph
              </div>
            </Button>
          </div>
        </div>

        {/* Add the price graph view with improved UI */}
        {viewMode === "graph" && (
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-800 mb-6 shadow-lg">
            <CardHeader className="border-b border-gray-800">
              <CardTitle className="text-white">Price History</CardTitle>
              <CardDescription className="text-gray-400">
                {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] p-5">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getFilteredPriceData(priceHistoryData)}>
                  <XAxis 
                    dataKey="date" 
                    tick={{fill: '#9ca3af'}}
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  />
                  <YAxis 
                    tick={{fill: '#9ca3af'}}
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      borderColor: '#374151', 
                      color: '#e5e7eb' 
                    }}
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
                    labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                  />
                  <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Calendar (75%) with improved styling */}
          <div className="lg:w-3/4">
            <Card className="h-full bg-gray-900/80 backdrop-blur-sm border-gray-800 shadow-lg">
              <CardHeader className="border-b border-gray-800">
               
              </CardHeader>
              <CardContent className="p-0">
                <DividendCalendar />
              </CardContent>
            </Card>
          </div>

          {/* Right side - Analysis (25%) with improved UI */}
          <div className="lg:w-1/4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid grid-cols-3 mb-4 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">Overview</TabsTrigger>
                <TabsTrigger value="stats" className="data-[state=active]:bg-gray-700">Stats</TabsTrigger>
                <TabsTrigger value="search" className="data-[state=active]:bg-gray-700">Search</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                {/* Dashboard Metrics with improved styling */}
                <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-gray-600 transition-all shadow-md hover:shadow-lg">
                  <CardHeader className="pb-2 border-b border-gray-800">
                    <CardTitle className="text-lg font-medium text-white">Upcoming Dividends</CardTitle>
                    <CardDescription className="text-gray-400">Next 30 days</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        <span className="text-2xl font-bold text-white">
                          {reports.filter(r => {
                            const divDate = r.dividend_date ? new Date(r.dividend_date) : null;
                            const today = new Date();
                            const thirtyDaysLater = new Date();
                            thirtyDaysLater.setDate(today.getDate() + 30);
                            return divDate && divDate > today && divDate < thirtyDaysLater;
                          }).length}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">Companies</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-gray-600 transition-all shadow-md hover:shadow-lg">
                  <CardHeader className="pb-2 border-b border-gray-800">
                    <CardTitle className="text-lg font-medium text-white">Average EPS</CardTitle>
                    <CardDescription className="text-gray-400">Across portfolio</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        <span className="text-2xl font-bold text-white">
                          {reports.length > 0 
                            ? formatNumber(reports.reduce((sum, r) => sum + r.earnings_average, 0) / reports.length)
                            : "N/A"}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">Per share</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-gray-600 transition-all shadow-md hover:shadow-lg">
                  <CardHeader className="pb-2 border-b border-gray-800">
                    <CardTitle className="text-lg font-medium text-white">Total Revenue</CardTitle>
                    <CardDescription className="text-gray-400">All companies</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-500" />
                        <span className="text-xl font-bold text-white">
                          {reports.length > 0 
                            ? formatCurrency(reports.reduce((sum, r) => sum + r.revenue_average, 0))
                            : "N/A"}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">Combined</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="stats" className="space-y-4">
                <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 shadow-md">
                  <CardHeader className="border-b border-gray-800">
                    <CardTitle className="text-white">Earnings Distribution</CardTitle>
                    <CardDescription className="text-gray-400">Top 5 companies by EPS</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={earningsChartData.slice(0, 5)}>
                        <XAxis dataKey="symbol" tick={{fill: '#9ca3af'}} />
                        <YAxis tick={{fill: '#9ca3af'}} />
                        <Tooltip 
                          formatter={(value) => [`$${value}`, 'EPS']}
                          labelFormatter={(label) => `Symbol: ${label}`}
                          contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#e5e7eb' }}
                        />
                        <Bar dataKey="Average" fill="#0ea5e9" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 shadow-md">
                  <CardHeader className="border-b border-gray-800">
                    <CardTitle className="text-white">Revenue Summary</CardTitle>
                    <CardDescription className="text-gray-400">Billion USD</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueChartData.slice(0, 5)}>
                        <XAxis dataKey="symbol" tick={{fill: '#9ca3af'}} />
                        <YAxis tick={{fill: '#9ca3af'}} />
                        <Tooltip 
                          formatter={(value) => [`$${value}B`, 'Revenue']}
                          labelFormatter={(label) => `Symbol: ${label}`}
                          contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#e5e7eb' }}
                        />
                        <Bar dataKey="Average" fill="#14b8a6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="search" className="space-y-4">
                <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 shadow-md">
                  <CardHeader className="border-b border-gray-800">
                    <CardTitle className="text-white">Find Report</CardTitle>
                    <CardDescription className="text-gray-400">Search for a specific company</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by symbol..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    
                    <div className="mt-4 max-h-[400px] overflow-y-auto">
                      {filteredReports.length === 0 ? (
                        <p className="text-center py-4 text-gray-400">No matching companies found</p>
                      ) : (
                        filteredReports.slice(0, 10).map(report => (
                          <div key={report.id} className="flex items-center py-2 border-b border-gray-800 hover:bg-gray-800/30 px-2 rounded-md cursor-pointer">
                            <div className="font-medium text-white">{report.symbol}</div>
                            <div className="ml-auto text-sm text-gray-400">
                              {formatDate(report.dividend_date)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Report Table with improved UI */}
        <Card className="mt-8 bg-gray-900/80 backdrop-blur-sm border-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gradient bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dividend & Earnings Reports
            </CardTitle>
            <CardDescription className="text-gray-400">
              {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
            </CardDescription>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by symbol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <Select
                value={sortField as string}
                onValueChange={(value) => setSortField(value as keyof DividendReport)}
              >
                <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="symbol">Symbol</SelectItem>
                  <SelectItem value="dividend_date">Dividend Date</SelectItem>
                  <SelectItem value="ex_dividend_date">Ex-Dividend Date</SelectItem>
                  <SelectItem value="earnings_date">Earnings Date</SelectItem>
                  <SelectItem value="earnings_average">Earnings Average</SelectItem>
                  <SelectItem value="revenue_average">Revenue Average</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={() => setSortDirection(current => current === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500 flex items-center justify-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {error}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-800/70 backdrop-blur-sm sticky top-0 z-10">
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer text-gray-300 hover:text-white transition-colors"
                        onClick={() => handleSort('symbol')}
                      >
                        <div className="flex items-center gap-1">
                          Symbol
                          {sortField === 'symbol' && (
                            <ArrowUpDown size={16} className="text-blue-400" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-gray-300 hover:text-white transition-colors"
                        onClick={() => handleSort('ex_dividend_date')}
                      >
                        <div className="flex items-center gap-1">
                          Ex-Dividend Date
                          {sortField === 'ex_dividend_date' && (
                            <ArrowUpDown size={16} className="text-blue-400" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-gray-300 hover:text-white transition-colors"
                        onClick={() => handleSort('dividend_date')}
                      >
                        <div className="flex items-center gap-1">
                          Dividend Date
                          {sortField === 'dividend_date' && (
                            <ArrowUpDown size={16} className="text-blue-400" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-gray-300 hover:text-white transition-colors"
                        onClick={() => handleSort('earnings_date')}
                      >
                        <div className="flex items-center gap-1">
                          Earnings Date
                          {sortField === 'earnings_date' && (
                            <ArrowUpDown size={16} className="text-blue-400" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-right text-gray-300 hover:text-white transition-colors"
                        onClick={() => handleSort('earnings_average')}
                      >
                        <div className="flex items-center gap-1 justify-end">
                          Earnings (EPS)
                          {sortField === 'earnings_average' && (
                            <ArrowUpDown size={16} className="text-blue-400" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-right text-gray-300 hover:text-white transition-colors"
                        onClick={() => handleSort('revenue_average')}
                      >
                        <div className="flex items-center gap-1 justify-end">
                          Revenue
                          {sortField === 'revenue_average' && (
                            <ArrowUpDown size={16} className="text-blue-400" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-right text-gray-300">
                        <div className="flex items-center gap-1 justify-end">
                          Price Status
                        </div>
                      </TableHead>
                      <TableHead className="text-right text-gray-300">
                        <div className="flex items-center gap-1 justify-end">
                          Actions
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                          No reports found matching your search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedReports.map((report) => (
                        <TableRow key={report.id} className="hover:bg-gray-800/40 border-b border-gray-800">
                          <TableCell className="font-medium text-white">{report.symbol}</TableCell>
                          <TableCell className="text-gray-300">{formatDate(report.ex_dividend_date)}</TableCell>
                          <TableCell className="text-gray-300">{formatDate(report.dividend_date)}</TableCell>
                          <TableCell className="text-gray-300">{formatDate(report.earnings_date)}</TableCell>
                          <TableCell className="text-right">
                            <span className="text-green-400 font-medium">${formatNumber(report.earnings_average)}</span>
                            <div className="text-xs text-gray-400">
                              Range: ${formatNumber(report.earnings_low)} - ${formatNumber(report.earnings_high)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-blue-400 font-medium">{formatCurrency(report.revenue_average)}</span>
                            <div className="text-xs text-gray-400">
                              Range: {formatCurrency(report.revenue_low)} - {formatCurrency(report.revenue_high)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {getPriceStatusIndicator(report.price_status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-blue-400 hover:text-blue-300 hover:bg-gray-800"
                              onClick={() => handleViewPriceHistory(report.symbol)}
                            >
                              View History
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {/* Add pagination controls with improved UI */}
                {!loading && !error && filteredReports.length > 0 && (
                  <div className="flex items-center justify-between mt-6 bg-gray-800/70 backdrop-blur-sm p-4 rounded-lg border border-gray-700 shadow-md">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="text-gray-300 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        Page {currentPage} of {totalPages}
                      </span>
                      <span className="text-gray-600">•</span>
                      <span className="text-sm text-gray-400">
                        {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredReports.length)} of {filteredReports.length}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="text-gray-300 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Reporting;
