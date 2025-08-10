import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TrendingUp, TrendingDown, Minus, BarChart3, DollarSign, Percent, Activity, PieChart, Target, Users, Building2, FileText, ChartBar, Info, X, Calendar, Zap, Sword, Shield, Crown, Star, Trophy, Flame } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Stock {
  symbol: string;
  name: string;
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  peRatio: number;
  dividendYield: number;
  sector: string;
  industry: string;
  // Additional fields from stock_comparison table
  exchange?: string;
  employees?: number;
  description?: string;
  trailing_pe_ratio?: number;
  forward_pe_ratio?: number;
  ps_ratio?: number;
  shares_outstanding?: number;
  average_analyst_rating?: string;
  number_of_analyst_opinions?: number;
  recommendation_key?: string;
  average_price_target?: number;
  upside_percentage?: number;
  annual_revenue_growth_percent?: number;
  qoq_revenue_growth_percent?: number;
  net_income_margin_percent?: number;
  debt_status?: number;
  cash_position?: number;
  short_ratio?: number;
  recommendation_mean?: number;
  founded?: number;
  as_of_date?: string;
  LogoURL?: string;
}

interface ComparisonData {
  symbol1: StockData;
  symbol2: StockData;
  comparison: {
    priceDifference: number;
    priceDifferencePercent: number;
    marketCapDifference: number;
    marketCapDifferencePercent: number;
    peRatioDifference: number;
    dividendYieldDifference: number;
  };
  comparison_insights?: string;
  timestamp?: string;
}

