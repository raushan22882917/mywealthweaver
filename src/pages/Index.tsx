import Navbar from "@/components/Navbar";
import StockTicker from "@/components/StockTicker";
import Features from "@/components/Features";
import TopStocks from "@/components/TopStocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import Footer from "@/components/Footer";
import { LineChart, TrendingUp, BookOpen, DollarSign, Target, Search, BarChart, PieChart, Star, Users, CheckCircle, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import TradingAnimation from "@/components/TradingAnimation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("user1");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Factor benchmarking states
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [stockOptions, setStockOptions] = useState<Array<{symbol: string, shortname: string}>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [factorData, setFactorData] = useState({
    generalEvaluation: {
      score: 0,
      performance: "Loading...",
      categories: [
        { name: "Performance", value: 0 },
        { name: "Risk", value: 0 },
        { name: "Average", value: 0 },
        { name: "Score", value: 0 }
      ]
    },
    factors: [
      { name: "Content Factors", score: 0, color: "from-red-500 to-red-600" },
      { name: "Marketing Factors", score: 0, color: "from-blue-500 to-blue-600" },
      { name: "Service Factors", score: 0, color: "from-green-500 to-green-600" }
    ]
  });
  
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

  // Fetch stock options from dividendsymbol table
  const fetchStockOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('dividendsymbol')
        .select('symbol, shortname')
        .not('symbol', 'is', null)
        .not('shortname', 'is', null)
        .order('symbol')
        .limit(100);

      if (error) throw error;
      
      const uniqueStocks = data?.filter((stock, index, self) => 
        index === self.findIndex(s => s.symbol === stock.symbol)
      ) || [];
      
      setStockOptions(uniqueStocks);
      
      // Set first stock as default if none selected
      if (uniqueStocks.length > 0 && !selectedSymbol) {
        setSelectedSymbol(uniqueStocks[0].symbol);
      }
    } catch (error) {
      console.error('Error fetching stock options:', error);
    }
  };

  // Fetch factor data for selected symbol
  const fetchFactorData = async (symbol: string) => {
    if (!symbol) return;
    
    try {
      const { data, error } = await supabase
        .from('dividendsymbol')
        .select('*')
        .eq('symbol', symbol)
        .single();

      if (error) throw error;
      
      if (data) {
        // Calculate scores based on real data
        const dividendYield = data.dividendyield || 0;
        const payoutRatio = data.payoutratio || 0;
        const currentPrice = data.currentprice || 0;
        const previousClose = data.previousclose || 0;
        
        // Calculate performance score (0-100)
        const performanceScore = Math.min(Math.max(dividendYield * 20, 0), 100);
        const riskScore = Math.min(Math.max(100 - (payoutRatio || 0), 0), 100);
        const priceChange = currentPrice && previousClose ? 
          ((currentPrice - previousClose) / previousClose) * 100 : 0;
        const averageScore = (performanceScore + riskScore) / 2;
        const totalScore = Math.round(averageScore);
        
        setFactorData({
          generalEvaluation: {
            score: totalScore,
            performance: totalScore >= 80 ? "Excellent" : totalScore >= 60 ? "Good" : totalScore >= 40 ? "Average" : "Poor",
            categories: [
              { name: "Performance", value: Math.round(performanceScore) },
              { name: "Risk", value: Math.round(riskScore) },
              { name: "Average", value: Math.round(averageScore) },
              { name: "Score", value: totalScore }
            ]
          },
          factors: [
            { name: "Dividend Factors", score: Math.round(performanceScore), color: "from-red-500 to-red-600" },
            { name: "Risk Factors", score: Math.round(riskScore), color: "from-blue-500 to-blue-600" },
            { name: "Price Factors", score: Math.min(Math.max(50 + priceChange * 2, 0), 100), color: "from-green-500 to-green-600" }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching factor data:', error);
    }
  };

  useEffect(() => {
    fetchStockOptions();
  }, []);

  useEffect(() => {
    if (selectedSymbol) {
      fetchFactorData(selectedSymbol);
    }
  }, [selectedSymbol]);

  // Filter stocks based on search term
  const filteredStocks = stockOptions.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.shortname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CircularProgress = ({ value, maxValue = 100, size = 120, strokeWidth = 8, color = "from-red-500 to-red-600" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = (value / maxValue) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="stop-color-red-500" />
              <stop offset="100%" className="stop-color-red-600" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{value}</span>
          <span className="text-xs text-gray-400">/{maxValue}</span>
        </div>
      </div>
    );
  };

  const SmallCircularProgress = ({ value, maxValue = 100, size = 80, color = "from-red-500 to-red-600" }) => {
    const radius = (size - 6) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = (value / maxValue) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-gray-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#smallGradient)"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="smallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="stop-color-current" />
              <stop offset="100%" className="stop-color-current" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">{value}</span>
          <span className="text-xs text-gray-400">%</span>
        </div>
      </div>
    );
  };

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

          {/* Split Content */}
          <div className="relative z-20 container mx-auto px-4 h-full flex flex-col lg:flex-row items-center justify-between pt-16 md:pt-24 lg:pt-32">
            {/* Left Content */}
            <div className="w-full lg:w-1/2 space-y-6 md:space-y-8 text-center lg:text-left lg:pr-10 mb-8 lg:mb-0">
              
              
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

        {/* Factor Benchmarking Analysis Section */}
        <div className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-8">
                Factor Benchmarking Analysis
              </h2>
              
              {/* Search Bar and Stock Selector */}
              <div className="mb-8">
                <div className="max-w-md mx-auto relative">
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search stocks..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        className="pl-10 bg-white/10 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      />
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* Dropdown */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {filteredStocks.length > 0 ? (
                        filteredStocks.map((stock) => (
                          <button
                            key={stock.symbol}
                            onClick={() => {
                              setSelectedSymbol(stock.symbol);
                              setSearchTerm(stock.symbol);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white border-b border-gray-700 last:border-b-0 transition-colors"
                          >
                            <div className="font-medium">{stock.symbol}</div>
                            <div className="text-sm text-gray-400">{stock.shortname}</div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-400">No stocks found</div>
                      )}
                    </div>
                  )}
                </div>
                
                {selectedSymbol && (
                  <div className="text-center mt-4">
                    <span className="text-lg font-semibold text-blue-400">
                      Selected: {selectedSymbol}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Left Side - General Evaluation */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">General Evaluation</h3>
                      <h4 className="text-lg font-semibold text-gray-300 mb-6">
                        {selectedSymbol || "Select a stock"}
                      </h4>
                    </div>
                    
                    {/* Main Circular Progress */}
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <CircularProgress value={factorData.generalEvaluation.score} />
                        <div className="text-center mt-4">
                          <span className="text-sm text-gray-400">
                            {factorData.generalEvaluation.performance}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Category List */}
                    <div className="space-y-3">
                      {factorData.generalEvaluation.categories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700/30">
                          <span className="text-gray-300 text-sm">{category.name}</span>
                          <span className="text-white font-semibold">{category.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Right Side - Factor Scores */}
                  <div className="space-y-8">
                    {factorData.factors.map((factor, index) => (
                      <div key={index} className="text-center">
                        <h4 className="text-gray-300 text-sm mb-4">{factor.name}</h4>
                        <div className="flex justify-center">
                          <div className={`text-red-500`}>
                            <SmallCircularProgress 
                              value={factor.score} 
                              color={factor.color}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
