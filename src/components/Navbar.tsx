import { Search, Sun, Moon, LogOut, Home, ChevronDown, CalendarDays, DollarSign, User, LayoutDashboard, Shield, Bell, Settings, HelpCircle, Menu, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import StockDetailsDialog from "./StockDetailsDialog";
import NavbarNotificationSection from './NavbarNotificationSection';

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
  const [insightDropdownOpen, setInsightDropdownOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

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

    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUsername(profile.username);
          setAvatarUrl(profile.avatar_url || "");
        } else {
          // Create profile if it doesn't exist
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([{ 
              id: session.user.id, 
              username: session.user.email?.split('@')[0] 
            }]);

          if (!insertError) {
            setUsername(session.user.email?.split('@')[0] || "");
          }
        }
      }
    };

    checkAuth();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim()) {
      const searchTermLower = value.toLowerCase();
      
      // First try to find matches in symbols only
      let filtered = stockData.filter(stock => 
        stock.Symbol.toLowerCase().includes(searchTermLower)
      );

      // If no symbol matches found, then search in titles
      if (filtered.length === 0) {
        filtered = stockData.filter(stock => 
          stock.title.toLowerCase().includes(searchTermLower)
        );
      }

      // Sort based on number of characters matched
      filtered.sort((a, b) => {
        const aSymbol = a.Symbol.toLowerCase();
        const bSymbol = b.Symbol.toLowerCase();
        const searchTerm = value.toLowerCase();

        // Count occurrences of search term in symbols
        const aCount = (aSymbol.match(new RegExp(searchTerm, 'g')) || []).length;
        const bCount = (bSymbol.match(new RegExp(searchTerm, 'g')) || []).length;

        // If counts are different, prioritize fewer occurrences
        if (aCount !== bCount) {
          return aCount - bCount;
        }

        // If same number of occurrences, prioritize by position
        const aIndex = aSymbol.indexOf(searchTerm);
        const bIndex = bSymbol.indexOf(searchTerm);
        if (aIndex !== bIndex) {
          return aIndex - bIndex;
        }

        return aSymbol.localeCompare(bSymbol);
      });

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

  const highlightMatchedText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <span key={index} className="bg-blue-500/30 text-blue-200">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <>
      <nav className="border-b border-white/10 backdrop-blur-md bg-black/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2 md:space-x-8">
            <a href="/" className="flex items-center space-x-2 text-lg md:text-xl font-bold text-primary">
              <img src="/logo.png" alt="Logo" className="h-6 w-6 md:h-8 md:w-8" />
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent hidden sm:inline">
                globalstockinsights
              </span>
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent sm:hidden">
                II+
              </span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-1">
              <a href="/news" className="nav-item text-sm">
                News
              </a>
              
              <a href="/education" className="nav-item text-sm">
                Education
              </a>
              
              <a href="/announcements" className="nav-item text-sm">
                Announcements
              </a>
              
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="nav-item flex items-center text-sm"
                  aria-expanded={isOpen}
                >
                  <span>Dividend</span>
                  <ChevronDown
                    className={`ml-1 w-3 h-3 transition-transform duration-300 ${
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

              <a href="/reporting" className="nav-item text-sm">
                Reporting
              </a>

              <a href="/top-stocks" className="nav-item text-sm">
                Top Stocks
              </a>

              <div className="relative">
                <button
                  onClick={() => setInsightDropdownOpen(!insightDropdownOpen)}
                  className="nav-item flex items-center text-sm"
                  aria-expanded={insightDropdownOpen}
                >
                  <span>Insight</span>
                  <ChevronDown
                    className={`ml-1 w-3 h-3 transition-transform duration-300 ${
                      insightDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {insightDropdownOpen && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 w-64 opacity-100 scale-100 translate-y-0 transition-all duration-300">
                    <div className="p-1 rounded-xl bg-gradient-to-br from-green-600 to-blue-600 shadow-xl">
                      <div className="bg-gray-900 rounded-lg">
                        <div className="p-2 space-y-1">
                          <a
                            href="/comparison"
                            className="flex items-center px-4 py-3 space-x-3 rounded-lg hover:bg-gray-800 transition-colors group"
                          >
                            <div className="p-2 rounded-full bg-green-900/30 text-green-400 group-hover:bg-green-900/50 transition-colors">
                              <LayoutDashboard className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-100">
                                Comparison
                              </span>
                              <span className="text-xs text-gray-400">
                                Compare stocks side by side
                              </span>
                            </div>
                          </a>

                          <a
                            href="/chatinterface"
                            className="flex items-center px-4 py-3 space-x-3 rounded-lg hover:bg-gray-800 transition-colors group"
                          >
                            <div className="p-2 rounded-full bg-blue-900/30 text-blue-400 group-hover:bg-blue-900/50 transition-colors">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-100">
                                Analysis with AI
                              </span>
                              <span className="text-xs text-gray-400">
                                Get AI-powered insights
                              </span>
                            </div>
                          </a>

                          {/* <a
                            href="/dividend-frequency"
                            className="flex items-center px-4 py-3 space-x-3 rounded-lg hover:bg-gray-800 transition-colors group"
                          >
                            <div className="p-2 rounded-full bg-green-900/30 text-green-400 group-hover:bg-green-900/50 transition-colors">
                              <CalendarDays className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-100">
                                Dividend Frequency
                              </span>
                              <span className="text-xs text-gray-400">
                                Analyze payment schedules
                              </span>
                            </div>
                          </a> */}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              
            </div>
          </div>
          
          {/* Right section */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Search - Hidden on small screens, shown on medium+ */}
            <div className="hidden md:block">
              <div ref={searchRef} className="relative">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search stocks..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="pl-10 pr-4 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800/50 w-[180px] lg:w-[250px] placeholder-gray-500 text-sm"
                    />
                  </div>
                </form>
                
                {showSuggestions && filteredStocks.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                    {filteredStocks
                      .sort((a, b) => {
                        const termLower = searchTerm.toLowerCase();
                        const aSymbolLower = a.Symbol.toLowerCase();
                        const bSymbolLower = b.Symbol.toLowerCase();
                        
                        // Priority 1: Single character matches
                        const aHasSingleChar = aSymbolLower.split('').filter(char => char === termLower).length === 1;
                        const bHasSingleChar = bSymbolLower.split('').filter(char => char === termLower).length === 1;
                        if (aHasSingleChar && !bHasSingleChar) return -1;
                        if (!aHasSingleChar && bHasSingleChar) return 1;

                        // Priority 2: Position of first occurrence
                        const aIndex = aSymbolLower.indexOf(termLower);
                        const bIndex = bSymbolLower.indexOf(termLower);
                        if (aIndex !== bIndex) return aIndex - bIndex;

                        // Priority 3: Length of symbol (shorter symbols first)
                        if (aSymbolLower.length !== bSymbolLower.length) {
                          return aSymbolLower.length - bSymbolLower.length;
                        }

                        // Priority 4: Alphabetical order
                        return aSymbolLower.localeCompare(bSymbolLower);
                      })
                      .map((stock) => (
                        <div
                          key={stock.Symbol}
                          className="px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0"
                          onClick={() => handleStockSelect(stock)}
                        >
                          <div className="font-medium text-white">
                            {highlightMatchedText(stock.Symbol, searchTerm)}
                          </div>
                          <div className="text-sm text-gray-400 truncate">
                            {highlightMatchedText(stock.title, searchTerm)}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
            
           
            
            {/* Notifications - Only show when authenticated */}
            {isAuthenticated && (
              <div className="hidden sm:block">
                <NavbarNotificationSection />
              </div>
            )}
            
            {/* Login/User Menu */}
            {isAuthenticated ? (
              <div className="relative ml-3 hidden md:block">
                <div>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 px-2 md:px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-all"
                  >
                    <div className="flex items-center">
                      <div className="h-6 w-6 md:h-8 md:w-8 rounded-full overflow-hidden bg-gray-700 border border-gray-600">
                        {avatarUrl ? (
                          <img 
                            src={avatarUrl} 
                            alt={username} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${username}&background=random`;
                            }}
                          />
                        ) : (
                          <User className="h-3 w-3 md:h-5 md:w-5 m-1.5 text-gray-400" />
                        )}
                      </div>
                      <ChevronDown className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                    </div>
                  </button>
                </div>

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
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                className="hidden md:flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Login</span>
              </Button>
            )}
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 rounded-lg border border-gray-700 hover:bg-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-white" />
              ) : (
                <Menu className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800 shadow-xl">
            {/* Mobile Search */}
            <div className="px-4 py-3 border-b border-gray-800">
              <div ref={searchRef} className="relative">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search stocks..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="pl-10 pr-4 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800/50 w-full placeholder-gray-500 text-sm"
                    />
                  </div>
                </form>
                
                {showSuggestions && filteredStocks.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                    {filteredStocks.map((stock) => (
                      <div
                        key={stock.Symbol}
                        className="px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0"
                        onClick={() => {
                          handleStockSelect(stock);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <div className="font-medium text-white">
                          {highlightMatchedText(stock.Symbol, searchTerm)}
                        </div>
                        <div className="text-sm text-gray-400 truncate">
                          {highlightMatchedText(stock.title, searchTerm)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="px-4 py-2 space-y-1">
              <a href="/news" className="block py-3 px-4 text-gray-300 hover:bg-gray-800 rounded-lg">
                News
              </a>
              <a href="/education" className="block py-3 px-4 text-gray-300 hover:bg-gray-800 rounded-lg">
                Education
              </a>
              <a href="/announcements" className="block py-3 px-4 text-gray-300 hover:bg-gray-800 rounded-lg">
                Announcements
              </a>
              <a href="/dividend" className="block py-3 px-4 text-gray-300 hover:bg-gray-800 rounded-lg">
                Dividend
              </a>
              {/* <a href="/dividend-frequency" className="block py-3 px-4 text-gray-300 hover:bg-gray-800 rounded-lg">
                Dividend Frequency
              </a> */}
              <a href="/reporting" className="block py-3 px-4 text-gray-300 hover:bg-gray-800 rounded-lg">
                Reporting
              </a>
              <a href="/top-stocks" className="block py-3 px-4 text-gray-300 hover:bg-gray-800 rounded-lg">
                Top Stocks
              </a>
              <a href="/comparison" className="block py-3 px-4 text-gray-300 hover:bg-gray-800 rounded-lg flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Comparison
              </a>
              <a href="/chatinterface" className="block py-3 px-4 text-gray-300 hover:bg-gray-800 rounded-lg flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Analysis stock pdf AI
              </a>
              <a href="/chatinterface" className="block py-3 px-4 text-gray-300 hover:bg-gray-800 rounded-lg flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </a>
              
              {/* Mobile Login/User Section */}
              {isAuthenticated ? (
                <>
                  <div className="border-t border-gray-800 pt-2 mt-2">
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium text-white">{username}</p>
                      <p className="text-xs text-gray-400">Premium Member</p>
                    </div>
                    <a href="/dashboard" className="block py-3 px-4 text-gray-300 hover:bg-gray-800 rounded-lg">
                      Dashboard
                    </a>
                    <a href="/settings" className="block py-3 px-4 text-gray-300 hover:bg-gray-800 rounded-lg">
                      Settings
                    </a>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left py-3 px-4 text-red-400 hover:bg-red-900/30 rounded-lg"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Button
                  onClick={() => {
                    navigate("/auth");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mt-2"
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              )}
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
