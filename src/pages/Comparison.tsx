import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TrendingUp, TrendingDown, Minus, BarChart3, DollarSign, Percent, Activity, PieChart, Target, Users, Building2, FileText, ChartBar, Info, X, Calendar } from 'lucide-react';
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
  LogoURL?: string; // Added for new UI
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
  const [activeTab, setActiveTab] = useState('overview');
  const [showDetailedInsights, setShowDetailedInsights] = useState(false);
  const [showAllTabs, setShowAllTabs] = useState(false);
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
      
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim()) {
          // Parse CSV line properly, handling quoted values
          const columns = line.match(/(".*?"|[^,]+)/g) || [];
          if (columns.length >= 5) {
            const id = columns[0].replace(/"/g, '');
            const symbol = columns[1].replace(/"/g, '');
            const company_name = columns[2].replace(/"/g, '');
            const domain = columns[3].replace(/"/g, '');
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
      
      // Try backend API first, fallback to Supabase
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

      // Fallback to Supabase
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
      // Try backend API first
      try {
        const response = await fetch(`/api/stocks/${symbol}`);
        if (response.ok) {
          const data = await response.json();
          return {
            symbol: data.symbol,
            name: data.name,
            price: data.price,
            change: 0,
            changePercent: 0,
            marketCap: data.market_capitalization,
            volume: 0,
            peRatio: data.trailing_pe_ratio || 0,
            dividendYield: 0,
            sector: data.sector,
            industry: data.industry,
            exchange: data.exchange,
            employees: data.employees,
            description: data.description,
            trailing_pe_ratio: data.trailing_pe_ratio,
            forward_pe_ratio: data.forward_pe_ratio,
            ps_ratio: data.ps_ratio,
            shares_outstanding: data.shares_outstanding,
            average_analyst_rating: data.average_analyst_rating,
            number_of_analyst_opinions: data.number_of_analyst_opinions,
            recommendation_key: data.recommendation_key,
            average_price_target: data.average_price_target,
            upside_percentage: data.upside_percentage,
            annual_revenue_growth_percent: data.annual_revenue_growth_percent,
            qoq_revenue_growth_percent: data.qoq_revenue_growth_percent,
            net_income_margin_percent: data.net_income_margin_percent,
            debt_status: data.debt_status,
            cash_position: data.cash_position,
            short_ratio: data.short_ratio,
            recommendation_mean: data.recommendation_mean,
            founded: data.founded,
            as_of_date: data.as_of_date,
            LogoURL: data.logo_url, // Assuming logo_url is available in the backend response
          };
        }
      } catch (error) {
        console.log('Backend API not available, using Supabase fallback');
      }

      // Fallback to Supabase
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
        LogoURL: comparisonDataAny?.logo_url, // Assuming logo_url is available in Supabase
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

  const generateComparisonInsights = (stock1: StockData, stock2: StockData): string => {
    const formatMarketCap = (marketCap: number) => {
      if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(0)}T`;
      if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(0)}B`;
      if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(0)}M`;
      return `$${marketCap.toLocaleString()}`;
    };

    const formatCash = (cash: number) => {
      return cash.toLocaleString();
    };



    const insights = `📊 Company Comparison: ${stock1.name} vs ${stock2.name}
${stock1.name}, founded in ${stock1.founded || 'N/A'}, has a market cap of ${formatMarketCap(stock1.marketCap)} compared to ${stock2.name}, founded in ${stock2.founded || 'N/A'}, with a market cap of ${formatMarketCap(stock2.marketCap)}.

📈 Growth
${stock1.name} leads in annual revenue growth at ${stock1.annual_revenue_growth_percent?.toFixed(1) || 'N/A'}% vs ${stock2.annual_revenue_growth_percent?.toFixed(1) || 'N/A'}%.
${stock2.name} also shows better quarter-over-quarter growth at ${stock2.qoq_revenue_growth_percent?.toFixed(1) || 'N/A'}% vs ${stock1.qoq_revenue_growth_percent?.toFixed(1) || 'N/A'}%.

💰 Profitability
${stock1.name} has a higher net income margin of ${stock1.net_income_margin_percent?.toFixed(1) || 'N/A'}% compared to ${stock2.name}'s ${stock2.net_income_margin_percent?.toFixed(1) || 'N/A'}%.
${stock1.name} employs ${stock1.employees?.toLocaleString() || 'N/A'} people, while ${stock2.name} employs ${stock2.employees?.toLocaleString() || 'N/A'}.

💹 Valuation
${stock1.name} trades at $${stock1.price?.toFixed(1) || 'N/A'} (P/E TTM: ${stock1.trailing_pe_ratio?.toFixed(1) || 'N/A'}, FTM: ${stock1.forward_pe_ratio?.toFixed(1) || 'N/A'}), while ${stock2.name} trades at $${stock2.price?.toFixed(1) || 'N/A'} (P/E TTM: ${stock2.trailing_pe_ratio?.toFixed(1) || 'N/A'}, FTM: ${stock2.forward_pe_ratio?.toFixed(1) || 'N/A'}).
${stock1.trailing_pe_ratio && stock2.trailing_pe_ratio ? (stock1.trailing_pe_ratio < stock2.trailing_pe_ratio ? `${stock1.name} has a more attractive trailing P/E ratio` : `${stock2.name} has a more attractive trailing P/E ratio`) : ''}, and ${stock1.forward_pe_ratio && stock2.forward_pe_ratio ? (stock1.forward_pe_ratio < stock2.forward_pe_ratio ? `${stock1.name} also has a better forward P/E` : `${stock2.name} also has a better forward P/E`) : ''}.
In terms of price-to-sales, ${stock1.ps_ratio && stock2.ps_ratio ? (stock1.ps_ratio < stock2.ps_ratio ? `${stock1.name} is slightly cheaper with a P/S ratio of ${stock1.ps_ratio.toFixed(1)} vs ${stock2.ps_ratio.toFixed(1)}` : `${stock2.name} is slightly cheaper with a P/S ratio of ${stock2.ps_ratio.toFixed(1)} vs ${stock1.ps_ratio.toFixed(1)}`) : ''}.

🧾 Balance Sheet
${stock1.name} holds $${formatCash(stock1.cash_position || 0)} in cash and $${formatCash(stock1.debt_status || 0)} in debt, while ${stock2.name} has $${formatCash(stock2.cash_position || 0)} in cash and $${formatCash(stock2.debt_status || 0)} in debt.

🧠 Analyst Outlook
${stock1.name} is rated ${stock1.average_analyst_rating || 'N/A'}, ${stock2.name} is rated ${stock2.average_analyst_rating || 'N/A'}.
${stock1.upside_percentage && stock2.upside_percentage ? (stock1.upside_percentage > stock2.upside_percentage ? `${stock1.name} offers a slightly higher upside potential of ${stock1.upside_percentage.toFixed(1)}% vs ${stock2.upside_percentage.toFixed(1)}%` : `${stock2.name} offers a slightly higher upside potential of ${stock2.upside_percentage.toFixed(1)}% vs ${stock1.upside_percentage.toFixed(1)}%`) : ''}.

📉 Investor Sentiment
${stock1.name}'s short ratio is ${stock1.short_ratio?.toFixed(1) || 'N/A'}, while ${stock2.name}'s is ${stock2.short_ratio?.toFixed(1) || 'N/A'}, indicating relatively similar investor sentiment.

✅ Final Verdict
${stock1.annual_revenue_growth_percent && stock2.annual_revenue_growth_percent ? (stock1.annual_revenue_growth_percent > stock2.annual_revenue_growth_percent ? `${stock1.name} is the growth leader` : `${stock2.name} is the growth leader`) : ''}, but ${stock1.net_income_margin_percent && stock2.net_income_margin_percent ? (stock1.net_income_margin_percent > stock2.net_income_margin_percent ? `${stock1.name} wins on profitability` : `${stock2.name} wins on profitability`) : ''}.
${stock1.trailing_pe_ratio && stock2.trailing_pe_ratio ? (stock1.trailing_pe_ratio < stock2.trailing_pe_ratio ? `${stock1.name} appears better valued` : `${stock2.name} appears better valued`) : ''}, and ${stock1.cash_position && stock2.cash_position ? (stock1.cash_position > stock2.cash_position ? `${stock1.name} has the stronger balance sheet` : `${stock2.name} has the stronger balance sheet`) : ''}.
${stock1.upside_percentage && stock2.upside_percentage ? (stock1.upside_percentage > stock2.upside_percentage ? `Analysts see more upside in ${stock1.name}` : `Analysts see more upside in ${stock2.name}`) : ''}.`;

    return insights;
  };

  const handleCompare = async () => {
    // Reset detailed insights view when starting a new comparison
    setShowDetailedInsights(false);
    setShowAllTabs(false);
    
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
      
      // Try backend API first, fallback to individual stock fetching
      try {
        const response = await fetch('/api/stocks/compare', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            symbol1: selectedStock1,
            symbol2: selectedStock2,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          // Calculate comparison metrics
          const priceDifference = data.symbol2.price - data.symbol1.price;
          const priceDifferencePercent = ((priceDifference / data.symbol1.price) * 100);
          const marketCapDifference = data.symbol2.market_capitalization - data.symbol1.market_capitalization;
          const marketCapDifferencePercent = ((marketCapDifference / data.symbol1.market_capitalization) * 100);
          const peRatioDifference = (data.symbol2.trailing_pe_ratio || 0) - (data.symbol1.trailing_pe_ratio || 0);
          const dividendYieldDifference = (data.symbol2.dividendYield || 0) - (data.symbol1.dividendYield || 0);

          setComparisonData({
            symbol1: {
              symbol: data.symbol1.symbol,
              name: data.symbol1.name,
              price: data.symbol1.price,
              change: 0,
              changePercent: 0,
              marketCap: data.symbol1.market_capitalization,
              volume: 0,
              peRatio: data.symbol1.trailing_pe_ratio || 0,
              dividendYield: 0,
              sector: data.symbol1.sector,
              industry: data.symbol1.industry,
              exchange: data.symbol1.exchange,
              employees: data.symbol1.employees,
              description: data.symbol1.description,
              trailing_pe_ratio: data.symbol1.trailing_pe_ratio,
              forward_pe_ratio: data.symbol1.forward_pe_ratio,
              ps_ratio: data.symbol1.ps_ratio,
              shares_outstanding: data.symbol1.shares_outstanding,
              average_analyst_rating: data.symbol1.average_analyst_rating,
              number_of_analyst_opinions: data.symbol1.number_of_analyst_opinions,
              recommendation_key: data.symbol1.recommendation_key,
              average_price_target: data.symbol1.average_price_target,
              upside_percentage: data.symbol1.upside_percentage,
              annual_revenue_growth_percent: data.symbol1.annual_revenue_growth_percent,
              qoq_revenue_growth_percent: data.symbol1.qoq_revenue_growth_percent,
              net_income_margin_percent: data.symbol1.net_income_margin_percent,
              debt_status: data.symbol1.debt_status,
              cash_position: data.symbol1.cash_position,
              short_ratio: data.symbol1.short_ratio,
              recommendation_mean: data.symbol1.recommendation_mean,
              founded: data.symbol1.founded,
              as_of_date: data.symbol1.as_of_date,
              LogoURL: data.symbol1.logo_url, // Assuming logo_url is available in the backend response
            },
            symbol2: {
              symbol: data.symbol2.symbol,
              name: data.symbol2.name,
              price: data.symbol2.price,
              change: 0,
              changePercent: 0,
              marketCap: data.symbol2.market_capitalization,
              volume: 0,
              peRatio: data.symbol2.trailing_pe_ratio || 0,
              dividendYield: 0,
              sector: data.symbol2.sector,
              industry: data.symbol2.industry,
              exchange: data.symbol2.exchange,
              employees: data.symbol2.employees,
              description: data.symbol2.description,
              trailing_pe_ratio: data.symbol2.trailing_pe_ratio,
              forward_pe_ratio: data.symbol2.forward_pe_ratio,
              ps_ratio: data.symbol2.ps_ratio,
              shares_outstanding: data.symbol2.shares_outstanding,
              average_analyst_rating: data.symbol2.average_analyst_rating,
              number_of_analyst_opinions: data.symbol2.number_of_analyst_opinions,
              recommendation_key: data.symbol2.recommendation_key,
              average_price_target: data.symbol2.average_price_target,
              upside_percentage: data.symbol2.upside_percentage,
              annual_revenue_growth_percent: data.symbol2.annual_revenue_growth_percent,
              qoq_revenue_growth_percent: data.symbol2.qoq_revenue_growth_percent,
              net_income_margin_percent: data.symbol2.net_income_margin_percent,
              debt_status: data.symbol2.debt_status,
              cash_position: data.symbol2.cash_position,
              short_ratio: data.symbol2.short_ratio,
              recommendation_mean: data.symbol2.recommendation_mean,
              founded: data.symbol2.founded,
              as_of_date: data.symbol2.as_of_date,
              LogoURL: data.symbol2.logo_url, // Assuming logo_url is available in Supabase
            },
            comparison: {
              priceDifference,
              priceDifferencePercent,
              marketCapDifference,
              marketCapDifferencePercent,
              peRatioDifference,
              dividendYieldDifference,
            },
            comparison_insights: data.comparison_insights,
            timestamp: data.timestamp,
          });

          toast({
            title: "Comparison Complete",
            description: `Successfully compared ${selectedStock1} and ${selectedStock2}`,
          });
          return;
        }
      } catch (error) {
        console.log('Backend API not available, using Supabase fallback');
      }

      // Fallback to individual stock fetching
      const [stock1Data, stock2Data] = await Promise.all([
        fetchStockDataForComparison(selectedStock1),
        fetchStockDataForComparison(selectedStock2),
      ]);

      const priceDifference = stock2Data.price - stock1Data.price;
      const priceDifferencePercent = ((priceDifference / stock1Data.price) * 100);
      const marketCapDifference = stock2Data.marketCap - stock1Data.marketCap;
      const marketCapDifferencePercent = ((marketCapDifference / stock1Data.marketCap) * 100);
      const peRatioDifference = stock2Data.peRatio - stock1Data.peRatio;
      const dividendYieldDifference = stock2Data.dividendYield - stock1Data.dividendYield;

      // Generate comparison insights
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
        title: "Comparison Complete",
        description: `Successfully compared ${selectedStock1} and ${selectedStock2}`,
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

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const truncateToWords = (text: string, maxWords: number = 50) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const handleReadInDetail = () => {
    setShowDetailedInsights(true);
    setShowAllTabs(true);
    // Switch to charts tab to show the detailed view
    setActiveTab('charts');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Stock Comparison</h1>
            <p className="text-gray-400">Compare two stocks side by side to make informed investment decisions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Input Controls */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-800/50 border-gray-700 sticky top-4">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Select Stocks</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Choose two different stocks to analyze
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Stock Selection */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">First Stock</label>
                      <Select value={selectedStock1} onValueChange={setSelectedStock1}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select first stock" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {loadingStocks ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              <span>Loading stocks...</span>
                            </div>
                          ) : (
                            stocks.map((stock) => (
                              <SelectItem key={stock.symbol} value={stock.symbol} className="text-white">
                                <div className="flex items-center space-x-2">
                                  <img
                                    src={logoMap.get(stock.symbol.toUpperCase()) || '/stock.avif'}
                                    alt={stock.symbol}
                                    className="w-4 h-4 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/stock.avif';
                                    }}
                                  />
                                  <span>{stock.symbol} - {stock.name}</span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Second Stock</label>
                      <Select value={selectedStock2} onValueChange={setSelectedStock2}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select second stock" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {loadingStocks ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              <span>Loading stocks...</span>
                            </div>
                          ) : (
                            stocks.map((stock) => (
                              <SelectItem key={stock.symbol} value={stock.symbol} className="text-white">
                                <div className="flex items-center space-x-2">
                                  <img
                                    src={logoMap.get(stock.symbol.toUpperCase()) || '/stock.avif'}
                                    alt={stock.symbol}
                                    className="w-4 h-4 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/stock.avif';
                                    }}
                                  />
                                  <span>{stock.symbol} - {stock.name}</span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Compare Button */}
                  <Button 
                    onClick={handleCompare} 
                    disabled={loading || !selectedStock1 || !selectedStock2}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Comparing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Compare Stocks
                      </>
                    )}
                  </Button>

                  {/* Quick Stats (if comparison exists) */}
                  {comparisonData && (
                    <div className="space-y-3 pt-4 border-t border-gray-700">
                      <h4 className="text-sm font-medium text-gray-300">Quick Stats</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Price Difference:</span>
                          <span className={`font-medium ${comparisonData.comparison.priceDifference > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(Math.abs(comparisonData.comparison.priceDifference))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Market Cap Diff:</span>
                          <span className="text-white font-medium">
                            {formatNumber(Math.abs(comparisonData.comparison.marketCapDifference))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">P/E Difference:</span>
                          <span className="text-white font-medium">
                            {comparisonData.comparison.peRatioDifference.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Comparison Results */}
            <div className="lg:col-span-2">
              {comparisonData ? (
                <>
                  {!showAllTabs ? (
                    /* Quick Summary View - Side by Side Comparison */
                    <div className="space-y-6">
                     
                    

                      {/* Truncated Insights with Read in Detail Button */}
                      {comparisonData.comparison_insights && (
                        <Card className="bg-gray-800/50 border-gray-700">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center space-x-2">
                              <Activity className="w-5 h-5" />
                              <span>Quick Analysis Preview</span>
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                              Brief overview of the comparison analysis
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-gray-700/30 rounded-lg p-6 mb-4">
                              <div className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                                {truncateToWords(comparisonData.comparison_insights, 50)}
                              </div>
                            </div>
                            <Button 
                              onClick={handleReadInDetail}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Read in Detail
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    /* Detailed View with Tabs */
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border-gray-700 gap-2 p-1">
                        <TabsTrigger value="charts" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white px-4 py-2">
                          <ChartBar className="w-4 h-4 mr-2" />
                          Charts
                        </TabsTrigger>
                        <TabsTrigger value="financials" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white px-4 py-2">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Financials
                        </TabsTrigger>
                        <TabsTrigger value="analysis" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white px-4 py-2">
                          <Activity className="w-4 h-4 mr-2" />
                          Analysis
                        </TabsTrigger>
                        <TabsTrigger value="details" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white px-4 py-2">
                          <Info className="w-4 h-4 mr-2" />
                          Details
                        </TabsTrigger>
                      </TabsList>

                      {/* Charts Tab */}
                      <TabsContent value="charts" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Valuation Comparison Chart */}
                          <Card className="bg-gray-800/50 border-gray-700">
                            <CardHeader>
                              <CardTitle className="text-white flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5" />
                                <span>Valuation Metrics</span>
                              </CardTitle>
                              <CardDescription className="text-gray-400">
                                P/E, P/S, and Forward P/E comparison
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ChartContainer
                                config={{
                                  [comparisonData.symbol1.symbol]: {
                                    label: comparisonData.symbol1.symbol,
                                    color: "#3B82F6",
                                  },
                                  [comparisonData.symbol2.symbol]: {
                                    label: comparisonData.symbol2.symbol,
                                    color: "#EF4444",
                                  },
                                }}
                              >
                                <BarChart data={[
                                  {
                                    metric: 'Trailing P/E',
                                    [comparisonData.symbol1.symbol]: comparisonData.symbol1.trailing_pe_ratio || 0,
                                    [comparisonData.symbol2.symbol]: comparisonData.symbol2.trailing_pe_ratio || 0,
                                  },
                                  {
                                    metric: 'Forward P/E',
                                    [comparisonData.symbol1.symbol]: comparisonData.symbol1.forward_pe_ratio || 0,
                                    [comparisonData.symbol2.symbol]: comparisonData.symbol2.forward_pe_ratio || 0,
                                  },
                                  {
                                    metric: 'P/S Ratio',
                                    [comparisonData.symbol1.symbol]: comparisonData.symbol1.ps_ratio || 0,
                                    [comparisonData.symbol2.symbol]: comparisonData.symbol2.ps_ratio || 0,
                                  },
                                ]}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                  <XAxis dataKey="metric" stroke="#9CA3AF" />
                                  <YAxis stroke="#9CA3AF" />
                                  <ChartTooltip content={<ChartTooltipContent />} />
                                  <Bar dataKey={comparisonData.symbol1.symbol} fill="#3B82F6" />
                                  <Bar dataKey={comparisonData.symbol2.symbol} fill="#EF4444" />
                                </BarChart>
                              </ChartContainer>
                            </CardContent>
                          </Card>

                          {/* Growth Metrics Chart */}
                          <Card className="bg-gray-800/50 border-gray-700">
                            <CardHeader>
                              <CardTitle className="text-white flex items-center space-x-2">
                                <TrendingUp className="w-5 h-5" />
                                <span>Growth Metrics</span>
                              </CardTitle>
                              <CardDescription className="text-gray-400">
                                Revenue growth and profitability comparison
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ChartContainer
                                config={{
                                  [comparisonData.symbol1.symbol]: {
                                    label: comparisonData.symbol1.symbol,
                                    color: "#10B981",
                                  },
                                  [comparisonData.symbol2.symbol]: {
                                    label: comparisonData.symbol2.symbol,
                                    color: "#F59E0B",
                                  },
                                }}
                              >
                                <BarChart data={[
                                  {
                                    metric: 'Revenue Growth',
                                    [comparisonData.symbol1.symbol]: comparisonData.symbol1.annual_revenue_growth_percent || 0,
                                    [comparisonData.symbol2.symbol]: comparisonData.symbol2.annual_revenue_growth_percent || 0,
                                  },
                                  {
                                    metric: 'Net Income Margin',
                                    [comparisonData.symbol1.symbol]: comparisonData.symbol1.net_income_margin_percent || 0,
                                    [comparisonData.symbol2.symbol]: comparisonData.symbol2.net_income_margin_percent || 0,
                                  },
                                  {
                                    metric: 'Upside Potential',
                                    [comparisonData.symbol1.symbol]: comparisonData.symbol1.upside_percentage || 0,
                                    [comparisonData.symbol2.symbol]: comparisonData.symbol2.upside_percentage || 0,
                                  },
                                ]}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                  <XAxis dataKey="metric" stroke="#9CA3AF" />
                                  <YAxis stroke="#9CA3AF" />
                                  <ChartTooltip content={<ChartTooltipContent />} />
                                  <Bar dataKey={comparisonData.symbol1.symbol} fill="#10B981" />
                                  <Bar dataKey={comparisonData.symbol2.symbol} fill="#F59E0B" />
                                </BarChart>
                              </ChartContainer>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      {/* Financials Tab */}
                      <TabsContent value="financials" className="space-y-8 mt-6">
                        {/* Header */}
                        <div className="mb-8">
                          <h2 className="text-2xl font-bold text-white flex items-center space-x-3 mb-2">
                            <DollarSign className="w-7 h-7 text-blue-400" />
                            <span>Financial Metrics</span>
                          </h2>
                          <p className="text-muted-foreground">Detailed financial comparison</p>
                        </div>

                        {/* Enhanced Side by Side Financial Comparison */}
                        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-0">
                          {/* Vertical Divider */}
                          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-500 to-transparent transform -translate-x-1/2 z-10"></div>
                          
                          {/* VS Label */}
                          <div className="hidden lg:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                            <div className=" text-white font-bold text-xl px-6 py-3 ">
                              VS
                            </div>
                          </div>
                          
                          {/* Left Stock */}
                          <div className="relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 backdrop-blur-sm border border-slate-700/60 rounded-l-xl lg:rounded-r-none rounded-xl lg:rounded-none p-4 hover:border-blue-500/60 hover:shadow-2xl transition-all duration-500 shadow-xl">
                            {/* Stock Logo/Image with Symbol Name */}
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="relative">
                                <div className="w-16 h-16  rounded-xl flex items-center justify-center shadow-lg">
                                  <img
                                    src={logoMap.get(comparisonData.symbol1.symbol.toUpperCase()) || '/stock.avif'}
                                    alt={comparisonData.symbol1.symbol}
                                    className="w-10 h-10 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/stock.avif';
                                    }}
                                  />
                                </div>
                               
                              </div>
                              <div className="flex-1">
                                <h3 className="text-white font-bold text-xl mb-1 tracking-wide">
                                  {comparisonData.symbol1.symbol}
                                </h3>
                                <p className="text-gray-300 text-xs leading-tight mb-2 max-w-32">
                                  {comparisonData.symbol1.name}
                                </p>
                               
                              </div>
                            </div>

                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl p-3 text-center border border-slate-600/30 hover:border-blue-500/50 transition-all duration-300">
                                <div className="text-blue-400 text-xs font-semibold mb-2 uppercase tracking-wide">Market Cap</div>
                                <div className="text-white font-bold text-sm">{formatCurrency(comparisonData.symbol1.marketCap)}</div>
                              </div>
                              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl p-3 text-center border border-slate-600/30 hover:border-green-500/50 transition-all duration-300">
                                <div className="text-green-400 text-xs font-semibold mb-2 uppercase tracking-wide">P/E Ratio</div>
                                <div className="text-white font-bold text-sm">{comparisonData.symbol1.trailing_pe_ratio?.toFixed(1) || 'N/A'}</div>
                              </div>
                              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl p-3 text-center border border-slate-600/30 hover:border-emerald-500/50 transition-all duration-300">
                                <div className="text-emerald-400 text-xs font-semibold mb-2 uppercase tracking-wide">Growth</div>
                                <div className="text-white font-bold text-sm">{comparisonData.symbol1.annual_revenue_growth_percent?.toFixed(1) || 'N/A'}%</div>
                              </div>
                              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl p-3 text-center border border-slate-600/30 hover:border-purple-500/50 transition-all duration-300">
                                <div className="text-purple-400 text-xs font-semibold mb-2 uppercase tracking-wide">Margin</div>
                                <div className="text-white font-bold text-sm">{comparisonData.symbol1.net_income_margin_percent?.toFixed(1) || 'N/A'}%</div>
                              </div>
                            </div>

                            {/* Detailed Financial Specifications */}
                            <div className="space-y-3 mb-6">
                              <div className="flex items-center justify-between bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-xl p-3 border border-slate-600/30 hover:border-cyan-500/50 transition-all duration-300">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-4 h-4 text-cyan-400" />
                                  </div>
                                  <span className="text-slate-300 text-sm font-medium">Cash Position</span>
                                </div>
                                <span className="text-white font-semibold text-sm">{comparisonData.symbol1.cash_position ? formatNumber(comparisonData.symbol1.cash_position) : 'N/A'}</span>
                              </div>
                              <div className="flex items-center justify-between bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-xl p-3 border border-slate-600/30 hover:border-red-500/50 transition-all duration-300">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                                    <Target className="w-4 h-4 text-red-400" />
                                  </div>
                                  <span className="text-slate-300 text-sm font-medium">Total Debt</span>
                                </div>
                                <span className="text-white font-semibold text-sm">{comparisonData.symbol1.debt_status ? formatNumber(comparisonData.symbol1.debt_status) : 'N/A'}</span>
                              </div>
                              <div className="flex items-center justify-between bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-xl p-3 border border-slate-600/30 hover:border-yellow-500/50 transition-all duration-300">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                    <Users className="w-4 h-4 text-yellow-400" />
                                  </div>
                                  <span className="text-slate-300 text-sm font-medium">Employees</span>
                                </div>
                                <span className="text-white font-semibold text-sm">{comparisonData.symbol1.employees?.toLocaleString() || 'N/A'}</span>
                              </div>
                              <div className="flex items-center justify-between bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-xl p-3 border border-slate-600/30 hover:border-indigo-500/50 transition-all duration-300">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-indigo-400" />
                                  </div>
                                  <span className="text-slate-300 text-sm font-medium">Founded</span>
                                </div>
                                <span className="text-white font-semibold text-sm">{comparisonData.symbol1.founded || 'N/A'}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30 hover:border-blue-400/60 transition-all duration-300"
                                onClick={() => handleReadInDetail()}
                              >
                                <Info className="w-4 h-4 mr-2" />
                                Details
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 bg-green-500/20 text-green-300 border-green-500/40 hover:bg-green-500/30 hover:border-green-400/60 transition-all duration-300"
                              >
                                <ChartBar className="w-4 h-4 mr-2" />
                                Analysis
                              </Button>
                            </div>
                          </div>

                          {/* Right Stock */}
                          <div className="relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 backdrop-blur-sm border border-slate-700/60 rounded-l-xl lg:rounded-r-none rounded-xl lg:rounded-none p-4 hover:border-blue-500/60 hover:shadow-2xl transition-all duration-500 shadow-xl">
                            {/* Stock Logo/Image with Symbol Name */}
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="relative">
                                <div className="w-16 h-16  rounded-xl flex items-center justify-center shadow-lg">
                                  <img
                                    src={logoMap.get(comparisonData.symbol2.symbol.toUpperCase()) || '/stock.avif'}
                                    alt={comparisonData.symbol2.symbol}
                                    className="w-10 h-10 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/stock.avif';
                                    }}
                                  />
                                </div>
                               
                              </div>
                              <div className="flex-1">
                                <h3 className="text-white font-bold text-xl mb-1 tracking-wide">
                                  {comparisonData.symbol2.symbol}
                                </h3>
                                <p className="text-gray-300 text-xs leading-tight mb-2 max-w-32">
                                  {comparisonData.symbol2.name}
                                </p>
                              
                              </div>
                            </div>

                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl p-3 text-center border border-slate-600/30 hover:border-blue-500/50 transition-all duration-300">
                                <div className="text-blue-400 text-xs font-semibold mb-2 uppercase tracking-wide">Market Cap</div>
                                <div className="text-white font-bold text-sm">{formatCurrency(comparisonData.symbol2.marketCap)}</div>
                              </div>
                              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl p-3 text-center border border-slate-600/30 hover:border-green-500/50 transition-all duration-300">
                                <div className="text-green-400 text-xs font-semibold mb-2 uppercase tracking-wide">P/E Ratio</div>
                                <div className="text-white font-bold text-sm">{comparisonData.symbol2.trailing_pe_ratio?.toFixed(1) || 'N/A'}</div>
                              </div>
                              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl p-3 text-center border border-slate-600/30 hover:border-emerald-500/50 transition-all duration-300">
                                <div className="text-blue-400 text-xs font-semibold mb-2 uppercase tracking-wide">Growth</div>
                                <div className="text-white font-bold text-sm">{comparisonData.symbol2.annual_revenue_growth_percent?.toFixed(1) || 'N/A'}%</div>
                              </div>
                              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl p-3 text-center border border-slate-600/30 hover:border-purple-500/50 transition-all duration-300">
                                <div className="text-purple-400 text-xs font-semibold mb-2 uppercase tracking-wide">Margin</div>
                                <div className="text-white font-bold text-sm">{comparisonData.symbol2.net_income_margin_percent?.toFixed(1) || 'N/A'}%</div>
                              </div>
                            </div>

                            {/* Detailed Financial Specifications */}
                            <div className="space-y-3 mb-6">
                              <div className="flex items-center justify-between bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-xl p-3 border border-slate-600/30 hover:border-cyan-500/50 transition-all duration-300">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-4 h-4 text-cyan-400" />
                                  </div>
                                  <span className="text-slate-300 text-sm font-medium">Cash Position</span>
                                </div>
                                <span className="text-white font-semibold text-sm">{comparisonData.symbol2.cash_position ? formatNumber(comparisonData.symbol2.cash_position) : 'N/A'}</span>
                              </div>
                              <div className="flex items-center justify-between bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-xl p-3 border border-slate-600/30 hover:border-red-500/50 transition-all duration-300">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                                    <Target className="w-4 h-4 text-red-400" />
                                  </div>
                                  <span className="text-slate-300 text-sm font-medium">Total Debt</span>
                                </div>
                                <span className="text-white font-semibold text-sm">{comparisonData.symbol2.debt_status ? formatNumber(comparisonData.symbol2.debt_status) : 'N/A'}</span>
                              </div>
                              <div className="flex items-center justify-between bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-xl p-3 border border-slate-600/30 hover:border-yellow-500/50 transition-all duration-300">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                    <Users className="w-4 h-4 text-yellow-400" />
                                  </div>
                                  <span className="text-slate-300 text-sm font-medium">Employees</span>
                                </div>
                                <span className="text-white font-semibold text-sm">{comparisonData.symbol2.employees?.toLocaleString() || 'N/A'}</span>
                              </div>
                              <div className="flex items-center justify-between bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-xl p-3 border border-slate-600/30 hover:border-indigo-500/50 transition-all duration-300">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-indigo-400" />
                                  </div>
                                  <span className="text-slate-300 text-sm font-medium">Founded</span>
                                </div>
                                <span className="text-white font-semibold text-sm">{comparisonData.symbol2.founded || 'N/A'}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30 hover:border-red-400/60 transition-all duration-300"
                                onClick={() => handleReadInDetail()}
                              >
                                <Info className="w-4 h-4 mr-2" />
                                Details
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 bg-orange-500/20 text-orange-300 border-orange-500/40 hover:bg-orange-500/30 hover:border-orange-400/60 transition-all duration-300"
                              >
                                <ChartBar className="w-4 h-4 mr-2" />
                                Analysis
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Comparison Summary Card */}
                        <div className="mt-8">
                          <Card className="bg-gradient-to-r from-slate-800/95 via-slate-800/90 to-slate-900/95 border-slate-700/60 shadow-2xl">
                            <CardHeader className="pb-4">
                              <CardTitle className="text-white flex items-center space-x-3 text-xl">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                  <BarChart3 className="w-5 h-5 text-white" />
                                </div>
                                <span>Key Differences Summary</span>
                              </CardTitle>
                              <CardDescription className="text-gray-400 text-sm">
                                Quick comparison highlights between the two stocks
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-4 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/30 hover:border-green-500/50 transition-all duration-300">
                                  <div className="text-2xl font-bold text-white mb-2">
                                    {comparisonData.comparison.priceDifference > 0 ? '+' : ''}{formatCurrency(comparisonData.comparison.priceDifference)}
                                  </div>
                                  <div className="text-sm text-gray-400 mb-2 font-medium">Price Difference</div>
                                  <div className={`text-sm font-semibold ${comparisonData.comparison.priceDifference > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {comparisonData.comparison.priceDifferencePercent > 0 ? '+' : ''}{comparisonData.comparison.priceDifferencePercent.toFixed(1)}%
                                  </div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/30 hover:border-blue-500/50 transition-all duration-300">
                                  <div className="text-2xl font-bold text-white mb-2">
                                    {formatNumber(Math.abs(comparisonData.comparison.marketCapDifference))}
                                  </div>
                                  <div className="text-sm text-gray-400 mb-2 font-medium">Market Cap Difference</div>
                                  <div className="text-sm font-semibold text-blue-400">
                                    {comparisonData.comparison.marketCapDifferencePercent > 0 ? '+' : ''}{comparisonData.comparison.marketCapDifferencePercent.toFixed(1)}%
                                  </div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/30 hover:border-purple-500/50 transition-all duration-300">
                                  <div className="text-2xl font-bold text-white mb-2">
                                    {comparisonData.comparison.peRatioDifference > 0 ? '+' : ''}{comparisonData.comparison.peRatioDifference.toFixed(1)}
                                  </div>
                                  <div className="text-sm text-gray-400 mb-2 font-medium">P/E Ratio Difference</div>
                                  <div className={`text-sm font-semibold ${comparisonData.comparison.peRatioDifference < 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {comparisonData.comparison.peRatioDifference < 0 ? 'Lower P/E' : 'Higher P/E'}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      {/* Analysis Tab */}
                      <TabsContent value="analysis" className="space-y-6 mt-6">
                        {comparisonData.comparison_insights && (
                          <Card className="bg-gray-800/50 border-gray-700">
                            <CardHeader>
                              <CardTitle className="text-white flex items-center space-x-2">
                                <Activity className="w-5 h-5" />
                                <span>AI Analysis & Insights</span>
                              </CardTitle>
                              <CardDescription className="text-gray-400">
                                Comprehensive analysis and investment recommendations
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="bg-gray-700/30 rounded-lg p-6">
                                <div className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                                  {comparisonData.comparison_insights}
                                </div>
                                {comparisonData.timestamp && (
                                  <div className="mt-4 text-xs text-gray-500">
                                    Analysis generated on: {new Date(comparisonData.timestamp).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>

                      {/* Details Tab */}
                      <TabsContent value="details" className="space-y-6 mt-6">
                        <Card className="bg-gray-800/50 border-gray-700">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center space-x-2">
                              <FileText className="w-5 h-5" />
                              <span>Company Information</span>
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                              Business descriptions and key information
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div>
                                <h3 className="text-lg font-semibold text-white mb-3">{comparisonData.symbol1.symbol} - {comparisonData.symbol1.name}</h3>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                  {comparisonData.symbol1.description || 'No description available.'}
                                </p>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-white mb-3">{comparisonData.symbol2.symbol} - {comparisonData.symbol2.name}</h3>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                  {comparisonData.symbol2.description || 'No description available.'}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  )}
                </>
              ) : (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Select two stocks and click "Compare Stocks" to see the analysis</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Comparison; 