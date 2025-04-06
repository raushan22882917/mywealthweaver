
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Trash2, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Search, 
  Filter, 
  Bell, 
  Settings,
  ExternalLink,
  Plus,
  User,
  ChevronRight,
  CreditCard,
  Star,
  BarChart4,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ChevronDown,
  Gauge,
  LineChart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Session } from '@supabase/supabase-js';
import Papa from 'papaparse';

import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';
import { StockData } from '@/utils/types';

interface UserProfile {
  username: string;
  email: string;
  avatar_url?: string;
}

interface DashboardProps {
  session?: Session | null;
}

export default function Dashboard({ session }: DashboardProps) {
  const [savedStocks, setSavedStocks] = useState<StockData[]>([]);
  const [companyLogos, setCompanyLogos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [portfolioStats, setPortfolioStats] = useState({
    totalDividendYield: 0,
    averageDividendYield: 0,
    upcomingDividends: 0,
    totalValue: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [portfolioTrend, setPortfolioTrend] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const { theme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    checkUser();
    generateMockData();
  }, []);

  const generateMockData = () => {
    // Generate mock portfolio trend data (last 30 days)
    const mockTrend = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      value: 10000 + Math.random() * 1000 * i,
    }));
    setPortfolioTrend(mockTrend);

    // Generate mock recent activity
    const activityTypes = ['added', 'removed', 'dividend_received', 'price_alert'];
    const mockActivity = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
      symbol: ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO'][Math.floor(Math.random() * 5)],
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      amount: Math.random() * 100,
    }));
    setRecentActivity(mockActivity);
  };

  const checkUser = async () => {
    try {
      // Get current session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;

      if (!currentSession) {
        navigate('/auth');
        return;
      }

      // If we have a session, fetch the stocks
      await fetchUserStocks(currentSession.user.id);

    } catch (error) {
      console.error('Session check error:', error);
      navigate('/auth');
    }
  };

  useEffect(() => {
    const loadCompanyLogos = async () => {
      try {
        const response = await fetch('/sp500_company_logos.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            setCompanyLogos(results.data as any[]);
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
      
      const { data, error } = await supabase
        .from('saved_stocks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Calculate portfolio statistics
      if (data && data.length > 0) {
        const totalYield = data.reduce((acc, stock) => acc + (stock.dividend_yield || 0), 0);
        const avgYield = totalYield / data.length;
        const totalValue = data.reduce((acc, stock) => acc + (stock.price || 0), 0);
        
        // Count upcoming dividends (stocks with ex-dividend date in the next 30 days)
        const now = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(now.getDate() + 30);
        
        const upcomingDivs = data.filter(stock => {
          if (!stock.next_dividend_date) return false;
          const exDivDate = new Date(stock.next_dividend_date);
          return exDivDate >= now && exDivDate <= thirtyDaysLater;
        }).length;
        
        setPortfolioStats({
          totalDividendYield: totalYield,
          averageDividendYield: avgYield,
          upcomingDividends: upcomingDivs,
          totalValue: totalValue
        });
      }

      // Match logos with stocks and update the data
      const stocksWithLogos = data?.map(stock => ({
        ...stock,
        logo_url: companyLogos.find(logo => logo.Symbol === stock.symbol)?.LogoURL || '/stock.avif'
      }));

      setSavedStocks(stocksWithLogos || []);

    } catch (error) {
      console.error('Error fetching stocks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your saved stocks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter stocks based on search and favorites
  const filteredStocks = savedStocks
    .filter(stock => activeTab === 'all' || 
                    (activeTab === 'favorites' && stock.is_favorite) || 
                    (activeTab === 'dividend' && (stock.dividend_yield && stock.dividend_yield > 0)))
    .filter(stock => 
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stock.company_name && stock.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="text-gray-400 mb-4">You need to be logged in to view your dashboard</p>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User Profile Section */}
        <div className="mb-10 bg-gradient-to-r from-gray-900 via-purple-900/20 to-gray-900 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-purple-900/20">
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
                Manage your dividend portfolio and track your investments. Stay updated with your financial goals and upcoming dividends.
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

            {/* Portfolio Chart Summary */}
            <div className="ml-auto hidden lg:block w-[300px] h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={portfolioTrend.slice(-10)} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-gray-800 p-2 rounded shadow-md text-xs">
                            <p>${payload[0].value.toFixed(2)}</p>
                            <p>{payload[0].payload.date}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
              <p className="text-xs text-center text-gray-400">30-day portfolio trend</p>
            </div>
          </div>
        </div>

        {/* Dashboard Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="bg-gradient-to-br from-gray-900 to-purple-900/40 hover:shadow-lg transition-shadow duration-200 border border-purple-900/30 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                ${portfolioStats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-green-400">+2.4% this month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-pink-900/40 hover:shadow-lg transition-shadow duration-200 border border-pink-900/30 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-pink-400" />
                Average Yield
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {portfolioStats.averageDividendYield.toFixed(2)}%
              </div>
              <p className="text-sm text-green-400">+0.3% from last quarter</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-blue-900/40 hover:shadow-lg transition-shadow duration-200 border border-blue-900/30 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                Upcoming Dividends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {portfolioStats.upcomingDividends}
              </div>
              <p className="text-sm text-gray-400">Next 30 days</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-green-900/40 hover:shadow-lg transition-shadow duration-200 border border-green-900/30 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                <BarChart4 className="h-5 w-5 text-green-400" />
                Saved Stocks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {savedStocks.length}
              </div>
              <p className="text-sm text-gray-400">
                {savedStocks.filter(s => s.is_favorite).length} favorites
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stocks List */}
          <div className="lg:col-span-2">
            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search stocks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-700 bg-gray-800/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-white"
                  />
                </div>
                <Button
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white"
                  onClick={() => navigate('/market-data')}
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Add Stocks</span>
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="bg-gray-900/60 border border-gray-800 rounded-xl p-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-purple-700">
                  All Stocks
                </TabsTrigger>
                <TabsTrigger value="favorites" className="data-[state=active]:bg-purple-700">
                  Favorites
                </TabsTrigger>
                <TabsTrigger value="dividend" className="data-[state=active]:bg-purple-700">
                  Dividend Stocks
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Stocks List */}
            {filteredStocks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredStocks.map((stock) => (
                  <Card 
                    key={stock.id} 
                    className="overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-gray-800 p-2 shadow-lg border border-gray-700">
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
                            <h3 className="font-bold text-xl text-white flex items-center gap-2">
                              {stock.symbol}
                              {stock.is_favorite && <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />}
                            </h3>
                            <p className="text-sm text-gray-400 line-clamp-1">
                              {stock.company_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-gray-800"
                            onClick={async () => {
                              try {
                                const { error } = await supabase
                                  .from('saved_stocks')
                                  .update({ is_favorite: !stock.is_favorite })
                                  .eq('id', stock.id);

                                if (error) throw error;

                                setSavedStocks(stocks => 
                                  stocks.map(s => 
                                    s.id === stock.id ? { ...s, is_favorite: !s.is_favorite } : s
                                  )
                                );
                              } catch (error) {
                                console.error('Error updating favorite:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to update favorite status",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <Heart 
                              className={`w-5 h-5 ${
                                stock.is_favorite ? 'fill-pink-500 stroke-pink-500' : 'stroke-gray-400 hover:stroke-pink-400'
                              }`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-gray-800"
                            onClick={async () => {
                              try {
                                const { error } = await supabase
                                  .from('saved_stocks')
                                  .delete()
                                  .eq('id', stock.id);

                                if (error) throw error;

                                setSavedStocks(stocks => 
                                  stocks.filter(s => s.id !== stock.id)
                                );
                                toast({
                                  title: "Success",
                                  description: "Stock removed from watchlist",
                                });
                              } catch (error) {
                                console.error('Error removing stock:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to remove stock",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-400" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-gray-800/60">
                          <p className="text-xs font-medium text-gray-400 mb-1">Price</p>
                          <p className="text-lg font-bold text-white">
                            ${stock.price?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-800/60">
                          <p className="text-xs font-medium text-gray-400 mb-1">Dividend Yield</p>
                          <p className="text-lg font-bold text-green-400">
                            {stock.dividend_yield?.toFixed(2) || '0.00'}%
                          </p>
                        </div>
                      </div>

                      {stock.next_dividend_date && (
                        <div className="p-3 rounded-xl bg-blue-900/20 border border-blue-900/40 mb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-blue-400" />
                            <p className="text-xs font-medium text-blue-400">Next Dividend Date</p>
                          </div>
                          <p className="text-sm font-bold text-blue-300">
                            {new Date(stock.next_dividend_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      <Button 
                        className="w-full mt-2 bg-purple-700 hover:bg-purple-600 text-white flex items-center justify-center"
                        onClick={() => navigate(`/stock/${stock.symbol}`)}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 bg-gray-900/40 rounded-xl border border-gray-800 p-8">
                <div className="w-20 h-20 mb-6 text-gray-600">
                  {activeTab === 'favorites' ? <Heart className="w-full h-full" /> : <Search className="w-full h-full" />}
                </div>
                <p className="text-xl font-medium text-gray-400 text-center max-w-md mb-6">
                  {activeTab === 'favorites' 
                    ? 'No favorite stocks yet. Start by marking some stocks as favorites!'
                    : searchTerm 
                      ? 'No stocks found matching your search.'
                      : 'No saved stocks yet. Start by adding stocks to your watchlist!'}
                </p>
                <Button 
                  className="bg-purple-700 hover:bg-purple-600 text-white"
                  onClick={() => navigate('/market-data')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stocks
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Activity & Quick Stats */}
          <div className="space-y-6">
            {/* Next Dividends */}
            <Card className="bg-gradient-to-br from-blue-900/20 to-gray-900 border border-blue-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <span>Upcoming Dividends</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Next 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedStocks.filter(stock => stock.next_dividend_date && new Date(stock.next_dividend_date) > new Date()).length > 0 ? (
                  <div className="space-y-4">
                    {savedStocks
                      .filter(stock => stock.next_dividend_date && new Date(stock.next_dividend_date) > new Date())
                      .sort((a, b) => new Date(a.next_dividend_date!).getTime() - new Date(b.next_dividend_date!).getTime())
                      .slice(0, 3)
                      .map((stock) => (
                        <div key={stock.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/40">
                          <div className="w-10 h-10 rounded-full bg-gray-800 p-1 border border-gray-700 flex-shrink-0">
                            <img 
                              src={stock.logo_url} 
                              alt={stock.symbol} 
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/stock.avif';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{stock.symbol}</p>
                            <p className="text-xs text-gray-400 truncate">{stock.company_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-blue-400">
                              {new Date(stock.next_dividend_date!).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-400">Ex-Div Date</p>
                          </div>
                        </div>
                      ))
                    }
                    <Button 
                      variant="outline" 
                      className="w-full border-blue-800 text-blue-400 hover:bg-blue-900/20"
                      onClick={() => navigate('/dividend')}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      View All
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No upcoming dividend dates found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Portfolio Performance */}
            <Card className="bg-gradient-to-br from-purple-900/20 to-gray-900 border border-purple-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-purple-400" />
                  <span>Portfolio Performance</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full mb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={portfolioTrend} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        dot={false}
                      />
                      <XAxis dataKey="date" hide={true} />
                      <YAxis hide={true} domain={['auto', 'auto']} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-gray-800 p-2 rounded shadow-md text-xs">
                                <p className="font-medium">${payload[0].value.toFixed(2)}</p>
                                <p className="text-gray-400">{payload[0].payload.date}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Start/End Values */}
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <p className="text-gray-400">Start</p>
                    <p className="font-medium">${portfolioTrend[0]?.value.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className={`font-medium ${
                      portfolioTrend[portfolioTrend.length - 1]?.value > portfolioTrend[0]?.value
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      {portfolioTrend[portfolioTrend.length - 1]?.value > portfolioTrend[0]?.value ? '+' : ''}
                      {(((portfolioTrend[portfolioTrend.length - 1]?.value - portfolioTrend[0]?.value) / 
                         portfolioTrend[0]?.value) * 100).toFixed(2)}%
                    </p>
                    <p className="text-gray-400">Change</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400">Current</p>
                    <p className="font-medium">${portfolioTrend[portfolioTrend.length - 1]?.value.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`rounded-full p-2 ${
                        activity.type === 'added' ? 'bg-green-500/20 text-green-400' :
                        activity.type === 'removed' ? 'bg-red-500/20 text-red-400' :
                        activity.type === 'dividend_received' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {activity.type === 'added' && <Plus className="h-4 w-4" />}
                        {activity.type === 'removed' && <Trash2 className="h-4 w-4" />}
                        {activity.type === 'dividend_received' && <DollarSign className="h-4 w-4" />}
                        {activity.type === 'price_alert' && <AlertCircle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {activity.type === 'added' && `Added ${activity.symbol} to your watchlist`}
                          {activity.type === 'removed' && `Removed ${activity.symbol} from your watchlist`}
                          {activity.type === 'dividend_received' && `Dividend received for ${activity.symbol}`}
                          {activity.type === 'price_alert' && `Price alert triggered for ${activity.symbol}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(activity.date).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        {activity.type === 'dividend_received' && (
                          <span className="font-medium text-green-400">+${activity.amount.toFixed(2)}</span>
                        )}
                        {activity.type === 'price_alert' && (
                          <span className={activity.amount > 0 ? 'text-green-400' : 'text-red-400'}>
                            {activity.amount > 0 ? '+' : ''}{activity.amount.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-800 px-6 py-4">
                <Button variant="ghost" className="w-full text-sm text-gray-400 hover:text-white">
                  View All Activity
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
