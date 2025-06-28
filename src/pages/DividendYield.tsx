import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import StockFilter from '../components/ui/stock-filter';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Calendar, Search, Filter, TrendingUp, TrendingDown, ChevronDown, X, Loader2, DollarSign } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StockDetailsDialog from '../components/StockDetailsDialog';
import { DateRangePicker } from '../components/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';
import { AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area, ResponsiveContainer } from 'recharts';

interface StockOption {
  symbol: string;
  shortname: string;
}

interface LogoData {
  Symbol: string;
  company_name: string;
  LogoURL: string;
}

const DividendYield: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [stockOptions, setStockOptions] = useState<StockOption[]>([]);
  const [logos, setLogos] = useState<LogoData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -365),
    to: new Date()
  });

  // Fetch logos from CSV
  const fetchLogos = async () => {
    try {
      const response = await fetch('/logos.csv');
      const text = await response.text();
      const lines = text.split('\n');
      const logoData: LogoData[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',');
          logoData.push({
            Symbol: values[1]?.replace(/"/g, '') || '',
            company_name: values[2]?.replace(/"/g, '') || '',
            LogoURL: values[4]?.replace(/"/g, '') || ''
          });
        }
      }
      
      setLogos(logoData);
    } catch (error) {
      console.error('Error fetching logos:', error);
    }
  };

  // Fetch stock options from dividendsymbol table
  const fetchStockOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('dividendsymbol')
        .select('symbol, shortname')
        .not('symbol', 'is', null)
        .not('shortname', 'is', null)
        .order('symbol')
        .limit(100);

      if (error) throw error;
      
      const uniqueStocks = data?.filter((stock, index, self) => 
        index === self.findIndex(s => s.symbol === stock.symbol)
      ) || [];
      
      setStockOptions(uniqueStocks);
      
      if (uniqueStocks.length > 0 && !selectedSymbol) {
        setSelectedSymbol(uniqueStocks[0].symbol);
        setSearchTerm(uniqueStocks[0].symbol);
      }
    } catch (error) {
      console.error('Error fetching stock options:', error);
    }
  };

  // Get logo for symbol
  const getLogoForSymbol = (symbol: string) => {
    return logos.find(logo => logo.Symbol === symbol);
  };

  const selectedLogo = getLogoForSymbol(selectedSymbol);

  useEffect(() => {
    fetchStockOptions();
    fetchLogos();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSymbol) return;

      try {
        const { data: yieldData, error } = await supabase
          .from('dividendyieldhistory')
          .select('*')
          .eq('symbol', selectedSymbol)
          .gte('date', dateRange.from?.toISOString().split('T')[0])
          .lte('date', dateRange.to?.toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (error) {
          throw error;
        }
        
        if (yieldData) {
          const processedData = yieldData.map((item: any) => ({
            ...item,
            date: item.date || new Date().toISOString().split('T')[0]
          }));
          
          setChartData(processedData);
        }
      } catch (error) {
        console.error('Error fetching dividend yield data:', error);
      }
    };

    fetchData();
  }, [selectedSymbol, dateRange]);

  // Filter stocks based on search term
  const filteredStocks = stockOptions.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.shortname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dividend Yield History</h1>
        </div>

        {/* Enhanced Search Bar */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search stocks by symbol or company name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="pl-12 pr-4 py-3 bg-white/10 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 rounded-xl text-lg"
                />
              </div>
              <div className="flex items-center space-x-2 text-gray-300 bg-white/10 px-4 py-3 rounded-xl border border-gray-600">
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
            
            {/* Enhanced Dropdown */}
            {isDropdownOpen && (
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 bg-gray-800/95 backdrop-blur-lg border border-gray-600 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                  {filteredStocks.length > 0 ? (
                    <div className="p-2">
                      {filteredStocks.slice(0, 10).map((stock) => {
                        const logo = getLogoForSymbol(stock.symbol);
                        return (
                          <button
                            key={stock.symbol}
                            onClick={() => {
                              setSelectedSymbol(stock.symbol);
                              setSearchTerm(stock.symbol);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-700/50 rounded-lg transition-colors border-b border-gray-700/30 last:border-b-0"
                          >
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                              {logo?.LogoURL ? (
                                <img 
                                  src={logo.LogoURL} 
                                  alt={stock.symbol}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                                  {stock.symbol.slice(0, 2)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-semibold text-lg">{stock.symbol}</div>
                              <div className="text-gray-400 text-sm truncate">
                                {logo?.company_name || stock.shortname || 'Unknown Company'}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-400">
                      No stocks found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Selected Stock Display */}
            {selectedSymbol && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center space-x-3 bg-blue-500/20 px-6 py-3 rounded-xl border border-blue-500/30">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
                    {selectedLogo?.LogoURL ? (
                      <img 
                        src={selectedLogo.LogoURL} 
                        alt={selectedSymbol}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                        {selectedSymbol.slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-blue-400">{selectedSymbol}</span>
                    {selectedLogo?.company_name && (
                      <div className="text-sm text-gray-300">{selectedLogo.company_name}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Date Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Date Range</CardTitle>
            <CardDescription>Select the date range for dividend yield history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <DateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => setDateRange({ from: addDays(new Date(), -365), to: new Date() })}
              >
                Last Year
              </Button>
              <Button
                variant="outline"
                onClick={() => setDateRange({ from: addDays(new Date(), -90), to: new Date() })}
              >
                Last 3 Months
              </Button>
              <Button
                variant="outline"
                onClick={() => setDateRange({ from: addDays(new Date(), -30), to: new Date() })}
              >
                Last Month
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chart Display */}
        <Card>
          <CardHeader>
            <CardTitle>
              Dividend Yield History Chart
            </CardTitle>
            <CardDescription>
              {selectedSymbol ? `Dividend Yield History for ${selectedSymbol}` : 'Select a stock to view its dividend yield history'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="yield" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default DividendYield;
