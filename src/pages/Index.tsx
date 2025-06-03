import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StockTicker from "@/components/StockTicker";
import Features from "@/components/Features";
import TopStocks from "@/components/TopStocks";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { LineChart, TrendingUp, BookOpen, DollarSign, Target, Search, BarChart, PieChart, Star, Users, CheckCircle, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import TradingAnimation from "@/components/TradingAnimation";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("user1");
  const [realStockData, setRealStockData] = useState<any>(null);
  
  const testimonials = [
    {
      id: "user1",
      name: "Sarah Johnson",
      role: "Professional Investor",
      content: "IntelligentInvestor+ has transformed my investment strategy completely. The AI-driven insights helped me identify opportunities I would have otherwise missed.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    },
    {
      id: "user2",
      name: "Michael Chen",
      role: "Day Trader",
      content: "The dividend calendar feature alone has paid for itself many times over. I've never missed an opportunity since I started using this platform.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    },
    {
      id: "user3",
      name: "Emily Rodriguez",
      role: "Financial Advisor",
      content: "I recommend IntelligentInvestor+ to all my clients. The educational resources are exceptional, and the market analysis tools are unmatched in the industry.",
      image: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    }
  ];

  const stats = [
    { title: "Active Users", value: "250K+", icon: Users },
    { title: "Market Data Points", value: "1B+", icon: BarChart },
    { title: "Success Rate", value: "94%", icon: CheckCircle },
    { title: "Companies Tracked", value: "5,000+", icon: Target }
  ];

  // Fetch real stock data from database
  useEffect(() => {
    const fetchRealStockData = async () => {
      try {
        // Get a random stock from top stocks or dividend data
        const { data: topStock, error } = await supabase
          .from('top_stocks')
          .select('*')
          .order('Score', { ascending: false })
          .limit(1)
          .single();

        if (topStock && !error) {
          // Get company profile for the stock
          const { data: profile } = await supabase
            .from('company_profiles')
            .select('*')
            .eq('symbol', topStock.symbol)
            .single();

          // Get company logo
          const { data: logo } = await supabase
            .from('company_logos')
            .select('*')
            .eq('Symbol', topStock.symbol)
            .single();

          // Get latest dividend data
          const { data: dividend } = await supabase
            .from('dividendsymbol')
            .select('*')
            .eq('symbol', topStock.symbol)
            .single();

          setRealStockData({
            symbol: topStock.symbol,
            shortName: profile?.short_name || topStock.symbol,
            currentPrice: dividend?.currentprice || 150.00,
            changePercent: Math.random() > 0.5 ? 1.21 : -0.85,
            change: Math.random() > 0.5 ? 2.35 : -1.25,
            marketCap: profile?.total_revenue ? `$${(profile.total_revenue / 1000000000).toFixed(2)}B` : "$3.05T",
            peRatio: profile?.trailing_pe || 32.41,
            dividendYield: profile?.dividend_yield ? `${(profile.dividend_yield * 100).toFixed(2)}%` : "0.51%",
            fiftyTwoWeekLow: 124.17,
            fiftyTwoWeekHigh: 199.62,
            logoUrl: logo?.LogoURL || "/logo.png"
          });
        }
      } catch (error) {
        console.error('Error fetching real stock data:', error);
        // Fallback to AAPL data structure
        setRealStockData({
          symbol: 'AAPL',
          shortName: 'Apple Inc.',
          currentPrice: 193.89,
          changePercent: 1.21,
          change: 2.35,
          marketCap: '$3.05T',
          peRatio: 32.41,
          dividendYield: '0.51%',
          fiftyTwoWeekLow: 124.17,
          fiftyTwoWeekHigh: 199.62,
          logoUrl: '/logo.png'
        });
      }
    };

    fetchRealStockData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <Navbar />
      
      <main>
        {/* Enhanced Hero Section */}
        <Hero realStockData={realStockData} />

        {/* Features Section */}
        <div className="py-16 md:py-20 bg-gradient-to-b from-gray-800 to-gray-900">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-8 md:mb-12">
              Explore Our Features
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Stock Screening */}
              <Link to="/dividend" className="group">
                <div className="flex flex-col items-center p-6 md:p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/15 shadow-lg transition-all hover:scale-105 hover:shadow-2xl hover:border-green-500/50 cursor-pointer h-full">
                  <Search className="h-10 w-10 md:h-14 md:w-14 text-green-400 mb-4 md:mb-5" />
                  <h3 className="text-lg md:text-2xl font-semibold text-white mb-2 md:mb-3 group-hover:text-green-300 transition-colors text-center">
                    Stock Screening
                  </h3>
                  <p className="text-gray-300 text-center text-sm md:text-base">
                    Identify potential investment opportunities with real-time data.
                  </p>
                </div>
              </Link>

              {/* Market Research */}
              <Link to="/market-data" className="group">
                <div className="flex flex-col items-center p-6 md:p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/15 shadow-lg transition-all hover:scale-105 hover:shadow-2xl hover:border-blue-500/50 cursor-pointer h-full">
                  <BarChart className="h-10 w-10 md:h-14 md:w-14 text-blue-400 mb-4 md:mb-5" />
                  <h3 className="text-lg md:text-2xl font-semibold text-white mb-2 md:mb-3 group-hover:text-blue-300 transition-colors text-center">
                    Market Research
                  </h3>
                  <p className="text-gray-300 text-center text-sm md:text-base">
                    Gain deep insights into market trends and economic indicators.
                  </p>
                </div>
              </Link>

              {/* Smart Investments */}
              <Link to="/top-stocks" className="group">
                <div className="flex flex-col items-center p-6 md:p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/15 shadow-lg transition-all hover:scale-105 hover:shadow-2xl hover:border-yellow-500/50 cursor-pointer h-full">
                  <DollarSign className="h-10 w-10 md:h-14 md:w-14 text-yellow-400 mb-4 md:mb-5" />
                  <h3 className="text-lg md:text-2xl font-semibold text-white mb-2 md:mb-3 group-hover:text-yellow-300 transition-colors text-center">
                    Smart Investments
                  </h3>
                  <p className="text-gray-300 text-center text-sm md:text-base">
                    Leverage AI-driven strategies for optimal investment decisions.
                  </p>
                </div>
              </Link>

              {/* Portfolio Management */}
              <Link to="/dashboard" className="group">
                <div className="flex flex-col items-center p-6 md:p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/15 shadow-lg transition-all hover:scale-105 hover:shadow-2xl hover:border-purple-500/50 cursor-pointer h-full">
                  <PieChart className="h-10 w-10 md:h-14 md:w-14 text-purple-400 mb-4 md:mb-5" />
                  <h3 className="text-lg md:text-2xl font-semibold text-white mb-2 md:mb-3 group-hover:text-purple-300 transition-colors text-center">
                    Portfolio Management
                  </h3>
                  <p className="text-gray-300 text-center text-sm md:text-base">
                    Optimize and balance your investment portfolio efficiently.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 md:py-20 bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Trusted by Investors Worldwide
              </h2>
              <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
                Join thousands of successful investors who rely on our platform for their financial decisions
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-6 md:p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300">
                  <stat.icon className="h-8 w-8 md:h-12 md:w-12 text-blue-400 mx-auto mb-4" />
                  <div className="text-2xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-400 text-sm md:text-base">{stat.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback/Contact Section */}
        <div className="py-16 md:py-20 bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-6 md:p-8 border border-white/10">
              <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Let's Talk!</h2>
                  <p className="text-gray-300 mb-6 text-sm md:text-base">
                    Have questions about our platform or need help getting started? Our team is here to help!
                  </p>
                  <div className="bg-white/5 p-4 md:p-6 rounded-xl mb-6 border border-white/10">
                    <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Email Support</h3>
                    <p className="text-blue-400 text-sm md:text-base">support@intelligentinvestor.com</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <a href="#" className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                    </a>
                    <a href="#" className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.486 2 2 6.486 2 12c0 5.511 4.486 10 10 10s10-4.489 10-10c0-5.514-4.486-10-10-10zm3.293 14.707L12 13.414l-3.293 3.293-1.414-1.414L10.586 12 7.293 8.707l1.414-1.414L12 10.586l3.293-3.293 1.414 1.414L13.414 12l3.293 3.293-1.414 1.414z"></path></svg>
                    </a>
                    <a href="#" className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01z"></path></svg>
                    </a>
                  </div>
                </div>
                <div className="flex-1">
                  <form className="space-y-4">
                    <div>
                      <input 
                        type="text" 
                        placeholder="Your Name" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                      />
                    </div>
                    <div>
                      <input 
                        type="email" 
                        placeholder="Your Email" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                      />
                    </div>
                    <div>
                      <textarea 
                        placeholder="Your Message" 
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm md:text-base"
                      ></textarea>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium py-3 rounded-lg transition-all shadow-lg border border-white/10">
                      <MessageSquare className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
