
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StockOption {
  symbol: string;
  shortname: string;
}

interface LogoData {
  Symbol: string;
  company_name: string;
  LogoURL: string;
}

interface FactorData {
  generalEvaluation: {
    score: number;
    performance: string;
    categories: Array<{
      name: string;
      value: number;
    }>;
  };
  factors: Array<{
    name: string;
    score: number;
    color: string;
  }>;
}

const FactorBenchmarkingAnalysis = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [stockOptions, setStockOptions] = useState<StockOption[]>([]);
  const [logos, setLogos] = useState<LogoData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [factorData, setFactorData] = useState<FactorData>({
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
      { name: "Dividend Factors", score: 0, color: "from-red-500 to-red-600" },
      { name: "Risk Factors", score: 0, color: "from-blue-500 to-blue-600" },
      { name: "Price Factors", score: 0, color: "from-green-500 to-green-600" }
    ]
  });

  // Fetch logos from CSV
  const fetchLogos = async () => {
    try {
      const response = await fetch('/logos.csv');
      const text = await response.text();
      const lines = text.split('\n');
      const logoData: LogoData[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',');
          logoData.push({
            Symbol: values[1]?.replace(/"/g, '') || '',
            company_name: values[2]?.replace(/"/g, '') || '',
            LogoURL: values[4]?.replace(/"/g, '') || ''
          });
        }
      }
      
      setLogos(logoData);
    } catch (error) {
      console.error('Error fetching logos:', error);
    }
  };

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
      
      if (uniqueStocks.length > 0 && !selectedSymbol) {
        setSelectedSymbol(uniqueStocks[0].symbol);
        setSearchTerm(uniqueStocks[0].symbol);
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
        const dividendYield = data.dividendyield || 0;
        const payoutRatio = data.payoutratio || 0;
        const currentPrice = data.currentprice || 0;
        const previousClose = data.previousclose || 0;
        
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
    fetchLogos();
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

  // Get logo for symbol
  const getLogoForSymbol = (symbol: string) => {
    return logos.find(logo => logo.Symbol === symbol);
  };

  const selectedLogo = getLogoForSymbol(selectedSymbol);

  const CircularProgress = ({ value, maxValue = 100, size = 120, strokeWidth = 8 }) => {
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

  const SmallCircularProgress = ({ value, maxValue = 100, size = 80 }) => {
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

  return (
    <div className="py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-8">
            Factor Benchmarking Analysis
          </h2>
          
          {/* Enhanced Search Bar */}
          <div className="mb-8">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search stocks by symbol or company name..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="pl-12 pr-4 py-3 bg-white/10 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 rounded-xl text-lg"
                  />
                </div>
                <div className="flex items-center space-x-2 text-gray-300 bg-white/10 px-4 py-3 rounded-xl border border-gray-600">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
              
              {/* Enhanced Dropdown */}
              {isDropdownOpen && (
                <div className="relative">
                  <div className="absolute top-0 left-0 right-0 bg-gray-800/95 backdrop-blur-lg border border-gray-600 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                    {filteredStocks.length > 0 ? (
                      <div className="p-2">
                        {filteredStocks.slice(0, 10).map((stock) => {
                          const logo = getLogoForSymbol(stock.symbol);
                          return (
                            <button
                              key={stock.symbol}
                              onClick={() => {
                                setSelectedSymbol(stock.symbol);
                                setSearchTerm(stock.symbol);
                                setIsDropdownOpen(false);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-700/50 rounded-lg transition-colors border-b border-gray-700/30 last:border-b-0"
                            >
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                                {logo?.LogoURL ? (
                                  <img 
                                    src={logo.LogoURL} 
                                    alt={stock.symbol}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                                    {stock.symbol.slice(0, 2)}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-white font-semibold text-lg">{stock.symbol}</div>
                                <div className="text-gray-400 text-sm truncate">
                                  {logo?.company_name || stock.shortname || 'Unknown Company'}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-400">
                        No stocks found matching "{searchTerm}"
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Selected Stock Display */}
              {selectedSymbol && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center space-x-3 bg-blue-500/20 px-6 py-3 rounded-xl border border-blue-500/30">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
                      {selectedLogo?.LogoURL ? (
                        <img 
                          src={selectedLogo.LogoURL} 
                          alt={selectedSymbol}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                          {selectedSymbol.slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-lg font-semibold text-blue-400">{selectedSymbol}</span>
                      {selectedLogo?.company_name && (
                        <div className="text-sm text-gray-300">{selectedLogo.company_name}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Analysis Results */}
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
                      <div className="text-red-500">
                        <SmallCircularProgress value={factor.score} />
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
  );
};

export default FactorBenchmarkingAnalysis;
