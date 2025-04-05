
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Heart,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  Search,
  Bell,
  Settings,
  ExternalLink,
  Plus
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import Papa from 'papaparse';

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
}

interface UserProfile {
  username: string;
  email: string;
  avatar_url?: string;
}

interface DashboardProps {
  session?: Session | null;
}

export default function Dashboard({ session }: DashboardProps) {
  const [savedStocks, setSavedStocks] = useState<SavedStock[]>([]);
  const [companyLogos, setCompanyLogos] = useState<CompanyLogo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { theme: _ } = useTheme(); // Unused but kept for future use
  const { toast } = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");

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
        const response = await fetch('/sp500_company_logos.csv');
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
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

      const { data, error } = await supabase
        .from('saved_stocks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Match logos with stocks and update the data
      const stocksWithLogos = data?.map(stock => ({
        ...stock,
        LogoURL: companyLogos.find(logo => logo.Symbol === stock.symbol)?.LogoURL || '/stock.avif'
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
                <p className="text-sm font-medium text-gray-400">Favorites</p>
                <p className="text-2xl font-bold text-white">
                  {savedStocks.filter(s => s.is_favorite).length}
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

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all duration-200 ${
              filterFavorites
                ? 'bg-pink-900/30 border-pink-700 text-pink-400 hover:bg-pink-900/40'
                : 'border-gray-700 hover:bg-gray-800 text-gray-300'
            }`}
          >
            <Heart className={`h-5 w-5 ${filterFavorites ? 'fill-pink-500 text-pink-500' : ''}`} />
            <span className="font-medium">Favorites</span>
          </Button>
          <Button
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-700 hover:bg-gray-800 text-gray-300"
            onClick={() => navigate('/market-data')}
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Add Stocks</span>
          </Button>
        </div>

        {/* Stocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStocks.length > 0 ? (
            filteredStocks.map((stock) => (
              <Card
                key={stock.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-900/20"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gray-800 p-2 shadow-lg border border-gray-700">
                        <img
                          src={stock.LogoURL}
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
                          <Badge className="ml-2 bg-purple-900/60 text-purple-300 hover:bg-purple-800">
                            Stock
                          </Badge>
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
                    <div className="p-4 rounded-xl bg-gray-800/60">
                      <p className="text-sm font-medium text-gray-400 mb-1">Price</p>
                      <p className="text-lg font-bold text-white">
                        ${stock.price?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-800/60">
                      <p className="text-sm font-medium text-gray-400 mb-1">Dividend Yield</p>
                      <p className="text-lg font-bold text-green-400">
                        {stock.dividend_yield?.toFixed(2) || '0.00'}%
                      </p>
                    </div>
                  </div>

                  {stock.next_dividend_date && (
                    <div className="p-4 rounded-xl bg-blue-900/20 border border-blue-900/40">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <p className="text-sm font-medium text-blue-400">Next Dividend Date</p>
                      </div>
                      <p className="mt-1 text-lg font-bold text-blue-300">
                        {new Date(stock.next_dividend_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full mt-4 bg-purple-700 hover:bg-purple-600 text-white"
                    onClick={() => navigate(`/stock/${stock.symbol}`)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-gray-900/40 rounded-xl border border-gray-800 p-8">
              <div className="w-20 h-20 mb-6 text-gray-600">
                {filterFavorites ? <Heart className="w-full h-full" /> : <Search className="w-full h-full" />}
              </div>
              <p className="text-xl font-medium text-gray-400 text-center max-w-md mb-6">
                {filterFavorites
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
      </div>
      <Footer />
    </div>
  );
}
