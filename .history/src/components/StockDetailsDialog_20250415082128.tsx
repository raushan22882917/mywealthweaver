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
import { Switch } from "@/components/ui/switch";

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
import { Star, Square, ChevronDown, ChevronUp, Calendar, DollarSign, AlertCircle, AlertTriangle, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Papa, { ParseResult } from 'papaparse';
import { filterDividendData, type DividendHistoryData } from '@/utils/dividend';
import UpDown from "@/pages/UpDown";
import DividendYield from "@/pages/DividendYield";

interface Stock {
  cik_str: string;
  Symbol: string;
  title: string;
  LogoURL?: string;
  marketCap?: number;
  dividendyield?: number;
}

interface StockDetailsDialogProps {
  stock: Stock;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface CompanyProfile {
  symbol: string;
  phone: string;
  website: string;
  industry: string;
  sector: string;
  long_business_summary: string;
  fullTimeEmployees: string;
  auditRisk: number;
  boardRisk: number;
  compensationRisk: number;
  shareHolderRightsRisk: number;
  overallRisk: number;
  dividendRate: number;
  dividendYield: number;
  dividendPayoutRatio: number;
  exDividendDate: string;
  payoutRatio: number;
  fiveYearAvgDividendYield: number;
  beta: number;
  trailingPE: number;
  forwardPE: number;
  priceToSalesTrailing12Months: number;
  fiftyDayAverage: number;
  twoHundredDayAverage: number;
  trailingAnnualDividendRate: number;
  trailingAnnualDividendYield: number;
  profitMargins: number;
  heldPercentInsiders: number;
  heldPercentInstitutions: number;
  bookValue: number;
  priceToBook: number;
  lastFiscalYearEnd: string;
  earningsQuarterlyGrowth: number;
  netIncomeToCommon: number;
  trailingEps: number;
  forwardEps: number;
  enterpriseToRevenue: number;
  enterpriseToEbitda: number;
  weekChange52: number;
  sandP52WeekChange: number;
  lastDividendValue: number;
  lastDividendDate: string;
  exchange: string;
  quoteType: string;
  shortName: string;
  targetHighPrice: number;
  targetLowPrice: number;
  targetMeanPrice: number;
  targetMedianPrice: number;
  recommendationMean: number;
  recommendationKey: string;
  numberOfAnalystOpinions: number;
  totalCash: number;
  totalCashPerShare: number;
  ebitda: number;
  totalDebt: number;
  quickRatio: number;
  currentRatio: number;
  totalRevenue: number;
  debtToEquity: number;
  revenuePerShare: number;
  returnOnAssets: number;
  returnOnEquity: number;
  grossProfits: number;
  freeCashflow: number;
  operatingCashflow: number;
  earningsGrowth: number;
  revenueGrowth: number;
  grossMargins: number;
  ebitdaMargins: number;
  operatingMargins: number;
  trailingPegRatio: number;
  address: string;
}

interface DividendHistory {
  date: string;
  dividend: number;
}

interface RankingData {
  index: string;
  industry: string;
  sector: string;
  Symbol: string;
  score: string;
  rank: string;
}

interface RankingDisplayData {
  rank: string;
  score: string;
  industryRank: string;
  totalStocks: string;
  totalIndustryStocks: string;
  industry: string;
  sector: string;
}

interface fetchRankingData {
  symbol: string;
  score: string;
  rank: string;
  industry: string;
  sector: string;
}

interface SimilarCompany {
  symbol: string;
  similar_symbol: string;
  similar_company: string;
  revenue_2025: string;
  LogoURL: string;
  logoUrl?: string; // Add this for compatibility
  dividend_yield?: string;
  risks?: string;
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
  logoUrl: string;
  next_dividend_date?: string;
  is_favorite: boolean;
}

interface DividendSymbol {
  buy_date: string;
  symbol: string;
  dividend: string;
  dividendrate: string;
  payoutdate?: string;
  exdividenddate?: string;
}

interface DividendCountdownProps {
  symbol: string;
}

const DividendCountdown: React.FC<DividendCountdownProps> = ({ symbol }) => {
  const [timeLeft, setTimeLeft] = useState<{
    exDividendDays: number;
    exDividendHours: number;
    isExDividendPassed: boolean;
  }>({
    exDividendDays: 0,
    exDividendHours: 0,
    isExDividendPassed: false,
  });

  const [exDividendDate, setExDividendDate] = useState<string | null>(null);

  // Fetch buy_date from Supabase
  useEffect(() => {
    const fetchDates = async () => {
      try {
        const { data, error } = await supabase
          .from('dividendsymbol') // Updated to use correct table name from schema
          .select<'*', DividendSymbol>('*')
          .eq('symbol', symbol)
          .order('buy_date', { ascending: true })
          .limit(1);  // Get the earliest buy_date

        if (error) {
          console.error("Database error:", error);
          return;
        }

        if (!data || data.length === 0 || !data[0]?.buy_date || isNaN(Date.parse(data[0].buy_date))) {
          console.log("No valid buy_date found for", symbol);
          setExDividendDate(null);
          return;
        }

        // Format the date to YYYY-MM-DD
        const formattedDate = new Date(data[0].buy_date).toISOString().split('T')[0];
        setExDividendDate(formattedDate);
        console.log("Ex-Dividend Date set for", symbol, formattedDate);
      } catch (error) {
        console.error("Error fetching dates:", error);
      }
    };

    if (symbol) {
      fetchDates();
    }
  }, [symbol]);

  // Countdown Timer
  useEffect(() => {
    if (!exDividendDate) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const targetDate = new Date(exDividendDate);

      const timeDiff = targetDate.getTime() - currentDate.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      // Calculate remaining hours in the current day
      const hoursDiff = 24 - now.getHours() - 1;

      console.log('Buy Date:', exDividendDate);
      console.log('Current Date:', currentDate.toISOString().split('T')[0]);
      console.log('Days Difference:', daysDiff);
      console.log('Time Difference:', timeDiff);

      return {
        exDividendDays: Math.max(0, daysDiff),
        exDividendHours: Math.max(0, hoursDiff),
        isExDividendPassed: timeDiff < 0
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every hour
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000 * 60 * 60);

    return () => clearInterval(timer);
  }, [exDividendDate]);

  // Countdown UI
  return (
    <div>
     <Card className="w-full h-[80px] bg-gradient-to-br from-gray-900 to-blue-900 shadow-lg rounded-xl text-white relative overflow-hidden m-0 flex items-center justify-center">
  <div className="absolute inset-0 bg-[url('/airplane-bg.jpg')] opacity-10 bg-cover bg-center" />
  <div className="relative z-10 w-full flex items-center justify-center">
    {!timeLeft.isExDividendPassed ? (
      <div className="flex items-center justify-center gap-12">
        {[
          { label: "Days", value: String(timeLeft.exDividendDays) },
          {
            label: "Hours",
            value: String(timeLeft.exDividendHours),
            color:
              timeLeft.exDividendDays === 0
                ? "text-red-500"
                : "text-white",
          },
        ].map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center bg-black/20 px-4 py-2 rounded-lg"
          >
            <div
              className={`text-3xl font-bold ${
                item.color || "text-white"
              } font-mono tracking-wider`}
            >
              {(item.value + '').padStart(2, "0")}
            </div>
            <div className="text-sm text-blue-200 font-medium uppercase tracking-wide">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex items-center justify-center gap-3 text-red-500 text-base font-bold">
        <AlertCircle className="w-5 h-5" />
        Ex-Dividend Date Has Passed
      </div>
    )}
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
  const [dividendHistory, setDividendHistory] = useState<DividendHistory[]>([]);
  const [timeRange, setTimeRange] = useState('5Y');
  const [isHidden, setIsHidden] = useState(false);
  const [similarCompanies, setSimilarCompanies] = useState<SimilarCompany[]>([]);
  const [activeDividendTab, setActiveDividendTab] = useState('quarterly');
  const [dividendHistoryData, setDividendHistoryData] = useState<DividendHistoryData[]>([]);
  const [rankingCSVData, setRankingCSVData] = useState<RankingDisplayData | null>(null);
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const { theme } = useTheme();
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(true); // Replace with actual auth check

  const handleToggle = () => {
    if (!isUserLoggedIn) {
      setIsLoginPopupOpen(true);
      return;
    }
    setIsSubscribed(!isSubscribed);
    saveSubscriptionStatus(!isSubscribed);

    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  const saveSubscriptionStatus = (status: boolean) => {
    // Implement saving logic (e.g., API call to save user preference)
    console.log('Subscription status saved:', status);
  };
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
    dividend: string | null;
    dividendrate: string | null;
    quarterly: string | null;
    annualDate: string | null;
    quarterlyDate: string | null;
    annual: string | null;
    exDividendDate: string | null;
    dividendyield: string | null;
  }>({
    dividend: null,
    dividendrate: null,
    quarterly: null,
    annualDate: null,
    quarterlyDate: null,
    annual: null,
    exDividendDate: null,
    dividendyield: null
  });
  const [similarStocks, setSimilarStocks] = useState<Array<{
    symbol: string;
    company: string;
    description: string;
    logoUrl: string;
  }>>([]);
  const [selectedStock, setSelectedStock] = useState<SimilarCompany | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch all dividend data for a specific stock symbol
  const fetchDividendData = async (symbol: string) => {
    if (!symbol) {
      console.error('No symbol provided for dividend data fetch');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('dividendsymbol') // Updated to use correct table name from schema
        .select('*')
        .eq('symbol', symbol.toUpperCase())
        .order('buy_date', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log('No dividend data found for', symbol);
        return null;
      }

      // Calculate dividend yield
      const dividendYield = data[0].currentprice ? ((data[0].dividendrate / data[0].currentprice) * 100).toFixed(2) : '';

      // Transform data to match expected format
      return {
        dividend: data[0].dividend?.toString() || '',
        dividendrate: data[0].dividendrate?.toString() || '',
        quarterly: data[0].dividend?.toString() || '',
        annualDate: data[0].buy_date || null,
        quarterlyDate: data[0].payoutdate || '',
        annual: data[0].dividendrate?.toString() || '',
        exDividendDate: data[0].exdividenddate || '',
        dividendyield: data[0].dividendyield.toString() || ''
      };
    } catch (error) {
      console.error('Exception fetching dividend data:', error);
      return null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedTab("Company");
      setActiveTab("Company");
      setTimeRange('5Y');

      // Fetch dividend data when dialog opens
      if (stock?.Symbol) {
        fetchDividendData(stock.Symbol).then(data => {
          if (data) {
            console.log('Fetched dividend data:', data);

            // Update latest dividends
            setLatestDividends({
              dividend: data.dividend,
              dividendrate: data.dividendrate,
              quarterly: data.dividend,
              annualDate: data.annualDate,
              quarterlyDate: data.quarterlyDate,
              annual: data.annual,
              exDividendDate: data.exDividendDate,
              dividendyield: data.dividendyield
            });

            console.log('Dividend data mapped:', {
              dividend: data.dividend,
              dividendrate: data.dividendrate,
              quarterly: data.dividend,
              annualDate: data.annualDate,
              quarterlyDate: data.quarterlyDate,
              annual: data.annual,
              exDividendDate: data.exDividendDate,
              dividendyield: data.dividendyield
            });

            // Log the ex-dividend date for debugging
            if (data.annualDate) {
              console.log('Ex-Dividend Date:', new Date(data.annualDate).toLocaleDateString());
            }
          }
        });
      }
    }
  }, [isOpen, stock?.Symbol]);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('symbol', stock.Symbol)
          .single();

        if (error) throw error;

        if (data) {
          const formattedData: CompanyProfile = {
            ...data,
            dividendRate: Number(data.dividend_rate) || 0,
            dividendYield: Number(data.dividend_yield) || 0,
            shareHolderRightsRisk: Number(data.shareholder_rights_risk) || 0,
            overallRisk: Number(data.overall_risk) || 0,
            dividendPayoutRatio: Number(data.dividend_payout_ratio) || 0,
            payoutRatio: Number(data.payout_ratio) || 0,
          };
          setCompanyProfile(formattedData);
        }
      } catch (err) {
        console.error('Error fetching company profile:', err);
      }
    };

    fetchCompanyProfile();
  }, [stock?.Symbol]);


  useEffect(() => {
    const fetchRankingData = async () => {
      if (!stock?.Symbol) return;

      try {
        const { data: rankingData, error } = await supabase
          .from('top_stocks')
          .select('*')
          .eq('symbol', stock.Symbol.toUpperCase())  // Ensure uppercase symbol
          .single();

        if (error) {
          console.error('Database error:', error);
          setRankingCSVData(null);
          return;
        }

        if (rankingData) {
          const formattedData: string = rankingData.Score?.toString() || 'N/A';
          setRankingCSVData({
            rank: rankingData.Rank?.toString() || 'N/A',
            score: formattedData,
            sector: rankingData.sector || 'Unknown',
            industry: rankingData.industry || 'Unknown'
          });
        }
      } catch (error) {
        console.error('Error fetching ranking data:', error);
        setRankingCSVData(null);
      }
    };

    fetchRankingData();
  }, [stock?.Symbol]);

  useEffect(() => {
    const fetchSimilarCompanies = async () => {
      if (!stock?.Symbol) return;

      try {
        // Fetch similar companies based on stock symbol
        const { data: similarData, error: similarError } = await supabase
          .from('similar_companies')
          .select('*')
          .eq('symbol', stock.Symbol);

        if (similarError) {
          toast({
            title: "Error fetching similar companies",
            description: similarError.message,
            variant: "destructive",
          });
          return;
        }

        if (similarData && similarData.length > 0) {
          // Fetch logos for similar companies
          const symbols = similarData.map(item => item.similar_symbol);
          const { data: logoData, error: logoError } = await supabase
            .from('company_logos')
            .select('Symbol, LogoURL')
            .in('Symbol', symbols);

          if (logoError) {
            console.error('Error fetching logos:', logoError);
          }

          // Create a map of symbols to logos
          const logoMap = new Map();
          if (logoData) {
            logoData.forEach((logo: LogoData) => {
              logoMap.set(logo.Symbol.toUpperCase(), logo.LogoURL);
            });
          }

          // Fetch company names for similar symbols
          const { data: companyData, error: companyError } = await supabase
            .from('company_profiles')
            .select('symbol, company_name')
            .in('symbol', symbols);

          // Create a map of symbols to company names
          const companyNameMap = new Map();
          if (companyData && !companyError) {
            companyData.forEach((company: any) => {
              companyNameMap.set(company.symbol.toUpperCase(), company.company_name);
            });
          } else if (companyError) {
            console.error('Error fetching company names:', companyError);
          }

          const formattedData: SimilarCompany[] = similarData.map(company => ({
            symbol: company.symbol,
            similar_symbol: company.similar_symbol,
            similar_company: companyNameMap.get(company.similar_symbol?.toUpperCase()) || company.similar_symbol,
            revenue_2025: company.revenue_2025 || 'N/A',
            dividend_yield: company.dividend_yield || 'N/A',
            risks: company.risks || 'N/A',
            LogoURL: logoMap.get(company.similar_symbol?.toUpperCase()) || '/stock.avif'
          }));
          setSimilarCompanies(formattedData);
        } else {
          console.log('No similar companies found for', stock.Symbol);
          setSimilarCompanies([]);
        }
      } catch (error) {
        console.error('Error in fetchSimilarCompanies:', error);
        toast({
          title: "Error",
          description: "Failed to fetch similar companies",
          variant: "destructive",
        });
      }
    };

    fetchSimilarCompanies();
  }, [stock?.Symbol, toast]);

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
            .order('created_at', { ascending: false })
            .limit(1);

          if (error) throw error;
          setLogoURL(data[0].LogoURL);
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
            .select('*')
            .in('Symbol', similarData.map(company => company.similar_symbol));

          if (logoError) throw logoError;

          const combinedData = similarData.map(company => ({
            ...company,
            logo: logoData.find(logo => logo.Symbol === company.similar_symbol)?.LogoURL
          }));

          setSimilarStocks(combinedData.map(item => ({
            symbol: item.symbol,
            company: item.company_name,
            description: item.description || '',
            logoUrl: item.logo || ''
          })));
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

  const filterDividendHistory = (data: DividendHistory[], range: string) => {
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
        .order('created_at', { ascending: false })
        .limit(1);

      if (error && error.code !== 'PGRST116') { // PGRST116 is the "not found" error
        throw error;
      }

      setIsSaved(!!data && data.length > 0);
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

        if (error) {
          console.error('Error removing stock:', error);
          toast({
            title: "Error",
            description: error.message || "Failed to remove stock from watchlist",
            variant: "destructive",
          });
          return;
        }

        setIsSaved(false);
        toast({
          title: "Success",
          description: "Stock removed from watchlist",
        });
      } else {
        // Validate stock data before saving
        if (!stock.Symbol || !stock.title) {
          toast({
            title: "Error",
            description: "Invalid stock data. Missing required fields.",
            variant: "destructive",
          });
          return;
        }

        // Check if stock already exists for this user
        const { data: existingStock } = await supabase
          .from('saved_stocks')
          .select()
          .eq('user_id', user.id)
          .eq('symbol', stock.Symbol)
          .single();

        if (existingStock) {
          toast({
            title: "Info",
            description: "This stock is already in your watchlist",
          });
          setIsSaved(true);
          return;
        }

        // Save new stock
        const stockData: SavedStock = {
          user_id: user.id,
          symbol: stock.Symbol,
          company_name: stock.title,
          LogoURL: stock.LogoURL || '',
          next_dividend_date: stock['Ex-Dividend Date'] || null,
          is_favorite: false
        };

        const { error } = await supabase
          .from('saved_stocks')
          .insert([stockData]);

        if (error) {
          console.error('Error saving stock:', error);
          toast({
            title: "Error",
            description: error.message || "Failed to save stock to watchlist",
            variant: "destructive",
          });
          return;
        }

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
        description: error instanceof Error ? error.message : "An unexpected error occurred",
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
          <div className="p-4 max-h-[calc(100vh-250px)] overflow-y-auto">
            <div className="space-y-6">
              <div className="grid grid-cols-[250px,1fr] gap-8 transition-all duration-300" style={{ height: isHidden ? '0px' : 'auto', overflow: 'hidden' }}>
                {/* Left Column - Company Overview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Company Profile</h3>
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
              <div className="mt-2">
              </div>
            </div>
          </div>
        );
        case "Dividend Yield":
          return (
            <div style={{ display: "flex", flexDirection: "column", height: "auto" }}>
              <DividendYield symbol={stock.Symbol} />
            </div>
          );

      case "Payout":
        const lastPayout = payoutData[0]?.value || 0;
        const healthyPayoutRange = { min: 40, max: 60 };
        const isHealthyPayout = lastPayout >= healthyPayoutRange.min && lastPayout <= healthyPayoutRange.max;
        const isHighPayout = lastPayout > healthyPayoutRange.max;
        return (
          <div className="p-4 max-h-[calc(100vh-250px)] overflow-y-auto">
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-semibold mb-2 text-white">Payout Ratio Analysis</h3>
              <div className={`text-2xl font-bold mb-4 ${
                isHealthyPayout ? 'text-yellow-500' :
                isHighPayout ? 'text-red-500' : 'text-green-500'
              }`}>
                {lastPayout.toFixed(2)}%
              </div>
              <div className="px-4 h-[300px] relative">
                {/* Background color zones */}
                <div className="absolute inset-0 flex flex-col">
                  <div className="h-1/3 bg-red-600 opacity-20" />
                  <div className="h-1/3 bg-yellow-400 opacity-20" />
                  <div className="h-1/3 bg-green-500 opacity-20" />
                </div>
                {/* Zone labels */}
                <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between pr-2 text-sm">
                  <span className="text-white mt-2">65%</span>
                  <span className="text-white">35%</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={payoutData}
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <XAxis
                      dataKey="quarter"
                      axisLine={false}
                      tickLine={false}
                      stroke="#fff"
                      fontSize={12}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      stroke="#fff"
                      fontSize={12}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        // Use star marker for future projections (2025 onwards)
                        const isFuture = payload.quarter.includes('2025');
                        if (isFuture) {
                          return (
                            <path
                              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                              transform={`translate(${cx - 10}, ${cy - 10}) scale(0.8)`}
                              fill="#2563eb"
                              stroke="none"
                            />
                          );
                        }
                        // Use square marker for historical data
                        return (
                          <rect
                            x={cx - 4}
                            y={cy - 4}
                            width={8}
                            height={8}
                            fill="#2563eb"
                            transform={`rotate(45, ${cx}, ${cy})`}
                          />
                        );
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case "Dividend History":
        return (
          <div className="p-4 max-h-[calc(100vh-250px)] overflow-y-auto">
            <div className="space-y-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-4">
                  <Button
                    variant={activeDividendTab === 'annual' ? 'default' : 'outline'}
                    onClick={() => setActiveDividendTab('annual')}
                    className={`w-32 ${activeDividendTab === 'annual' && 'bg-primary text-primary-foreground'}`}
                  >
                    Annual
                  </Button>
                  <Button
                    variant={activeDividendTab === 'quarterly' ? 'default' : 'outline'}
                    onClick={() => setActiveDividendTab('quarterly')}
                    className={`w-32 ${activeDividendTab === 'quarterly' && 'bg-primary text-primary-foreground'}`}
                  >
                    Quarterly
                  </Button>
                </div>
                <div className="flex space-x-2">
                  {['1Y', '3Y', '5Y', 'MAX'].map((range) => (
                    <Button
                      key={range}
                      variant={timeRange === range ? 'default' : 'outline'}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 ${
                        timeRange === range ? 'bg-primary text-primary-foreground' : ''
                      }`}
                      size="sm"
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filterDividendData(dividendHistoryData, timeRange)}
                    margin={{ top: 20, right: 30, left: 40, bottom: 30 }}
                  >
                    {/* X-Axis */}
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: theme === 'dark' ? '#9CA3AF' : '#4B5563' }}
                      axisLine={{ stroke: theme === 'dark' ? '#374151' : '#e5e7eb' }}
                      tickLine={false}
                    />
                    {/* Y-Axis */}
                    <YAxis
                      tick={{ fontSize: 12, fill: theme === 'dark' ? '#9CA3AF' : '#4B5563' }}
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                      axisLine={{ stroke: theme === 'dark' ? '#374151' : '#e5e7eb' }}
                      tickLine={false}
                    />
                    {/* Tooltip */}
                    <Tooltip
                      cursor={false}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Dividend']}
                      labelFormatter={(label) => `Year: ${label}`}
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        padding: '12px'
                      }}
                    />
                    {/* Bar Graph */}
                    <Bar
                      dataKey="dividends"
                      fill={theme === 'dark' ? '#6366f1' : '#4f46e5'}
                      name="Dividend Amount"
                      radius={[6, 6, 0, 0]}
                    >
                      <LabelList
                        dataKey="dividends"
                        position="top"
                        formatter={(value: number) => `$${value.toFixed(2)}`}
                        style={{
                          fontSize: '10px',
                          fill: theme === 'dark' ? '#9CA3AF' : '#4B5563'
                        }}
                      />
                    </Bar>
                    {/* Red Line Graph - Ensures It Touches Midpoints of Bars */}
                    <Line
                      type="monotone"
                      dataKey="dividends"
                      stroke="red"
                      strokeWidth={2}
                      dot={{
                        r: 4,
                        fill: 'red',
                        stroke: 'red',
                        strokeWidth: 2
                      }}
                      activeDot={{
                        r: 6,
                        fill: 'red'
                      }}
                      connectNulls={true} // Ensures missing points are connected
                    />
                    {/* Dot Graph Above Each Bar */}
                    <Scatter
                      data={filterDividendData(dividendHistoryData, timeRange).map(d => ({
                        date: d.date,
                        dividends: d.dividends * 1.1 // Adjusted height (10% higher than bars)
                      }))}
                      fill="green"
                      shape="circle"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 'Analyst Ratings':
        return (
          <div className="p-4 max-h-[calc(100vh-250px)] overflow-y-auto">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 w-full">
                    <UpDown symbol={stock.Symbol} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Create mini chart data from yield data
  const miniChartData = yieldData.slice(0, 3).map(item => ({
    date: item.date,
    value: item.value
  }));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={`max-w-6xl rounded-lg shadow-lg text-sm  space-y-1 ${theme === "dark" ? ' text-white' : ' text-white'}`}>
      <DialogHeader className="mb-1">
        <DialogTitle className="flex items-center justify-between gap-2 w-full">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {/* Logo and Stock Info */}
            <div className="flex items-center gap-2">
              <div
                className="w-12 h-12 bg-center bg-no-repeat bg-contain rounded-xl border border-gray-300 dark:border-gray-700 shadow-lg transition-all duration-300"
                style={{
                  backgroundImage: `url(${logoURL || 'stock.avif'})`,
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb'
                }}
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="text-base font-semibold text-gray-800 dark:text-gray-200">
                    {stock.Symbol}
                  </div>
                  <button
                    onClick={handleSaveStock}
                    disabled={isLoading}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-300 text-xs ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    } ${
                      isSaved
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                        : 'bg-white dark:bg-gray-900 text-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600'
                    }`}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 stroke-red-500' : 'stroke-current'}`} />
                    )}
                    <span className="font-medium">
                      {isLoading ? '...' : isSaved ? 'Saved' : 'Save'}
                    </span>
                  </button>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {stock?.title}
                </div>
              </div>
            </div>

            {/* Ranking Section - Made Compact */}
            <div className="flex gap-3 px-2 py-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              {[
                { label: 'Rank', value: rankingCSVData?.rank ? `#${rankingCSVData.rank}` : 'N/A' },
                {
                  label: 'Score',
                  value: rankingCSVData?.score ? `#${rankingCSVData.score}` : 'N/A',
                  color: !rankingCSVData?.score ? 'text-gray-500' :
                         Number(rankingCSVData.score) >= 0.7 ? 'text-green-500' :
                         Number(rankingCSVData.score) >= 0.4 ? 'text-yellow-500' : 'text-red-500'
                },
                { label: 'Sector', value: rankingCSVData?.sector || 'N/A', color: 'text-blue-400' },
                { label: 'Industry', value: rankingCSVData?.industry || 'N/A', color: 'text-purple-400' }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-500 uppercase">{item.label}</span>
                  <span className={`text-sm font-bold ${item.color || 'text-gray-800 dark:text-gray-200'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Mini Chart - Made Compact */}
            <div className="flex items-center px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500">Annual | Yield</span>
                  <div className="flex gap-1 items-center">
                    <span className="text-xs font-bold text-green-600">
                      {latestDividends.dividendrate ? `$${Number(latestDividends.dividendrate).toFixed(2)}` : 'N/A'}
                    </span>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs font-semibold text-green-500">
                      ({latestDividends.dividendyield ? `${Number(latestDividends.dividendyield).toFixed(2)}%` : 'N/A'})
                    </span>
                  </div>
                </div>
                <div className="w-px h-5 bg-gray-300 dark:bg-gray-600" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500">Quarterly</span>
                  <span className="text-xs font-bold text-blue-600">
                    {latestDividends.dividend ? `$${Number(latestDividends.dividend).toFixed(2)}` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>


          {/* Notification Box in Top Right Corner */}
          <div className="flex items-center px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-500 font-medium">Track Price</span>
                <Switch checked={isSubscribed} onCheckedChange={handleToggle} className="data-[state=checked]:bg-blue-500" />
                {showMessage && (
                  <span className="text-sm text-blue-500 transition-opacity duration-500">
                    {isSubscribed ? "Saved for updates" : "Subscribe for updates"}
                  </span>
                )}
              </div>
            </div>




          {/* Right Section */}
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-500">{currentDateTime.toLocaleString('en-US')}</div>
            <div className="flex items-center gap-2">
              <div className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md">Similar Companies</div>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="w-5 h-5 flex items-center justify-center rounded-full border border-gray-400 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <AlertCircle className="w-3 h-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-4 text-sm rounded-xl shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                  <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">Symbol Company</th>
                          <th className="px-3 py-2 text-left font-medium">Revenue 2025</th>
                          <th className="px-3 py-2 text-right font-medium">Dividend Yield</th>
                          <th className="px-3 py-2 text-right font-medium">Risks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {similarCompanies.slice(0, 5).map((company) => (
                          <tr
                            key={company.similar_symbol}
                            className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                            onClick={() => {
                              // Always open the StockDetailsDialog for the similar symbol
                              // Close current dialog
                              setIsOpen(false);
                              // Wait for dialog to close, then open new one
                              setTimeout(() => {
                                // Create a new stock object for the similar company
                                const newStock = {
                                  Symbol: company.similar_symbol,
                                  title: company.similar_company || company.similar_symbol,
                                  cik_str: '',
                                  LogoURL: company.LogoURL
                                };
                                // Open a new dialog for this stock
                                const event = new CustomEvent('openStockDetails', { detail: newStock });
                                window.dispatchEvent(event);
                              }, 300);
                            }}
                          >
                            <td className="px-3 py-2 font-medium text-blue-600 dark:text-blue-400">
                              <div
                                className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1 rounded-md"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent triggering the row click handler

                                  // If user holds Shift key, show popup instead
                                  if (e.shiftKey) {
                                    setSelectedStock(company);
                                  } else {
                                    // Close current dialog
                                    setIsOpen(false);
                                    // Wait for dialog to close, then open new one
                                    setTimeout(() => {
                                      // Create a new stock object for the similar company
                                      const newStock = {
                                        Symbol: company.similar_symbol,
                                        title: company.similar_company || company.similar_symbol,
                                        cik_str: '',
                                        LogoURL: company.LogoURL
                                      };
                                      // Open a new dialog for this stock
                                      const event = new CustomEvent('openStockDetails', { detail: newStock });
                                      window.dispatchEvent(event);
                                    }, 300);
                                  }
                                }}
                              >
                                <div
                                  className="w-5 h-5 bg-center bg-no-repeat bg-contain rounded border border-red-500 flex-shrink-0 animate-pulse-border"
                                  style={{
                                    backgroundImage: `url(${company.LogoURL || "/stock.avif"})`
                                  }}
                                />
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium">{company.similar_symbol}</span>
                                  <span className="text-xs text-gray-500 truncate max-w-[120px]">{company.similar_company || company.similar_symbol}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                              {company.revenue_2025 || 'N/A'}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span className={`font-medium ${parseFloat(company.dividend_yield) > 3 ? 'text-green-500' : 'text-blue-500'}`}>
                                {company.dividend_yield || 'N/A'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-xs text-gray-500 truncate max-w-[60px] overflow-hidden">
                                  {company.risks ? (company.risks.length > 10 ? company.risks.substring(0, 10) + '...' : company.risks) : 'N/A'}
                                </span>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button
                                      className="w-5 h-5 flex items-center justify-center rounded-full border border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent row click
                                      }}
                                    >
                                      <AlertTriangle className="w-3 h-3" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-72 p-3 text-sm rounded-xl shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                                    onPointerDownOutside={(e) => {
                                      // Auto-close when clicking outside
                                      e.preventDefault();
                                    }}
                                  >
                                    <p className="font-semibold text-red-500 mb-1">Risk Factors</p>
                                    <p className="text-xs text-gray-700 dark:text-gray-300">
                                      {company.risks || 'No risk information available'}
                                    </p>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Click on any company to open in a new dialog. <span className="font-medium text-blue-500">Hold Shift + Click</span> to view in a popup instead.
                  </p>
                </PopoverContent>
              </Popover>

            </div>
          </div>
        </DialogTitle>
      </DialogHeader>

        <div className="space-y-1">
          {stock && (
            <DividendCountdown symbol={stock.Symbol} />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1 mb-1">
            {/* Dividend Information Card */}
          </div>
          <div >

            {/* Tabs in a single row */}
            <div className="flex gap-1 mt-1 overflow-x-auto pb-1">
              {["Company", "Dividend History", "Dividend Yield", "Payout", "Overall", "Analyst Ratings"].map((tab) => (
                <div
                  key={tab}
                  className={`flex items-center cursor-pointer px-2 py-1 ${
                    selectedTab === tab ? 'border-b-2 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedTab(tab)}
                >
                  <span className={`text-sm ${selectedTab === tab ? 'text-blue-500' : ''}`}>
                    {tab}
                  </span>
                </div>
              ))}
            </div>
            {renderTabContent()}
          </div>
        </div>
        {/* Similar Company Details Dialog */}
        <Dialog
          open={!!selectedStock}
          onOpenChange={() => setSelectedStock(null)}
          onPointerDownOutside={(e) => {
            // Auto-close when clicking outside
            setSelectedStock(null);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div
                  className="w-8 h-8 bg-center bg-no-repeat bg-contain rounded-lg border border-red-500 animate-pulse-border"
                  style={{
                    backgroundImage: `url(${selectedStock?.LogoURL || "/stock.avif"})`
                  }}
                />
                <div>
                  <div className="text-base font-bold">{selectedStock?.similar_symbol}</div>
                  <div className="text-xs text-gray-500">{selectedStock?.similar_company || selectedStock?.similar_symbol}</div>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="p-3">
              {/* Company Details Table */}
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2 font-medium bg-gray-50 dark:bg-gray-800">Revenue 2025</td>
                      <td className="px-4 py-2">{selectedStock?.revenue_2025 || 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2 font-medium bg-gray-50 dark:bg-gray-800">Dividend Yield</td>
                      <td className="px-4 py-2">
                        <span className={`font-medium ${Number(selectedStock?.dividend_yield) > 3 ? 'text-green-500' : 'text-blue-500'}`}>
                          {selectedStock?.dividend_yield || 'N/A'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium bg-gray-50 dark:bg-gray-800">Risks</td>
                      <td className="px-4 py-2">
                        <div className="text-xs text-gray-600 max-h-24 overflow-y-auto">
                          {selectedStock?.risks || 'No risk information available'}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex justify-between">
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => {
                    // Close current dialogs
                    setSelectedStock(null);
                    setIsOpen(false);

                    // Wait for dialogs to close, then open new one
                    setTimeout(() => {
                      // Create a new stock object for the similar company
                      const newStock = {
                        Symbol: selectedStock?.similar_symbol || '',
                        title: selectedStock?.similar_company || selectedStock?.similar_symbol || '',
                        cik_str: '',
                        LogoURL: selectedStock?.LogoURL || ''
                      };
                      // Open a new dialog for this stock
                      const event = new CustomEvent('openStockDetails', { detail: newStock });
                      window.dispatchEvent(event);
                    }, 300);
                  }}
                >
                  Open {selectedStock?.similar_symbol}
                </Button>

                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => {
                    // Handle comparison logic here
                    toast({
                      title: "Comparison",
                      description: `Comparing ${stock.Symbol} with ${selectedStock?.similar_symbol}`,
                    });
                  }}
                >
                  Compare with {stock.Symbol}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default StockDetailsDialog;
