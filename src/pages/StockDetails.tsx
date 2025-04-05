
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  BarChart4, 
  Share2, 
  Clock, 
  Info,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Star,
  Heart,
  AlertCircle,
  ChevronLeft,
  LineChart,
  Book
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { StockData } from '@/utils/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AIStockAnalysis from '@/components/AIStockAnalysis';

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

// List of popular stock tickers to display as options
const popularStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' }
];

const StockDetails = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stock, setStock] = useState<StockData | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [dividendHistory, setDividendHistory] = useState<any[]>([]);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [similarStocks, setSimilarStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [stockDataForAI, setStockDataForAI] = useState<any>(null);

  useEffect(() => {
    const fetchStockDetails = async () => {
      if (!symbol) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Fetch stock details
        const { data: stockData, error: stockError } = await supabase
          .from('dividend')
          .select('*')
          .eq('symbol', symbol)
          .single();

        if (stockError && stockError.code !== 'PGRST116') throw stockError;
        
        // If no stock data found, try to generate mock data
        const stockInfo = stockData || generateMockStockData(symbol);
        
        // Fetch logo
        const { data: logoData, error: logoError } = await supabase
          .from('company_logos')
          .select('LogoURL')
          .eq('Symbol', symbol)
          .single();

        // Fetch company profile
        const { data: profileData, error: profileError } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('symbol', symbol)
          .single();

        // Generate mock price history if real data is not available
        const mockPriceHistory = Array.from({ length: 20 }, (_, i) => ({
          date: new Date(Date.now() - (19 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          price: 100 + Math.random() * 50,
        }));
        
        // Fetch dividend history
        const { data: dividendData, error: dividendError } = await supabase
          .from('quarterly_dividends')
          .select('*')
          .eq('symbol', symbol)
          .order('date', { ascending: false })
          .limit(10);
          
        // Generate mock dividend data if real data is not available
        const mockDividendHistory = dividendData || Array.from({ length: 8 }, (_, i) => ({
          date: new Date(Date.now() - i * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          dividends: 0.5 + Math.random() * 0.5,
          symbol: symbol,
          id: i,
          created_at: new Date().toISOString()
        }));
          
        // Fetch similar stocks
        const { data: similarData, error: similarError } = await supabase
          .from('similar_companies')
          .select('*')
          .eq('symbol', symbol);
        
        // Generate mock similar stocks if real data is not available
        const mockSimilarStocks = popularStocks
          .filter(stock => stock.symbol !== symbol)
          .slice(0, 4)
          .map((stock, index) => ({
            symbol: stock.symbol,
            title: stock.symbol,
            company_name: stock.name,
            logo_url: `/lovable-uploads/d08374ca-e2cf-4609-8c67-df6b7a08a417.png`,
            dividend_yield: (1 + Math.random() * 3).toFixed(2),
            ExDividendDate: new Date(Date.now() + index * 15 * 24 * 60 * 60 * 1000).toISOString(),
            id: `mock-${index}`
          }));
        
        const processedSimilarStocks = similarData?.length ? 
          await fetchSimilarStocksData(similarData.map(item => item.similar_symbol)) : 
          mockSimilarStocks;
            
        // Check if stock is user's favorite
        checkFavoriteStatus(symbol);

        // Prepare data for AI analysis
        const combinedData = {
          ...stockInfo,
          ...(profileData || {})
        };
        setStockDataForAI(combinedData);

        setStock({
          ...stockInfo,
          title: stockInfo.symbol,
          logo_url: logoData?.LogoURL || `/lovable-uploads/d08374ca-e2cf-4609-8c67-df6b7a08a417.png`,
          ExDividendDate: stockInfo.exdividenddate,
          id: String(stockInfo.id || 'mock-id') // Convert id to string to match StockData type
        });
        setLogoUrl(logoData?.LogoURL || `/lovable-uploads/d08374ca-e2cf-4609-8c67-df6b7a08a417.png`);
        setCompanyProfile(profileData || generateMockCompanyProfile(symbol));
        setPriceHistory(mockPriceHistory);
        setDividendHistory(mockDividendHistory || []);
        setSimilarStocks(processedSimilarStocks);
        
      } catch (error) {
        console.error('Error fetching stock details:', error);
        toast({
          title: "Error",
          description: "Failed to load stock details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStockDetails();
  }, [symbol, toast]);

  const generateMockStockData = (symbol: string) => {
    // Generate mock stock data for a given symbol
    return {
      symbol: symbol,
      company_name: popularStocks.find(s => s.symbol === symbol)?.name || `${symbol} Corporation`,
      currentprice: 100 + Math.random() * 200,
      previousClose: 95 + Math.random() * 200,
      dividend: 1 + Math.random() * 2,
      dividendrate: 1 + Math.random() * 2,
      dividendyield: 1 + Math.random() * 4,
      payoutratio: 0.3 + Math.random() * 0.4,
      exdividenddate: new Date().toISOString().split('T')[0],
      earningsdate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      buy_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      payoutdate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      shortname: symbol,
      quotetype: 'EQUITY',
      hist: '',
      message: '',
      insight: ''
    };
  };

  const generateMockCompanyProfile = (symbol: string) => {
    // Generate mock company profile for a given symbol
    const companyName = popularStocks.find(s => s.symbol === symbol)?.name || `${symbol} Corporation`;
    return {
      symbol: symbol,
      company_name: companyName,
      sector: ['Technology', 'Healthcare', 'Finance', 'Consumer Goods', 'Energy'][Math.floor(Math.random() * 5)],
      industry: ['Software', 'Pharmaceuticals', 'Banking', 'Retail', 'Oil & Gas'][Math.floor(Math.random() * 5)],
      address: '123 Corporate Drive, Business City, CA 94000',
      phone: '(555) 123-4567',
      website: `https://www.${symbol.toLowerCase()}.com`,
      fullTimeEmployees: Math.floor(1000 + Math.random() * 100000),
      longBusinessSummary: `${companyName} is a leading company in the ${['technology', 'healthcare', 'financial', 'retail', 'energy'][Math.floor(Math.random() * 5)]} sector, focusing on innovative solutions for businesses and consumers. The company has operations in over 50 countries and continues to expand its global presence through strategic acquisitions and partnerships.`,
      marketCap: (1 + Math.random() * 1000) * 1000000000,
      beta: 0.7 + Math.random() * 1.5,
      dividendRate: 1 + Math.random() * 3,
      dividendYield: 0.01 + Math.random() * 0.05,
      payoutRatio: 0.3 + Math.random() * 0.5,
      exDividendDate: new Date().toISOString().split('T')[0],
      previousClose: 100 + Math.random() * 200,
      open: 100 + Math.random() * 200,
      dayLow: 95 + Math.random() * 190,
      dayHigh: 105 + Math.random() * 210,
      exchange: 'NASDAQ',
      trailingPE: 15 + Math.random() * 30,
      forwardPE: 14 + Math.random() * 28,
      fiveYearAvgDividendYield: 0.01 + Math.random() * 0.04,
    };
  };

  const fetchSimilarStocksData = async (symbols: string[]) => {
    if (!symbols || symbols.length === 0) return [];
    
    try {
      const stockPromises = symbols.map(async (symbol) => {
        // Mock data for similar stocks
        return {
          symbol: symbol,
          title: symbol,
          company_name: popularStocks.find(s => s.symbol === symbol)?.name || `${symbol} Inc.`,
          logo_url: `/lovable-uploads/d08374ca-e2cf-4609-8c67-df6b7a08a417.png`,
          dividend_yield: (1 + Math.random() * 3).toFixed(2),
          ExDividendDate: new Date(Date.now() + Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000).toISOString(),
          id: `similar-${symbol}`
        };
      });
      
      return await Promise.all(stockPromises);
    } catch (error) {
      console.error('Error fetching similar stocks data:', error);
      return [];
    }
  };

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

  const renderStockOptions = () => {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <h2 className="text-xl font-medium mb-4">View Popular Stocks</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {popularStocks.map((stock) => (
            <Link 
              key={stock.symbol} 
              to={`/stock/${stock.symbol}`}
              className={`px-4 py-2 rounded-md text-center transition-colors ${
                symbol === stock.symbol 
                  ? 'bg-purple-800 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
              }`}
            >
              {stock.symbol}
            </Link>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!symbol) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-6">Stock Details</h1>
          
          {renderStockOptions()}
          
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-8 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-bold mb-4">Please Select a Stock</h2>
            <p className="text-gray-400 mb-6">Choose a stock from the options above to view its details</p>
          </div>
        </div>
        <Footer />
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stock selection options */}
        {renderStockOptions()}
        
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-8 text-gray-400 hover:text-white"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        {/* Stock Header */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-900/20 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
            {/* Logo and Symbol */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700">
                <img 
                  src={logoUrl}
                  alt={stock.company_name || symbol}
                  className="w-full h-full object-contain"
                  onError={(e) => { 
                    const target = e.target as HTMLImageElement;
                    target.src = '/lovable-uploads/d08374ca-e2cf-4609-8c67-df6b7a08a417.png'; 
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">{symbol}</h1>
                  <Badge variant="outline" className="border-blue-500 text-blue-400">
                    {companyProfile?.exchange || 'NASDAQ'}
                  </Badge>
                </div>
                <p className="text-lg text-gray-400">{stock.company_name || companyProfile?.company_name || 'Company Name'}</p>
              </div>
            </div>
            
            {/* Stock Actions */}
            <div className="flex items-center gap-3 ml-auto">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-700"
                onClick={toggleFavorite}
              >
                <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                {isFavorite ? 'Favorited' : 'Add to Favorites'}
              </Button>
              <Button variant="default" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
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
                ${companyProfile?.previousClose?.toFixed(2) || stock.currentprice?.toFixed(2) || '0.00'}
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-gray-800/60">
              <p className="text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                Dividend Yield
              </p>
              <p className="text-2xl font-bold text-green-400">
                {(stock.dividend_yield || stock.dividendyield || companyProfile?.dividendYield * 100 || 0).toFixed(2)}%
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-gray-800/60">
              <p className="text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-400" />
                Ex-Dividend Date
              </p>
              <p className="text-2xl font-bold text-white">
                {stock.ExDividendDate ? new Date(stock.ExDividendDate).toLocaleDateString() : 'N/A'}
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
            <TabsTrigger value="analysis" className="data-[state=active]:bg-purple-900/50">AI Analysis</TabsTrigger>
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
                  {companyProfile?.long_business_summary || companyProfile?.longBusinessSummary || 
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
                    <p className="text-xl font-bold">${companyProfile?.dividendRate?.toFixed(2) || stock.dividendrate?.toFixed(2) || '0.00'}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-400">Dividend Yield</p>
                    <p className="text-xl font-bold text-green-400">
                      {(companyProfile?.dividendYield * 100)?.toFixed(2) || stock.dividendyield?.toFixed(2) || '0.00'}%
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-400">Payout Ratio</p>
                    <p className="text-xl font-bold">
                      {(companyProfile?.payoutRatio * 100)?.toFixed(2) || stock.payoutratio?.toFixed(2) || '0.00'}%
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-400">Ex-Dividend Date</p>
                    <p className="text-xl font-bold">
                      {companyProfile?.exDividendDate ? 
                        new Date(companyProfile.exDividendDate).toLocaleDateString() : 
                        stock.ExDividendDate ? 
                          new Date(stock.ExDividendDate).toLocaleDateString() : 
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

          <TabsContent value="analysis" className="focus-visible:outline-none focus-visible:ring-0">
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-800">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Book className="h-5 w-5 text-blue-400" />
                  Stock Analysis
                </h2>
                
                <AIStockAnalysis symbol={symbol || ''} companyData={stockDataForAI} />
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
                    ${companyProfile?.open?.toFixed(2) || stock.currentprice?.toFixed(2) || 'N/A'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-800/60">
                  <p className="text-sm text-gray-400 mb-1">Previous Close</p>
                  <p className="text-xl font-bold text-white">
                    ${companyProfile?.previousClose?.toFixed(2) || stock.previousclose?.toFixed(2) || 'N/A'}
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
                                target.src = '/lovable-uploads/d08374ca-e2cf-4609-8c67-df6b7a08a417.png';
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
                              {stock.dividend_yield?.toString() || '0.00'}%
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-gray-800/60">
                            <p className="text-xs font-medium text-gray-400 mb-1">Ex-Div Date</p>
                            <p className="text-md font-bold text-white truncate">
                              {stock.ExDividendDate ? new Date(stock.ExDividendDate).toLocaleDateString() : 'N/A'}
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
    </div>
  );
};

export default StockDetails;
