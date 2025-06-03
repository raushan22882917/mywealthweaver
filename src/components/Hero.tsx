
import React from "react";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, TrendingUp, BarChart3, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";

interface HeroProps {
  realStockData?: any;
}

const Hero: React.FC<HeroProps> = ({ realStockData }) => {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/30 z-0" />
      
      {/* Animated particles/shapes */}
      <div className="absolute top-20 right-1/4 w-72 h-72 rounded-full bg-blue-500/10 filter blur-3xl opacity-60 animate-float" />
      <div className="absolute bottom-20 left-1/4 w-96 h-96 rounded-full bg-purple-500/10 filter blur-3xl opacity-60 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-10 w-32 h-32 rounded-full bg-green-500/10 filter blur-2xl opacity-40 animate-pulse" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-6 md:space-y-8">
            {/* Status badge */}
            <div className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 text-blue-300 animate-fade-in">
              <Zap className="w-4 h-4 mr-2 text-yellow-400" />
              AI-Powered Investment Intelligence
            </div>
            
            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight animate-fade-in stagger-1">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 bg-clip-text text-transparent">
                IntelligentInvestor+
              </span>
              <br />
              <span className="text-white mt-2 block">
                Your Financial
              </span>
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Future Starts Here
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-fade-in stagger-2">
              Transform your investment strategy with cutting-edge AI analytics, real-time market data, and expert insights. 
              Make smarter decisions, maximize returns, and build lasting wealth.
            </p>
            
            {/* Features list */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start animate-fade-in stagger-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Star className="w-4 h-4 text-yellow-400" />
                Real-time Analysis
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <TrendingUp className="w-4 h-4 text-green-400" />
                AI Predictions
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                Portfolio Optimization
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in stagger-4">
              <Link to="/dividend">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 border-none shadow-xl shadow-blue-500/25"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Start Investing Now
                </Button>
              </Link>
              <Link to="/education">
                <Button 
                  variant="outline"
                  size="lg"
                  className="bg-white/5 border-2 border-blue-400/50 text-blue-300 hover:bg-blue-400/10 hover:border-blue-400 px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 backdrop-blur-sm"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Right Content - Enhanced Stock Card */}
          <div className="relative flex justify-center lg:justify-end animate-fade-in stagger-4">
            <div className="relative max-w-md w-full">
              {/* Glowing background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl" />
              
              {/* Main stock card */}
              <div className="relative backdrop-blur-xl bg-gray-900/60 p-6 md:p-8 border border-gray-700/50 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500">
                {realStockData && (
                  <>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl mr-4 flex items-center justify-center backdrop-blur-sm">
                          <img 
                            src={realStockData.logoUrl} 
                            alt="Stock" 
                            className="w-8 h-8 object-contain rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{realStockData.symbol}</h3>
                          <p className="text-sm text-gray-400">{realStockData.shortName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-xl ${realStockData.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${realStockData.currentPrice.toFixed(2)}
                        </p>
                        <p className={`text-sm flex items-center justify-end gap-1 ${realStockData.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {realStockData.changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                          {realStockData.changePercent >= 0 ? '+' : ''}{realStockData.change.toFixed(2)} ({realStockData.changePercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                    
                    {/* Chart placeholder with gradient */}
                    <div className="h-40 w-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl mb-6 flex items-center justify-center overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
                      <img 
                        src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
                        alt="Stock Chart" 
                        className="w-full h-full object-cover opacity-60 rounded-2xl"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <TrendingUp className="w-12 h-12 text-blue-400/50" />
                      </div>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50">
                        <p className="text-gray-400 text-xs mb-1">Market Cap</p>
                        <p className="font-semibold text-white text-lg">{realStockData.marketCap}</p>
                      </div>
                      <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50">
                        <p className="text-gray-400 text-xs mb-1">P/E Ratio</p>
                        <p className="font-semibold text-white text-lg">{realStockData.peRatio}</p>
                      </div>
                      <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50">
                        <p className="text-gray-400 text-xs mb-1">Dividend Yield</p>
                        <p className="font-semibold text-white text-lg">{realStockData.dividendYield}</p>
                      </div>
                      <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50">
                        <p className="text-gray-400 text-xs mb-1">52W Range</p>
                        <p className="font-semibold text-white text-sm">
                          ${realStockData.fiftyTwoWeekLow} - ${realStockData.fiftyTwoWeekHigh}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* AI Recommendation Badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-green-500 to-blue-600 p-4 rounded-2xl shadow-xl transform rotate-3 hover:rotate-0 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-white" />
                  <div>
                    <p className="text-white font-bold text-sm">AI Signal</p>
                    <p className="text-xs text-green-100">
                      {realStockData?.changePercent >= 0 ? 'Strong Buy' : 'Hold Position'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
