import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Star, Square, ChevronDown, ChevronUp, Calendar, DollarSign, AlertCircle, Heart, Bell } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Papa, { ParseResult } from 'papaparse';
import { filterDividendData, type DividendHistoryData, type DividendHistory } from '@/utils/dividend';
import UpDown from "@/pages/UpDown";

interface Stock {
  cik_str: string;
  Symbol: string;
  title: string;
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
  // Add any other fields from the database
}

interface RankingData {
  index: string;
  industry: string;
  sector: string;
  Symbol: string;
  Score: string;
  Rank: string;
}

interface RankingDisplayData {
  rank: string;
  score: string;
  industryRank?: string;
  totalStocks?: string;
  totalIndustryStocks?: string;
  industry?: string;
  sector?: string;
}

interface RankingCSVData {
  symbol: string;
  score: string;
  rank: string;
  industry: string;
  sector: string;
}

interface SimilarStockData {
  stock: string;
  Description: string;
  similarStock: string;
  Company: string;
  'Revenue 2024 (USD billion)'?: string;
}

interface LogoData {
  Symbol: string;
  LogoURL: string;
}

interface DividendDates {
  buy_date: string;
  payout_date: string;
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

interface SimilarCompany {
  symbol: string;
  similar_symbol: string;
  company_name?: string;
  description?: string;
  created_at?: string;
  id?: number;
  revenue_2024?: string;
  logo?: string;
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
        const { data, error } = await supabase
          .from('dividend_dates')
          .select('*')
          .eq('symbol', symbol)
          .single();

        if (error) throw error;
        setDates({
          buyDate: data.buy_date,
          payoutDate: data.payout_date
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
  const [dividendHistory, setDividendHistory] = useState<DividendHistory[]>([]);
  const [timeRange, setTimeRange] = useState('5Y');
  const [isHidden, setIsHidden] = useState(false);
  const [similarCompanies, setSimilarCompanies] = useState<string[]>([]);
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
  const [quarterlyDividend, setQuarterlyDividend] = useState<{ 
    current: string; 
    last: string 
  }>({ 
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
  const [similarStocks, setSimilarStocks] = useState<Array<{
    symbol: string;
    company: string;
    description: string;
    logoUrl: string;
  }>>([]);
  const [selectedStock, setSelectedStock] = useState<typeof similarStocks[0] | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
  const { toast } = useToast();

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
        setCompanyProfile(data as CompanyProfile);
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
        setDividendHistory(data as DividendHistory[]);
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
        setRankingCSVData(data as RankingDisplayData);
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
          .select('*')
          .in('symbol', similarData.map(company => company.similar_symbol));

        if (logoError) throw logoError;

        const combinedData = similarData.map(company => ({
          ...company,
          logo: logoData.find(logo => logo.Symbol === company.similar_symbol)?.LogoURL
        }));

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
        setDividendHistoryData(data as DividendHistoryData[]);
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
            .eq('symbol', stock.Symbol)
            .single();

          if (error) throw error;
          setLogoURL(data.logo_url);
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
            .in('symbol', similarData.map(company => company.similar_symbol));

          if (logoError) throw logoError;

          const combinedData = similarData.map(company => ({
            ...company,
            logo: logoData.find(logo => logo.symbol === company.similar_symbol)?.logo_url
          }));

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

  const handleSaveStock = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save stocks",
          variant: "destructive",
        });
        return;
      }
      
      if (isSaved) {
        // Remove from saved stocks
        const { error } = await supabase
          .from('saved_stocks')
          .delete()
          .eq('user_id', user.id)
          .eq('symbol', stock.Symbol);
          
        if (error) throw error;
        
        setIsSaved(false);
        toast({
          title: "Stock removed",
          description: `${stock.Symbol} has been removed from your saved stocks`,
        });
      } else {
        // Add to saved stocks
        const { error } = await supabase
          .from('saved_stocks')
          .upsert({
            user_id: user.id,
            symbol: stock.Symbol,
            company_name: stock.title || '',
            logo_url: logoURL,
            price: parseFloat(currentYield.toFixed(2)),
            dividend_yield: parseFloat(yieldChange.toFixed(2)),
            is_favorite: false
          });
          
        if (error) throw error;
        
        setIsSaved(true);
        toast({
          title: "Stock saved",
          description: `${stock.Symbol} has been added to your saved stocks`,
        });
      }
    } catch (error) {
      console.error('Error saving stock:', error);
      toast({
        title: "Error",
        description: "Failed to save stock. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to subscribe to stock updates",
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
      
      setIsSubscriptionLoading(true);
      
      if (isSubscribed) {
        // Unsubscribe - update subscription to false
        const { error } = await supabase
          .from('stock_subscriptions')
          .update({ is_subscribed: false, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('stock_symbol', stock.Symbol);
        
        if (error) throw error;
        
        setIsSubscribed(false);
        toast({
          title: "Unsubscribed",
          description: `You will no longer receive updates about ${stock.Symbol}`,
        });
      } else {
        // Subscribe - insert or update
        const { error } = await supabase
          .from('stock_subscriptions')
          .upsert({
            user_id: user.id,
            stock_symbol: stock.Symbol,
            is_subscribed: true,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,stock_symbol' });
        
        if (error) throw error;
        
        setIsSubscribed(true);
        toast({
          title: "Subscribed",
          description: `You will now receive updates about ${stock.Symbol}`,
        });
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user || !stock?.Symbol) return;
        
        const { data, error } = await supabase
          .from('stock_subscriptions')
          .select('is_subscribed')
          .eq('user_id', user.id)
          .eq('stock_symbol', stock.Symbol)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking subscription:', error);
          return;
        }
        
        setIsSubscribed(!!data?.is_subscribed);
      } catch (error) {
        console.error('Error checking subscription status:', error);
      }
    };
    
    checkSubscriptionStatus();
  }, [stock?.Symbol]);

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
              <div className="mt-4">
              </div>
            </div>
          </div>
        );
      case "Dividend Yield":
        return (
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <h2 className="text-3xl font-bold">Yield</h2>
                <div className="text-lg text-muted-foreground mt-2">
                  {stock.Symbol} Dividend Yield
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {["1Y", "5Y", "10Y"].map((period) => (
                      <Button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        variant={period === selectedPeriod ? "default" : "outline"}
                        size="sm"
                      >
                        {period}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={selectedDataType === 'quarterly' ? "default" : "outline"}
                      onClick={() => setSelectedDataType('quarterly')}
                      size="sm"
                    >
                      Quat
                    </Button>
                    <Button
                      variant={selectedDataType === 'annual' ? "default" : "outline"}
                      onClick={() => setSelectedDataType('annual')}
                      size="sm"
                    >
                      Annual
                    </Button>
                  </div>

                  <div className="flex space-x-1">
                    <Button variant="outline" size="icon">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon">
