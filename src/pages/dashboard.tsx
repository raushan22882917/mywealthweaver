
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Heart, Trash2, Calendar, DollarSign, TrendingUp, Search, Filter, Settings, ChevronDown, Edit, CreditCard, User, Bell, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import Papa from 'papaparse';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  logo_url: string;
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

// Update Database type definition to include saved_stocks table
interface Database {
  public: {
    Tables: {
      saved_stocks: {
        Row: {
          id: string
          user_id: string
          symbol: string
          company_name: string
          logo_url: string
          price: number
          dividend_yield: number
          next_dividend_date?: string
          is_favorite: boolean
          created_at: string
        }
        Insert: Omit<SavedStock, 'id' | 'created_at'>
        Update: Partial<SavedStock>
      }
      profiles: {
        // ... existing profiles table definition
      }
      stock_subscriptions: {
        // ... existing stock_subscriptions table definition
      }
    }
  }
}

export default function Dashboard({ session }: DashboardProps) {
  const [savedStocks, setSavedStocks] = useState<SavedStock[]>([]);
  const [companyLogos, setCompanyLogos] = useState<CompanyLogo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { theme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

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

  // Add useEffect to load company logos from CSV
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
          .select("username")
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

  // Add useEffect to fetch profile on component mount
  useEffect(() => {
    getProfile();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      navigate('/auth');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="text-gray-500 mb-4">You need to be logged in to view your dashboard</p>
          <button
            onClick={() => navigate('/auth')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Section - Updated with better styling */}
        <div className="mb-10 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-blue-600/10 dark:from-blue-900/20 dark:via-purple-900/15 dark:to-blue-900/20 rounded-2xl p-8 shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 animate-pulse-gentle blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 p-[2px] shadow-xl">
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    {userProfile?.avatar_url ? (
                      <img 
                        src={userProfile.avatar_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {username}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Manage your stock portfolio and track dividends
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-all duration-200 rounded-xl gap-2">
                    <User size={16} />
                    <span>Profile</span>
                    <ChevronDown size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-red-500 dark:text-red-400" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                onClick={() => navigate('/reporting')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-xl"
              >
                View Reports
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Updated with better gradients and hover effects */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-4 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 transition-colors duration-300">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Stocks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{savedStocks.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-4 rounded-xl bg-red-500/10 dark:bg-red-500/20 group-hover:bg-red-500/20 dark:group-hover:bg-red-500/30 transition-colors duration-300">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Favorites</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {savedStocks.filter(s => s.is_favorite).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-4 rounded-xl bg-green-500/10 dark:bg-green-500/20 group-hover:bg-green-500/20 dark:group-hover:bg-green-500/30 transition-colors duration-300">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Yield</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(savedStocks.reduce((acc, stock) => acc + (stock.dividend_yield || 0), 0) / 
                    (savedStocks.length || 1)).toFixed(2)}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter Section - Updated with better styling */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <Button
            onClick={() => setFilterFavorites(!filterFavorites)}
            variant="outline"
            className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all duration-200 ${
              filterFavorites 
                ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30' 
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Heart className={`h-5 w-5 ${filterFavorites ? 'fill-red-500' : ''}`} />
            <span className="font-medium">Favorites</span>
          </Button>
        </div>

        {/* Stocks Grid - Updated with better card styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStocks.map((stock) => (
            <Card 
              key={stock.id} 
              className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="p-6 relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-700 p-2 shadow-sm overflow-hidden group-hover:scale-110 transition-transform duration-300">
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
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{stock.symbol}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {stock.company_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
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
                          
                          toast({
                            title: stock.is_favorite ? "Removed from favorites" : "Added to favorites",
                            description: `${stock.symbol} ${stock.is_favorite ? "removed from" : "added to"} your favorites`,
                          });
                        } catch (error) {
                          console.error('Error updating favorite:', error);
                          toast({
                            title: "Error",
                            description: "Failed to update favorite status",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <Heart 
                        className={`w-5 h-5 ${
                          stock.is_favorite ? 'fill-red-500 stroke-red-500' : 'stroke-current'
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
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
                            description: `${stock.symbol} removed from watchlist`,
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
                      className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors duration-200" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors duration-300">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Price</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      ${stock.price?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 group-hover:bg-green-50 dark:group-hover:bg-green-900/20 transition-colors duration-300">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dividend Yield</p>
                    <p className="text-lg font-bold text-green-500 group-hover:text-green-600 transition-colors duration-300">
                      {stock.dividend_yield?.toFixed(2) || '0.00'}%
                    </p>
                  </div>
                </div>

                {stock.next_dividend_date && (
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors duration-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <p className="text-sm font-medium text-blue-500">Next Dividend Date</p>
                    </div>
                    <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">
                      {new Date(stock.next_dividend_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}

          {/* Empty State - Updated with better styling */}
          {filteredStocks.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 mb-6 text-gray-300 dark:text-gray-600">
                {filterFavorites ? <Heart className="w-full h-full" /> : <Search className="w-full h-full" />}
              </div>
              <p className="text-xl font-medium text-gray-500 dark:text-gray-400 text-center max-w-md">
                {filterFavorites 
                  ? 'No favorite stocks yet. Start by marking some stocks as favorites!'
                  : searchTerm 
                    ? 'No stocks found matching your search.'
                    : 'No saved stocks yet. Start by adding stocks to your watchlist!'}
              </p>
              <Button
                onClick={() => navigate('/market-data')}
                className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl"
              >
                Browse Stocks
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
