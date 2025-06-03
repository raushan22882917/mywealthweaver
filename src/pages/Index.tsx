
import Navbar from "@/components/Navbar";
import StockTicker from "@/components/StockTicker";
import Features from "@/components/Features";
import TopStocks from "@/components/TopStocks";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { LineChart, TrendingUp, BookOpen, DollarSign, Target, Search, BarChart, PieChart, Star, Users, CheckCircle, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import TradingAnimation from "@/components/TradingAnimation";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("user1");
  
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <Navbar />
      
      <main>
        {/* Hero Section with 3D Animation */}
        <div className="relative min-h-[600px] md:min-h-[700px] overflow-hidden">
          {/* 3D Trading Animation Background */}
          <div className="absolute inset-0 z-0">
            <TradingAnimation />
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/80 to-gray-900/95 z-10"></div>

          {/* Split Content */}
          <div className="relative z-20 container mx-auto px-4 h-full flex flex-col lg:flex-row items-center justify-between pt-16 md:pt-24 lg:pt-32">
            {/* Left Content */}
            <div className="w-full lg:w-1/2 space-y-6 md:space-y-8 text-center lg:text-left lg:pr-10 mb-8 lg:mb-0">
              <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 backdrop-blur-sm rounded-full border border-blue-500/20 text-blue-300 text-sm">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
                Next-gen investment intelligence
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  IntelligentInvestor+
                </span>
                <br />
                <span className="text-white">
                  Shape Your Financial Future
                </span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Harness the power of AI-driven analytics and real-time market data to make 
                informed investment decisions that transform your portfolio performance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 md:px-8 py-4 md:py-6 rounded-xl text-base md:text-lg font-semibold transition-all transform hover:scale-105 border-none shadow-lg shadow-blue-500/20"
                >
                  <Search className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Start Investing
                </Button>
                <Link to="/education">
                  <Button 
                    variant="outline"
                    size="lg"
                    className="bg-transparent border-2 border-blue-400 text-blue-400 hover:bg-blue-400/10 px-6 md:px-8 py-4 md:py-6 rounded-xl text-base md:text-lg font-semibold transition-all transform hover:scale-105 shadow-lg w-full sm:w-auto"
                  >
                    <BookOpen className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right Content - Trading/Chart Visual */}
            <div className="w-full lg:w-1/2 relative px-4 lg:px-0">
              <div className="relative backdrop-blur-md bg-black/30 p-4 md:p-6 border border-gray-700/50 rounded-2xl shadow-2xl transform hover:rotate-0 transition-all duration-300 max-w-md mx-auto lg:max-w-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl pointer-events-none"></div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg mr-3 flex items-center justify-center">
                      <img src="/logo.png" alt="Stock" className="w-6 h-6 md:w-8 md:h-8 object-contain" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm md:text-base">AAPL</h3>
                      <p className="text-xs text-gray-400">Apple Inc.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-sm md:text-base">$193.89</p>
                    <p className="text-xs text-green-400">+2.35 (1.21%)</p>
                  </div>
                </div>
                
                <div className="h-32 md:h-48 w-full bg-gray-800/50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
                    alt="Stock Chart" 
                    className="w-full h-full object-cover opacity-70"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm">
                  <div className="bg-gray-800/70 p-2 md:p-3 rounded-lg">
                    <p className="text-gray-400">Market Cap</p>
                    <p className="font-semibold text-white">$3.05T</p>
                  </div>
                  <div className="bg-gray-800/70 p-2 md:p-3 rounded-lg">
                    <p className="text-gray-400">P/E Ratio</p>
                    <p className="font-semibold text-white">32.41</p>
                  </div>
                  <div className="bg-gray-800/70 p-2 md:p-3 rounded-lg">
                    <p className="text-gray-400">Dividend Yield</p>
                    <p className="font-semibold text-white">0.51%</p>
                  </div>
                  <div className="bg-gray-800/70 p-2 md:p-3 rounded-lg">
                    <p className="text-gray-400">52W Range</p>
                    <p className="font-semibold text-white text-xs md:text-sm">$124.17 - $199.62</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-gradient-to-br from-purple-600 to-blue-600 p-3 md:p-4 rounded-2xl shadow-lg transform -rotate-3 hover:rotate-0 transition-all duration-300">
                <p className="text-white font-bold text-xs md:text-sm">AI Recommendation</p>
                <p className="text-xs text-blue-100">Strong Buy</p>
              </div>
            </div>
          </div>
        </div>

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
