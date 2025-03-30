import { Search, Sun, Moon, LogOut, Home, ChevronDown, CalendarDays, DollarSign, User, LayoutDashboard, Shield } from "lucide-react";
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
  const [username, setUsername] = useState<string>("");

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
      <nav className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <a href="/" className="flex items-center space-x-2 text-xl font-bold text-primary">
              <img src="/logo.png" alt="Logo" className="h-8 w-8" />
              <span>IntelligentInvestor+</span>
            </a>

            <div className="hidden md:flex space-x-6">
              

              <a href="/news" className="relative text-gray-600 hover:text-primary px-1 py-1 rounded-full border-2 border-transparent hover:border-primary 
             before:absolute before:inset-0 before:scale-0 before:bg-[#040273]/20 before:rounded-full before:transition-transform before:duration-300 before:content-['']
             after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-[2px] after:bg-[#040273] after:transition-all after:duration-300 after:content-['']
             hover:before:scale-100 hover:after:w-full hover:after:left-0
             hover:shadow-lg hover:shadow-green-500">
                News
              </a>
              
              <a href="/education" className="relative text-gray-600 hover:text-primary px-1 py-1 rounded-full border-2 border-transparent hover:border-primary 
             before:absolute before:inset-0 before:scale-0 before:bg-[#040273]/20 before:rounded-full before:transition-transform before:duration-300 before:content-['']
             after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-[2px] after:bg-[#040273] after:transition-all after:duration-300 after:content-['']
             hover:before:scale-100 hover:after:w-full hover:after:left-0
             hover:shadow-lg hover:shadow-green-500">
                Education
              </a>
              <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-700 dark:text-gray-300 hover:text-primary px-4 py-2 rounded-lg border-2 border-transparent hover:border-primary flex items-center space-x-2 transition-all duration-300"
        aria-expanded={isOpen}
      >
        <span className="font-medium">Dividend</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 w-64 opacity-100 scale-100 translate-y-0 transition-all duration-300">
          <div className="p-1 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-xl">
            <div className="bg-white dark:bg-gray-900 rounded-lg">
              <div className="p-2 space-y-1">
                <a
                  href="/dividend?type=buy"
                  className="flex items-center px-4 py-3 space-x-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      When should I buy?
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Find the best time to invest
                    </span>
                  </div>
                </a>

                <a
                  href="/dividend?type=paid"
                  className="flex items-center px-4 py-3 space-x-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      When will I get paid?
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
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

              <a href="/reporting" className="relative text-gray-600 hover:text-primary px-1 py-1 rounded-full border-2 border-transparent hover:border-primary 
             before:absolute before:inset-0 before:scale-0 before:bg-[#040273]/20 before:rounded-full before:transition-transform before:duration-300 before:content-['']
             after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-[2px] after:bg-[#040273] after:transition-all after:duration-300 after:content-['']
             hover:before:scale-100 hover:after:w-full hover:after:left-0
             hover:shadow-lg hover:shadow-green-500">
                Reporting
              </a>


              <a
                href="/market-data"
                className="relative text-gray-600 hover:text-primary px-1 py-1 rounded-full border-2 border-transparent hover:border-primary 
               before:absolute before:inset-0 before:scale-0 before:bg-[#040273]/20 before:rounded-full before:transition-transform before:duration-300 before:content-['']
               after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-[2px] after:bg-[#040273] after:transition-all after:duration-300 after:content-['']
               hover:before:scale-100 hover:after:w-full hover:after:left-0
               hover:shadow-lg hover:shadow-green-500"
              >
                Market Data
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
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
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background w-[300px]"
                    />
                  </div>
                </form>
                
                {showSuggestions && filteredStocks.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-background border rounded-lg shadow-lg">
                    {filteredStocks.map((stock) => (
                      <div
                        key={stock.Symbol}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => handleStockSelect(stock)}
                      >
                        <div className="font-medium">{stock.Symbol}</div>
                        <div className="text-sm text-gray-500">{stock.title}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="relative">
      <button
        className="relative flex items-center text-gray-600 hover:text-primary px-3 py-2 rounded-full border-2 border-transparent hover:border-primary
          before:absolute before:inset-0 before:scale-0 before:bg-[#040273]/20 before:rounded-full before:transition-transform before:duration-300 before:content-['']
          after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-[2px] after:bg-[#040273] after:transition-all after:duration-300 after:content-['']
          hover:before:scale-100 hover:after:w-full hover:after:left-0
          hover:shadow-lg hover:shadow-green-500"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {username ? (
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span className="font-medium">{username}</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        ) : (
          <Button onClick={() => navigate("/auth")}>Log In</Button>
        )}
      </button>

      {dropdownOpen && username && (
        <div className="absolute right-0 mt-2 w-44 bg-black ml-[200px] border border-gray-600 rounded-lg shadow-xl z-50">
        <a
          href="/dashboard"
          className="flex items-center px-4 py-3 text-white hover:bg-gray-800 transition-all rounded-md space-x-3"
        >
          <LayoutDashboard className="h-5 w-5 text-gray-300" />
          <span className="text-sm">Dashboard</span>
        </a>
        <a
          href="/policy"
          className="flex items-center px-4 py-3 text-white hover:bg-gray-800 transition-all rounded-md space-x-3"
        >
          <Shield className="h-5 w-5 text-gray-300" />
          <span className="text-sm">Privacy Policy</span>
        </a>
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-4 py-3 text-white hover:bg-red-700 transition-all rounded-md space-x-3"
        >
          <LogOut className="h-5 w-5 text-gray-300" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
      
      )}
    </div>

          </div>
        </div>
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
