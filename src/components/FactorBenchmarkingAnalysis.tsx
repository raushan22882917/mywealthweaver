
import React, { useState, useEffect } from 'react';
import { Search, Calendar, TrendingUp, Shield, DollarSign } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/DateRangePicker";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";

interface StockOption {
  symbol: string;
  shortname: string;
  currentprice?: number;
  dividendyield?: number;
  payoutratio?: number;
  previousclose?: number;
}

interface LogoData {
  Symbol: string;
  LogoURL: string;
  company_name?: string;
}

interface FactorData {
  generalEvaluation: {
    score: number;
    performance: string;
    categories: Array<{ name: string; value: number }>;
  };
  factors: Array<{
    name: string;
    score: number;
    color: string;
    icon: React.ComponentType<any>;
  }>;
}

const FactorBenchmarkingAnalysis = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [stockOptions, setStockOptions] = useState<StockOption[]>([]);
  const [logoData, setLogoData] = useState<LogoData[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [factorData, setFactorData] = useState<FactorData>({
    generalEvaluation: {
      score: 0,
      performance: "Select a stock",
      categories: [
        { name: "Performance", value: 0 },
        { name: "Risk", value: 0 },
        { name: "Stability", value: 0 },
        { name: "Overall", value: 0 }
      ]
    },
    factors: [
      { name: "Dividend Strength", score: 0, color: "from-emerald-400 to-emerald-600", icon: DollarSign },
      { name: "Risk Assessment", score: 0, color: "from-blue-400 to-blue-600", icon: Shield },
      { name: "Growth Potential", score: 0, color: "from-purple-400 to-purple-600", icon: TrendingUp }
    ]
  });

  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 30)
  });

  // Fetch stock options and logos
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stock data
        const { data: stockData, error: stockError } = await supabase
          .from('dividendsymbol')
          .select('symbol, shortname, currentprice, dividendyield, payoutratio, previousclose')
          .not('symbol', 'is', null)
          .not('shortname', 'is', null)
          .order('symbol')
          .limit(100);

        if (stockError) throw stockError;
        
        const uniqueStocks = stockData?.filter((stock, index, self) => 
          index === self.findIndex(s => s.symbol === stock.symbol)
        ) || [];
        
        setStockOptions(uniqueStocks);
        
        // Set first stock as default
        if (uniqueStocks.length > 0 && !selectedSymbol) {
          setSelectedSymbol(uniqueStocks[0].symbol);
          setSearchTerm(uniqueStocks[0].symbol);
        }

        // Fetch logo data
        const response = await fetch('/logos.csv');
        const csvText = await response.text();
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        
        const logoDataParsed = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',');
            return {
              Symbol: values[0]?.replace(/"/g, ''),
              LogoURL: values[1]?.replace(/"/g, ''),
              company_name: values[2]?.replace(/"/g, '')
            };
          });
        
        setLogoData(logoDataParsed);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Update factor data when symbol changes
  useEffect(() => {
    if (selectedSymbol) {
      const selectedStock = stockOptions.find(stock => stock.symbol === selectedSymbol);
      if (selectedStock) {
        calculateFactorData(selectedStock);
      }
    }
  }, [selectedSymbol, stockOptions]);

  const calculateFactorData = (stock: StockOption) => {
    const dividendYield = stock.dividendyield || 0;
    const payoutRatio = stock.payoutratio || 0;
    const currentPrice = stock.currentprice || 0;
    const previousClose = stock.previousclose || 0;
    
    // Calculate scores (0-100)
    const dividendScore = Math.min(Math.max(dividendYield * 15, 0), 100);
    const riskScore = Math.min(Math.max(100 - payoutRatio, 0), 100);
    const priceChange = currentPrice && previousClose ? 
      ((currentPrice - previousClose) / previousClose) * 100 : 0;
    const growthScore = Math.min(Math.max(50 + priceChange * 5, 0), 100);
    
    const overallScore = Math.round((dividendScore + riskScore + growthScore) / 3);
    const performance = overallScore >= 80 ? "Excellent" : 
                       overallScore >= 60 ? "Good" : 
                       overallScore >= 40 ? "Average" : "Poor";

    setFactorData({
      generalEvaluation: {
        score: overallScore,
        performance,
        categories: [
          { name: "Performance", value: Math.round(dividendScore) },
          { name: "Risk", value: Math.round(riskScore) },
          { name: "Stability", value: Math.round((dividendScore + riskScore) / 2) },
          { name: "Overall", value: overallScore }
        ]
      },
      factors: [
        { name: "Dividend Strength", score: Math.round(dividendScore), color: "from-emerald-400 to-emerald-600", icon: DollarSign },
        { name: "Risk Assessment", score: Math.round(riskScore), color: "from-blue-400 to-blue-600", icon: Shield },
        { name: "Growth Potential", score: Math.round(growthScore), color: "from-purple-400 to-purple-600", icon: TrendingUp }
      ]
    });
  };

  const filteredStocks = stockOptions.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.shortname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedStock = stockOptions.find(stock => stock.symbol === selectedSymbol);
  const selectedLogo = logoData.find(logo => logo.Symbol === selectedSymbol);

  const CircularProgress = ({ value, maxValue = 100, size = 140, strokeWidth = 10, color = "from-emerald-400 to-emerald-600" }) => {
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
            className="text-gray-800"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#mainGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="stop-color-emerald-400" />
              <stop offset="100%" className="stop-color-emerald-600" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{value}</span>
          <span className="text-sm text-gray-400">/{maxValue}</span>
        </div>
      </div>
    );
  };

  const SmallCircularProgress = ({ value, maxValue = 100, size = 90, color, icon: Icon }) => {
    const radius = (size - 8) / 2;
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
            strokeWidth="8"
            fill="transparent"
            className="text-gray-800"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#smallGradient)"
            strokeWidth="8"
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
          <Icon className="h-6 w-6 text-white mb-1" />
          <span className="text-lg font-bold text-white">{value}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Factor Benchmarking Analysis
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Advanced AI-driven analysis to evaluate stock performance across multiple factors
            </p>
          </div>

          {/* Search and Date Controls */}
          <Card className="bg-gray-900/60 border-gray-700/50 mb-8">
            <CardHeader>
              <CardTitle className="text-white text-xl">Analysis Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stock Search */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-300">Select Stock Symbol</label>
                  <div className="relative">
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search stocks (e.g., AAPL, MSFT)..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsDropdownOpen(true);
                          }}
                          onFocus={() => setIsDropdownOpen(true)}
                          className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    
                    {/* Dropdown */}
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        {filteredStocks.length > 0 ? (
                          filteredStocks.map((stock) => {
                            const logo = logoData.find(logo => logo.Symbol === stock.symbol);
                            return (
                              <button
                                key={stock.symbol}
                                onClick={() => {
                                  setSelectedSymbol(stock.symbol);
                                  setSearchTerm(stock.symbol);
                                  setIsDropdownOpen(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-gray-700 text-white border-b border-gray-700 last:border-b-0 transition-colors flex items-center space-x-3"
                              >
                                {logo?.LogoURL && (
                                  <img 
                                    src={logo.LogoURL} 
                                    alt={stock.symbol}
                                    className="w-8 h-8 rounded object-contain bg-white/10 p-1"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                )}
                                <div>
                                  <div className="font-semibold">{stock.symbol}</div>
                                  <div className="text-sm text-gray-400 truncate">{stock.shortname}</div>
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-4 py-3 text-gray-400">No stocks found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-300">Analysis Period</label>
                  <DateRangePicker
                    date={dateRange}
                    onDateChange={setDateRange}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-400">
                    Current Date: {format(new Date(), "PPP")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Stock Info */}
          {selectedStock && (
            <Card className="bg-gradient-to-r from-gray-900/60 to-gray-800/40 border-gray-700/50 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  {selectedLogo?.LogoURL && (
                    <img 
                      src={selectedLogo.LogoURL} 
                      alt={selectedSymbol}
                      className="w-16 h-16 rounded-lg object-contain bg-white/10 p-2"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white">{selectedSymbol}</h3>
                    <p className="text-gray-300">{selectedStock.shortname}</p>
                    <div className="flex items-center space-x-6 mt-2 text-sm">
                      <span className="text-emerald-400">
                        Price: ${selectedStock.currentprice?.toFixed(2) || 'N/A'}
                      </span>
                      <span className="text-blue-400">
                        Yield: {selectedStock.dividendyield?.toFixed(2) || 'N/A'}%
                      </span>
                      <span className="text-purple-400">
                        Payout: {selectedStock.payoutratio?.toFixed(2) || 'N/A'}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Results */}
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Main Score */}
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Overall Assessment</h3>
                    <p className="text-lg font-semibold text-gray-300 mb-6">
                      {selectedSymbol || "Select a stock"}
                    </p>
                  </div>
                  
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <CircularProgress value={factorData.generalEvaluation.score} />
                      <div className="text-center mt-4">
                        <span className="text-lg font-semibold text-emerald-400">
                          {factorData.generalEvaluation.performance}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {factorData.generalEvaluation.categories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between py-3 px-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                        <span className="text-gray-300 font-medium">{category.name}</span>
                        <span className="text-white font-bold text-lg">{category.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Factor Scores */}
                <div className="space-y-8">
                  <h3 className="text-xl font-bold text-white text-center mb-8">Detailed Analysis</h3>
                  {factorData.factors.map((factor, index) => (
                    <div key={index} className="text-center">
                      <h4 className="text-gray-300 font-medium mb-4">{factor.name}</h4>
                      <div className="flex justify-center">
                        <div className={`text-emerald-400`}>
                          <SmallCircularProgress 
                            value={factor.score} 
                            color={factor.color}
                            icon={factor.icon}
                          />
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-400">
                        Score: {factor.score}/100
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FactorBenchmarkingAnalysis;
