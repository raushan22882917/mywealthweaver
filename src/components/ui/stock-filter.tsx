import React, { useState, useEffect } from "react";
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
import { supabase } from "@/lib/supabase";

export interface StockFilterData {
  id: number;
  symbol: string;
  sector: string;
  exchange: string;
  dividend_yield: number;
  payout_ratio: number;
  financial_health_score: number;
  debt_levels: number;
  revenue: number;
  earnings_per_share: number;
  five_year_dividend_yield?: number;
  status?: string;
}

interface StockFilterProps {
  onFilterApply: (filters: StockFilterCriteria) => void;
  stocks?: StockFilterData[];
  isCalendarView?: boolean;
}

export interface StockFilterCriteria {
  symbol?: string;
  sector?: string;
  exchange?: string;
  dividend_yield_min?: string;
  dividend_yield_max?: string;
  payout_ratio_min?: string;
  payout_ratio_max?: string;
  financial_health_min?: string;
  debt_concerns?: string;
}

const StockFilter: React.FC<StockFilterProps> = ({ 
  onFilterApply, 
  stocks = [],
  isCalendarView = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFilteredTable, setShowFilteredTable] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState<StockFilterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter criteria
  const [filters, setFilters] = useState<StockFilterCriteria>({
    sector: '_all',
    exchange: '_all',
    debt_concerns: '_all'
  });

  const [showResultsPopup, setShowResultsPopup] = useState(false);

  useEffect(() => {
    setFilteredStocks(stocks);
  }, [stocks]);

  // Extract unique sectors and exchanges for dropdowns
  const uniqueSectors = ['_all', ...Array.from(new Set(stocks?.map(stock => stock.sector).filter(Boolean) || []))];
  const uniqueExchanges = ['_all', ...Array.from(new Set(stocks?.map(stock => stock.exchange).filter(Boolean) || []))];

  const handleFilterChange = (key: keyof StockFilterCriteria, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    if (!stocks?.length) return;

    const newFilteredStocks = stocks.filter(stock => {
      // Symbol filter
      if (filters.symbol && !stock.symbol.toLowerCase().includes(filters.symbol.toLowerCase())) {
        return false;
      }

      // Sector filter
      if (filters.sector !== '_all' && stock.sector !== filters.sector) {
        return false;
      }

      // Exchange filter
      if (filters.exchange !== '_all' && stock.exchange !== filters.exchange) {
        return false;
      }

      // Dividend yield filter
      if (filters.dividend_yield_min || filters.dividend_yield_max) {
        const yieldMin = filters.dividend_yield_min ? parseFloat(filters.dividend_yield_min) : 0;
        const yieldMax = filters.dividend_yield_max ? parseFloat(filters.dividend_yield_max) : Infinity;
        if (stock.dividend_yield < yieldMin || stock.dividend_yield > yieldMax) {
          return false;
        }
      }

      // Payout ratio filter
      if (filters.payout_ratio_min || filters.payout_ratio_max) {
        const payoutMin = filters.payout_ratio_min ? parseFloat(filters.payout_ratio_min) : 0;
        const payoutMax = filters.payout_ratio_max ? parseFloat(filters.payout_ratio_max) : Infinity;
        if (stock.payout_ratio < payoutMin || stock.payout_ratio > payoutMax) {
          return false;
        }
      }

      // Financial health filter
      if (filters.financial_health_min && stock.financial_health_score < parseFloat(filters.financial_health_min)) {
        return false;
      }

      // Debt concerns filter
      if (filters.debt_concerns !== '_all' && stock.debt_levels !== parseInt(filters.debt_concerns)) {
        return false;
      }

      return true;
    });

    setFilteredStocks(newFilteredStocks);
    setShowFilteredTable(true);
    onFilterApply(filters);
    setIsOpen(false); // Close the filter dialog
    setShowResultsPopup(true); // Show the results popup
  };

  const resetFilters = () => {
    setFilters({
      sector: '_all',
      exchange: '_all',
      debt_concerns: '_all'
    });
    setFilteredStocks(stocks);
    setShowFilteredTable(false);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => setIsOpen(true)} variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter Stocks
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Filter Stocks</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Symbol Filter */}
            <div className="space-y-2">
              <Label>Symbol</Label>
              <Input 
                placeholder="Enter stock symbol"
                value={filters.symbol}
                onChange={(e) => handleFilterChange('symbol', e.target.value)}
              />
            </div>

            {/* Sector Filter */}
            <div className="space-y-2">
              <Label>Sector</Label>
              <Select 
                value={filters.sector} 
                onValueChange={(value) => handleFilterChange('sector', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueSectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector === '_all' ? 'All Sectors' : sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exchange Filter */}
            <div className="space-y-2">
              <Label>Exchange</Label>
              <Select 
                value={filters.exchange} 
                onValueChange={(value) => handleFilterChange('exchange', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exchange" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueExchanges.map((exchange) => (
                    <SelectItem key={exchange} value={exchange}>
                      {exchange === '_all' ? 'All Exchanges' : exchange}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Dividend Yield Filter */}
            <div className="space-y-2">
              <Label>Dividend Yield Range (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={filters.dividend_yield_min}
                  onChange={(e) => handleFilterChange('dividend_yield_min', e.target.value)}
                  className="w-20"
                />
                <span>to</span>
                <Input
                  type="number"
                  value={filters.dividend_yield_max}
                  onChange={(e) => handleFilterChange('dividend_yield_max', e.target.value)}
                  className="w-20"
                />
              </div>
            </div>

            {/* Payout Ratio Filter */}
            <div className="space-y-2">
              <Label>Payout Ratio Range (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={filters.payout_ratio_min}
                  onChange={(e) => handleFilterChange('payout_ratio_min', e.target.value)}
                  className="w-20"
                />
                <span>to</span>
                <Input
                  type="number"
                  value={filters.payout_ratio_max}
                  onChange={(e) => handleFilterChange('payout_ratio_max', e.target.value)}
                  className="w-20"
                />
              </div>
            </div>

            {/* Financial Health Filter */}
            <div className="space-y-2">
              <Label>Minimum Financial Health Score</Label>
              <Input
                type="number"
                value={filters.financial_health_min}
                onChange={(e) => handleFilterChange('financial_health_min', e.target.value)}
                className="w-20"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setFilters({
                  symbol: '',
                  sector: '_all',
                  exchange: '_all',
                  dividend_yield_min: '',
                  dividend_yield_max: '',
                  payout_ratio_min: '',
                  payout_ratio_max: '',
                  financial_health_min: '',
                  debt_concerns: '_all'
                });
                setShowFilteredTable(false);
              }}
            >
              Reset
            </Button>
            <Button onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading && <div className="text-center py-4">Loading stocks...</div>}
      {error && <div className="text-red-500 py-4">{error}</div>}
      
      {showFilteredTable && !isLoading && (
        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-2">
            Found {filteredStocks.length} matching stocks
          </div>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Exchange</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Dividend Yield</TableHead>
                  <TableHead>5Y Avg Yield</TableHead>
                  <TableHead>Payout Ratio</TableHead>
                  <TableHead>Health Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks.map((stock) => (
                  <TableRow key={stock.symbol}>
                    <TableCell className="font-medium">{stock.symbol}</TableCell>
                    <TableCell>{stock.exchange}</TableCell>
                    <TableCell>{stock.sector}</TableCell>
                    <TableCell>{(stock.dividend_yield * 100).toFixed(2)}%</TableCell>
                    <TableCell>{((stock.five_year_dividend_yield || stock.dividend_yield) * 100).toFixed(2)}%</TableCell>
                    <TableCell>{(stock.payout_ratio * 100).toFixed(2)}%</TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        stock.financial_health_score >= 7 ? 'text-green-600' :
                        stock.financial_health_score >= 4 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {stock.financial_health_score.toFixed(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Results Popup */}
      {showResultsPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="relative bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Filter Results ({filteredStocks.length} stocks)</h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowResultsPopup(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Active Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(filters).map(([key, value]) => {
                  if (value && value !== '_all') {
                    return (
                      <Badge key={key} variant="secondary">
                        {key}: {value.toString()}
                      </Badge>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Results Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Exchange</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Dividend Yield</TableHead>
                      <TableHead>5Y Avg Yield</TableHead>
                      <TableHead>Payout Ratio</TableHead>
                      <TableHead>Health Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStocks.map((stock) => (
                      <TableRow key={stock.symbol}>
                        <TableCell className="font-medium">{stock.symbol}</TableCell>
                        <TableCell>{stock.exchange}</TableCell>
                        <TableCell>{stock.sector}</TableCell>
                        <TableCell>{(stock.dividend_yield * 100).toFixed(2)}%</TableCell>
                        <TableCell>{((stock.five_year_dividend_yield || stock.dividend_yield) * 100).toFixed(2)}%</TableCell>
                        <TableCell>{(stock.payout_ratio * 100).toFixed(2)}%</TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            stock.financial_health_score >= 7 ? 'text-green-600' :
                            stock.financial_health_score >= 4 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {stock.financial_health_score.toFixed(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockFilter;
