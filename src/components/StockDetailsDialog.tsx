
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
  LabelList,
  Scatter,
} from "recharts";
import { useTheme } from "next-themes";
import { Star, Square, ChevronDown, ChevronUp, Calendar, DollarSign, AlertCircle, Heart } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Papa from 'papaparse';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Stock {
  cik_str: string;
  Symbol: string;
  title: string;
  LogoURL?: string;
  marketCap?: number;
  dividendYield?: number;
  "Ex-Dividend Date"?: string;
}

interface StockDetailsDialogProps {
  stock: Stock;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface CompanyProfile {
  symbol: string;
  phone?: string;
  website?: string;
  industry?: string;
  sector?: string;
  long_business_summary?: string;
  fullTimeEmployees?: string;
  auditRisk?: number;
  boardRisk?: number;
  compensationRisk?: number;
  shareHolderRightsRisk?: number;
  overallRisk?: number;
  dividendRate?: string;
  dividendYield?: string;
  exDividendDate?: string;
  payoutRatio?: string;
  fiveYearAvgDividendYield?: number;
  beta?: number;
  trailingPE?: number;
  forwardPE?: number;
  priceToSalesTrailing12Months?: number;
  fiftyDayAverage?: number;
  twoHundredDayAverage?: number;
  trailingAnnualDividendRate?: number;
  trailingAnnualDividendYield?: number;
  profitMargins?: number;
  heldPercentInsiders?: number;
  heldPercentInstitutions?: number;
  bookValue?: number;
  priceToBook?: number;
  lastFiscalYearEnd?: string;
  earningsQuarterlyGrowth?: number;
  netIncomeToCommon?: number;
  trailingEps?: number;
  forwardEps?: number;
  enterpriseToRevenue?: number;
  enterpriseToEbitda?: number;
  weekChange52?: number;
  sandP52WeekChange?: number;
  lastDividendValue?: number;
  lastDividendDate?: string;
  exchange?: string;
  quoteType?: string;
  shortName?: string;
  targetHighPrice?: number;
  targetLowPrice?: number;
  targetMeanPrice?: number;
  targetMedianPrice?: number;
  recommendationMean?: number;
  recommendationKey?: string;
  numberOfAnalystOpinions?: number;
  totalCash?: number;
  totalCashPerShare?: number;
  ebitda?: number;
  totalDebt?: number;
  quickRatio?: number;
  currentRatio?: number;
  totalRevenue?: number;
  debtToEquity?: number;
  revenuePerShare?: number;
  returnOnAssets?: number;
  returnOnEquity?: number;
  grossProfits?: number;
  freeCashflow?: number;
  operatingCashflow?: number;
  earningsGrowth?: number;
  revenueGrowth?: number;
  grossMargins?: number;
  ebitdaMargins?: number;
  operatingMargins?: number;
  trailingPegRatio?: number;
  address?: string;
}

interface DividendHistory {
  date: string;
  dividend: number;
}

interface RankingData {
  index?: string;
  industry?: string;
  sector?: string;
  Symbol?: string;
  Score?: string;
  Rank?: string;
}

interface RankingDisplayData {
  rank?: string;
  score?: string;
  industryRank?: string;
  totalStocks?: string;
  totalIndustryStocks?: string;
  industry?: string;
  sector?: string;
}

interface RankingCSVData {
  symbol?: string;
  score?: string;
  rank?: string;
  industry?: string;
  sector?: string;
}

interface SimilarStockData {
  symbol?: string;
  company?: string;
  description?: string;
  logoUrl?: string;
  revenue?: string;
}

interface LogoData {
  Symbol: string;
  LogoURL: string;
}

interface DividendData {
  symbol: string;
  date: string;
  dividends: string;
}

interface SavedStock {
  user_id: string;
  symbol: string;
  company_name: string;
  logo_url: string;
  price: number;
  dividend_yield: number;
  next_dividend_date?: string;
  is_favorite: boolean;
}

interface DividendDateData {
  id: string;
  symbol: string;
  buy_date: string | null;
  payout_date: string | null;
  created_at: string;
  updated_at: string;
}

interface DividendHistoryData {
  id: number;
  symbol: string;
  date: string;
  dividends: number;
  created_at?: string;
}

const DividendCountdown: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [timeLeft, setTimeLeft] = useState<{
    buyDays: number;
    buyHours: number;
    payoutDays: number;
    payoutHours: number;
    isBuyPassed: boolean;
    isPayoutPassed: boolean;
  }>({
    buyDays: 0,
    buyHours: 0,
    payoutDays: 0,
    payoutHours: 0,
    isBuyPassed: false,
    isPayoutPassed: false,
  });
  const [dates, setDates] = useState<{
    buyDate: string;
    payoutDate: string;
  }>({
    buyDate: '',
    payoutDate: ''
  });

