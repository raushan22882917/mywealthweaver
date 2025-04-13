
import { useState, useEffect } from 'react';
import StockDetailsDialog from '@/components/StockDetailsDialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Heart,
  DollarSign,
  TrendingUp,
  Bell,
  Settings
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
import { Star } from 'lucide-react';

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
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isStockDetailsOpen, setIsStockDetailsOpen] = useState(false);
  const [selectedStockForDetails, setSelectedStockForDetails] = useState<any>(null);
  const [selectedStock, setSelectedStock] = useState<SavedStock | null>(null);
  const { theme: _ } = useTheme(); // Unused but kept for future use
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
  const handleQuantityChange = (symbol: string, value: number) => {
    setQuantities(prev => ({
      ...prev,
      [symbol]: value
    }));
  };

  // Handle favorite toggle
  const toggleFavorite = async (stock: SavedStock) => {
    try {
      const { error } = await supabase
        .from('saved_stocks')
        .update({ is_favorite: !stock.is_favorite })
        .eq('symbol', stock.symbol)
        .eq('user_id', session?.user.id);

      if (error) throw error;

      // Update local state
      setSavedStocks(stocks =>
        stocks.map(s =>
          s.symbol === stock.symbol
            ? { ...s, is_favorite: !s.is_favorite }
            : s
        )
      );

      toast({
        title: "Success",
        description: `${stock.symbol} ${!stock.is_favorite ? 'added to' : 'removed from'} favorites`,
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    }
  };

  // Calculate total dividends
  const calculateTotalDividends = (stock: SavedStock) => {
    const quantity = quantities[stock.symbol] || 1;
    // Use dividend_rate directly (annual dividend per share) multiplied by quantity
    return (stock.dividend_rate * quantity) + (stock.special_dividend || 0);
  };

  useEffect(() => {
    if (session) {
      // If session is passed from parent, use it directly
      fetchUserStocks(session.user.id);
      getProfile();
    } else {
      // Fallback to checking session manually
      checkUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const checkUser = async () => {
    try {
      setIsLoading(true);
      // Get current session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!currentSession) {
        // No session found, redirect to auth
        navigate('/auth');
        return;
      }

      // If we have a session, fetch the stocks and profile
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

      // First get saved stocks
      const { data: savedStocksData, error: savedStocksError } = await supabase
        .from('saved_stocks')
        .select('*')
        .eq('user_id', userId);

      if (savedStocksError) throw savedStocksError;

      if (savedStocksData) {
        // Get logos from database
        const { data: logoData } = await supabase
          .from('company_logos')
          .select('symbol, LogoURL');

        // Create map of symbols to logos from database
        const dbLogoMap = new Map(
          logoData?.map(item => [item.symbol.toUpperCase(), item.LogoURL]) || []
        );

        // Create map of symbols to logos from CSV
        const csvLogoMap = new Map(companyLogos.map(logo => [logo.Symbol.toUpperCase(), logo.LogoURL]));

        // Get additional data from dividendsymbol table
        const symbols = savedStocksData.map(stock => stock.symbol);
        const { data: dividendData, error: dividendError } = await supabase
          .from('dividendsymbol')
          .select('symbol,buy_date,exdividenddate,earningsdate,payoutdate,shortname,dividendrate')
          .in('symbol', symbols);

        if (dividendError) throw dividendError;

        // Get sector and industry from top_stocks table
        const { data: topStocksData, error: topStocksError } = await supabase
          .from('company_profiles')
          .select('symbol,sector,industry')
          .in('symbol', symbols);

        if (topStocksError) throw topStocksError;

        // Merge all the data
        const mergedStocks = savedStocksData.map(stock => {
          const upperSymbol = stock.symbol.toUpperCase();
          const dividendInfo = dividendData?.find(d => d.symbol.toUpperCase() === upperSymbol) || {
            buy_date: null,
            exdividenddate: null,
            earningsdate: null,
            payoutdate: null,
            dividendrate: 0
          };
          const topStockInfo = topStocksData?.find(t => t.symbol.toUpperCase() === upperSymbol) || {
            sector: 'N/A',
            industry: 'N/A'
          };

          // Get logo from database first, then CSV, then fallback
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
            sector: topStockInfo.sector,
            industry: topStockInfo.industry,
            special_dividend: stock.special_dividend || 0,
            total_dividend: stock.total_dividend || 0
          };
        });

        setSavedStocks(mergedStocks);

        // Initialize quantities
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

  // Filter stocks based on search and favorites
  const filteredStocks = savedStocks
    .filter(stock => filterFavorites ? stock.is_favorite : true)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4" />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User Profile Section */}
        <div className="mb-10 bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-900/20">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                {userProfile?.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    {username?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {username}
              </h1>
              <p className="text-purple-300 max-w-xl">
                Manage your stock portfolio and track dividends. Stay updated with your investments and financial goals.
              </p>
              <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="p-6 bg-gradient-to-br from-gray-900 to-purple-900/40 hover:shadow-lg transition-shadow duration-200 border border-purple-900/30 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-purple-500/10 dark:bg-purple-500/20">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Total Stocks</p>
                <p className="text-2xl font-bold text-white">{savedStocks.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-gray-900 to-pink-900/40 hover:shadow-lg transition-shadow duration-200 border border-pink-900/30 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-pink-500/10 dark:bg-pink-500/20">
                <Heart className="h-6 w-6 text-pink-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Total Dividends</p>
                <p className="text-2xl font-bold text-white">
                  ${savedStocks.reduce((total, stock) => total + calculateTotalDividends(stock), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-gray-900 to-green-900/40 hover:shadow-lg transition-shadow duration-200 border border-green-900/30 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-green-500/10 dark:bg-green-500/20">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Avg Yield</p>
                <p className="text-2xl font-bold text-white">
                  {(savedStocks.reduce((acc, stock) => acc + (stock.dividend_yield || 0), 0) /
                    (savedStocks.length || 1)).toFixed(2)}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Saved Symbols and Quantities Table */}
        <Card className="mb-8 bg-gradient-to-br from-gray-900 to-blue-900/20 border border-blue-900/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              Saved Symbols and Quantities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Dividend Rate</TableHead>
                    <TableHead>Total Dividends</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(quantities).map(([symbol, quantity]) => {
                    const stock = savedStocks.find(s => s.symbol === symbol);
                    if (!stock) return null;
                    return (
                      <TableRow key={symbol}>
                        <TableCell className="font-medium">{symbol}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(symbol, parseInt(e.target.value) || 1)}
                            className="w-20 bg-gray-800/50 border-gray-700 text-white"
                            min="1"
                          />
                        </TableCell>
                        <TableCell>${stock.dividend_rate?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>${calculateTotalDividends(stock).toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Controls Section */}
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stocks Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Favorite</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Dividend Rate</TableHead>
              <TableHead>Dividend Yield</TableHead>
              <TableHead>Ex-Dividend Date</TableHead>
              <TableHead>Payout Date</TableHead>
              <TableHead>Report Date</TableHead>
              <TableHead>Special Dividend</TableHead>
              <TableHead>Total Dividends</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortStocks(filteredStocks).map((stock) => (
              <TableRow key={stock.symbol}>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(stock)}
                  >
                    <Star
                      className={stock.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}
                    />
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {(() => {
                      // Find logo from CSV file by matching symbol
                      const logoInfo = companyLogos.find(logo =>
                        logo.Symbol?.toUpperCase() === stock.symbol?.toUpperCase()
                      );

                      const logoUrl = logoInfo?.LogoURL || stock.LogoURL;

                      return logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={`${stock.company_name} logo`}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            // Fallback if image fails to load
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${stock.symbol}&background=random&size=32`;
                          }}
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">{stock.symbol.substring(0, 2)}</span>
                        </div>
                      );
                    })()}
                    <span>{stock.symbol}</span>
                  </div>
                </TableCell>
                <TableCell>{stock.company_name}</TableCell>
                <TableCell>{stock.sector}</TableCell>
                <TableCell>{stock.industry}</TableCell>
                <TableCell>${stock.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    value={quantities[stock.symbol] || 1}
                    onChange={(e) => handleQuantityChange(stock.symbol, parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>${stock.dividend_rate.toFixed(2)}</TableCell>
                <TableCell>{stock.dividend_yield.toFixed(2)}%</TableCell>
                <TableCell>{stock.ex_dividend_date || 'N/A'}</TableCell>
                <TableCell>{stock.payout_date || 'N/A'}</TableCell>
                <TableCell>{stock.report_date || 'N/A'}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={stock.special_dividend || 0}
                    onChange={(e) => {
                      // Update special dividend logic here
                    }}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>${calculateTotalDividends(stock).toFixed(2)}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Create a stock object in the format expected by StockDetailsDialog
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
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Footer />

      {/* Stock Analysis Dialog */}
      {selectedStock && (
        <StockAnalysisDialog
          stock={{
            symbol: selectedStock.symbol,
            longName: selectedStock.company_name,
            regularMarketPrice: selectedStock.price || 0,
            regularMarketChange: 0,
            regularMarketChangePercent: 0,
            marketCap: 0,
            regularMarketVolume: 0,
            dividendYield: selectedStock.dividend_yield,
            sector: selectedStock.sector || 'N/A',
            industry: selectedStock.industry || 'N/A'
          }}
          isOpen={isAnalysisOpen}
          setIsOpen={setIsAnalysisOpen}
        />
      )}

      {/* Stock Details Dialog */}
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
