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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Papa, { ParseResult } from 'papaparse';
import { filterDividendData, type DividendHistoryData } from '@/utils/dividend';
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
  website: string;
  industry: string;
  sector: string;
  longBusinessSummary: string;
  fullTimeEmployees: string;
  dividendRate: string;
  dividendYield: string;
  exDividendDate: string;
  payoutRatio: string;
  previousClose: string;
  open: string;
  dayLow: string;
  dayHigh: string;
  volume: string;
  marketCap: string;
  trailingPE: string;
  forwardPE: string;
  beta: string;
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
  Score: string;
  Rank: string;
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
  'Revenue 2024 (USD billion)': string;
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
        const response = await fetch('/dividends.csv');
        const csvText = await response.text();
        const lines = csvText.split('\n');
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split('|');
          if (values[0] === symbol) {
            setDates({
              buyDate: values[13],    // buy_date is the 14th column (index 13)
              payoutDate: values[12]  // payout_date is the 15th column (index 14)
            });
            break;
          }
        }
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
  const [similarStocks, setSimilarStocks] = useState<Array<{
    symbol: string;
    company: string;
    description: string;
    logoUrl: string;
  }>>([]);
  const [selectedStock, setSelectedStock] = useState<typeof similarStocks[0] | null>(null);
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
        const response = await fetch('/profile/company_profile.csv');
        const text = await response.text();
        const lines = text.split('\n');
        const headers = lines[0].split('|');
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split('|');
          if (values[headers.indexOf('symbol')] === stock.Symbol) {
            const profile: CompanyProfile = {
              symbol: values[headers.indexOf('symbol')] || '',
              website: values[headers.indexOf('website')] || '',
              industry: values[headers.indexOf('industry')] || '',
              sector: values[headers.indexOf('sector')] || '',
              longBusinessSummary: values[headers.indexOf('longBusinessSummary')] || '',
              fullTimeEmployees: values[headers.indexOf('fullTimeEmployees')] || '',
              dividendRate: values[headers.indexOf('dividendRate')] || '',
              dividendYield: values[headers.indexOf('dividendYield')] || '',
              exDividendDate: values[headers.indexOf('exDividendDate')] || '',
              payoutRatio: values[headers.indexOf('payoutRatio')] || '',
              previousClose: values[headers.indexOf('previousClose')] || '',
              open: values[headers.indexOf('open')] || '',
              dayLow: values[headers.indexOf('dayLow')] || '',
              dayHigh: values[headers.indexOf('dayHigh')] || '',
              volume: values[headers.indexOf('volume')] || '',
              marketCap: values[headers.indexOf('marketCap')] || '',
              trailingPE: values[headers.indexOf('trailingPE')] || '',
              forwardPE: values[headers.indexOf('forwardPE')] || '',
              beta: values[headers.indexOf('beta')] || '',
              address: values[headers.indexOf('address')] || '',
            };
            setCompanyProfile(profile);
            break;
          }
        }
      } catch (error) {
        console.error('Error fetching company profile:', error);
        toast({
          title: "Error",
          description: "Failed to load company profile data",
          variant: "destructive",
        });
      }
    };

    fetchCompanyProfile();
  }, [stock?.Symbol, toast]);

  useEffect(() => {
    const fetchDividendData = async () => {
      if (stock?.Symbol) {
        try {
          // Fetch both dividend files
          const [annualResponse, quarterlyResponse] = await Promise.all([
            fetch('/Annual_dividend/annual_dividend.csv'),
            fetch('/quatarly_dividend/quater_dividend.csv')
          ]);

          const [annualText, quarterlyText] = await Promise.all([
            annualResponse.text(),
            quarterlyResponse.text()
          ]);

          // Parse annual data
          Papa.parse<DividendData>(annualText, {
            header: true,
            delimiter: '|',
            complete: (results) => {
              const stockDividends = results.data
                .filter(item => 
                  item.symbol === stock.Symbol &&
                  item.date && item.dividends
                )
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

              if (stockDividends.length > 0) {
                setLatestDividends(prev => ({
                  ...prev,
                  annual: stockDividends[0].dividends,
                  annualDate: stockDividends[0].date
                }));
              }
            }
          });

          // Parse quarterly data
          Papa.parse<DividendData>(quarterlyText, {
            header: true,
            delimiter: '|',
            complete: (results) => {
              const stockDividends = results.data
                .filter(item => 
                  item.symbol === stock.Symbol &&
                  item.date && item.dividends
                )
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

              if (stockDividends.length > 0) {
                setLatestDividends(prev => ({
                  ...prev,
                  quarterly: stockDividends[0].dividends,
                  quarterlyDate: stockDividends[0].date
                }));
              }
            }
          });

        } catch (error) {
          console.error('Error fetching dividend data:', error);
        }
      }
    };

    fetchDividendData();
  }, [stock?.Symbol]);

  useEffect(() => {
    const fetchPayoutData = async () => {
      try {
        const response = await fetch(`/payout/${stock.Symbol}.csv`);
        const csvText = await response.text();
        const rows = csvText.split('\n').slice(1); // Skip header
        const data = rows.map(row => {
          const [dividends, date, quarterlyEPS, _, quarter_year, payout] = row.split(',');
          return {
            quarter: quarter_year,
            value: parseFloat(payout),
            dividends: parseFloat(dividends),
            eps: parseFloat(quarterlyEPS)
          };
        }).filter(item => !isNaN(item.value));
        setPayoutData(data.reverse()); // Most recent first
      } catch (error) {
        console.error('Error loading payout data:', error);
      }
    };

    if (stock?.Symbol) {
      fetchPayoutData();
    }
  }, [stock?.Symbol]);

  useEffect(() => {
    const fetchDividendHistory = async () => {
      if (stock?.Symbol) {
        try {
          const response = await fetch(`/dividend/${stock.Symbol}.csv`);
          const csvText = await response.text();
          const rows = csvText.split('\n').slice(1); // Skip header
          const data = rows.map(row => {
            const [date, dividend] = row.split(',');
            return {
              date,
              dividend: parseFloat(dividend)
            };
          }).filter(item => !isNaN(item.dividend));
          setDividendHistory(data);
        } catch (error) {
          console.error('Error loading dividend history:', error);
        }
      }
    };

    fetchDividendHistory();
  }, [stock?.Symbol]);

  useEffect(() => {
    const fetchSimilarCompanies = async () => {
      if (stock?.Symbol) {
        try {
          const response = await fetch('/profile/similarcompany.csv');
          const text = await response.text();
          const lines = text.split('\n');
          const companies = lines
            .slice(1) // Skip header
            .map(line => {
              const [symbol, similars] = line.split('|');
              return { symbol, similarcompanies: similars };
            })
            .find(company => company.symbol === stock.Symbol);
          
          if (companies) {
            setSimilarCompanies(companies.similarcompanies.split(','));
          } else {
            setSimilarCompanies([]);
          }
        } catch (error) {
          console.error('Error loading similar companies:', error);
          setSimilarCompanies([]);
        }
      }
    };

    fetchSimilarCompanies();
  }, [stock?.Symbol]);

  useEffect(() => {
    const fetchRanking = async () => {
      if (stock?.Symbol) {
        try {
          const response = await fetch('/ranking/ranking.csv');
          const csvText = await response.text();
          
          Papa.parse<RankingData>(csvText, {
            header: true,
            delimiter: '|',
            complete: (results) => {
              const allStocks = results.data.filter(item => 
                item.Symbol && item.Rank && item.industry
              );
              
              const stockData = allStocks.find(item => 
                item.Symbol === stock.Symbol
              );
              
              if (stockData) {
                const industryStocks = allStocks.filter(item => 
                  item.industry === stockData.industry
                );
                
                const industryRank = industryStocks
                  .sort((a, b) => Number(a.Rank) - Number(b.Rank))
                  .findIndex(item => item.Symbol === stock.Symbol) + 1;

                setRankingCSVData({
                  rank: stockData.Rank,
                  score: stockData.Score,
                  industryRank: industryRank.toString(),
                  totalStocks: allStocks.length.toString(),
                  totalIndustryStocks: industryStocks.length.toString(),
                  industry: stockData.industry,
                  sector: stockData.sector
                });
              }
            }
          });
        } catch (error) {
          console.error('Error fetching ranking:', error);
          toast({
            title: "Error",
            description: "Failed to load ranking data",
            variant: "destructive",
          });
        }
      }
    };
    
    fetchRanking();
  }, [stock?.Symbol, toast]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDividendHistoryData = async () => {
      if (!stock?.Symbol) return;
      
      try {
        const response = await fetch(`/History/${activeDividendTab === 'annual' ? 'annual' : 'quater'}_dividend.csv`);
        const csvText = await response.text();
        
        const results = Papa.parse(csvText, {
          header: true,
          delimiter: '|',
          dynamicTyping: true,
        });

        const filteredData = (results.data as any[])
          .filter(row => row.symbol === stock.Symbol)
          .map(row => ({
            date: new Date(row.date).getFullYear().toString(),
            dividends: row.dividends
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setDividendHistoryData(filteredData);
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
          const response = await fetch('/sp500_company_logos.csv');
          const csvText = await response.text();
          
          Papa.parse<LogoData>(csvText, {
            header: true,
            delimiter: ',', // Adjust delimiter if needed
            complete: (results) => {
              const logoData = results.data.find(item => 
                item.Symbol?.trim() === stock.Symbol?.trim()
              );
              
              if (logoData?.LogoURL) {
                setLogoURL(logoData.LogoURL);
              } else {
                setLogoURL('stock.avif'); // fallback image
              }
            },
            error: (error) => {
              console.error('Error parsing logo CSV:', error);
              setLogoURL('stock.avif'); // fallback image on error
            }
          });
        } catch (error) {
          console.error('Error fetching logo:', error);
          setLogoURL('stock.avif'); // fallback image on error
        }
      }
    };

    fetchLogo();
  }, [stock?.Symbol]);

  useEffect(() => {
    const fetchSimilarStocks = async () => {
      if (stock?.Symbol) {
        try {
          // Fetch both CSV files
          const [similarResponse, logoResponse] = await Promise.all([
            fetch('/similar_stock.csv'),
            fetch('/sp500_company_logos.csv')
          ]);

          const [similarText, logoText] = await Promise.all([
            similarResponse.text(),
            logoResponse.text()
          ]);

          // Parse similar stocks CSV
          Papa.parse<SimilarStockData>(similarText, {
            header: true,
            delimiter: '|',
            complete: async (similarResults) => {
              // Get similar stocks for current stock
              const matchingStocks = similarResults.data.filter(
                item => item.stock === stock.Symbol
              );

              // Parse logo CSV
              Papa.parse<LogoData>(logoText, {
                header: true,
                delimiter: ',',
                complete: (logoResults) => {
                  const stocksWithLogos = matchingStocks.map(similarStock => {
                    const logoData = logoResults.data.find(
                      logo => logo.Symbol === similarStock.similarStock
                    );
                    
                    return {
                      symbol: similarStock.similarStock,
                      company: similarStock.Company.trim(),
                      description: similarStock.Description.trim(),
                      logoUrl: logoData?.LogoURL || 'stock.avif'
                    };
                  });

                  setSimilarStocks(stocksWithLogos);
                }
              });
            }
          });

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
          logo_url: stock.LogoURL || '',
          price: parseFloat(stock.marketCap) || 0,
          dividend_yield: parseFloat(stock.dividendYield) || 0,
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
                    {companyProfile?.longBusinessSummary || 'No description available.'}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </Button>
                  </div>
                  <Button variant="outline" size="sm">
                    + Add Comparison
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="font-medium">{stock.Symbol}</span>
                </div>
                <div>
                  <span className="font-medium">{currentYield.toFixed(2)}%</span>
                  <span className={`ml-2 ${yieldChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {yieldChange >= 0 ? '+' : ''}{yieldChange.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="rounded-lg h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filterDataByPeriod(selectedPeriod)}
                    margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => `${value.toFixed(2)}%`}
                      axisLine={false}
                      tickLine={false}
                      stroke="#666"
                      fontSize={12}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: "#f97316" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case "Payout":
        const lastPayout = payoutData[0]?.value || 0;
        const healthyPayoutRange = { min: 40, max: 60 };
        const isHealthyPayout = lastPayout >= healthyPayoutRange.min && lastPayout <= healthyPayoutRange.max;
        const isHighPayout = lastPayout > healthyPayoutRange.max;
        
        return (
          <div >
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2 text-white">Payout Ratio Analysis</h3>
              <div className={`text-2xl font-bold mb-4 ${
                isHealthyPayout ? 'text-yellow-500' : 
                isHighPayout ? 'text-red-500' : 'text-green-500'
              }`}>
                {lastPayout.toFixed(2)}%
              </div>
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
        );

    
      case "Dividend History":
        return (
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
  barCategoryGap={15} 
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
        );

      case 'Analyst Ratings':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Analyst Ratings</span>
                </div>
                <div className="flex items-center gap-2">
                  <UpDown />
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
      <DialogContent className={`max-w-6xl mx-auto mt-6 mb-6 p-5 rounded-lg shadow-lg text-sm overflow-y-auto max-h-[80vh] ${theme === "dark" ? ' text-white' : ' text-white'}`}>
      <DialogHeader>
  <DialogTitle className="text-2xl font-bold flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg">
    <div className="flex items-center gap-6 flex-wrap">
      {/* Logo and Stock Info */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 bg-center bg-no-repeat bg-contain rounded-lg border border-gray-300 dark:border-gray-700 shadow-md"
          style={{
            backgroundImage: `url(${logoURL || 'stock.avif'})`,
            backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6'
          }}
        />
        <div className="flex flex-col">
  {/* Symbol & Save Button on the Same Row */}
  <div className="flex items-center gap-[2px]">
    <div className="text-lg text-gray-600 dark:text-gray-300">{stock.Symbol}</div>
    <button
      onClick={handleSaveStock}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 ml-4 py-2 rounded-full transition ${
        isLoading ? 'opacity-50 cursor-not-allowed ' : ''
      } ${
        isSaved
          ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
      }`}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Heart
          className={`w-5 h-5 transition ${
            isSaved ? 'fill-red-500 stroke-red-500' : 'stroke-current'
          }`}
        />
      )}
      <span className="text-sm font-medium">
        {isLoading ? 'Processing...' : isSaved ? 'Saved' : 'Save'}
      </span>
    </button>
  </div>

  {/* Short Name Below Symbol & Save Button */}
  <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
    {stock?.title}
  </div>
</div>

        
      </div>

      {/* Ranking Section */}
      {rankingCSVData && (
        <div className="flex gap-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500">Score</span>
            <span className={`text-lg font-bold ${
              Number(rankingCSVData.score) >= 0.7 ? 'text-green-500' : 
              Number(rankingCSVData.score) >= 0.4 ? 'text-yellow-500' : 
              'text-red-500'
            }`}>
              {(Number(rankingCSVData.score) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500">Sector</span>
            <span className="text-sm font-medium text-blue-400">
              {rankingCSVData.sector || 'N/A'}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500">Industry</span>
            <span className="text-sm font-medium text-purple-400">
              {rankingCSVData.industry || 'N/A'}
            </span>
          </div>
        </div>
      )}

      {/* Mini Chart */}
      <div className="h-14 w-28">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={miniChartData}>
            <Line type="monotone" dataKey="value" stroke="#2563eb" dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="text-xs text-gray-500 text-center">Last quarter data</div>
      </div>
    </div>

    {/* Right Section */}
    <div className="text-right flex flex-col items-end gap-3">
      <div className="text-xs text-gray-500">{currentDateTime.toLocaleString('en-US')}</div>

      {/* Similar Companies */}
      <div className="relative flex flex-col items-end space-y-3 mt-2">
        <div className="flex items-center space-x-2 mb-2">
          <div className="text-sm font-medium">Similar Companies</div>
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-500 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">
                <AlertCircle className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4 text-sm rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <p className="font-semibold text-lg">📈 Similar Stocks</p>
              <p className="mt-2">Click on any company to view more details.</p>
            </PopoverContent>
          </Popover>
        </div>

        {/* Similar Companies Grid */}
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {similarStocks.map((similarStock) => (
            <div
              key={similarStock.symbol}
              onClick={() => setSelectedStock(similarStock)}
              className="w-12 h-16 flex flex-col items-center p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition cursor-pointer"
            >
              <div
                className="w-10 h-10 bg-center bg-no-repeat bg-contain rounded-lg"
                style={{ backgroundImage: `url(${similarStock.logoUrl})` }}
              />
              <div className="text-sm font-semibold text-center">{similarStock.symbol}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </DialogTitle>
</DialogHeader>



        <div className="mt-6">
          {stock && (
            <DividendCountdown symbol={stock.Symbol} />
          )}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <Card className={`mt-4 p-4 ${theme === "dark" ? 'bg-gray-800' : 'bg-black'}`} >
              
              <div className="grid grid-cols-2 gap-4">
                {/* Annual Dividend */}
                <div className="border-r border-gray-700 pr-4">
                  <div className="text-xs text-gray-400 mb-1">Annual</div>
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-green-500">
                        {latestDividends.annual 
                          ? `$${Number(latestDividends.annual).toFixed(2)}` 
                          : 'N/A'}
                      </span>
                      
                    </div>
                    
                  </div>
                </div>

                {/* Quarterly Dividend */}
                <div className="pl-4">
                  <div className="text-xs text-gray-400 mb-1">Quarterly</div>
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-blue-500">
                        {latestDividends.quarterly 
                          ? `$${Number(latestDividends.quarterly).toFixed(2)}` 
                          : 'N/A'}
                      </span>
                      
                    </div>
                    
                  </div>
                </div>
              </div>
            </Card>
            <Card className={`mt-4 p-4 ${theme === "dark" ? 'bg-gray-800' : 'bg-black'}`}>
              <div className="text-xs text-gray-600 mb-2">Rank in Cohert</div>
              <div className="font-bold space-y-2">
                {rankingCSVData ? (
                  <>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg text-blue-500">#{rankingCSVData.rank}</span>
                        
                      </div>
                      
                    </div>
                    
                  </>
                ) : (
                  <div className="text-gray-500 text-lg">
                    0
                  </div>
                )}
              </div>
            </Card>
            <Card className={`mt-4 p-4 ${theme === "dark" ? 'bg-gray-800' : 'bg-black'}`}>
              <div className="text-sm text-gray-600">Next raise expectations
              </div>
              <div className="text-lg font-bold">$.08 on 11/30/2025
              </div>
            </Card>
            <Card className={`mt-4 p-4 ${theme === "dark" ? 'bg-gray-800' : 'bg-black'}`}>
              <div className="text-sm text-gray-600">Current Status</div>
              <div className="text-lg font-bold">Neutral</div>
            </Card>
            <Card className={`mt-4 p-4 ${theme === "dark" ? 'bg-gray-800' : 'bg-black'}`}>
              <div className="text-sm text-gray-600">Regulatory Impact</div>
              <div className="text-lg font-bold">High</div>
            </Card>
          </div>

         

          <div className={`relative border rounded-lg p-4 ${theme === "dark" ? 'border-gray-700' : 'border-gray-200'}`}>
  {/* Notification Box in Top Right Corner */}
  <div className="absolute top-2 right-2 flex flex-col items-start gap-2 p-4 rounded-md shadow-md w-[500px]">
  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
    Stay updated with important notifications!
  </p>
  <div className="flex w-full items-center gap-3">
    <Input
      type="email"
      placeholder="Enter your email"
      className={`w-full p-3 rounded-lg border text-sm focus:ring-2 transition ${
        theme === 'dark'
          ? 'bg-transparent text-white border-gray-600 focus:ring-blue-400'
          : 'bg-transparent text-black border-gray-400 focus:ring-blue-500'
      }`}
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      disabled={isSubmitting}
    />
    <Button
      onClick={handleSubscribe}
      disabled={isSubmitting}
      className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
    >
      {isSubmitting ? "Subscribing..." : "Subscribe"}
    </Button>
  </div>
</div>


  
  {/* Tabs in a single row */}
  <div className="flex gap-4 mt-8 overflow-x-auto">
    {["Company", "Dividend History", "Dividend Yield", "Payout", "Overall", "Analyst Ratings"].map((tab) => (
      <div 
        key={tab} 
        className={`flex flex-col items-center cursor-pointer ${
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

        {/* Stock Details Dialog */}
        <Dialog open={!!selectedStock} onOpenChange={() => setSelectedStock(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 bg-center bg-no-repeat bg-contain rounded-lg"
                  style={{ backgroundImage: `url(${selectedStock?.logoUrl})` }}
                />
                <div>
                  <div className="text-lg font-bold">{selectedStock?.symbol}</div>
                  <div className="text-sm text-gray-500">{selectedStock?.company}</div>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="p-4">
              <div className="text-sm text-gray-600 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                {selectedStock?.description || 'No description available'}
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                Estimated Revenue 2024: ${selectedStock?.revenue}B
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default StockDetailsDialog;
