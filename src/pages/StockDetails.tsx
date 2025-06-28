import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { fetchStockData, fetchChartData, fetchSimilarStocks } from "@/services/stockService";
import type { StockData, ChartData, SimilarStock } from "@/services/stockService";
import AIAnalysisDialog from "@/components/AIAnalysisDialog";
import { BarChart, TrendingUp, DollarSign, Calendar, Users, Activity, Percent, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface DividendData {
  buy_date: string | null;
  currentprice: number | null;
  dividend: number | null;
  dividendrate: number | null;
  dividendyield: number | null;
  earningsdate: string | null;
  exdividenddate: string | null;
  payoutdate: string | null;
  payoutratio: number | null;
  previousclose: number | null;
  shortname: string | null;
  symbol: string | null;
}

const StockDetails: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [activeTab, setActiveTab] = useState("summary");
  const [isAIAnalysisOpen, setIsAIAnalysisOpen] = useState(false);
  const [dividendData, setDividendData] = useState<DividendData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("1Y");

  // Fetch dividend data
  useEffect(() => {
    const fetchDividendData = async () => {
      if (!symbol) return;
      
      try {
        const { data, error } = await supabase
          .from('dividendsymbol')
          .select('*')
          .eq('symbol', symbol.toUpperCase())
          .single();

        if (error) {
          console.error('Error fetching dividend data:', error);
          return;
        }

        setDividendData(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchDividendData();
  }, [symbol]);

  const { data: stockData, isLoading: isStockLoading } = useQuery<StockData>({
    queryKey: ['stock', symbol],
    queryFn: () => fetchStockData(symbol!),
    meta: {
      onError: (error: Error) => {
        toast.error(error.message);
      }
    }
  });

  const { data: chartData, isLoading: isChartLoading } = useQuery<ChartData[]>({
    queryKey: ['stockChart', symbol],
    queryFn: () => fetchChartData(symbol!),
    meta: {
      onError: (error: Error) => {
        toast.error(error.message);
      }
    }
  });

  const { data: similarStocks, isLoading: isSimilarStocksLoading } = useQuery<SimilarStock[]>({
    queryKey: ['similarStocks', symbol],
    queryFn: () => fetchSimilarStocks(symbol!),
    meta: {
      onError: (error: Error) => {
        toast.error(error.message);
      }
    }
  });

  if (isStockLoading || isChartLoading || isSimilarStocksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-950">
        <Loader className="h-12 w-12" />
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Stock Not Found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find information for symbol {symbol}</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const formatMarketCap = (value: number): string => {
    if (value >= 1000000000000) {
      return `$${(value / 1000000000000).toFixed(2)}T`;
    } else if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else {
      return `$${value.toLocaleString()}`;
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-lg border border-gray-100 dark:border-gray-800">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-primary">${payload[0].value.toFixed(2)}</p>
          {dividendData && (
            <p className="text-sm text-green-500">
              Yield: {dividendData.dividendyield?.toFixed(2)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                {stockData.symbol}
                <span className="text-xl text-muted-foreground font-normal">{stockData.longName}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-2">{stockData.exchange} | {stockData.sector || 'N/A'}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setIsAIAnalysisOpen(true)}
              >
                <BarChart className="h-4 w-4" />
                AI Analysis
              </Button>
              <Button 
                variant="default" 
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Track Stock
              </Button>
            </div>
          </div>

          {/* Price and Stats Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Price and Chart */}
            <div className="lg:col-span-2 space-y-6">
              {/* Price Section */}
              <div className="p-6 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-baseline gap-4">
                  <h2 className="text-4xl font-bold">${stockData.regularMarketPrice.toFixed(2)}</h2>
                  <span className={`text-lg font-medium flex items-center gap-1 ${stockData.regularMarketChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {stockData.regularMarketChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {stockData.regularMarketChange >= 0 ? '+' : ''}{stockData.regularMarketChange.toFixed(2)} ({stockData.regularMarketChangePercent.toFixed(2)}%)
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">52W Range</p>
                      <p className="font-medium">{stockData.weekRange?.low.toFixed(2)} - {stockData.weekRange?.high.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Market Cap</p>
                      <p className="font-medium">{formatMarketCap(stockData.marketCap)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Volume</p>
                      <p className="font-medium">{stockData.regularMarketVolume.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">P/E Ratio</p>
                      <p className="font-medium">{stockData.pe?.toFixed(2) || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Section */}
              <div className="p-6 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Price Chart</h3>
                  <div className="flex gap-2">
                    {["1D", "1W", "1M", "1Y", "5Y", "MAX"].map((period) => (
                      <Button 
                        key={period}
                        variant={selectedPeriod === period ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setSelectedPeriod(period)}
                        className="min-w-[40px]"
                      >
                        {period}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tick={{fontSize: 12}}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }}
                      />
                      <YAxis 
                        domain={['auto', 'auto']} 
                        tick={{fontSize: 12}}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        stroke="#e5e7eb" 
                        opacity={0.5}
                      />
                      <ChartTooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#2563eb" 
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dividend Information */}
              {dividendData && (
                <div className="p-6 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Dividend Information</h3>
                    <Badge variant="outline" className="text-green-500 border-green-500">
                      Active Dividend Stock
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-sm text-muted-foreground">Current Price</span>
                        <span className="font-medium">${dividendData.currentprice?.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-sm text-muted-foreground">Dividend Yield</span>
                        <span className="font-medium flex items-center gap-1">
                          <Percent className="h-4 w-4" />
                          {dividendData.dividendyield?.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-sm text-muted-foreground">Dividend Rate</span>
                        <span className="font-medium">${dividendData.dividendrate?.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-sm text-muted-foreground">Ex-Dividend Date</span>
                        <span className="font-medium">{formatDate(dividendData.exdividenddate)}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-sm text-muted-foreground">Payout Date</span>
                        <span className="font-medium">{formatDate(dividendData.payoutdate)}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-sm text-muted-foreground">Buy Date</span>
                        <span className="font-medium">{formatDate(dividendData.buy_date)}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-sm text-muted-foreground">Next Earnings</span>
                        <span className="font-medium">{formatDate(dividendData.earningsdate)}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-sm text-muted-foreground">Previous Close</span>
                        <span className="font-medium">${dividendData.previousclose?.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-sm text-muted-foreground">Payout Ratio</span>
                        <span className="font-medium">{dividendData.payoutratio?.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Last updated: {formatDate(dividendData.buy_date)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabs Section */}
              <div className="rounded-xl border border-gray-100 dark:border-gray-800">
                <Tabs defaultValue="summary" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                  <div className="border-b border-gray-100 dark:border-gray-800">
                    <TabsList className="w-full justify-start p-0 h-12 bg-transparent">
                      <TabsTrigger value="summary" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 rounded-none px-6">Summary</TabsTrigger>
                      <TabsTrigger value="financials" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 rounded-none px-6">Financials</TabsTrigger>
                      <TabsTrigger value="analysis" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 rounded-none px-6">Analysis</TabsTrigger>
                      <TabsTrigger value="news" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 rounded-none px-6">News</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="summary" className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Key Statistics</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-sm text-muted-foreground">EPS (FWD)</span>
                            <span className="font-medium">{stockData.eps?.toFixed(2) || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-sm text-muted-foreground">Dividend Yield</span>
                            <span className="font-medium">{stockData.yield ? `${stockData.yield.toFixed(2)}%` : '-'}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-sm text-muted-foreground">Short Interest</span>
                            <span className="font-medium">{stockData.shortInterest?.toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold">About {stockData.longName}</h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {stockData.longBusinessSummary || 'No company description available.'}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="financials" className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Financial Highlights</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-sm text-muted-foreground">Revenue</span>
                            <span className="font-medium">{stockData.totalRevenue ? formatMarketCap(stockData.totalRevenue) : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-sm text-muted-foreground">Net Income</span>
                            <span className="font-medium">{stockData.netIncomeToCommon ? formatMarketCap(stockData.netIncomeToCommon) : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right Column - Similar Stocks */}
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Similar Stocks</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {similarStocks?.map((stock) => (
                      <TableRow key={stock.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell className="font-medium">{stock.symbol}</TableCell>
                        <TableCell className="text-right">${stock.lastPrice.toFixed(2)}</TableCell>
                        <TableCell className={`text-right font-medium flex items-center justify-end gap-1 ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {stock.change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                          {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4">
                  <Button variant="outline" className="w-full">Compare Stocks</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AIAnalysisDialog
        isOpen={isAIAnalysisOpen}
        onClose={() => setIsAIAnalysisOpen(false)}
        symbol={symbol}
        currentPrice={stockData?.currentprice || 0}
        sector={stockData?.sector || ""}
      />
      
      <Footer />
    </div>
  );
};

export default StockDetails;
