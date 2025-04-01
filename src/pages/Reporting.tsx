
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateRangePicker } from '@/components/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BellRing, Calendar, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, Search, Clock, List, BarChart3, CalendarIcon, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

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

const Reporting: React.FC = () => {
  const [reports, setReports] = useState<DividendReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'chart'>('list');
  const [trackPrices, setTrackPrices] = useState(false);
  const [trackInterval, setTrackInterval] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof DividendReport;
    direction: 'ascending' | 'descending';
  } | null>(null);

  useEffect(() => {
    fetchReports();
  }, [dateRange, trackPrices]);

  useEffect(() => {
    if (trackPrices) {
      const interval = setInterval(updatePrices, 60000); // Update prices every minute
      setTrackInterval(interval as unknown as number);
      updatePrices(); // Initial price update
      return () => {
        if (trackInterval) clearInterval(trackInterval);
      };
    } else if (trackInterval) {
      clearInterval(trackInterval);
      setTrackInterval(null);
    }
  }, [trackPrices]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dividend reports
      const { data, error } = await supabase
        .from('dividend_reports')
        .select('*');

      if (error) throw error;

      // Filter by date range if set
      let filteredData = data;
      if (dateRange?.from && dateRange?.to) {
        const fromDate = format(dateRange.from, 'yyyy-MM-dd');
        const toDate = format(dateRange.to, 'yyyy-MM-dd');
        
        filteredData = data.filter(item => {
          const reportDate = item.dividend_date || item.ex_dividend_date || item.earnings_date;
          return reportDate >= fromDate && reportDate <= toDate;
        });
      }

      // Add fake price history for demonstration
      const reportsWithPriceHistory = filteredData.map(report => {
        const priceHistory = generatePriceHistory(30);
        const currentPrice = priceHistory[priceHistory.length - 1].price;
        const initialPrice = priceHistory[0].price;
        
        let priceStatus: 'high' | 'low' | 'medium' = 'medium';
        if (currentPrice > initialPrice * 1.05) {
          priceStatus = 'high';
        } else if (currentPrice < initialPrice * 0.95) {
          priceStatus = 'low';
        }
        
        return {
          ...report,
          price_history: priceHistory,
          current_price: currentPrice,
          price_status: priceStatus
        };
      });

      setReports(reportsWithPriceHistory);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Failed to fetch dividend reports');
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const updatePrices = () => {
    if (!trackPrices) return;

    const updatedReports = reports.map(report => {
      // Simulate price movement (-2% to +2% change)
      const priceChange = (Math.random() * 4 - 2) / 100;
      const newPrice = report.current_price ? report.current_price * (1 + priceChange) : 0;
      
      const newPriceHistory = [...(report.price_history || [])];
      
      // Remove oldest price point and add newest
      if (newPriceHistory.length > 30) {
        newPriceHistory.shift();
      }
      
      newPriceHistory.push({
        date: new Date().toISOString(),
        price: newPrice
      });
      
      // Determine price status
      const initialPrice = newPriceHistory[0]?.price || 0;
      let priceStatus: 'high' | 'low' | 'medium' = 'medium';
      
      if (newPrice > initialPrice * 1.05) {
        priceStatus = 'high';
      } else if (newPrice < initialPrice * 0.95) {
        priceStatus = 'low';
      }
      
      return {
        ...report,
        price_history: newPriceHistory,
        current_price: newPrice,
        price_status: priceStatus
      };
    });
    
    setReports(updatedReports);
  };

  const generatePriceHistory = (days: number) => {
    const data = [];
    const basePrice = 50 + Math.random() * 150; // Random base price between 50 and 200
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Create some random price movement
      const volatility = 0.02; // 2% daily volatility
      const change = (Math.random() * 2 - 1) * volatility;
      const previousPrice = data[data.length - 1]?.price || basePrice;
      const newPrice = previousPrice * (1 + change);
      
      data.push({
        date: date.toISOString(),
        price: newPrice
      });
    }
    
    return data;
  };

  const requestSort = (key: keyof DividendReport) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  const getSortedReports = () => {
    if (!sortConfig) return filteredReports;
    
    return [...filteredReports].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredReports = reports.filter(report => {
    const searchValue = searchQuery.toLowerCase();
    return report.symbol.toLowerCase().includes(searchValue);
  });

  const sortedReports = getSortedReports();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <Card className="shadow-md border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-2xl font-bold">Dividend Reports</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="flex-1 px-4 py-2">
                  <DateRangePicker 
                    value={dateRange}
                    onChange={setDateRange}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="track-prices"
                      checked={trackPrices}
                      onCheckedChange={setTrackPrices}
                    />
                    <Label htmlFor="track-prices">Track prices</Label>
                  </div>
                  <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                    <TabsList>
                      <TabsTrigger value="list">
                        <List className="h-4 w-4" />
                      </TabsTrigger>
                      <TabsTrigger value="chart">
                        <BarChart3 className="h-4 w-4" />
                      </TabsTrigger>
                      <TabsTrigger value="calendar">
                        <CalendarIcon className="h-4 w-4" />
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-6">
                <Search className="h-5 w-5 text-gray-500" />
                <Input
                  placeholder="Search by symbol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                />
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 p-4 rounded-lg">
                  {error}
                </div>
              ) : sortedReports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No dividend reports found for the selected criteria.
                </div>
              ) : (
                <TabsContent value="list" className="mt-0">
                  <div className="overflow-auto max-h-[70vh]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead 
                            onClick={() => requestSort('symbol')}
                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <div className="flex items-center space-x-1">
                              <span>Symbol</span>
                              {sortConfig?.key === 'symbol' && (
                                sortConfig.direction === 'ascending' ? 
                                <ChevronUp className="h-4 w-4" /> : 
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead>Dividend Date</TableHead>
                          <TableHead>Ex-Dividend Date</TableHead>
                          <TableHead>Earnings Date</TableHead>
                          <TableHead>Earnings Est.</TableHead>
                          <TableHead>Revenue Est.</TableHead>
                          {trackPrices && (
                            <>
                              <TableHead>Current Price</TableHead>
                              <TableHead>Price Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">{report.symbol}</TableCell>
                            <TableCell>{report.dividend_date || 'N/A'}</TableCell>
                            <TableCell>{report.ex_dividend_date || 'N/A'}</TableCell>
                            <TableCell>{report.earnings_date || 'N/A'}</TableCell>
                            <TableCell>
                              ${report.earnings_low.toFixed(2)} - ${report.earnings_high.toFixed(2)}
                              <div className="text-xs text-gray-500">Avg: ${report.earnings_average.toFixed(2)}</div>
                            </TableCell>
                            <TableCell>
                              ${report.revenue_low.toFixed(2)}B - ${report.revenue_high.toFixed(2)}B
                              <div className="text-xs text-gray-500">Avg: ${report.revenue_average.toFixed(2)}B</div>
                            </TableCell>
                            {trackPrices && (
                              <>
                                <TableCell>
                                  <div className="flex items-center">
                                    ${report.current_price?.toFixed(2)}
                                    {report.price_status === 'high' ? (
                                      <ArrowUpRight className="ml-1 text-green-600 h-4 w-4" />
                                    ) : report.price_status === 'low' ? (
                                      <ArrowDownRight className="ml-1 text-red-600 h-4 w-4" />
                                    ) : null}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className={`rounded-full px-2 py-1 text-xs font-medium inline-block 
                                    ${report.price_status === 'high' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                      : report.price_status === 'low'
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                    }`}
                                  >
                                    {report.price_status === 'high' 
                                      ? 'High' 
                                      : report.price_status === 'low' 
                                      ? 'Low' 
                                      : 'Stable'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="flex items-center text-xs"
                                  >
                                    <Eye className="mr-1 h-3 w-3" />
                                    View History
                                  </Button>
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              )}
              
              <TabsContent value="chart">
                <div className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sortedReports}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="symbol" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70} 
                      />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="earnings_average" fill="#8884d8" name="Earnings Est." />
                      <Bar yAxisId="right" dataKey="revenue_average" fill="#82ca9d" name="Revenue Est." />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="calendar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedReports.map((report) => (
                    <Card key={report.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{report.symbol}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                            <span className="font-medium">Dividend Date:</span>
                            <span className="ml-2">{report.dividend_date || 'N/A'}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                            <span className="font-medium">Ex-Dividend Date:</span>
                            <span className="ml-2">{report.ex_dividend_date || 'N/A'}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                            <span className="font-medium">Earnings Date:</span>
                            <span className="ml-2">{report.earnings_date || 'N/A'}</span>
                          </div>
                          {report.price_history && trackPrices && (
                            <div className="mt-3 h-20">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={report.price_history}>
                                  <Line 
                                    type="monotone" 
                                    dataKey="price" 
                                    stroke={
                                      report.price_status === 'high' 
                                        ? '#10b981' 
                                        : report.price_status === 'low' 
                                        ? '#ef4444' 
                                        : '#6366f1'
                                    } 
                                    strokeWidth={2} 
                                    dot={false} 
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reporting;
