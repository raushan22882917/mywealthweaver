
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, X, Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

export interface StockFilterData {
  symbol: string;
  location?: string;
  exchange?: string;
  sector?: string;
  subSector?: string;
  revenueGrowth?: number;
  netIncome?: number;
  debtLevels?: number;
  payoutRatio?: number;
  dividendYield?: number;
  fiveYearDividendYield?: number;
  dividendHistory?: string;
  financialHealthScore?: number;
  revenue?: number;
  earningsPerShare?: number;
  adjustedDividendYield?: number;
  payoutRatioPenalty?: number;
}

interface StockFilterProps {
  onFilterApply: (filters: StockFilterCriteria) => void;
  filterableStocks: StockFilterData[];
  isCalendarView?: boolean;
}

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

const StockFilter: React.FC<StockFilterProps> = ({ 
  onFilterApply, 
  filterableStocks,
  isCalendarView = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFilteredTable, setShowFilteredTable] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState<StockFilterData[]>([]);
  
  // Filter criteria
  const [filters, setFilters] = useState<StockFilterCriteria>({
    minDividendYield: 0,
    maxDividendYield: 15,
    minPayoutRatio: 0,
    maxPayoutRatio: 100,
    minHealthScore: 0,
    hasDebtConcerns: false
  });

  // Extract unique sectors and exchanges for dropdowns
  const uniqueSectors = Array.from(new Set(filterableStocks.map(stock => stock.sector).filter(Boolean)));
  const uniqueExchanges = Array.from(new Set(filterableStocks.map(stock => stock.exchange).filter(Boolean)));

  const handleFilterChange = (key: keyof StockFilterCriteria, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const newFilteredStocks = filterableStocks.filter(stock => {
      // Symbol filter
      if (filters.symbol && !stock.symbol.toLowerCase().includes(filters.symbol.toLowerCase())) {
        return false;
      }
      
      // Sector filter
      if (filters.sector && stock.sector !== filters.sector) {
        return false;
      }
      
      // Exchange filter
      if (filters.exchange && stock.exchange !== filters.exchange) {
        return false;
      }
      
      // Dividend Yield filter
      if (stock.dividendYield !== undefined && 
          (stock.dividendYield < (filters.minDividendYield || 0) || 
           stock.dividendYield > (filters.maxDividendYield || 100))) {
        return false;
      }
      
      // Payout Ratio filter
      if (stock.payoutRatio !== undefined && 
          (stock.payoutRatio < (filters.minPayoutRatio || 0) || 
           stock.payoutRatio > (filters.maxPayoutRatio || 100))) {
        return false;
      }
      
      // Health Score filter
      if (stock.financialHealthScore !== undefined && 
          stock.financialHealthScore < (filters.minHealthScore || 0)) {
        return false;
      }
      
      // Debt Concerns filter
      if (filters.hasDebtConcerns && stock.debtLevels !== undefined && stock.debtLevels < 3) {
        return false;
      }
      
      return true;
    });
    
    setFilteredStocks(newFilteredStocks);
    setShowFilteredTable(true);
    onFilterApply(filters);
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
      >
        <Filter className="h-4 w-4" />
        <span>Filter Stocks</span>
        {Object.values(filters).some(val => val !== undefined && val !== "" && val !== 0 && val !== false) && (
          <Badge variant="secondary" className="ml-1 bg-blue-500 text-white">
            Active
          </Badge>
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
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  placeholder="e.g., AAPL"
                  value={filters.symbol || ""}
                  onChange={(e) => handleFilterChange("symbol", e.target.value)}
                />
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
          {showFilteredTable && filteredStocks.length > 0 && (
            <div className="mt-4 border rounded-lg p-4 overflow-auto max-h-[400px]">
              <h3 className="text-lg font-medium mb-3">Filtered Results ({filteredStocks.length} stocks)</h3>
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
                    <TableRow key={stock.symbol}>
                      <TableCell className="font-medium">{stock.symbol}</TableCell>
                      <TableCell>{stock.sector || "N/A"}</TableCell>
                      <TableCell>{stock.exchange || "N/A"}</TableCell>
                      <TableCell>{stock.dividendYield !== undefined ? `${stock.dividendYield.toFixed(2)}%` : "N/A"}</TableCell>
                      <TableCell>{stock.payoutRatio !== undefined ? `${stock.payoutRatio.toFixed(2)}%` : "N/A"}</TableCell>
                      <TableCell>{stock.financialHealthScore !== undefined ? stock.financialHealthScore.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stock.revenue !== undefined ? formatValue(stock.revenue) : "N/A"}</TableCell>
                      <TableCell>{stock.earningsPerShare !== undefined ? `$${stock.earningsPerShare.toFixed(2)}` : "N/A"}</TableCell>
                      <TableCell>
                        {stock.debtLevels !== undefined ? (
                          <Badge
                            variant={stock.debtLevels > 7 ? "destructive" : stock.debtLevels > 4 ? "default" : "secondary"}
                          >
                            {stock.debtLevels > 7 ? "High" : stock.debtLevels > 4 ? "Medium" : "Low"}
                          </Badge>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {showFilteredTable && filteredStocks.length === 0 && (
            <div className="mt-4 border rounded-lg p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">No stocks match your filter criteria.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockFilter;
