
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface StockFilterData {
  sectors: string[];
  exchanges: string[];
  minRevenue: number;
  maxRevenue: number;
  minEPS: number;
  maxEPS: number;
}

interface StockFilterProps {
  filterData: StockFilterData;
  selectedSector: string;
  selectedExchange: string;
  onSectorChange: (sector: string) => void;
  onExchangeChange: (exchange: string) => void;
  onRevenueRangeChange: (min: number, max: number) => void;
  onEPSRangeChange: (min: number, max: number) => void;
}

const StockFilter: React.FC<StockFilterProps> = ({
  filterData,
  selectedSector,
  selectedExchange,
  onSectorChange,
  onExchangeChange,
  onRevenueRangeChange,
  onEPSRangeChange,
}) => {
  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Filter Stocks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="sector" className="text-gray-300">Sector</Label>
          <Select value={selectedSector} onValueChange={onSectorChange}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="all">All Sectors</SelectItem>
              {filterData.sectors.map(sector => (
                <SelectItem key={sector} value={sector}>{sector}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="exchange" className="text-gray-300">Exchange</Label>
          <Select value={selectedExchange} onValueChange={onExchangeChange}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select exchange" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="all">All Exchanges</SelectItem>
              {filterData.exchanges.map(exchange => (
                <SelectItem key={exchange} value={exchange}>{exchange}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="minRevenue" className="text-gray-300">Min Revenue</Label>
            <Input
              id="minRevenue"
              type="number"
              placeholder="0"
              className="bg-gray-800 border-gray-600 text-white"
              onChange={(e) => onRevenueRangeChange(Number(e.target.value), filterData.maxRevenue)}
            />
          </div>
          <div>
            <Label htmlFor="maxRevenue" className="text-gray-300">Max Revenue</Label>
            <Input
              id="maxRevenue"
              type="number"
              placeholder="1000000"
              className="bg-gray-800 border-gray-600 text-white"
              onChange={(e) => onRevenueRangeChange(filterData.minRevenue, Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="minEPS" className="text-gray-300">Min EPS</Label>
            <Input
              id="minEPS"
              type="number"
              placeholder="0"
              step="0.01"
              className="bg-gray-800 border-gray-600 text-white"
              onChange={(e) => onEPSRangeChange(Number(e.target.value), filterData.maxEPS)}
            />
          </div>
          <div>
            <Label htmlFor="maxEPS" className="text-gray-300">Max EPS</Label>
            <Input
              id="maxEPS"
              type="number"
              placeholder="100"
              step="0.01"
              className="bg-gray-800 border-gray-600 text-white"
              onChange={(e) => onEPSRangeChange(filterData.minEPS, Number(e.target.value))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { StockFilter };
export default StockFilter;
