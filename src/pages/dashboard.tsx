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
  Plus
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
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
          <p className="text-purple-300 font-medium">Loading your dashboard...</p>
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
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      {username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Welcome back, {username}
                </h1>
                <p className="text-gray-400">
                  Manage your portfolio and track dividends
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                onClick={() => navigate('/notifications')}
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900/60 border-gray-800 hover:bg-gray-900/80 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Stocks</p>
                  <p className="text-3xl font-bold text-white">{savedStocks.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/60 border-gray-800 hover:bg-gray-900/80 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Dividends</p>
                  <p className="text-3xl font-bold text-white">
                    ${savedStocks.reduce((total, stock) => total + calculateTotalDividends(stock), 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-pink-500/10">
                  <Heart className="h-8 w-8 text-pink-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/60 border-gray-800 hover:bg-gray-900/80 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Avg Yield</p>
                  <p className="text-3xl font-bold text-white">
                    {(savedStocks.reduce((acc, stock) => acc + (stock.dividend_yield || 0), 0) /
                      (savedStocks.length || 1)).toFixed(2)}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10">
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Section */}
        <Card className="bg-gray-900/60 border-gray-800 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search stocks by symbol or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {sortOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button
                onClick={() => navigate('/top-stocks')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Stocks
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stocks Table */}
        <Card className="bg-gray-900/60 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Portfolio ({filteredStocks.length} stocks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-300">Stock</TableHead>
                    <TableHead className="text-gray-300">Sector</TableHead>
                    <TableHead className="text-gray-300">Quantity</TableHead>
                    <TableHead className="text-gray-300">Dividend Rate</TableHead>
                    <TableHead className="text-gray-300">Yield</TableHead>
                    <TableHead className="text-gray-300">Ex-Dividend</TableHead>
                    <TableHead className="text-gray-300">Payout Date</TableHead>
                    <TableHead className="text-gray-300">Total Dividends</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortStocks(filteredStocks).map((stock) => (
                    <TableRow
                      key={stock.symbol}
                      className="border-gray-800 hover:bg-gray-800/50 cursor-pointer"
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
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {(() => {
                            const logoInfo = companyLogos.find(logo =>
                              logo.Symbol?.toUpperCase() === stock.symbol?.toUpperCase()
                            );
                            const logoUrl = logoInfo?.LogoURL || stock.LogoURL;

                            return logoUrl ? (
                              <img
                                src={logoUrl}
                                alt={`${stock.company_name} logo`}
                                className="w-8 h-8 object-contain rounded"
                                onError={(e) => {
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${stock.symbol}&background=random&size=32`;
                                }}
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                                <span className="text-xs font-bold">{stock.symbol.substring(0, 2)}</span>
                              </div>
                            );
                          })()}
                          <div>
                            <div className="font-semibold text-white">{stock.symbol}</div>
                            <div className="text-sm text-gray-400">{stock.company_name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                          {stock.sector}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={quantities[stock.symbol] || 1}
                          onChange={(e) => handleQuantityChange(stock.symbol, parseInt(e.target.value) || 1)}
                          className="w-20 bg-gray-800 border-gray-700 text-white"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell className="text-white">${stock.dividend_rate.toFixed(2)}</TableCell>
                      <TableCell className="text-green-400 font-semibold">
                        {stock.dividend_yield ? stock.dividend_yield.toFixed(2) : '0.00'}%
                      </TableCell>
                      <TableCell className="text-gray-300">{stock.ex_dividend_date || 'N/A'}</TableCell>
                      <TableCell className="text-gray-300">{stock.payout_date || 'N/A'}</TableCell>
                      <TableCell className="text-blue-400 font-semibold">
                        ${calculateTotalDividends(stock).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
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
              
              {filteredStocks.length === 0 && (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No stocks found</h3>
                  <p className="text-gray-500 mb-4">Start building your portfolio by adding some stocks</p>
                  <Button
                    onClick={() => navigate('/top-stocks')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
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