  useEffect(() => {
    const fetchDates = async () => {
      try {
        // Check if the table exists first or use dividend table
        const { data, error } = await supabase
          .from('dividend')
          .select('buy_date, payoutdate')
          .eq('symbol', symbol)
          .single();

        if (error) throw error;
        setDates({
          buyDate: data.buy_date || '',
          payoutDate: data.payoutdate || ''
        });
      } catch (error) {
        console.error('Error fetching dates:', error);
      }
    };

    fetchDates();
  }, [symbol]);

  useEffect(() => {
    if (!dates.buyDate && !dates.payoutDate) return;

    const calculateTimeLeft = () => {
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
      
      // Calculate buy date countdown
      const buyExDate = new Date(dates.buyDate);
      buyExDate.setHours(16, 0, 0, 0);
      const buyDifference = buyExDate.getTime() - now.getTime();

      // Calculate payout date countdown
      const payoutExDate = new Date(dates.payoutDate);
      payoutExDate.setHours(16, 0, 0, 0);
      const payoutDifference = payoutExDate.getTime() - now.getTime();

      setTimeLeft({
        buyDays: buyDifference < 0 ? 0 : Math.floor(buyDifference / (1000 * 60 * 60 * 24)),
        buyHours: buyDifference < 0 ? 0 : Math.floor((buyDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        payoutDays: payoutDifference < 0 ? 0 : Math.floor(payoutDifference / (1000 * 60 * 60 * 24)),
        payoutHours: payoutDifference < 0 ? 0 : Math.floor((payoutDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        isBuyPassed: buyDifference < 0,
        isPayoutPassed: payoutDifference < 0
      });
    };

    const timer = setInterval(calculateTimeLeft, 1000 * 60 * 60); // Update every hour
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [dates]);

  if (!dates.buyDate && !dates.payoutDate) return null;

  return (
    <div className="grid grid-cols-1 gap-4 w-full">
      <Card className="w-full p-8 bg-gradient-to-br from-gray-900 to-blue-900 shadow-lg rounded-xl text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/airplane-bg.jpg')] opacity-10 bg-cover bg-center"></div>
        <div className="relative z-10">
          <div className="text-center">
            {!timeLeft.isBuyPassed ? (
              <div className="flex items-center justify-center gap-3 mb-8">
                <Calendar className="w-8 h-8 text-blue-400" />
                <h3 className="text-2xl font-bold text-white">Time until Buy Date</h3>
              </div>
            ) : (
              <div className="text-3xl font-bold text-red-500 animate-pulse flex items-center justify-center gap-3">
                <AlertCircle className="w-8 h-8" />
                Ex-Dividend Date Has Passed
              </div>
            )}
            
            {!timeLeft.isBuyPassed && (
              <div className="flex justify-center items-center gap-12">
                {[
                  { label: "Days", value: timeLeft.buyDays, color: "text-white" },
                  { label: "Hours", value: timeLeft.buyHours, color: timeLeft.buyDays === 0 ? "text-red-500" : "text-white" }
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center bg-black/20 px-8 py-6 rounded-xl">
                    <div className={`text-7xl font-bold ${item.color} mb-3 font-mono tracking-wider`}>
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <div className="text-xl text-blue-200 font-medium uppercase tracking-wide">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

const StockDetailsDialog = ({ stock, isOpen, setIsOpen }: StockDetailsDialogProps) => {
  const [selectedTab, setSelectedTab] = useState("Company");
  const [activeTab, setActiveTab] = useState("Company");
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [yieldData, setYieldData] = useState<any[]>([]);
  const [payoutData, setPayoutData] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("1Y");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState<'default' | 'annual' | 'quarterly'>('default');
  const [dividendHistory, setDividendHistory] = useState<DividendHistoryData[]>([]);
  const [timeRange, setTimeRange] = useState('5Y');
  const [isHidden, setIsHidden] = useState(false);
  const [similarCompanies, setSimilarCompanies] = useState<SimilarStockData[]>([]);
  const [activeDividendTab, setActiveDividendTab] = useState('quarterly');
  const [dividendHistoryData, setDividendHistoryData] = useState<DividendHistoryData[]>([]);
  const [rankingCSVData, setRankingCSVData] = useState<RankingDisplayData | null>(null);
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const { theme } = useTheme();
  const { toast } = useToast();
  const [logoURL, setLogoURL] = useState<string>('');
  const [annualDividend, setAnnualDividend] = useState<{ current: string; last: string }>({ 
    current: '0', 
    last: '0' 
  });
  const [quarterlyDividend, setQuarterlyDividend] = useState<{ current: string; last: string }>({ 
    current: '0', 
    last: '0' 
  });
  const [latestDividends, setLatestDividends] = useState<{
    annual: string | null;
    quarterly: string | null;
    annualDate: string | null;
    quarterlyDate: string | null;
  }>({
    annual: null,
    quarterly: null,
    annualDate: null,
    quarterlyDate: null
  });
  const [similarStocks, setSimilarStocks] = useState<SimilarStockData[]>([]);
  const [selectedStock, setSelectedStock] = useState<SimilarStockData | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedTab("Company");
      setActiveTab("Company");
      setTimeRange('5Y');
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      if (!stock?.Symbol) return;
      
      try {
        const { data, error } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('symbol', stock.Symbol)
          .single();

        if (error) throw error;
        
        // Transform data to match CompanyProfile interface
        const transformedData: CompanyProfile = {
          symbol: data.symbol,
          phone: data.phone,
          website: data.website,
          industry: data.industry,
          sector: data.sector,
          long_business_summary: data.long_business_summary,
          fullTimeEmployees: data.full_time_employees?.toString(),
          auditRisk: data.audit_risk,
          boardRisk: data.board_risk,
          compensationRisk: data.compensation_risk,
          shareHolderRightsRisk: data.share_holder_rights_risk,
          overallRisk: data.overall_risk,
          dividendRate: data.dividend_rate?.toString(),
          dividendYield: data.dividend_yield?.toString(),
          exDividendDate: data.ex_dividend_date,
          payoutRatio: data.payout_ratio?.toString(),
          // Add additional fields as needed
        };
        
        setCompanyProfile(transformedData);
      } catch (error) {
        console.error('Error fetching company profile:', error);
      }
    };

    fetchCompanyProfile();
  }, [stock?.Symbol]);

  useEffect(() => {
    const fetchDividendHistory = async () => {
      if (!stock?.Symbol) return;
      
      try {
        const { data, error } = await supabase
          .from(activeDividendTab === 'annual' ? 'annual_dividends' : 'quarterly_dividends')
          .select('*')
          .eq('symbol', stock.Symbol)
          .order('date', { ascending: false });

        if (error) throw error;
        
        // Transform data to the expected format in DividendHistory[]
        const transformedData = data.map((item) => ({
          date: item.date,
          dividend: item.dividends,
          dividends: item.dividends,
          id: item.id,
          symbol: item.symbol,
          created_at: item.created_at
        }));
        
        setDividendHistory(transformedData);
      } catch (error) {
        console.error('Error fetching dividend history:', error);
      }
    };

    fetchDividendHistory();
  }, [stock?.Symbol, activeDividendTab]);

  useEffect(() => {
    const fetchRankingData = async () => {
      if (!stock?.Symbol) return;
      
      try {
        const { data, error } = await supabase
          .from('stock_rankings')
          .select('*')
          .eq('symbol', stock.Symbol)
          .single();

        if (error) throw error;
        setRankingCSVData({
          rank: data.rank.toString(),
          score: data.score.toString(),
          sector: data.sector,
          industry: data.industry
        });
      } catch (error) {
        console.error('Error fetching ranking data:', error);
      }
    };

    fetchRankingData();
  }, [stock?.Symbol]);

  useEffect(() => {
    const fetchSimilarCompanies = async () => {
      if (!stock?.Symbol) return;
      
      try {
        const { data: similarData, error: similarError } = await supabase
          .from('similar_companies')
          .select('*')
          .eq('symbol', stock.Symbol);

        if (similarError) throw similarError;

        const { data: logoData, error: logoError } = await supabase
          .from('company_logos')
          .select('*');

        if (logoError) throw logoError;

        // Transform data to match SimilarStockData interface
        const combinedData: SimilarStockData[] = similarData.map(company => {
          const logo = logoData.find(logo => logo.Symbol === company.similar_symbol);
          return {
            symbol: company.similar_symbol,
            company: company.company_name || '',
            description: company.description || '',
            logoUrl: logo?.LogoURL || '',
            revenue: company.revenue_2024
          };
        });

        setSimilarCompanies(combinedData);
      } catch (error) {
        console.error('Error fetching similar companies:', error);
      }
    };

    fetchSimilarCompanies();
  }, [stock?.Symbol]);

  useEffect(() => {
    const fetchPayoutHistory = async () => {
      if (!stock?.Symbol) return;
      
      try {
        const { data, error } = await supabase
          .from('payout_history')
          .select('*')
          .eq('symbol', stock.Symbol)
          .order('date', { ascending: false });

        if (error) throw error;
        setPayoutData(data);
      } catch (error) {
        console.error('Error fetching payout history:', error);
      }
    };

    fetchPayoutHistory();
  }, [stock?.Symbol]);

  useEffect(() => {
    const fetchDividendHistoryData = async () => {
      if (!stock?.Symbol) return;
      
      try {
        const { data, error } = await supabase
          .from(activeDividendTab === 'annual' ? 'annual_dividend_history' : 'quarterly_dividend_history')
          .select('*')
          .eq('symbol', stock.Symbol)
          .order('date', { ascending: true });

        if (error) throw error;
        setDividendHistoryData(data);
      } catch (error) {
        console.error('Error fetching dividend history data:', error);
      }
    };

    fetchDividendHistoryData();
  }, [stock?.Symbol, activeDividendTab]);

  useEffect(() => {
    const fetchLogo = async () => {
      if (stock?.Symbol) {
        try {
          const { data, error } = await supabase
            .from('company_logos')
            .select('*')
            .eq('Symbol', stock.Symbol)
            .single();

          if (error) throw error;
          setLogoURL(data.LogoURL);
        } catch (error) {
          console.error('Error fetching logo:', error);
        }
      }
    };

    fetchLogo();
  }, [stock?.Symbol]);

  useEffect(() => {
    const fetchSimilarStocks = async () => {
      if (stock?.Symbol) {
        try {
          const { data: similarData, error: similarError } = await supabase
            .from('similar_companies')
            .select('*')
            .eq('symbol', stock.Symbol);

          if (similarError) throw similarError;

          const { data: logoData, error: logoError } = await supabase
            .from('company_logos')
            .select('*');

          if (logoError) throw logoError;

          // Transform to match the SimilarStockData interface
          const combinedData: SimilarStockData[] = similarData.map(company => {
            const logo = logoData.find(logo => logo.Symbol === company.similar_symbol);
            return {
              symbol: company.similar_symbol,
              company: company.company_name || '',
              description: company.description || '',
              logoUrl: logo?.LogoURL || '',
              revenue: company.revenue_2024
            };
          });

          setSimilarStocks(combinedData);
        } catch (error) {
          console.error('Error fetching similar stocks:', error);
        }
      }
    };

    fetchSimilarStocks();
  }, [stock?.Symbol]);

  const filterDataByPeriod = (period: string) => {
    const periodMap: { [key: string]: number } = {
      "1Y": 12,
      "5Y": 60,
      "10Y": 120
    };
    
    const monthsToShow = periodMap[period];
    return yieldData.slice(0, Math.ceil(monthsToShow / 3)); // Since data is quarterly
  };

  const currentYield = yieldData[0]?.value || 0;
  const previousYield = yieldData[1]?.value || 0;
  const yieldChange = ((currentYield - previousYield) / previousYield) * 100;

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!stock?.Symbol) {
      toast({
        title: "Error",
        description: "Stock symbol not found",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("stock_subscriptions")
        .insert([
          {
            email: email,
            stock_symbol: stock.Symbol,
          },
        ]);

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already subscribed",
            description: "You are already subscribed to updates for this stock",
            variant: "default",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Subscription successful",
          description: "You will receive updates about this stock",
          variant: "default",
        });
        setEmail("");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription failed",
        description: "Unable to subscribe at this time. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filterDividendHistory = (data: DividendHistoryData[], range: string) => {
    const now = new Date();
    const yearsAgo = new Date();
    
    switch (range) {
      case '1Y':
        yearsAgo.setFullYear(now.getFullYear() - 1);
        break;
      case '3Y':
        yearsAgo.setFullYear(now.getFullYear() - 3);
        break;
      case '5Y':
        yearsAgo.setFullYear(now.getFullYear() - 5);
        break;
      case '10Y':
        yearsAgo.setFullYear(now.getFullYear() - 10);
        break;
      case 'MAX':
        return data;
      default:
        yearsAgo.setFullYear(now.getFullYear() - 1);
    }

    return data.filter(item => new Date(item.date) >= yearsAgo);
  };

  // Check if stock is already saved when dialog opens
  useEffect(() => {
    if (stock?.Symbol) {
      checkIfStockIsSaved(stock.Symbol);
    }
  }, [stock]);

  const checkIfStockIsSaved = async (symbol: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_stocks')
        .select('*')
        .eq('user_id', user.id)
        .eq('symbol', symbol)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is the "not found" error
        throw error;
      }

      setIsSaved(!!data);
    } catch (error) {
      console.error('Error checking saved stock:', error);
    }
  };

  const handleSaveStock = async () => {
    if (!stock) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please login to save stocks",
          variant: "destructive",
        });
        return;
      }

      if (isSaved) {
        // Remove stock if it's already saved
        const { error } = await supabase
          .from('saved_stocks')
          .delete()
          .eq('user_id', user.id)
          .eq('symbol', stock.Symbol);

        if (error) throw error;

        setIsSaved(false);
        toast({
          title: "Success",
          description: "Stock removed from watchlist",
        });
      } else {
        // Save new stock
        const stockData: SavedStock = {
          user_id: user.id,
          symbol: stock.Symbol,
          company_name: stock.title,
          logo_url: logoURL || stock.LogoURL || '',
          price: stock.marketCap || 0,
          dividend_yield: stock.dividendYield || 0,
          next_dividend_date: stock['Ex-Dividend Date'],
          is_favorite: false
        };

        const { error } = await supabase
          .from('saved_stocks')
          .insert([stockData]);

        if (error) throw error;

        setIsSaved(true);
        toast({
          title: "Success",
          description: "Stock saved to watchlist",
        });
      }
    } catch (error) {
      console.error('Error saving stock:', error);
      toast({
        title: "Error",
        description: "Failed to save stock",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!stock) return null;

  const renderTabContent = () => {
    switch (selectedTab) {
      case "Company":
        return (
          <div className="p-4">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{stock?.title}</h2>
                
              </div>

              <div className="grid grid-cols-[250px,1fr] gap-8 transition-all duration-300" style={{ height: isHidden ? '0px' : 'auto', overflow: 'hidden' }}>
                {/* Left Column - Company Overview */}
                <div className="space-y-4">
                  
                  <h3 className="text-lg font-semibold">{stock?.Symbol} Company Profile</h3>
                  
                  <div className="space-y-2">
                    
                    
                    <div>
                      <div className="text-sm">Website</div>
                      <div className="text-sm text-blue-600 hover:underline">
                        <a href={companyProfile?.website} target="_blank" rel="noopener noreferrer">
                          {companyProfile?.website}
                        </a>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm">Address</div>
                      <div className="text-sm">{companyProfile?.address || '-'}</div>
                    </div>
                    
                  </div>
                </div>

                {/* Right Column - Company Description & Dividends */}
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 leading-relaxed">
                    {companyProfile?.long_business_summary || 'No description available.'}
                  </div>
                  
                 
                </div>
              </div>

              {/* Similar Companies Section - Always visible */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Similar Companies</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {similarStocks.map((similar, index) => (
                    <div key={index} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-2">
                        <img
                          src={similar.logoUrl || "/stock.avif"}
                          alt={similar.symbol || ""}
                          className="w-8 h-8 mr-2 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{similar.symbol}</div>
                          <div className="text-xs text-gray-500">{similar.company}</div>
                        </div>
                      </div>
                      {similar.revenue && (
                        <div className="text-xs text-gray-500 mt-1">
                          Revenue: ${similar.revenue}B
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      // Add other cases as needed
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-white dark:bg-gray-900 max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <img
              src={logoURL || "/stock.avif"}
              alt={stock.Symbol}
              className="w-10 h-10 rounded-full"
            />
            <div>
              {stock.Symbol} - {stock.title}
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Main Content */}
        <div className="flex flex-col h-full">
          {/* Email Subscription */}
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Subscribe for Updates
            </h3>
            <div className="flex gap-2 items-center">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSubscribe}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Subscribe
              </Button>
            </div>
            <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">
              Receive notifications for dividend announcements, price alerts, and more.
            </p>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b mb-4">
            {["Company", "Dividends", "Historical", "Analyst Ratings"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 ${
                  selectedTab === tab
                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                onClick={() => setSelectedTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockDetailsDialog;
