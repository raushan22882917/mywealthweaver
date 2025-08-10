
import Navbar from "@/components/Navbar";
import StockTicker from "@/components/StockTicker";
import Features from "@/components/Features";
import TopStocks from "@/components/TopStocks";
import FactorBenchmarkingAnalysis from "@/components/FactorBenchmarkingAnalysis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import Footer from "@/components/Footer";
import { LineChart, TrendingUp, BookOpen, DollarSign, Target, Search, BarChart, PieChart, Star, Users, CheckCircle, MessageSquare, ChevronLeft, ChevronRight, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import TradingAnimation from "@/components/TradingAnimation";
import { motion, AnimatePresence } from "framer-motion";
import { fetchStockData, StockData } from "@/services/stockService";

const Index = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [featureStocks, setFeatureStocks] = useState<StockData[]>([
    {
      symbol: 'AAPL',
      longName: 'Apple Inc.',
      regularMarketPrice: 182.52,
      regularMarketChange: 1.23,
      regularMarketChangePercent: 0.68,
      marketCap: 2800000000000,
      regularMarketVolume: 58000000,
      trailingPE: 28.5,
      dividendYield: 0.0065,
      sector: 'Technology',
      industry: 'Consumer Electronics',
      exchange: 'NASDAQ'
    },
    {
      symbol: 'MSFT',
      longName: 'Microsoft Corporation',
      regularMarketPrice: 411.65,
      regularMarketChange: 2.54,
      regularMarketChangePercent: 0.62,
      marketCap: 3100000000000,
      regularMarketVolume: 22000000,
      trailingPE: 35.2,
      dividendYield: 0.0073,
      sector: 'Technology',
      industry: 'Software',
      exchange: 'NASDAQ'
    },
    {
      symbol: 'GOOGL',
      longName: 'Alphabet Inc.',
      regularMarketPrice: 142.56,
      regularMarketChange: -0.87,
      regularMarketChangePercent: -0.61,
      marketCap: 1800000000000,
      regularMarketVolume: 25000000,
      trailingPE: 25.8,
      dividendYield: 0,
      sector: 'Technology',
      industry: 'Internet Services',
      exchange: 'NASDAQ'
    },
    {
      symbol: 'TSLA',
      longName: 'Tesla, Inc.',
      regularMarketPrice: 248.42,
      regularMarketChange: 5.67,
      regularMarketChangePercent: 2.34,
      marketCap: 790000000000,
      regularMarketVolume: 85000000,
      trailingPE: 78.9,
      dividendYield: 0,
      sector: 'Consumer Discretionary',
      industry: 'Automobiles',
      exchange: 'NASDAQ'
    }
  ]);
  const [loadingStocks, setLoadingStocks] = useState(true);
  
  const testimonials = [
    {
      id: "user1",
      name: "Sarah Johnson",
      role: "Professional Investor",
      content: "globalstockinsights has transformed my investment strategy completely. The AI-driven insights helped me identify opportunities I would have otherwise missed.",
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
      content: "I recommend globalstockinsights to all my clients. The educational resources are exceptional, and the market analysis tools are unmatched in the industry.",
      image: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    }
  ];

  const stats = [
    { title: "Active Users", value: "250K+", icon: Users },
    { title: "Market Data Points", value: "1B+", icon: BarChart },
    { title: "Success Rate", value: "94%", icon: CheckCircle },
    { title: "Companies Tracked", value: "5,000+", icon: Target }
  ];

  const galleryImages = [
    "/hero/Screenshot 2025-06-12 223818.png",
    "/hero/Screenshot 2025-06-12 223750.png",
    "/hero/Screenshot 2025-06-12 223657.png"
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setDirection(1);
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, galleryImages.length]);

  // Fetch feature stocks data
  useEffect(() => {
    const fetchFeatureStocks = async () => {
      try {
        setLoadingStocks(true);
        const stockSymbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'];
        
        // Fetch stock data with better error handling
        const stocksData = await Promise.allSettled(
          stockSymbols.map(symbol => fetchStockData(symbol))
        );
        
        // Filter out failed requests and use successful ones
        const successfulStocks = stocksData
          .filter((result): result is PromiseFulfilledResult<StockData> => 
            result.status === 'fulfilled' && result.value !== null
          )
          .map(result => result.value);
        
        // If we have successful stocks, set them
        if (successfulStocks.length > 0) {
          console.log('Successfully fetched stocks:', successfulStocks);
          setFeatureStocks(successfulStocks);
        } else {
          // Fallback to mock data if all API calls fail
          console.warn('All stock API calls failed, using fallback data');
          const fallbackStocks = stockSymbols.map(symbol => ({
            symbol,
            longName: `${symbol} Corporation`,
            regularMarketPrice: 100 + Math.random() * 200,
            regularMarketChange: (Math.random() - 0.5) * 10,
            regularMarketChangePercent: (Math.random() - 0.5) * 5,
            marketCap: 100000000000 + Math.random() * 900000000000,
            regularMarketVolume: 10000000 + Math.random() * 50000000,
            trailingPE: 15 + Math.random() * 30,
            dividendYield: Math.random() * 0.05,
            sector: 'Technology',
            industry: 'Software',
            exchange: 'NASDAQ'
          }));
          console.log('Setting fallback stocks:', fallbackStocks);
          setFeatureStocks(fallbackStocks);
        }
      } catch (error) {
        console.error('Error fetching feature stocks:', error);
        // Set fallback data on error
        const fallbackStocks = ['AAPL', 'MSFT', 'GOOGL', 'TSLA'].map(symbol => ({
          symbol,
          longName: `${symbol} Corporation`,
          regularMarketPrice: 100 + Math.random() * 200,
          regularMarketChange: (Math.random() - 0.5) * 10,
          regularMarketChangePercent: (Math.random() - 0.5) * 5,
          marketCap: 100000000000 + Math.random() * 900000000000,
          regularMarketVolume: 10000000 + Math.random() * 50000000,
          trailingPE: 15 + Math.random() * 30,
          dividendYield: Math.random() * 0.05,
          sector: 'Technology',
          industry: 'Software',
          exchange: 'NASDAQ'
        }));
        console.log('Setting fallback stocks due to error:', fallbackStocks);
        setFeatureStocks(fallbackStocks);
      } finally {
        // Only set loading to false if we have stock data
        if (featureStocks.length > 0) {
          setLoadingStocks(false);
        }
      }
    };

    fetchFeatureStocks();
  }, []);

  // Debug effect to monitor stock data changes
  useEffect(() => {
    console.log('Feature stocks updated:', featureStocks);
    console.log('Loading state:', loadingStocks);
  }, [featureStocks, loadingStocks]);

  // Ensure loading state is properly managed
  useEffect(() => {
    if (featureStocks.length > 0 && loadingStocks) {
      setLoadingStocks(false);
    }
  }, [featureStocks, loadingStocks]);

  // Memoize the stock cards to prevent unnecessary re-renders
  const stockCards = useMemo(() => {
    // Always return stock cards if we have data, even if it's the initial data
    if (featureStocks.length === 0) {
      // Return initial stock cards if no data is available
      return [
        {
          symbol: 'AAPL',
          longName: 'Apple Inc.',
          regularMarketPrice: 182.52,
          regularMarketChange: 1.23,
          regularMarketChangePercent: 0.68,
          marketCap: 2800000000000,
          regularMarketVolume: 58000000,
          trailingPE: 28.5,
          dividendYield: 0.0065,
          sector: 'Technology',
          industry: 'Consumer Electronics',
          exchange: 'NASDAQ'
        },
        {
          symbol: 'MSFT',
          longName: 'Microsoft Corporation',
          regularMarketPrice: 411.65,
          regularMarketChange: 2.54,
          regularMarketChangePercent: 0.62,
          marketCap: 3100000000000,
          regularMarketVolume: 22000000,
          trailingPE: 35.2,
          dividendYield: 0.0073,
          sector: 'Technology',
          industry: 'Software',
          exchange: 'NASDAQ'
        },
        {
          symbol: 'GOOGL',
          longName: 'Alphabet Inc.',
          regularMarketPrice: 142.56,
          regularMarketChange: -0.87,
          regularMarketChangePercent: -0.61,
          marketCap: 1800000000000,
          regularMarketVolume: 25000000,
          trailingPE: 25.8,
          dividendYield: 0,
          sector: 'Technology',
          industry: 'Internet Services',
          exchange: 'NASDAQ'
        },
        {
          symbol: 'TSLA',
          longName: 'Tesla, Inc.',
          regularMarketPrice: 248.42,
          regularMarketChange: 5.67,
          regularMarketChangePercent: 2.34,
          marketCap: 790000000000,
          regularMarketVolume: 85000000,
          trailingPE: 78.9,
          dividendYield: 0,
          sector: 'Consumer Discretionary',
          industry: 'Automobiles',
          exchange: 'NASDAQ'
        }
      ].map((stock, index) => {
        const isPositive = stock.regularMarketChange >= 0;
        const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
        const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;
        
        return (
          <motion.div
            key={stock.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-3 hover:bg-white/20 transition-all duration-300 cursor-pointer">
              {/* Stock Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{stock.symbol}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-xs">{stock.symbol}</h3>
                    <p className="text-gray-300 text-xs truncate max-w-32">{stock.longName}</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 ${changeColor}`}>
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                </div>
              </div>

              {/* Price Information */}
              <div className="mb-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg font-bold text-white">
                    ${stock.regularMarketPrice?.toFixed(2) || '0.00'}
                  </span>
                  <div className={`flex items-center space-x-1 ${changeColor}`}>
                    <ChangeIcon className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      {stock.regularMarketChangePercent?.toFixed(2) || '0.00'}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-300">
                  <span>Change: ${stock.regularMarketChange?.toFixed(2) || '0.00'}</span>
                  <span>•</span>
                  <span>Vol: {(stock.regularMarketVolume / 1000000).toFixed(1)}M</span>
                </div>
              </div>

              {/* Stock Details */}
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span>Market Cap:</span>
                  <span className="text-white font-medium">
                    ${(stock.marketCap / 1000000000).toFixed(1)}B
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>P/E:</span>
                  <span className="text-white font-medium">
                    {stock.trailingPE?.toFixed(1) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Div Yield:</span>
                  <span className="text-white font-medium">
                    {stock.dividendYield ? `${(stock.dividendYield * 100).toFixed(2)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sector:</span>
                  <span className="text-white font-medium truncate max-w-16">
                    {stock.sector || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Action Links */}
              <div className="mt-1 pt-1 border-t border-white/20">
                <div className="flex justify-between text-xs">
                  <Link to={`/stock/${stock.symbol}`} className="text-blue-300 hover:text-blue-200 font-medium">
                    Details
                  </Link>
                  <Link to="/dividend" className="text-blue-300 hover:text-blue-200 font-medium">
                    Dividend
                  </Link>
                  <Link to="/education" className="text-blue-300 hover:text-blue-200 font-medium">
                    Analysis
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        );
      });
    }
    
    return featureStocks.slice(0, 4).map((stock, index) => {
      const isPositive = stock.regularMarketChange >= 0;
      const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
      const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;
      
      return (
        <motion.div
          key={stock.symbol}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-3 hover:bg-white/20 transition-all duration-300 cursor-pointer">
            {/* Stock Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{stock.symbol}</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-xs">{stock.symbol}</h3>
                  <p className="text-gray-300 text-xs truncate max-w-32">{stock.longName}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${changeColor}`}>
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              </div>
            </div>

            {/* Price Information */}
            <div className="mb-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg font-bold text-white">
                  ${stock.regularMarketPrice?.toFixed(2) || '0.00'}
                </span>
                <div className={`flex items-center space-x-1 ${changeColor}`}>
                  <ChangeIcon className="h-3 w-3" />
                  <span className="text-xs font-medium">
                    {stock.regularMarketChangePercent?.toFixed(2) || '0.00'}%
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-300">
                <span>Change: ${stock.regularMarketChange?.toFixed(2) || '0.00'}</span>
                <span>•</span>
                <span>Vol: {(stock.regularMarketVolume / 1000000).toFixed(1)}M</span>
              </div>
            </div>

            {/* Stock Details */}
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Market Cap:</span>
                <span className="text-white font-medium">
                  ${(stock.marketCap / 1000000000).toFixed(1)}B
                </span>
              </div>
              <div className="flex justify-between">
                <span>P/E:</span>
                <span className="text-white font-medium">
                  {stock.trailingPE?.toFixed(1) || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Div Yield:</span>
                <span className="text-white font-medium">
                  {stock.dividendYield ? `${(stock.dividendYield * 100).toFixed(2)}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sector:</span>
                <span className="text-white font-medium truncate max-w-16">
                  {stock.sector || 'N/A'}
                </span>
              </div>
            </div>

            {/* Action Links */}
            <div className="mt-1 pt-1 border-t border-white/20">
              <div className="flex justify-between text-xs">
                <Link to={`/stock/${stock.symbol}`} className="text-blue-300 hover:text-blue-200 font-medium">
                  Details
                </Link>
                <Link to="/dividend" className="text-blue-300 hover:text-blue-200 font-medium">
                  Dividend
                </Link>
                <Link to="/education" className="text-blue-300 hover:text-blue-200 font-medium">
                  Analysis
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      );
    });
  }, [featureStocks]);

  const nextImage = () => {
    setDirection(1);
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const previousImage = () => {
    setDirection(-1);
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

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

          {/* Hero Content */}
          <div className="relative z-20 container mx-auto px-4 pt-8 md:pt-12 lg:pt-16">
            
            {/* Top Section - Stock Cards Row */}
            <div className="mb-6">
              <div className="grid grid-cols-4 gap-6">
                {stockCards}
              </div>
            </div>

            {/* Horizontal Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-6"></div>

            {/* Bottom Section - Left and Right Content */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Left Content */}
              <div className="w-full lg:w-1/2 space-y-6 md:space-y-8 text-center lg:text-left">
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                    Globalstockinsights
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

                  <Link to="/chatinterface">
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 md:px-8 py-4 md:py-6 rounded-xl text-base md:text-lg font-semibold transition-all transform hover:scale-105 shadow-lg w-full sm:w-auto"
                    >
                      <MessageSquare className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      Chat with AI
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Content - Gallery */}
              <div className="w-full lg:w-1/2 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-1 h-[420px]">
                  <div className="relative rounded-xl overflow-hidden h-full flex items-center justify-center bg-black/20">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                      <motion.div
                        key={currentImageIndex}
                        className="absolute inset-0 flex items-center justify-center"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          x: { type: "spring", stiffness: 300, damping: 30 },
                          opacity: { duration: 0.2 }
                        }}
                      >
                        <div className="relative w-full h-full">
                          <img 
                            src={galleryImages[currentImageIndex]} 
                            alt="Gallery Image" 
                            className="w-full h-full object-contain"
                            draggable="false"
                          />
                        </div>
                      </motion.div>
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    
                    {/* Navigation Buttons */}
                    <motion.button 
                      onClick={previousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all backdrop-blur-sm border border-white/20 z-10"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </motion.button>
                    <motion.button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all backdrop-blur-sm border border-white/20 z-10"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </motion.button>

                    {/* Auto-play Toggle */}
                    <motion.button
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                      className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all backdrop-blur-sm border border-white/20 z-10"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isAutoPlaying ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </motion.button>

                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {galleryImages.map((_, index) => (
                        <motion.button
                          key={index}
                          onClick={() => {
                            setDirection(index > currentImageIndex ? 1 : -1);
                            setCurrentImageIndex(index);
                          }}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                          }`}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Factor Benchmarking Analysis Section */}

        {/* Features Section */}
        <div className="py-16 md:py-20">
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

        {/* Feedback/Contact Section */}
        <div className="py-16 md:py-20">
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
