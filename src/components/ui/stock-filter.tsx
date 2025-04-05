
import React, { useState } from 'react';
import { Check, ChevronsUpDown, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// Export the StockFilterData interface for use in other components
export interface StockFilterData {
  symbol: string;
  sector?: string;
  exchange?: string;
  dividendYield?: number;
  payoutRatio?: number;
  financialHealthScore?: number;
  debtLevels?: number;
  revenue?: number;
  earningsPerShare?: number;
  // Capitalized properties for compatibility with API responses
  Sector?: string;
  Exchange?: string;
  Revenue?: number;
  Earnings_per_share?: number;
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

interface StockFilterProps {
  onFilterApply: (criteria: StockFilterCriteria) => void;
  filterableStocks: StockFilterData[];
  isCalendarView?: boolean;
}

const StockFilter: React.FC<StockFilterProps> = ({ onFilterApply, filterableStocks, isCalendarView = false }) => {
  const [open, setOpen] = useState(false);
  const [criteria, setCriteria] = useState<StockFilterCriteria>({});
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Extract unique sectors and exchanges from filterable stocks
  const sectors = Array.from(new Set(filterableStocks.map(stock => stock.sector || stock.Sector).filter(Boolean)));
  const exchanges = Array.from(new Set(filterableStocks.map(stock => stock.exchange || stock.Exchange).filter(Boolean)));

  const handleFilterChange = (key: keyof StockFilterCriteria, value: any) => {
    const newCriteria = { ...criteria, [key]: value };
    
    // Update active filters array for display
    const updatedFilters = [...activeFilters];
    const filterIndex = updatedFilters.findIndex(f => f.startsWith(`${key}:`));
    
    if (value !== undefined && value !== '' && value !== false) {
      const filterLabel = `${key}:${value}`;
      if (filterIndex >= 0) {
        updatedFilters[filterIndex] = filterLabel;
      } else {
        updatedFilters.push(filterLabel);
      }
    } else if (filterIndex >= 0) {
      updatedFilters.splice(filterIndex, 1);
    }
    
    setActiveFilters(updatedFilters);
    setCriteria(newCriteria);
  };

  const handleApplyFilters = () => {
    onFilterApply(criteria);
    setOpen(false);
  };

  const clearFilters = () => {
    setCriteria({});
    setActiveFilters([]);
    onFilterApply({});
  };

  const removeFilter = (filter: string) => {
    const key = filter.split(':')[0] as keyof StockFilterCriteria;
    const newCriteria = { ...criteria };
    delete newCriteria[key];
    
    const filterIndex = activeFilters.indexOf(filter);
    if (filterIndex >= 0) {
      const newFilters = [...activeFilters];
      newFilters.splice(filterIndex, 1);
      setActiveFilters(newFilters);
    }
    
    setCriteria(newCriteria);
    onFilterApply(newCriteria);
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`flex items-center justify-between ${isCalendarView ? 'w-[120px] bg-gray-800/90 border-gray-700 hover:border-blue-500 focus:ring-blue-500' : ''}`}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-2 rounded-full">
                {activeFilters.length}
              </Badge>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search symbol..." 
                         value={criteria.symbol || ''}
                         onValueChange={(value) => handleFilterChange('symbol', value)} />
            
            <CommandGroup className="px-3 py-2">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-gray-500">Sector</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between mt-1 h-8 text-xs"
                        size="sm"
                      >
                        {criteria.sector || 'Select Sector'}
                        <ChevronsUpDown className="ml-2 h-3 w-3 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search sector..." />
                        <CommandEmpty>No sectors found.</CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-y-auto">
                          {sectors.map((sector) => (
                            <CommandItem
                              key={sector}
                              value={sector}
                              onSelect={() => handleFilterChange('sector', sector)}
                              className="text-sm"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  criteria.sector === sector ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {sector}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500">Exchange</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between mt-1 h-8 text-xs"
                        size="sm"
                      >
                        {criteria.exchange || 'Select Exchange'}
                        <ChevronsUpDown className="ml-2 h-3 w-3 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search exchange..." />
                        <CommandEmpty>No exchanges found.</CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-y-auto">
                          {exchanges.map((exchange) => (
                            <CommandItem
                              key={exchange}
                              value={exchange}
                              onSelect={() => handleFilterChange('exchange', exchange)}
                              className="text-sm"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  criteria.exchange === exchange ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {exchange}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500">Dividend Yield Range</Label>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs">{criteria.minDividendYield || 0}%</span>
                    <span className="text-xs">{criteria.maxDividendYield || 10}%</span>
                  </div>
                  <Slider 
                    defaultValue={[0, 10]} 
                    max={10} 
                    step={0.1}
                    value={[criteria.minDividendYield || 0, criteria.maxDividendYield || 10]}
                    onValueChange={([min, max]) => {
                      handleFilterChange('minDividendYield', min);
                      handleFilterChange('maxDividendYield', max);
                    }}
                    className="mt-1" 
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500">Payout Ratio Range</Label>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs">{criteria.minPayoutRatio || 0}%</span>
                    <span className="text-xs">{criteria.maxPayoutRatio || 100}%</span>
                  </div>
                  <Slider 
                    defaultValue={[0, 100]} 
                    max={100} 
                    step={1}
                    value={[criteria.minPayoutRatio || 0, criteria.maxPayoutRatio || 100]}
                    onValueChange={([min, max]) => {
                      handleFilterChange('minPayoutRatio', min);
                      handleFilterChange('maxPayoutRatio', max);
                    }}
                    className="mt-1" 
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500">Minimum Financial Health Score</Label>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs">0</span>
                    <span className="text-xs">10</span>
                  </div>
                  <Slider 
                    defaultValue={[0]} 
                    max={10} 
                    step={1}
                    value={[criteria.minHealthScore || 0]}
                    onValueChange={([value]) => handleFilterChange('minHealthScore', value)}
                    className="mt-1" 
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="debt-filter" 
                    checked={criteria.hasDebtConcerns || false}
                    onCheckedChange={(checked) => handleFilterChange('hasDebtConcerns', checked)} 
                  />
                  <Label htmlFor="debt-filter" className="text-xs">Exclude Stocks with Debt Concerns</Label>
                </div>
              </div>
            </CommandGroup>
            
            <Separator />
            
            <div className="p-3 flex justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-xs"
              >
                Reset
              </Button>
              <Button 
                size="sm" 
                onClick={handleApplyFilters}
                className="text-xs"
              >
                Apply Filters
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Active filters display */}
      {activeFilters.length > 0 && !isCalendarView && (
        <div className="flex flex-wrap gap-2 mt-2">
          {activeFilters.map(filter => (
            <Badge key={filter} variant="secondary" className="flex items-center">
              {filter}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter(filter)} 
              />
            </Badge>
          ))}
          <Badge 
            variant="outline" 
            className="cursor-pointer" 
            onClick={clearFilters}
          >
            Clear All
          </Badge>
        </div>
      )}
    </div>
  );
};

export default StockFilter;