const Comparison = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock1, setSelectedStock1] = useState<string>('');
  const [selectedStock2, setSelectedStock2] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [logoMap, setLogoMap] = useState<Map<string, string>>(new Map());
  const { toast } = useToast();

  useEffect(() => {
    fetchStocks();
    loadLogos();
  }, []);

  const loadLogos = async () => {
    try {
      const response = await fetch('/logos.csv');
      const csvText = await response.text();
      const lines = csvText.split('\n');
      const logoData = new Map<string, string>();
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim()) {
          const columns = line.match(/(".*?"|[^,]+)/g) || [];
          if (columns.length >= 5) {
            const symbol = columns[1].replace(/"/g, '');
            const logoUrl = columns[4].replace(/"/g, '');
            
            if (symbol && logoUrl) {
              logoData.set(symbol.toUpperCase(), logoUrl);
            }
          }
        }
      }
      
      setLogoMap(logoData);
    } catch (error) {
      console.error('Error loading logos:', error);
    }
  };

  const fetchStocks = async () => {
    try {
      setLoadingStocks(true);
      
      try {
        const response = await fetch('/api/stocks');
        if (response.ok) {
          const data = await response.json();
          const transformedStocks = data.map((stock: any) => ({
            symbol: stock.symbol,
            name: stock.name || stock.symbol,
          }));
          setStocks(transformedStocks);
          return;
        }
      } catch (error) {
        console.log('Backend API not available, using Supabase fallback');
      }

      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from('stock_comparison')
        .select('symbol, name, sector, industry')
        .order('symbol', { ascending: true });

      if (error) {
        throw error;
      }

      const transformedStocks = (data as any[]).map((stock: any) => ({
        symbol: stock.symbol,
        name: stock.name || stock.symbol,
      }));

      setStocks(transformedStocks);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      toast({
        title: "Error",
        description: "Failed to load stocks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingStocks(false);
    }
  };

  const fetchStockDataForComparison = async (symbol: string): Promise<StockData> => {
    try {
      const supabaseAny = supabase as any;
      const { data: comparisonData, error: comparisonError } = await supabaseAny
        .from('stock_comparison')
        .select('*')
        .eq('symbol', symbol.toUpperCase())
        .order('as_of_date', { ascending: false })
        .limit(1)
        .single();

      if (comparisonError && comparisonError.code !== 'PGRST116') {
        console.error('Error fetching from stock_comparison:', comparisonError);
      }

      const comparisonDataAny = comparisonData as any;
      return {
        symbol: symbol.toUpperCase(),
        name: comparisonDataAny?.name || symbol.toUpperCase(),
        price: comparisonDataAny?.price || 0,
        change: 0,
        changePercent: 0,
        marketCap: comparisonDataAny?.market_capitalization || 0,
        volume: 0,
        peRatio: comparisonDataAny?.trailing_pe_ratio || 0,
        dividendYield: 0,
        sector: comparisonDataAny?.sector || 'N/A',
        industry: comparisonDataAny?.industry || 'N/A',
        exchange: comparisonDataAny?.exchange,
        employees: comparisonDataAny?.employees,
        description: comparisonDataAny?.description,
        trailing_pe_ratio: comparisonDataAny?.trailing_pe_ratio,
        forward_pe_ratio: comparisonDataAny?.forward_pe_ratio,
        ps_ratio: comparisonDataAny?.ps_ratio,
        shares_outstanding: comparisonDataAny?.shares_outstanding,
        average_analyst_rating: comparisonDataAny?.average_analyst_rating,
        number_of_analyst_opinions: comparisonDataAny?.number_of_analyst_opinions,
        recommendation_key: comparisonDataAny?.recommendation_key,
        average_price_target: comparisonDataAny?.average_price_target,
        upside_percentage: comparisonDataAny?.upside_percentage,
        annual_revenue_growth_percent: comparisonDataAny?.annual_revenue_growth_percent,
        qoq_revenue_growth_percent: comparisonDataAny?.qoq_revenue_growth_percent,
        net_income_margin_percent: comparisonDataAny?.net_income_margin_percent,
        debt_status: comparisonDataAny?.debt_status,
        cash_position: comparisonDataAny?.cash_position,
        short_ratio: comparisonDataAny?.short_ratio,
        recommendation_mean: comparisonDataAny?.recommendation_mean,
        founded: comparisonDataAny?.founded,
        as_of_date: comparisonDataAny?.as_of_date,
        LogoURL: comparisonDataAny?.logo_url,
      };
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      return {
        symbol: symbol.toUpperCase(),
        name: symbol.toUpperCase(),
        price: 0,
        change: 0,
        changePercent: 0,
        marketCap: 0,
        volume: 0,
        peRatio: 0,
        dividendYield: 0,
        sector: 'N/A',
        industry: 'N/A',
      };
    }
  };

  const handleCompare = async () => {
    if (!selectedStock1 || !selectedStock2) {
      toast({
        title: "Selection Required",
        description: "Please select two stocks to compare.",
        variant: "destructive",
      });
      return;
    }

    if (selectedStock1 === selectedStock2) {
      toast({
        title: "Invalid Selection",
        description: "Please select two different stocks to compare.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const [stock1Data, stock2Data] = await Promise.all([
        fetchStockDataForComparison(selectedStock1),
        fetchStockDataForComparison(selectedStock2),
      ]);

      const priceDifference = stock2Data.price - stock1Data.price;
      const priceDifferencePercent = ((priceDifference / stock1Data.price) * 100);
      const marketCapDifference = stock2Data.marketCap - stock1Data.marketCap;
      const marketCapDifferencePercent = ((marketCapDifference / stock1Data.marketCap) * 100);
      const peRatioDifference = (stock2Data.trailing_pe_ratio || 0) - (stock1Data.trailing_pe_ratio || 0);
      const dividendYieldDifference = (stock2Data.dividendYield || 0) - (stock1Data.dividendYield || 0);

      const comparisonInsights = generateComparisonInsights(stock1Data, stock2Data);

      setComparisonData({
        symbol1: stock1Data,
        symbol2: stock2Data,
        comparison: {
          priceDifference,
          priceDifferencePercent,
          marketCapDifference,
          marketCapDifferencePercent,
          peRatioDifference,
          dividendYieldDifference,
        },
        comparison_insights: comparisonInsights,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "Battle Complete!",
        description: `Successfully compared ${selectedStock1} vs ${selectedStock2}`,
      });

    } catch (error) {
      console.error('Error comparing stocks:', error);
      toast({
        title: "Error",
        description: "Failed to compare stocks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateComparisonInsights = (stock1: StockData, stock2: StockData): string => {
    const formatMarketCap = (marketCap: number) => {
      if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(0)}T`;
      if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(0)}B`;
      if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(0)}M`;
      return `$${marketCap.toLocaleString()}`;
    };

    return `⚔️ BATTLE ANALYSIS: ${stock1.name} vs ${stock2.name}

🏆 Market Cap Showdown:
${stock1.name}: ${formatMarketCap(stock1.marketCap)}
${stock2.name}: ${formatMarketCap(stock2.marketCap)}

💰 Stock Price Battle:
${stock1.name}: $${stock1.price?.toFixed(2) || 'N/A'}
${stock2.name}: $${stock2.price?.toFixed(2) || 'N/A'}

📊 Valuation War:
${stock1.name} P/E: ${stock1.trailing_pe_ratio?.toFixed(1) || 'N/A'}
${stock2.name} P/E: ${stock2.trailing_pe_ratio?.toFixed(1) || 'N/A'}

🏢 Sector Division:
${stock1.name}: ${stock1.sector}
${stock2.name}: ${stock2.sector}

🎯 The Winner:
${stock1.marketCap > stock2.marketCap ? `${stock1.name} dominates with superior market cap!` : `${stock2.name} leads the market cap battle!`}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(2);
  };

  const truncateToWords = (text: string, maxWords: number = 50) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-red-500/10 animate-pulse"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-delayed"></div>
      </div>
      
      <Navbar />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Epic Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Sword className="w-12 h-12 text-blue-400 animate-pulse mr-4" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent animate-fade-in">
                STOCK BATTLE
              </h1>
              <Sword className="w-12 h-12 text-red-400 animate-pulse ml-4 scale-x-[-1]" />
            </div>
            <p className="text-xl text-gray-300 animate-fade-in">
              ⚔️ Choose your fighters and witness the ultimate financial showdown! ⚔️
            </p>
            <div className="flex items-center justify-center mt-4 space-x-2">
              <Flame className="w-6 h-6 text-orange-400 animate-bounce" />
              <span className="text-orange-300 font-semibold">Epic Comparison Mode</span>
              <Flame className="w-6 h-6 text-orange-400 animate-bounce" />
            </div>
          </div>

          {!comparisonData ? (
            /* Selection Arena */
            <div className="max-w-4xl mx-auto">
              <Card className="bg-black/40 border-2 border-purple-500/50 backdrop-blur-lg shadow-2xl">
                <CardHeader className="text-center border-b border-purple-500/30">
                  <CardTitle className="text-3xl font-bold text-white flex items-center justify-center space-x-3">
                    <Crown className="w-8 h-8 text-yellow-400 animate-pulse" />
                    <span>Select Your Champions</span>
                    <Crown className="w-8 h-8 text-yellow-400 animate-pulse" />
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-300">
                    Choose two worthy opponents for the ultimate financial duel
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                    {/* Fighter 1 */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-2 rounded-full">
                          <Shield className="w-5 h-5 text-white" />
                          <span className="text-white font-bold">FIGHTER 1</span>
                        </div>
                      </div>
                      <Select value={selectedStock1} onValueChange={setSelectedStock1}>
                        <SelectTrigger className="h-16 bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-2 border-blue-500/50 text-white text-lg font-semibold hover:border-blue-400 transition-all duration-300">
                          <SelectValue placeholder="🥊 Choose Fighter 1" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-blue-500/50">
                          {loadingStocks ? (
                            <div className="flex items-center justify-center p-6">
                              <Loader2 className="w-6 h-6 animate-spin mr-3 text-blue-400" />
                              <span className="text-white">Loading warriors...</span>
                            </div>
                          ) : (
                            stocks.map((stock) => (
                              <SelectItem key={stock.symbol} value={stock.symbol} className="text-white hover:bg-blue-900/50 p-3">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={logoMap.get(stock.symbol.toUpperCase()) || '/stock.avif'}
                                    alt={stock.symbol}
                                    className="w-8 h-8 object-contain rounded"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/stock.avif';
                                    }}
                                  />
                                  <div>
                                    <div className="font-bold text-lg">{stock.symbol}</div>
                                    <div className="text-sm text-gray-400">{stock.name}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {selectedStock1 && (
                        <div className="text-center p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                          <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                          <p className="text-blue-300 font-semibold">Fighter 1 Ready!</p>
                        </div>
                      )}
                    </div>

                    {/* VS Divider */}
                    <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="bg-gradient-to-r from-purple-600 to-red-600 text-white px-6 py-3 rounded-full border-4 border-white shadow-2xl">
                        <span className="text-2xl font-bold">VS</span>
                      </div>
                    </div>

                    {/* Fighter 2 */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 rounded-full">
                          <Shield className="w-5 h-5 text-white" />
                          <span className="text-white font-bold">FIGHTER 2</span>
                        </div>
                      </div>
                      <Select value={selectedStock2} onValueChange={setSelectedStock2}>
                        <SelectTrigger className="h-16 bg-gradient-to-r from-red-900/50 to-red-800/50 border-2 border-red-500/50 text-white text-lg font-semibold hover:border-red-400 transition-all duration-300">
                          <SelectValue placeholder="🥊 Choose Fighter 2" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-red-500/50">
                          {loadingStocks ? (
                            <div className="flex items-center justify-center p-6">
                              <Loader2 className="w-6 h-6 animate-spin mr-3 text-red-400" />
                              <span className="text-white">Loading warriors...</span>
                            </div>
                          ) : (
                            stocks.map((stock) => (
                              <SelectItem key={stock.symbol} value={stock.symbol} className="text-white hover:bg-red-900/50 p-3">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={logoMap.get(stock.symbol.toUpperCase()) || '/stock.avif'}
                                    alt={stock.symbol}
                                    className="w-8 h-8 object-contain rounded"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/stock.avif';
                                    }}
                                  />
                                  <div>
                                    <div className="font-bold text-lg">{stock.symbol}</div>
                                    <div className="text-sm text-gray-400">{stock.name}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {selectedStock2 && (
                        <div className="text-center p-4 bg-red-900/30 rounded-lg border border-red-500/30">
                          <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                          <p className="text-red-300 font-semibold">Fighter 2 Ready!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Battle Button */}
                  <div className="text-center mt-8">
                    <Button 
                      onClick={handleCompare} 
                      disabled={loading || !selectedStock1 || !selectedStock2}
                      className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-purple-600 via-red-600 to-orange-600 hover:from-purple-700 hover:via-red-700 hover:to-orange-700 text-white border-0 shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin mr-3" />
                          ⚔️ BATTLE IN PROGRESS... ⚔️
                        </>
                      ) : (
                        <>
                          <Zap className="w-6 h-6 mr-3" />
                          🔥 START EPIC BATTLE! 🔥
                          <Zap className="w-6 h-6 ml-3" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Battle Results */
            <div className="space-y-8">
              {/* Battle Header */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
                  <h2 className="text-4xl font-bold text-white">BATTLE RESULTS</h2>
                  <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
                </div>
                <p className="text-xl text-gray-300">The financial duel has concluded! Here are the results...</p>
              </div>

              {/* Fighter Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Fighter 1 Card */}
                <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-2 border-blue-500/50 backdrop-blur-lg shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <CardHeader className="text-center border-b border-blue-500/30">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                      <img
                        src={logoMap.get(comparisonData.symbol1.symbol) || '/stock.avif'}
                        alt={comparisonData.symbol1.symbol}
                        className="w-16 h-16 object-contain rounded-full border-4 border-blue-400"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/stock.avif';
                        }}
                      />
                      <div>
                        <CardTitle className="text-3xl font-bold text-blue-300">{comparisonData.symbol1.symbol}</CardTitle>
                        <CardDescription className="text-blue-200 text-lg">{comparisonData.symbol1.name}</CardDescription>
                      </div>
                    </div>
                    <div className="inline-flex items-center space-x-2 bg-blue-600 px-4 py-2 rounded-full">
                      <Shield className="w-5 h-5 text-white" />
                      <span className="text-white font-bold">BLUE CORNER</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-800/30 p-4 rounded-lg border border-blue-500/30">
                        <div className="text-blue-300 text-sm">Stock Price</div>
                        <div className="text-2xl font-bold text-white">{formatCurrency(comparisonData.symbol1.price)}</div>
                      </div>
                      <div className="bg-blue-800/30 p-4 rounded-lg border border-blue-500/30">
                        <div className="text-blue-300 text-sm">Market Cap</div>
                        <div className="text-2xl font-bold text-white">{formatNumber(comparisonData.symbol1.marketCap)}</div>
                      </div>
                      <div className="bg-blue-800/30 p-4 rounded-lg border border-blue-500/30">
                        <div className="text-blue-300 text-sm">P/E Ratio</div>
                        <div className="text-2xl font-bold text-white">{comparisonData.symbol1.trailing_pe_ratio?.toFixed(2) || 'N/A'}</div>
                      </div>
                      <div className="bg-blue-800/30 p-4 rounded-lg border border-blue-500/30">
                        <div className="text-blue-300 text-sm">Sector</div>
                        <div className="text-lg font-bold text-white">{comparisonData.symbol1.sector}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fighter 2 Card */}
                <Card className="bg-gradient-to-br from-red-900/50 to-red-800/30 border-2 border-red-500/50 backdrop-blur-lg shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <CardHeader className="text-center border-b border-red-500/30">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                      <img
                        src={logoMap.get(comparisonData.symbol2.symbol) || '/stock.avif'}
                        alt={comparisonData.symbol2.symbol}
                        className="w-16 h-16 object-contain rounded-full border-4 border-red-400"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/stock.avif';
                        }}
                      />
                      <div>
                        <CardTitle className="text-3xl font-bold text-red-300">{comparisonData.symbol2.symbol}</CardTitle>
                        <CardDescription className="text-red-200 text-lg">{comparisonData.symbol2.name}</CardDescription>
                      </div>
                    </div>
                    <div className="inline-flex items-center space-x-2 bg-red-600 px-4 py-2 rounded-full">
                      <Shield className="w-5 h-5 text-white" />
                      <span className="text-white font-bold">RED CORNER</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-red-800/30 p-4 rounded-lg border border-red-500/30">
                        <div className="text-red-300 text-sm">Stock Price</div>
                        <div className="text-2xl font-bold text-white">{formatCurrency(comparisonData.symbol2.price)}</div>
                      </div>
                      <div className="bg-red-800/30 p-4 rounded-lg border border-red-500/30">
                        <div className="text-red-300 text-sm">Market Cap</div>
                        <div className="text-2xl font-bold text-white">{formatNumber(comparisonData.symbol2.marketCap)}</div>
                      </div>
                      <div className="bg-red-800/30 p-4 rounded-lg border border-red-500/30">
                        <div className="text-red-300 text-sm">P/E Ratio</div>
                        <div className="text-2xl font-bold text-white">{comparisonData.symbol2.trailing_pe_ratio?.toFixed(2) || 'N/A'}</div>
                      </div>
                      <div className="bg-red-800/30 p-4 rounded-lg border border-red-500/30">
                        <div className="text-red-300 text-sm">Sector</div>
                        <div className="text-lg font-bold text-white">{comparisonData.symbol2.sector}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analysis Preview */}
              {comparisonData.comparison_insights && (
                <Card className="bg-black/40 border-2 border-purple-500/50 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-center space-x-3 text-2xl">
                      <Activity className="w-8 h-8 text-purple-400" />
                      <span>⚡ BATTLE ANALYSIS ⚡</span>
                      <Activity className="w-8 h-8 text-purple-400" />
                    </CardTitle>
                    <CardDescription className="text-center text-lg text-gray-300">
                      AI-powered analysis of the financial showdown
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/30">
                      <div className="whitespace-pre-wrap text-gray-200 text-base leading-relaxed">
                        {comparisonData.comparison_insights}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Return to Selection Button */}
              <div className="text-center">
                <Button 
                  onClick={() => {
                    setComparisonData(null);
                  }}
                  className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white transform hover:scale-105 transition-all duration-300"
                >
                  🔄 NEW BATTLE
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Comparison;