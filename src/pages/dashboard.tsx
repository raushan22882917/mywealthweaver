
import { useState, useEffect } from 'react';
import StockDetailsDialog from '@/components/StockDetailsDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Heart,
  DollarSign,
  TrendingUp,
  Bell,
  Settings,
  Search,
  Filter,
  Eye,
  Plus,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import StockAnalysisDialog from '@/components/StockAnalysisDialog';
import { useTheme } from 'next-themes';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import Papa from 'papaparse';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface CompanyLogo {
  Symbol: string;
  'Company Name': string;
  Domain: string;
  LogoURL: string;
}

interface SavedStock {
  id: string;
  user_id: string;
  symbol: string;
  company_name: string;
  LogoURL: string;
  price: number;
  dividend_yield: number;
  next_dividend_date?: string;
  is_favorite: boolean;
  created_at: string;
  quantity: number;
  ex_dividend_date: string;
  payout_date: string;
  report_date: string;
  special_dividend: number;
  total_dividend: number;
  sector: string;
  industry: string;
  buy_date?: string;
  dividend_rate: number;
}

interface UserProfile {
  username: string;
  email: string;
  avatar_url?: string;
}

interface DashboardProps {
  session?: Session | null;
}

interface SortOption {
  value: string;
  label: string;
}

export default function Dashboard({ session }: DashboardProps) {
  const [savedStocks, setSavedStocks] = useState<SavedStock[]>([]);
  const [companyLogos, setCompanyLogos] = useState<CompanyLogo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isStockDetailsOpen, setIsStockDetailsOpen] = useState(false);
  const [selectedStockForDetails, setSelectedStockForDetails] = useState<any>(null);
  const { theme: _ } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>('alphabetical');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const sortOptions: SortOption[] = [
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'dividend-asc', label: 'Dividend Yield (Low to High)' },
    { value: 'dividend-desc', label: 'Dividend Yield (High to Low)' },
    { value: 'sector', label: 'Sector' },
    { value: 'industry', label: 'Industry' }
  ];

  // Sort stocks based on selected option
  const sortStocks = (stocks: SavedStock[]) => {
    switch (sortOption) {
      case 'alphabetical':
        return [...stocks].sort((a, b) => a.symbol.localeCompare(b.symbol));
      case 'price-asc':
        return [...stocks].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...stocks].sort((a, b) => b.price - a.price);
      case 'dividend-asc':
        return [...stocks].sort((a, b) => a.dividend_yield - b.dividend_yield);
      case 'dividend-desc':
        return [...stocks].sort((a, b) => b.dividend_yield - a.dividend_yield);
      case 'sector':
        return [...stocks].sort((a, b) => a.sector.localeCompare(b.sector));
      case 'industry':
        return [...stocks].sort((a, b) => a.industry.localeCompare(b.industry));
      default:
        return stocks;
    }
  };

  // Handle quantity change
  const handleQuantityChange = async (symbol: string, value: number) => {
    try {
      setQuantities(prev => ({
        ...prev,
        [symbol]: value
      }));

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please login to update quantities",
          variant: "destructive",
        });
        return;
      }

      const { data: existingData, error: checkError } = await supabase
        .from('quantity')
        .select('*')
        .eq('user_id', user.id)
        .eq('symbol', symbol)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingData) {
        const { error: updateError } = await supabase
          .from('quantity')
          .update({ quantity: value })
          .eq('user_id', user.id)
          .eq('symbol', symbol);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('quantity')
          .insert([
            {
              user_id: user.id,
              symbol: symbol,
              quantity: value
            }
          ]);

        if (insertError) throw insertError;
      }

      toast({
        title: "Quantity Updated",
        description: `Quantity for ${symbol} updated to ${value}`,
      });
    } catch (error) {
      console.error('Error saving quantity:', error);
      toast({
        title: "Error",
        description: "Failed to save quantity",
        variant: "destructive",
      });
    }
  };

  // Calculate total dividends
  const calculateTotalDividends = (stock: SavedStock) => {
    const quantity = quantities[stock.symbol] || 1;
    return (stock.dividend_rate * quantity) + (stock.special_dividend || 0);
  };

  useEffect(() => {
    if (session) {
      fetchUserStocks(session.user.id);
      getProfile();
    } else {
      checkUser();
    }
  }, [session]);

  const checkUser = async () => {
    try {
      setIsLoading(true);
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!currentSession) {
        navigate('/auth');
        return;
      }

      await fetchUserStocks(currentSession.user.id);
      await getProfile();

    } catch (error: any) {
      console.error('Session check error:', error);
      toast({
        title: "Authentication Error",
        description: "Please log in to access your dashboard",
        variant: "destructive",
      });
      navigate('/auth');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadCompanyLogos = async () => {
      try {
        const response = await fetch('/logos.csv');
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            console.log('CSV parsing complete, found', results.data.length, 'logos');
            setCompanyLogos(results.data as CompanyLogo[]);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
          }
        });
      } catch (error) {
        console.error('Error loading company logos:', error);
      }
    };

    loadCompanyLogos();
  }, []);

  const fetchUserStocks = async (userId: string) => {
    try {
      setIsLoading(true);

      const { data: savedStocksData, error: savedStocksError } = await supabase
        .from('saved_stocks')
        .select('*')
        .eq('user_id', userId);

      if (savedStocksError) throw savedStocksError;

      let quantityMap: { [key: string]: number } = {};
      try {
        const { data: quantityData } = await supabase
          .from('quantity')
          .select('symbol, quantity')
          .eq('user_id', userId);

        if (quantityData && quantityData.length > 0) {
          quantityData.forEach(item => {
            if (item && item.symbol && item.quantity) {
              quantityMap[item.symbol] = item.quantity;
            }
          });
          console.log('Loaded quantities from database:', quantityMap);
        } else {
          console.log('No quantities found in database');
        }
      } catch (error) {
        console.error('Error fetching quantities:', error);
      }

      setQuantities(quantityMap);

      if (savedStocksData) {
        const { data: logoData } = await supabase
          .from('company_logos')
          .select('symbol, LogoURL');

        const dbLogoMap = new Map(
          logoData?.map(item => [
            item?.symbol?.toUpperCase() || '',
            item?.LogoURL || ''
          ]) || []
        );

        const csvLogoMap = new Map(
          companyLogos?.filter(logo => logo?.Symbol && logo?.LogoURL)
            .map(logo => [
              logo?.Symbol?.toUpperCase() || '',
              logo?.LogoURL || ''
            ]) || []
        );

        const symbols = savedStocksData.map(stock => stock.symbol);
        const { data: dividendData, error: dividendError } = await supabase
          .from('dividendsymbol')
          .select('symbol,buy_date,exdividenddate,earningsdate,payoutdate,shortname,dividendrate,dividendyield')
          .in('symbol', symbols);

        if (dividendError) throw dividendError;

        const { data: topStocksData, error: topStocksError } = await supabase
          .from('company_profiles')
          .select('symbol,sector,industry')
          .in('symbol', symbols);

        if (topStocksError) throw topStocksError;

        const mergedStocks = savedStocksData.map(stock => {
          const upperSymbol = stock.symbol.toUpperCase();
          const dividendInfo = dividendData?.find(d => d?.symbol?.toUpperCase() === upperSymbol) || {
            symbol: upperSymbol,
            buy_date: null,
            exdividenddate: null,
            earningsdate: null,
            payoutdate: null,
            dividendrate: 0,
            dividendyield: 0
          };
          const topStockInfo = topStocksData?.find(t => t.symbol.toUpperCase() === upperSymbol) || {
            sector: 'N/A',
            industry: 'N/A'
          };

          const logoUrl = dbLogoMap.get(upperSymbol) ||
                         csvLogoMap.get(upperSymbol) ||
                         stock.LogoURL;

          return {
            ...stock,
            LogoURL: logoUrl,
            buy_date: dividendInfo.buy_date || null,
            ex_dividend_date: dividendInfo.exdividenddate || stock.ex_dividend_date || null,
            report_date: dividendInfo.earningsdate || stock.report_date || null,
            payout_date: dividendInfo.payoutdate || stock.payout_date || null,
            dividend_rate: dividendInfo.dividendrate || 0,
            dividendyield: dividendInfo.dividendyield || 0,
            sector: topStockInfo.sector,
            industry: topStockInfo.industry,
            special_dividend: stock.special_dividend || 0,
            total_dividend: stock.total_dividend || 0,
            quantity: quantityMap[stock.symbol] || 1
          };
        });

        setSavedStocks(mergedStocks);

        const initialQuantities: { [key: string]: number } = {};
        mergedStocks.forEach(stock => {
          initialQuantities[stock.symbol] = stock.quantity || 1;
        });
        setQuantities(initialQuantities);
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch saved stocks',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter stocks based on search
  const filteredStocks = savedStocks
    .filter(stock =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Add getProfile function
  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile, error: fetchError } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", user.id)
          .single();

        if (fetchError && fetchError.code === "PGRST116") {
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([{ id: user.id, username: user.email?.split('@')[0] }]);

          if (insertError) {
            console.error("Error creating profile:", insertError);
            toast({
              title: "Error",
              description: "Failed to create user profile",
              variant: "destructive",
            });
            return;
          }
          setUsername(user.email?.split('@')[0] || "");
        } else if (profile) {
          setUsername(profile.username);
          setUserProfile({
            username: profile.username,
            email: user.email || "",
            avatar_url: profile.avatar_url
          });
        }
      }
    } catch (error) {
      console.error("Error in getProfile:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user profile",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500" />
            <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-white mb-2">Loading Dashboard</p>
            <p className="text-purple-300">Preparing your portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  // This check is now handled by the ProtectedRoute component in App.tsx
  // We keep a simplified version as a fallback
  if (!session && !isLoading) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Navbar />
      
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Enhanced Header Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* User Profile Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 p-[3px] shadow-2xl">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                    {userProfile?.avatar_url ? (
                      <img
                        src={userProfile.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        {username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-gray-900 animate-pulse" />
              </div>
              
              <div className="space-y-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Welcome back, {username}
                </h1>
                <p className="text-gray-400 text-lg">
                  Manage your portfolio and track dividends
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-green-400 font-medium">Portfolio Active</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                onClick={() => navigate('/notifications')}
              >
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 group">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Stocks</p>
                  <p className="text-4xl font-bold text-white group-hover:text-purple-100 transition-colors">
                    {savedStocks.length}
                  </p>
                  <p className="text-xs text-gray-500">Active investments</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 group-hover:from-purple-500/30 group-hover:to-purple-600/20 transition-all duration-300">
                  <TrendingUp className="h-10 w-10 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50 hover:border-green-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-green-500/10 group">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Dividends</p>
                  <p className="text-4xl font-bold text-white group-hover:text-green-100 transition-colors">
                    ${savedStocks.reduce((total, stock) => total + calculateTotalDividends(stock), 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Expected returns</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/10 group-hover:from-green-500/30 group-hover:to-green-600/20 transition-all duration-300">
                  <DollarSign className="h-10 w-10 text-green-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 group">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Average Yield</p>
                  <p className="text-4xl font-bold text-white group-hover:text-blue-100 transition-colors">
                    {(savedStocks.reduce((acc, stock) => acc + (stock.dividend_yield || 0), 0) /
                      (savedStocks.length || 1)).toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500">Portfolio performance</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 group-hover:from-blue-500/30 group-hover:to-blue-600/20 transition-all duration-300">
                  <BarChart3 className="h-10 w-10 text-blue-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Controls Section */}
        <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 border-gray-700/50 mb-8 shadow-xl">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-6 items-center flex-1 w-full lg:w-auto">
                {/* Enhanced Search */}
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search stocks by symbol or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-gray-800/80 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 rounded-xl"
                  />
                </div>
                
                {/* Enhanced Filter */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-700/50">
                    <Filter className="h-5 w-5 text-gray-400" />
                  </div>
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-[220px] bg-gray-800/80 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 rounded-xl">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 rounded-xl">
                      {sortOptions.map(option => (
                        <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Enhanced Add Button */}
              <Button
                onClick={() => navigate('/top-stocks')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 group"
              >
                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Add Stocks
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Stocks Table */}
        <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 border-gray-700/50 shadow-2xl">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <Activity className="h-6 w-6 text-blue-400" />
              </div>
              Your Portfolio
              <Badge variant="secondary" className="ml-auto bg-gray-700/50 text-gray-300 px-3 py-1">
                {filteredStocks.length} stocks
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700/50 hover:bg-gray-800/30">
                    <TableHead className="text-gray-300 font-semibold py-4">Stock</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Sector</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Quantity</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Dividend Rate</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Yield</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Ex-Dividend</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Payout Date</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Total Dividends</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortStocks(filteredStocks).map((stock) => (
                    <TableRow
                      key={stock.symbol}
                      className="border-gray-700/30 hover:bg-gray-800/50 cursor-pointer transition-all duration-200 group"
                      onClick={() => {
                        const stockForDialog = {
                          Symbol: stock.symbol,
                          title: stock.company_name,
                          LogoURL: stock.LogoURL,
                          marketCap: stock.price,
                          dividendyield: stock.dividend_yield
                        };
                        setSelectedStockForDetails(stockForDialog);
                        setIsStockDetailsOpen(true);
                      }}
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-4">
                          {(() => {
                            const logoInfo = companyLogos.find(logo =>
                              logo.Symbol?.toUpperCase() === stock.symbol?.toUpperCase()
                            );
                            const logoUrl = logoInfo?.LogoURL || stock.LogoURL;

                            return logoUrl ? (
                              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                                <img
                                  src={logoUrl}
                                  alt={`${stock.company_name} logo`}
                                  className="w-full h-full object-contain bg-white/5 group-hover:scale-110 transition-transform duration-300"
                                  onError={(e) => {
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${stock.symbol}&background=random&size=48`;
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-sm font-bold text-white">{stock.symbol.substring(0, 2)}</span>
                              </div>
                            );
                          })()}
                          <div className="space-y-1">
                            <div className="font-bold text-white text-lg group-hover:text-blue-100 transition-colors">
                              {stock.symbol}
                            </div>
                            <div className="text-sm text-gray-400 max-w-[200px] truncate">
                              {stock.company_name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 text-purple-200 border-purple-500/30 px-3 py-1">
                          {stock.sector}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={quantities[stock.symbol] || 1}
                          onChange={(e) => handleQuantityChange(stock.symbol, parseInt(e.target.value) || 1)}
                          className="w-20 bg-gray-800/80 border-gray-600/50 text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 rounded-lg"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        ${stock.dividend_rate.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className="text-green-400 font-bold text-lg">
                          {stock.dividend_yield ? stock.dividend_yield.toFixed(2) : '0.00'}%
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {stock.ex_dividend_date || 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {stock.payout_date || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span className="text-blue-400 font-bold text-lg">
                          ${calculateTotalDividends(stock).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-600/50 text-gray-300 hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-200 transition-all duration-300 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            const stockForDialog = {
                              Symbol: stock.symbol,
                              title: stock.company_name,
                              LogoURL: stock.LogoURL,
                              marketCap: stock.price,
                              dividendyield: stock.dividend_yield
                            };
                            setSelectedStockForDetails(stockForDialog);
                            setIsStockDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Enhanced Empty State */}
              {filteredStocks.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-2xl">
                    <TrendingUp className="h-12 w-12 text-gray-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-300 mb-3">No stocks found</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Start building your dividend portfolio by adding your first stock investment
                  </p>
                  <Button
                    onClick={() => navigate('/top-stocks')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Your First Stock
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />

      {/* Dialogs */}
      {selectedStockForDetails && (
        <StockAnalysisDialog
          stock={{
            symbol: selectedStockForDetails.Symbol,
            longName: selectedStockForDetails.title,
            regularMarketPrice: selectedStockForDetails.marketCap || 0,
            regularMarketChange: 0,
            regularMarketChangePercent: 0,
            marketCap: 0,
            regularMarketVolume: 0,
            dividendYield: selectedStockForDetails.dividendyield,
            sector: 'N/A',
            industry: 'N/A'
          }}
          isOpen={isAnalysisOpen}
          setIsOpen={setIsAnalysisOpen}
        />
      )}

      {selectedStockForDetails && (
        <StockDetailsDialog
          stock={selectedStockForDetails}
          isOpen={isStockDetailsOpen}
          setIsOpen={setIsStockDetailsOpen}
        />
      )}
    </div>
  );
}
