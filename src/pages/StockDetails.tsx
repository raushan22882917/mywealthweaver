
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
import StockAnalysisDialog from "@/components/StockAnalysisDialog";
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
    };

    fetchStockDetails();
  }, [symbol, toast]);

  const checkFavoriteStatus = async (stockSymbol: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_stocks')
        .select('is_favorite')
        .eq('user_id', user.id)
        .eq('symbol', stockSymbol)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsFavorite(!!data?.is_favorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save favorites",
          variant: "default",
        });
        return;
      }

      // Check if stock is already saved
      const { data: existingStock, error: checkError } = await supabase
        .from('saved_stocks')
        .select('id, is_favorite')
        .eq('user_id', user.id)
        .eq('symbol', symbol)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existingStock) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('saved_stocks')
          .update({ is_favorite: !existingStock.is_favorite })
          .eq('id', existingStock.id);

        if (updateError) throw updateError;
        setIsFavorite(!existingStock.is_favorite);
      } else {
        // Create new record
        if (!stock) return;
        
        const { error: insertError } = await supabase
          .from('saved_stocks')
          .insert([{
            user_id: user.id,
            symbol: symbol,
            company_name: stock.company_name || companyProfile?.company_name || '',
            logo_url: logoUrl,
            price: companyProfile?.previousClose || 0,
            dividend_yield: stock.dividend_yield || 0,
            next_dividend_date: stock.ExDividendDate || '',
            is_favorite: true
          }]);

        if (insertError) throw insertError;
        setIsFavorite(true);
      }

      toast({
        title: "Success",
        description: `Stock ${isFavorite ? 'removed from' : 'added to'} favorites`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center text-white">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Stock Not Found</h2>
          <p className="text-gray-400 mb-6">We couldn't find information for symbol {symbol}</p>
          <Button onClick={() => navigate(-1)} className="mx-auto">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
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
                className="ml-2 h-8 text-xs"
                onClick={() => setIsAnalysisOpen(true)}
              >
                Analyze With AI
              </Button>
            </div>
          </div>
          
          {/* Key Stock Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-gray-800/60">
              <p className="text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                Current Price
              </p>
              <p className="text-2xl font-bold text-white">
                ${companyProfile?.previousClose?.toFixed(2) || '0.00'}
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-gray-800/60">
              <p className="text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                Dividend Yield
              </p>
              <p className="text-2xl font-bold text-green-400">
                {(stock.dividend_yield || 0).toFixed(2)}%
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-gray-800/60">
              <p className="text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-400" />
                Ex-Dividend Date
              </p>
              <p className="text-2xl font-bold text-white">
                {stock.exdividenddate ? new Date(stock.exdividenddate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-gray-800/60">
              <p className="text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                <BarChart4 className="h-4 w-4 text-yellow-400" />
                Market Cap
              </p>
              <p className="text-2xl font-bold text-white">
                ${companyProfile?.marketCap ? (companyProfile.marketCap / 1000000000).toFixed(2) + 'B' : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Tabs Content */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-800 p-1 mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-900/50">Overview</TabsTrigger>
            <TabsTrigger value="dividend" className="data-[state=active]:bg-purple-900/50">Dividend History</TabsTrigger>
            <TabsTrigger value="price" className="data-[state=active]:bg-purple-900/50">Price History</TabsTrigger>
            <TabsTrigger value="similar" className="data-[state=active]:bg-purple-900/50">Similar Stocks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="focus-visible:outline-none focus-visible:ring-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Company Profile */}
              <div className="lg:col-span-2 bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-400" />
                  Company Profile
                </h2>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {companyProfile?.long_business_summary || 
                    'No company description available for this stock.'}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Sector</p>
                    <p className="font-medium">{companyProfile?.sector || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Industry</p>
                    <p className="font-medium">{companyProfile?.industry || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Employees</p>
                    <p className="font-medium">{companyProfile?.fullTimeEmployees?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Beta</p>
                    <p className="font-medium">{companyProfile?.beta?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">P/E Ratio</p>
                    <p className="font-medium">{companyProfile?.trailingPE?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Website</p>
                    <a 
                      href={companyProfile?.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline font-medium flex items-center gap-1"
                    >
                      Visit Site
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Dividend Information */}
              <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  Dividend Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Dividend Rate</p>
                    <p className="text-xl font-bold">${companyProfile?.dividendRate?.toFixed(2) || '0.00'}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-400">Dividend Yield</p>
                    <p className="text-xl font-bold text-green-400">
                      {(companyProfile?.dividendYield * 100)?.toFixed(2) || '0.00'}%
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-400">Payout Ratio</p>
                    <p className="text-xl font-bold">
                      {(companyProfile?.payoutRatio * 100)?.toFixed(2) || '0.00'}%
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-400">Ex-Dividend Date</p>
                    <p className="text-xl font-bold">
                      {companyProfile?.exDividendDate ? 
                        new Date(companyProfile.exDividendDate).toLocaleDateString() : 
                        stock.exdividenddate ? 
                          new Date(stock.exdividenddate).toLocaleDateString() : 
                          'N/A'}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-400">5 Year Avg Dividend Yield</p>
                    <p className="text-xl font-bold">
                      {companyProfile?.fiveYearAvgDividendYield?.toFixed(2) || 'N/A'}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="dividend" className="focus-visible:outline-none focus-visible:ring-0">
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-400" />
                Dividend History
              </h2>
              
              {dividendHistory.length > 0 ? (
                <>
                  <div className="h-[400px] w-full mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dividendHistory.slice().reverse()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: '#9CA3AF' }}
                          axisLine={{ stroke: '#4B5563' }}
                        />
                        <YAxis 
                          tick={{ fill: '#9CA3AF' }}
                          axisLine={{ stroke: '#4B5563' }}
                          tickFormatter={(value) => `$${value.toFixed(2)}`}
                        />
                        <Tooltip 
                          formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Dividend']}
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                          }}
                        />
                        <Bar 
                          dataKey="dividends" 
                          fill="#10B981" 
                          radius={[4, 4, 0, 0]}
                          name="Dividend Amount"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="dividends" 
                          stroke="#EF4444" 
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                          dot={{ r: 4 }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="pb-3 text-left text-gray-400">Date</th>
                          <th className="pb-3 text-right text-gray-400">Dividend Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dividendHistory.map((dividend, index) => (
                          <tr key={index} className="border-b border-gray-800">
                            <td className="py-3 text-left">
                              {new Date(dividend.date).toLocaleDateString()}
                            </td>
                            <td className="py-3 text-right font-medium text-green-400">
                              ${dividend.dividends.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">No Dividend History</h3>
                  <p>There is no dividend history available for this stock.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="price" className="focus-visible:outline-none focus-visible:ring-0">
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <LineChart className="h-5 w-5 text-blue-400" />
                Price History
              </h2>
              
              <div className="h-[400px] w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={priceHistory}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#9CA3AF' }}
                      axisLine={{ stroke: '#4B5563' }}
                    />
                    <YAxis 
                      tick={{ fill: '#9CA3AF' }}
                      axisLine={{ stroke: '#4B5563' }}
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                      domain={['dataMin - 10', 'dataMax + 10']}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 8 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-4 rounded-xl bg-gray-800/60">
                  <p className="text-sm text-gray-400 mb-1">Open</p>
                  <p className="text-xl font-bold text-white">
                    ${companyProfile?.open?.toFixed(2) || 'N/A'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-800/60">
                  <p className="text-sm text-gray-400 mb-1">Previous Close</p>
                  <p className="text-xl font-bold text-white">
                    ${companyProfile?.previousClose?.toFixed(2) || 'N/A'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-800/60">
                  <p className="text-sm text-gray-400 mb-1">Day Low</p>
                  <p className="text-xl font-bold text-red-400">
                    ${companyProfile?.dayLow?.toFixed(2) || 'N/A'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-800/60">
                  <p className="text-sm text-gray-400 mb-1">Day High</p>
                  <p className="text-xl font-bold text-green-400">
                    ${companyProfile?.dayHigh?.toFixed(2) || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="similar" className="focus-visible:outline-none focus-visible:ring-0">
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Share2 className="h-5 w-5 text-purple-400" />
                Similar Stocks
              </h2>
              
              {similarStocks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarStocks.map((stock) => (
                    <Card 
                      key={stock.symbol} 
                      className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-900/20"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gray-800 p-2 shadow-lg border border-gray-700">
                            <img 
                              src={stock.logo_url}
                              alt={stock.company_name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/stock.avif';
                              }}
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-white">
                              {stock.symbol}
                            </h3>
                            <p className="text-sm text-gray-400 line-clamp-1">
                              {stock.company_name}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-3 rounded-lg bg-gray-800/60">
                            <p className="text-xs font-medium text-gray-400 mb-1">Dividend Yield</p>
                            <p className="text-md font-bold text-green-400">
                              {stock.dividend_yield?.toFixed(2) || '0.00'}%
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-gray-800/60">
                            <p className="text-xs font-medium text-gray-400 mb-1">Ex-Div Date</p>
                            <p className="text-md font-bold text-white truncate">
                              {stock.exdividenddate ? new Date(stock.exdividenddate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full bg-purple-700 hover:bg-purple-600 text-white"
                          onClick={() => navigate(`/stock/${stock.symbol}`)}
                        >
                          <ChevronRight className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Share2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">No Similar Stocks</h3>
                  <p>We couldn't find similar stocks for this company.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />

      {/* Stock Analysis Dialog */}
      {stockData && (
        <StockAnalysisDialog
          stock={stockData}
          isOpen={isAnalysisOpen}
          setIsOpen={setIsAnalysisOpen}
        />
      )}
    </div>
  );
};

export default StockDetails;
