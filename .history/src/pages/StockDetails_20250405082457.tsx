import { useState } from "react";
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
} from "recharts";
import { fetchStockData, fetchChartData, fetchSimilarStocks } from "@/services/stockService";
import type { StockData, ChartData, SimilarStock } from "@/services/stockService";
import { AIAnalysisDialog } from "@/components/AIAnalysisDialog";
import { BarChart } from "lucide-react";

const StockDetails = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [activeTab, setActiveTab] = useState("summary");
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header Section - Company Name and Stock Symbol */}
          <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {stockData.symbol} - {stockData.longName}
              <Button 
                size="sm" 
                variant="outline" 
                className="ml-2 h-8 text-xs flex items-center gap-1"
                onClick={() => setIsAnalysisOpen(true)}
              >
                <BarChart className="h-3 w-3" />
                Analyze With AI
              </Button>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Stock Price & Overview</p>
          </div>

          {/* Price and Stats Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Price and Chart */}
            <div className="lg:col-span-2 space-y-6">
              {/* Price Section */}
              <div className="flex items-baseline">
                <h2 className="text-3xl font-bold">${stockData.regularMarketPrice.toFixed(2)}</h2>
                <span className={`ml-2 text-lg ${stockData.regularMarketChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {stockData.regularMarketChange.toFixed(2)} ({stockData.regularMarketChangePercent.toFixed(2)}%)
                </span>
                <span className="ml-2 text-xs text-muted-foreground">11:35 AM 04/04/25</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {stockData.exchange} | ${stockData.symbol} | Realtime
              </div>

              {/* Tabs Navigation */}
              <Tabs defaultValue="summary" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start border-b border-gray-200 dark:border-gray-800 mb-4">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="ratings">Ratings</TabsTrigger>
                  <TabsTrigger value="financials">Financials</TabsTrigger>
                  <TabsTrigger value="earnings">Earnings</TabsTrigger>
                  <TabsTrigger value="dividends">Dividends</TabsTrigger>
                  <TabsTrigger value="valuation">Valuation</TabsTrigger>
                  <TabsTrigger value="growth">Growth</TabsTrigger>
                  <TabsTrigger value="profitability">Profitability</TabsTrigger>
                  <TabsTrigger value="momentum">Momentum</TabsTrigger>
                  <TabsTrigger value="peers">Peers</TabsTrigger>
                  <TabsTrigger value="options">Options</TabsTrigger>
                  <TabsTrigger value="charting">Charting</TabsTrigger>
                </TabsList>

                {/* Secondary Navigation */}
                <div className="flex space-x-2 mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
                  <Button variant="ghost" size="sm" className={activeTab === "all" ? "bg-gray-100 dark:bg-gray-800" : ""}>All</Button>
                  <Button variant="ghost" size="sm" className={activeTab === "analysis" ? "bg-gray-100 dark:bg-gray-800" : ""}>Analysis</Button>
                  <Button variant="ghost" size="sm" className={activeTab === "comments" ? "bg-gray-100 dark:bg-gray-800" : ""}>Comments</Button>
                  <Button variant="ghost" size="sm" className={activeTab === "news" ? "bg-gray-100 dark:bg-gray-800" : ""}>News</Button>
                  <Button variant="ghost" size="sm" className={activeTab === "transcripts" ? "bg-gray-100 dark:bg-gray-800" : ""}>Transcripts & Insights</Button>
                  <Button variant="ghost" size="sm" className={activeTab === "sec" ? "bg-gray-100 dark:bg-gray-800" : ""}>SEC Filings</Button>
                  <Button variant="ghost" size="sm" className={activeTab === "press" ? "bg-gray-100 dark:bg-gray-800" : ""}>Press Releases</Button>
                  <Button variant="ghost" size="sm" className={activeTab === "related" ? "bg-gray-100 dark:bg-gray-800" : ""}>Related Analysis</Button>
                </div>

                {/* Stock Price Chart */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">{stockData.symbol} Stock Price</h3>
                  
                  {/* Chart Period Buttons */}
                  <div className="flex space-x-2 mb-4">
                    <Button variant="outline" size="sm">1D</Button>
                    <Button variant="outline" size="sm">5D</Button>
                    <Button variant="outline" size="sm">1M</Button>
                    <Button variant="outline" size="sm">6M</Button>
                    <Button variant="outline" size="sm">YTD</Button>
                    <Button variant="outline" size="sm" className="bg-gray-900 text-white">1Y</Button>
                    <Button variant="outline" size="sm">5Y</Button>
                    <Button variant="outline" size="sm">10Y</Button>
                    <Button variant="outline" size="sm">MAX</Button>
                    <Button variant="outline" size="sm">Basic</Button>
                    <Button variant="outline" size="sm">Advanced</Button>
                  </div>
                  
                  {/* Price Change Badge */}
                  <Badge variant="destructive" className="mb-4">-28.85%</Badge>
                  
                  {/* Chart */}
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ff6b00" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{fontSize: 10}} />
                        <YAxis domain={['auto', 'auto']} tick={{fontSize: 10}} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <ChartTooltip />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#ff6b00" 
                          fillOpacity={1} 
                          fill="url(#colorPrice)" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tabs Content */}
                <TabsContent value="summary" className="space-y-4">
                  {/* Key Metrics Table */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">52 Week Range</span>
                        <span className="text-sm">{stockData.weekRange?.low.toFixed(2)} - {stockData.weekRange?.high.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Day Range</span>
                        <span className="text-sm">{stockData.dayRange?.low.toFixed(2)} - {stockData.dayRange?.high.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">EPS (FWD)</span>
                        <span className="text-sm">{stockData.eps?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">PE (FWD)</span>
                        <span className="text-sm">{stockData.pe?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Div Rate (TTM)</span>
                        <span className="text-sm">{stockData.divRate || '-'}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Yield (TTM)</span>
                        <span className="text-sm">{stockData.yield ? `${stockData.yield.toFixed(2)}%` : '-'}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Short Interest</span>
                        <span className="text-sm">{stockData.shortInterest?.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Market Cap</span>
                        <span className="text-sm">{formatMarketCap(stockData.marketCap)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Volume</span>
                        <span className="text-sm">{stockData.regularMarketVolume.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Prev. Close</span>
                        <span className="text-sm">${stockData.prevClose?.toFixed(2) || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* About Section */}
                  <Card className="p-6 mt-6 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <h3 className="text-xl font-semibold mb-4">About {stockData.longName}</h3>
                    <p className="text-muted-foreground">
                      {stockData.longBusinessSummary || 'No company description available.'}
                    </p>
                  </Card>
                </TabsContent>
                
                <TabsContent value="financials">
                  <Card className="p-6 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <h3 className="text-xl font-semibold mb-4">Financial Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="text-lg font-bold">{stockData.totalRevenue ? formatMarketCap(stockData.totalRevenue) : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Net Income</p>
                        <p className="text-lg font-bold">{stockData.netIncomeToCommon ? formatMarketCap(stockData.netIncomeToCommon) : 'N/A'}</p>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
                
                {/* Other tabs content would go here */}
              </Tabs>
            </div>

            {/* Right Column - Similar Stocks */}
            <div className="space-y-6">
              <Card className="p-6 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-4">People Also Follow</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead className="text-right">Last Price</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {similarStocks?.map((stock) => (
                      <TableRow key={stock.symbol}>
                        <TableCell className="font-medium">{stock.symbol}</TableCell>
                        <TableCell className="text-right">{stock.lastPrice.toFixed(2)}</TableCell>
                        <TableCell className={`text-right ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {stock.changePercent.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4">
                  <Button variant="outline" className="w-full">Compare</Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* AI Analysis Dialog */}
      <AIAnalysisDialog 
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        symbol={stockData.symbol}
        companyName={stockData.longName}
        sector={stockData.sector || 'N/A'}
        currentPrice={stockData.regularMarketPrice}
      />
    </div>
  );
};

export default StockDetails;
