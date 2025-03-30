
import Navbar from "@/components/Navbar";
import StockTicker from "@/components/StockTicker";
import Features from "@/components/Features";
import TopStocks from "@/components/TopStocks";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { LineChart, TrendingUp, BookOpen, DollarSign, Target, Search,BarChart ,PieChart} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <Navbar />
      <StockTicker />
      
      <main>
        {/* Hero Section */}
        <div className="relative h-[500px] overflow-hidden">
          {/* Background Video with Overlay */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute top-0 left-0 w-full h-full object-cover"
          >
            <source src="/video1.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Gradient Overlay */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900/90 via-gray-900/70 to-gray-900/90"></div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 max-w-6xl mx-auto">
            <div className="animate-fade-in">
              <div className="flex items-center justify-center mb-6">
                <TrendingUp className="h-12 w-12 text-green-400 mr-4" />
                <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                  IntelligentInvestor+
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Harness the power of AI-driven analytics and real-time market data to make 
                informed investment decisions that shape your financial future.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  <Search className="h-5 w-5" />
                  Start Investing
                </Button>
                <a href="/education">
                <Button 
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-2 border-blue-400 text-blue-400 hover:bg-blue-400/10 px-8 py-6 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  <BookOpen className="h-5 w-5" />
                  Learn More
                </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-extrabold text-white text-center mb-12">
          Explore Our Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Stock Screening */}
          <Link to="/dividend" className="group">
            <div className="flex flex-col items-center p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/15 shadow-lg transition-all hover:scale-105 hover:shadow-2xl cursor-pointer">
              <Search className="h-14 w-14 text-green-400 mb-5" />
              <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-green-300 transition-colors">
                Stock Screening
              </h3>
              <p className="text-gray-300 text-center">
                Identify potential investment opportunities with real-time data.
              </p>
            </div>
          </Link>

          {/* Market Research */}
          <Link to="/market-data" className="group">
            <div className="flex flex-col items-center p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/15 shadow-lg transition-all hover:scale-105 hover:shadow-2xl cursor-pointer">
              <BarChart className="h-14 w-14 text-blue-400 mb-5" />
              <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors">
                Market Research
              </h3>
              <p className="text-gray-300 text-center">
                Gain deep insights into market trends and economic indicators.
              </p>
            </div>
          </Link>

          {/* Smart Investments */}
          <Link to="/top-stocks" className="group">
            <div className="flex flex-col items-center p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/15 shadow-lg transition-all hover:scale-105 hover:shadow-2xl cursor-pointer">
              <DollarSign className="h-14 w-14 text-yellow-400 mb-5" />
              <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-yellow-300 transition-colors">
                Smart Investments
              </h3>
              <p className="text-gray-300 text-center">
                Leverage AI-driven strategies for optimal investment decisions.
              </p>
            </div>
          </Link>

          {/* Portfolio Management */}
          <Link to="/dashboard" className="group">
            <div className="flex flex-col items-center p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/15 shadow-lg transition-all hover:scale-105 hover:shadow-2xl cursor-pointer">
              <PieChart className="h-14 w-14 text-purple-400 mb-5" />
              <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">
                Portfolio Management
              </h3>
              <p className="text-gray-300 text-center">
                Optimize and balance your investment portfolio efficiently.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>

        

        {/* Top Stocks Section */}
        
      </main>

      {/* Footer with gradient border */}
     <Footer />
    </div>
  );
};

export default Index;
