
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, X, Check, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";
import { StockFilterData, mapDatabaseToFilterData } from "@/utils/dividend";
import { toast } from "sonner";

export interface StockFilterCriteria {
  symbol?: string;
  sector?: string;
  exchange?: string;
  minDividendYield?: number;
  maxDividendYield?: number;
  minPayoutRatio?: number;
  maxPayoutRatio?: number;
  minHealthScore?: number;
  hasDebtConcerns?: boolean;
}

interface StockFilterProps {
  onFilterApply: (filters: StockFilterCriteria) => void;
  filterableStocks?: StockFilterData[];
  isCalendarView?: boolean;
}

const StockFilter: React.FC<StockFilterProps> = ({ 
  onFilterApply, 
  filterableStocks: initialFilterableStocks,
  isCalendarView = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFilteredTable, setShowFilteredTable] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState<StockFilterData[]>([]);
  const [stockData, setStockData] = useState<StockFilterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Symbol search suggestions
  const [symbolSuggestions, setSymbolSuggestions] = useState<string[]>([]);
  const [showSymbolSuggestions, setShowSymbolSuggestions] = useState(false);
  
  // Filter criteria
  const [filters, setFilters] = useState<StockFilterCriteria>({
    minDividendYield: 0,
    maxDividendYield: 15,
    minPayoutRatio: 0,
    maxPayoutRatio: 100,
    minHealthScore: 0,
    hasDebtConcerns: false
  });

  // Fetch stock filter data from Supabase
  useEffect(() => {
    const fetchStockFilterData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('stock_filter')
          .select('*');
        
        if (error) {
          console.error("Error fetching stock filter data:", error);
          toast.error("Failed to load stock filter data");
          return;
        }
        
        // Map database results to our filter data structure
        const mappedData = data.map(item => mapDatabaseToFilterData(item));
        
        // If we have initial data passed through props, merge it with the fetched data
        if (initialFilterableStocks && initialFilterableStocks.length > 0) {
          // Create a map of existing symbols
          const symbolMap = new Map(mappedData.map(item => [item.Symbol, item]));
          
          // Add any stocks from initialFilterableStocks that aren't in the database results
          for (const stock of initialFilterableStocks) {
            if (!symbolMap.has(stock.Symbol)) {
              mappedData.push(stock);
            }
          }
        }
        
        setStockData(mappedData);
      } catch (error) {
        console.error("Error in stock filter data fetch:", error);
        toast.error("An error occurred while loading filter data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockFilterData();
  }, [initialFilterableStocks]);

  // Extract unique sectors and exchanges for dropdowns
  const uniqueSectors = Array.from(
    new Set(stockData.map(stock => stock.Sector).filter(Boolean))
  );
  
  // Get exchanges based on selected sector
  const getFilteredExchanges = () => {
    if (!filters.sector || filters.sector === "all-sectors") {
      return Array.from(new Set(stockData.map(stock => stock.Exchange).filter(Boolean)));
    }
    
    return Array.from(
      new Set(
        stockData
          .filter(stock => stock.Sector === filters.sector)
          .map(stock => stock.Exchange)
          .filter(Boolean)
      )
    );
  };
  
  const uniqueExchanges = getFilteredExchanges();

  const handleFilterChange = (key: keyof StockFilterCriteria, value: any) => {
    // If sector is changing, reset exchange
    if (key === 'sector' && value !== filters.sector) {
      setFilters(prev => ({ ...prev, [key]: value, exchange: undefined }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
    
    // If symbol is being typed, update suggestions
    if (key === 'symbol') {
      updateSymbolSuggestions(value);
    }
  };
  
  const updateSymbolSuggestions = (input: string) => {
    if (!input || input.length < 1) {
      setSymbolSuggestions([]);
      setShowSymbolSuggestions(false);
      return;
    }
    
    const matches = stockData
      .filter(stock => 
        stock.Symbol.toLowerCase().includes(input.toLowerCase()) || 
        (stock.Sector && stock.Sector.toLowerCase().includes(input.toLowerCase()))
      )
      .map(stock => stock.Symbol)
      .slice(0, 7); // Limit to 7 suggestions
    
    setSymbolSuggestions(matches);
    setShowSymbolSuggestions(matches.length > 0);
  };
  
  const handleSymbolSelect = (symbol: string) => {
    const selectedStock = stockData.find(stock => stock.Symbol === symbol);
    
    setFilters(prev => ({ 
      ...prev, 
      symbol,
      // Automatically set the sector if available
      sector: selectedStock?.Sector || prev.sector,
      // Automatically set the exchange if available
      exchange: selectedStock?.Exchange || prev.exchange
    }));
    
    setShowSymbolSuggestions(false);
  };

  const applyFilters = () => {
    const newFilteredStocks = stockData.filter(stock => {
      // Symbol filter
      if (filters.symbol && !stock.Symbol.toLowerCase().includes(filters.symbol.toLowerCase())) {
        return false;
      }
      
      // Sector filter
      if (filters.sector && filters.sector !== "all-sectors" && stock.Sector !== filters.sector) {
        return false;
      }
      
      // Exchange filter
      if (filters.exchange && filters.exchange !== "all-exchanges" && stock.Exchange !== filters.exchange) {
        return false;
      }
      
      // Dividend Yield filter
      if (stock["Dividend-Yield"] !== undefined && 
          (stock["Dividend-Yield"] < (filters.minDividendYield || 0) || 
           stock["Dividend-Yield"] > (filters.maxDividendYield || 100))) {
        return false;
      }
      
      // Payout Ratio filter
      if (stock["Payout Ratio"] !== undefined && 
          (stock["Payout Ratio"] < (filters.minPayoutRatio || 0) || 
           stock["Payout Ratio"] > (filters.maxPayoutRatio || 100))) {
        return false;
      }
      
      // Health Score filter
      if (stock["Financial-Health-Score"] !== undefined && 
          stock["Financial-Health-Score"] < (filters.minHealthScore || 0)) {
        return false;
      }
      
      // Debt Concerns filter
      if (filters.hasDebtConcerns && stock["Debt Levels"] !== undefined && stock["Debt Levels"] < 3) {
        return false;
      }
      
      return true;
    });
    
    setFilteredStocks(newFilteredStocks);
    setShowFilteredTable(true);
    onFilterApply(filters);
    
    // Show a toast notification with filter results
    toast.success(`Found ${newFilteredStocks.length} stocks matching your criteria`);
  };

  const clearFilters = () => {
    setFilters({
      symbol: "",
      sector: undefined,
      exchange: undefined,
      minDividendYield: 0,
      maxDividendYield: 15,
      minPayoutRatio: 0,
      maxPayoutRatio: 100,
      minHealthScore: 0,
      hasDebtConcerns: false
    });
    setFilteredStocks([]);
    setShowFilteredTable(false);
    onFilterApply({});
  };

  const formatValue = (value: number | undefined): string => {
    if (value === undefined) return "N/A";
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return value.toString();
  };

  return (
    <div className={`${isCalendarView ? 'inline-block' : ''}`}>
      <Button 
        onClick={() => setIsOpen(true)} 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
            <span>Loading...</span>
          </>
        ) : (
          <>
            <Filter className="h-4 w-4" />
            <span>Filter Stocks</span>
            {Object.values(filters).some(val => val !== undefined && val !== "" && val !== 0 && val !== false) && (
              <Badge variant="secondary" className="ml-1 bg-blue-500 text-white">
                Active
              </Badge>
            )}
          </>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Filter className="h-5 w-5" />
              Stock Filter
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* First Column */}
            <div className="space-y-4">
              <div className="space-y-2 relative">
                <Label htmlFor="symbol">Symbol</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="symbol"
                    placeholder="Type to search..."
                    value={filters.symbol || ""}
                    onChange={(e) => handleFilterChange("symbol", e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Symbol suggestions dropdown */}
                {showSymbolSuggestions && (
                  <div className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {symbolSuggestions.map((symbol) => (
                      <div 
                        key={symbol} 
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleSymbolSelect(symbol)}
                      >
                        {symbol}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Select
                  value={filters.sector || ""}
                  onValueChange={(value) => handleFilterChange("sector", value || undefined)}
                >
                  <SelectTrigger id="sector">
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-sectors">All Sectors</SelectItem>
                    {uniqueSectors.map((sector) => (
                      sector ? (
                        <SelectItem key={sector} value={sector}>
                          {sector}
                        </SelectItem>
                      ) : null
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exchange">Exchange</Label>
                <Select
                  value={filters.exchange || ""}
                  onValueChange={(value) => handleFilterChange("exchange", value || undefined)}
                >
                  <SelectTrigger id="exchange">
                    <SelectValue placeholder="Select exchange" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-exchanges">All Exchanges</SelectItem>
                    {uniqueExchanges.map((exchange) => (
                      exchange ? (
                        <SelectItem key={exchange} value={exchange}>
                          {exchange}
                        </SelectItem>
                      ) : null
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Second Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Dividend Yield Range ({filters.minDividendYield}% - {filters.maxDividendYield}%)</Label>
                <div className="pt-4 px-2">
                  <Slider
                    defaultValue={[filters.minDividendYield || 0, filters.maxDividendYield || 15]}
                    max={15}
                    step={0.1}
                    onValueChange={(values) => {
                      handleFilterChange("minDividendYield", values[0]);
                      handleFilterChange("maxDividendYield", values[1]);
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Payout Ratio Range ({filters.minPayoutRatio}% - {filters.maxPayoutRatio}%)</Label>
                <div className="pt-4 px-2">
                  <Slider
                    defaultValue={[filters.minPayoutRatio || 0, filters.maxPayoutRatio || 100]}
                    max={100}
                    step={1}
                    onValueChange={(values) => {
                      handleFilterChange("minPayoutRatio", values[0]);
                      handleFilterChange("maxPayoutRatio", values[1]);
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Minimum Financial Health Score ({filters.minHealthScore})</Label>
                <div className="pt-4 px-2">
                  <Slider
                    defaultValue={[filters.minHealthScore || 0]}
                    max={10}
                    step={1}
                    onValueChange={(values) => handleFilterChange("minHealthScore", values[0])}
                  />
                </div>
              </div>
            </div>
            
            {/* Third Column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="debtConcerns"
                  checked={filters.hasDebtConcerns}
                  onCheckedChange={(checked) => 
                    handleFilterChange("hasDebtConcerns", checked === true)
                  }
                />
                <label
                  htmlFor="debtConcerns"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Exclude stocks with debt concerns
                </label>
              </div>
              
              <div className="mt-6 flex gap-2">
                <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
                <Button onClick={applyFilters} className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
          
          {/* Results Table */}
          {showFilteredTable && (
            <div className="mt-4 border rounded-lg p-4 overflow-auto max-h-[400px]">
              <h3 className="text-lg font-medium mb-3">
                {filteredStocks.length > 0 
                  ? `Filtered Results (${filteredStocks.length} stocks)` 
                  : 'No stocks match your filter criteria.'}
              </h3>
              
              {filteredStocks.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Exchange</TableHead>
                      <TableHead>Div Yield</TableHead>
                      <TableHead>Payout Ratio</TableHead>
                      <TableHead>Health Score</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>EPS</TableHead>
                      <TableHead>Debt Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStocks.map((stock) => (
                      <TableRow key={stock.Symbol}>
                        <TableCell className="font-medium">{stock.Symbol}</TableCell>
                        <TableCell>{stock.Sector || "N/A"}</TableCell>
                        <TableCell>{stock.Exchange || "N/A"}</TableCell>
                        <TableCell>{stock["Dividend-Yield"] !== undefined ? `${stock["Dividend-Yield"].toFixed(2)}%` : "N/A"}</TableCell>
                        <TableCell>{stock["Payout Ratio"] !== undefined ? `${stock["Payout Ratio"].toFixed(2)}%` : "N/A"}</TableCell>
                        <TableCell>{stock["Financial-Health-Score"] !== undefined ? stock["Financial-Health-Score"].toFixed(1) : "N/A"}</TableCell>
                        <TableCell>{stock.Revenue !== undefined ? formatValue(stock.Revenue) : "N/A"}</TableCell>
                        <TableCell>{stock.Earnings_per_share !== undefined ? `$${stock.Earnings_per_share.toFixed(2)}` : "N/A"}</TableCell>
                        <TableCell>
                          {stock["Debt Levels"] !== undefined ? (
                            <Badge
                              variant={stock["Debt Levels"] > 7 ? "destructive" : stock["Debt Levels"] > 4 ? "default" : "secondary"}
                            >
                              {stock["Debt Levels"] > 7 ? "High" : stock["Debt Levels"] > 4 ? "Medium" : "Low"}
                            </Badge>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockFilter;
export type { StockFilterData, StockFilterCriteria };
