
import { Search, Sun, Moon, LogOut, Home, ChevronDown, CalendarDays, DollarSign, User, LayoutDashboard, Shield, Bell, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import StockDetailsDialog from "./StockDetailsDialog";

interface Stock {
  cik_str: string;
  Symbol: string;
  title: string;
}

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [stockData, setStockData] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    // Load and parse the CSV file
    fetch('/tickers.csv')
      .then(response => response.text())
      .then(csvText => {
        const lines = csvText.split('\n');
        const headers = lines[0].split('|');
        const data = lines.slice(1).map(line => {
          const values = line.split('|');
          return {
            cik_str: values[0],
            Symbol: values[1],
            title: values[2]
          };
        }).filter(stock => stock.Symbol && stock.title);
        setStockData(data);
      })
      .catch(error => console.error('Error loading stock data:', error));

    // Check if user is logged in
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername || "");
  }, []);

  useEffect(() => {
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

    getProfile();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim()) {
      const searchTermLower = value.toLowerCase();
      const filtered = stockData.filter(stock => 
        stock.Symbol.toLowerCase().includes(searchTermLower) ||
        stock.title.toLowerCase().includes(searchTermLower)
      );
      setFilteredStocks(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setFilteredStocks([]);
      setShowSuggestions(false);
    }
  };

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    setSearchTerm(stock.Symbol);
    setShowSuggestions(false);
    setDialogOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      const stock = stockData.find(s => s.Symbol.toLowerCase() === searchTerm.toLowerCase());
      if (stock) {
        setSelectedStock(stock);
        setDialogOpen(true);
      } else {
        toast({
          title: "Stock not found",
          description: "Please select a stock from the suggestions",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <>
      <nav className="border-b border-white/10 backdrop-blur-md bg-black/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-8">
            <a href="/" className="flex items-center space-x-2 text-xl font-bold text-primary">
              <img src="/logo.png" alt="Logo" className="h-8 w-8" />
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">IntelligentInvestor+</span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-1">
              <a href="/news" className="nav-item">
                News
              </a>
              
              <a href="/education" className="nav-item">
                Education
              </a>
              
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="nav-item flex items-center"
                  aria-expanded={isOpen}
                >
                  <span>Dividend</span>
                  <ChevronDown
                    className={`ml-1 w-4 h-4 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 w-64 opacity-100 scale-100 translate-y-0 transition-all duration-300">
                    <div className="p-1 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-xl">
                      <div className="bg-gray-900 rounded-lg">
                        <div className="p-2 space-y-1">
                          <a
                            href="/dividend?type=buy"
                            className="flex items-center px-4 py-3 space-x-3 rounded-lg hover:bg-gray-800 transition-colors group"
                          >
                            <div className="p-2 rounded-full bg-purple-900/30 text-purple-400 group-hover:bg-purple-900/50 transition-colors">
                              <CalendarDays className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-100">
                                When should I buy?
                              </span>
                              <span className="text-xs text-gray-400">
                                Find the best time to invest
                              </span>
                            </div>
                          </a>

                          <a
                            href="/dividend?type=paid"
                            className="flex items-center px-4 py-3 space-x-3 rounded-lg hover:bg-gray-800 transition-colors group"
                          >
                            <div className="p-2 rounded-full bg-blue-900/30 text-blue-400 group-hover:bg-blue-900/50 transition-colors">
                              <DollarSign className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-100">
                                When will I get paid?
                              </span>
                              <span className="text-xs text-gray-400">
                                Track your dividend payments
                              </span>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <a href="/reporting" className="nav-item">
                Reporting
              </a>

              <a href="/market-data" className="nav-item">
                Market Data
              </a>
            </div>
          </div>
          
          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Search */}
  {/* Search */}
  <div className="flex items-center gap-4">
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800/50 w-[220px] md:w-[300px] placeholder-gray-500 text-sm"
          />
        </div>
      </form>
      
      {showSuggestions && filteredStocks.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
          {filteredStocks.filter(stock => 
            stock.Symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stock.title.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((stock) => (
            <div
              key={stock.Symbol}
              className="px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0"
              onClick={() => handleStockSelect(stock)}
            >
              <div className="font-medium text-white">{stock.Symbol}</div>
              <div className="text-sm text-gray-400 truncate">{stock.title}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>

            
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-blue-400" />
              )}
            </button>
            
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors relative"
              >
                <Bell className="h-5 w-5 text-gray-300" />
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">3</span>
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-medium text-white">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="p-4 border-b border-gray-700 hover:bg-gray-700 cursor-pointer">
                      <p className="text-blue-400 text-sm font-medium">Dividend Alert</p>
                      <p className="text-gray-300 text-sm">AAPL is paying a dividend soon!</p>
                      <p className="text-gray-500 text-xs mt-1">2 hours ago</p>
                    </div>
                    <div className="p-4 border-b border-gray-700 hover:bg-gray-700 cursor-pointer">
                      <p className="text-green-400 text-sm font-medium">Price Alert</p>
                      <p className="text-gray-300 text-sm">MSFT has increased by 5%</p>
                      <p className="text-gray-500 text-xs mt-1">5 hours ago</p>
                    </div>
                    <div className="p-4 hover:bg-gray-700 cursor-pointer">
                      <p className="text-yellow-400 text-sm font-medium">News Alert</p>
                      <p className="text-gray-300 text-sm">New market analysis available</p>
                      <p className="text-gray-500 text-xs mt-1">1 day ago</p>
                    </div>
                  </div>
                  <div className="p-2 flex justify-center border-t border-gray-700">
                    <button className="w-full text-center text-blue-400 text-sm hover:underline">View all notifications</button>
                  </div>
                </div>
              )}
            </div>
            
            {/* User Menu */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 transition-all"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {username ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {username.charAt(0).toUpperCase()}
                      </div>
                      <div className="hidden md:block">
                        <p className="text-sm font-medium text-white">{username}</p>
                        <p className="text-xs text-gray-400">Premium User</p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </>
                ) : (
                  <Button onClick={() => navigate("/auth")} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Log In
                  </Button>
                )}
              </button>

              {dropdownOpen && username && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                  <div className="p-4 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">{username}</p>
                    <p className="text-xs text-gray-400">Premium Member</p>
                  </div>
                  
                  <div className="py-2">
                    <a
                      href="/dashboard"
                      className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 transition-all space-x-3"
                    >
                      <LayoutDashboard className="h-5 w-5 text-blue-400" />
                      <span className="text-sm">Dashboard</span>
                    </a>
                    
                    <a
                      href="/settings"
                      className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 transition-all space-x-3"
                    >
                      <Settings className="h-5 w-5 text-gray-400" />
                      <span className="text-sm">Settings</span>
                    </a>
                    
                    <a
                      href="/help"
                      className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 transition-all space-x-3"
                    >
                      <HelpCircle className="h-5 w-5 text-gray-400" />
                      <span className="text-sm">Help & Support</span>
                    </a>
                    
                    <a
                      href="/policy"
                      className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 transition-all space-x-3"
                    >
                      <Shield className="h-5 w-5 text-gray-400" />
                      <span className="text-sm">Privacy Policy</span>
                    </a>
                    
                    <div className="border-t border-gray-700 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-3 text-red-400 hover:bg-red-900/30 transition-all space-x-3"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 rounded-lg border border-gray-700 hover:bg-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800 shadow-xl">
            <div className="px-4 py-2 space-y-1">
              <a href="/news" className="block py-3 px-4 text-gray-300 hover:bg-gray-800 rounded-lg">
                News
              </a>
              <a href="/education" className="block py-3 px-4 text-gray-300 hover:bg-gray-800 rounded-lg">
                Education
              </a>
              <a href="/dividend" className="block py-3 px-4 text-gray-300 hover:bg-gray-800 rounded-lg">
                Dividend
              </a>
              <a href="/reporting" className="block py-3 px-4 text-gray-300 hover:bg-gray-800 rounded-lg">
                Reporting
              </a>
              <a href="/market-data" className="block py-3 px-4 text-gray-300 hover:bg-gray-800 rounded-lg">
                Market Data
              </a>
            </div>
          </div>
        )}
      </nav>

      {selectedStock && (
        <StockDetailsDialog
          stock={selectedStock}
          isOpen={dialogOpen}
          setIsOpen={setDialogOpen}
        />
      )}
    </>
  );
};

export default Navbar;

