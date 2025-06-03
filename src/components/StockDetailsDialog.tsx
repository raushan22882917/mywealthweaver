
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Heart, TrendingUp, TrendingDown, DollarSign, Calendar, Building, Globe, Phone, MapPin, AlertTriangle, CheckCircle, XCircle, Star, BookOpen, BarChart3, LineChart, Activity, Target, Shield, Zap, Award } from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format } from "date-fns";
import { toast } from "sonner";

interface StockDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symbol: string;
}

interface CompanyProfile {
  symbol: string;
  short_name: string;
  long_business_summary: string;
  sector: string;
  industry: string;
  full_time_employees: number;
  website: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  market_cap: number;
  trailing_pe: number;
  forward_pe: number;
  peg_ratio: number;
  book_value: number;
  price_to_book: number;
  enterprise_value: number;
  total_revenue: number;
  revenue_per_share: number;
  revenue_growth: number;
  earnings_growth: number;
  total_cash: number;
  total_debt: number;
  debt_to_equity: number;
  current_ratio: number;
  return_on_assets: number;
  return_on_equity: number;
  profit_margins: number;
  operating_margins: number;
  dividend_rate: number;
  dividend_yield: number;
  ex_dividend_date: string;
  last_dividend_date: string;
}

interface RankingDisplayData {
  rank: number;
  score: number;
  sector: string;
  industry: string;
  industryRank: number;
  totalStocks: number;
  totalIndustryStocks: number;
}

const StockDetailsDialog: React.FC<StockDetailsDialogProps> = ({ open, onOpenChange, symbol }) => {
  const [loading, setLoading] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [rankingData, setRankingData] = useState<RankingDisplayData | null>(null);
  const [similarCompanies, setSimilarCompanies] = useState<any[]>([]);
  const [dividendData, setDividendData] = useState<any[]>([]);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();
  }, []);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('symbol', symbol)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const profile: CompanyProfile = {
            symbol: data.symbol,
            short_name: data.short_name || '',
            long_business_summary: data.long_business_summary || '',
            sector: data.sector || '',
            industry: data.industry || '',
            full_time_employees: data.full_time_employees || 0,
            website: data.website || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            zip: data.zip || '',
            country: data.country || '',
            market_cap: data.market_cap || 0,
            trailing_pe: data.trailing_pe || 0,
            forward_pe: data.forward_pe || 0,
            peg_ratio: data.peg_ratio || 0,
            book_value: data.book_value || 0,
            price_to_book: data.price_to_book || 0,
            enterprise_value: data.enterprise_value || 0,
            total_revenue: data.total_revenue || 0,
            revenue_per_share: data.revenue_per_share || 0,
            revenue_growth: data.revenue_growth || 0,
            earnings_growth: data.earnings_growth || 0,
            total_cash: data.total_cash || 0,
            total_debt: data.total_debt || 0,
            debt_to_equity: data.debt_to_equity || 0,
            current_ratio: data.current_ratio || 0,
            return_on_assets: data.return_on_assets || 0,
            return_on_equity: data.return_on_equity || 0,
            profit_margins: data.profit_margins || 0,
            operating_margins: data.operating_margins || 0,
            dividend_rate: data.dividend_rate || 0,
            dividend_yield: data.dividend_yield || 0,
            ex_dividend_date: data.ex_dividend_date || '',
            last_dividend_date: data.last_dividend_date || ''
          };
          setCompanyProfile(profile);
        }
      } catch (error) {
        console.error('Error fetching company profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchCompanyProfile();
    }
  }, [symbol]);

  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        const { data, error } = await supabase
          .from('top_stocks')
          .select('*')
          .eq('symbol', symbol)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const { count: totalStocks } = await supabase
            .from('top_stocks')
            .select('*', { count: 'exact', head: true });

          const { count: totalIndustryStocks } = await supabase
            .from('top_stocks')
            .select('*', { count: 'exact', head: true })
            .eq('industry', data.industry);

          setRankingData({
            rank: Number(data.Rank) || 0,
            score: Number(data.Score) || 0,
            sector: data.sector || '',
            industry: data.industry || '',
            industryRank: Number(data.Industry_Rank) || 0,
            totalStocks: totalStocks || 0,
            totalIndustryStocks: totalIndustryStocks || 0
          });
        }
      } catch (error) {
        console.error('Error fetching ranking data:', error);
      }
    };

    if (symbol) {
      fetchRankingData();
    }
  }, [symbol]);

  useEffect(() => {
    const fetchSimilarCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('company_profiles')
          .select('symbol, short_name, sector, industry')
          .eq('sector', companyProfile?.sector)
          .limit(5);

        if (error) throw error;

        setSimilarCompanies(data || []);
      } catch (error) {
        console.error('Error fetching similar companies:', error);
      }
    };

    if (companyProfile?.sector) {
      fetchSimilarCompanies();
    }
  }, [companyProfile?.sector]);

  useEffect(() => {
    const fetchDividendData = async () => {
      try {
        const { data, error } = await supabase
          .from('dividendsymbol')
          .select('*')
          .eq('symbol', symbol)
          .limit(5);

        if (error) throw error;

        setDividendData(data || []);
      } catch (error) {
        console.error('Error fetching dividend data:', error);
      }
    };

    if (symbol) {
      fetchDividendData();
    }
  }, [symbol]);

  // Remove price history fetch since pricehistory table doesn't exist
  useEffect(() => {
    // Price history functionality disabled - table doesn't exist
    setPriceHistory([]);
  }, [symbol]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('saved_stocks')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('symbol', symbol)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        setIsFavorite(!!data);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    if (symbol && session?.user?.id) {
      checkFavoriteStatus();
    }
  }, [symbol, session]);

  const handleSaveToFavorites = async () => {
    try {
      if (!session?.user?.id) {
        toast.error("Please sign in to save stocks to favorites");
        return;
      }

      const savedStock = {
        user_id: session.user.id,
        symbol: symbol,
        company_name: companyProfile?.short_name || symbol,
        price: 0,
        dividend_yield: 0,
        is_favorite: true,
        LogoURL: "/logo.png"
      };

      const { error } = await supabase
        .from('saved_stocks')
        .insert([savedStock]);

      if (error) throw error;

      setIsFavorite(true);
      toast.success("Stock saved to favorites!");
    } catch (error) {
      console.error('Error saving to favorites:', error);
      toast.error("Failed to save stock to favorites");
    }
  };

  const handleRemoveFromFavorites = async () => {
    try {
      if (!session?.user?.id) {
        toast.error("Please sign in to remove stocks from favorites");
        return;
      }

      const { error } = await supabase
        .from('saved_stocks')
        .delete()
        .eq('user_id', session.user.id)
        .eq('symbol', symbol);

      if (error) throw error;

      setIsFavorite(false);
      toast.success("Stock removed from favorites!");
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast.error("Failed to remove stock from favorites");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-gray-700 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">{symbol}</span>
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">{symbol}</DialogTitle>
              <p className="text-gray-400">{companyProfile?.short_name || "Loading..."}</p>
            </div>
          </div>
          <Button
            onClick={isFavorite ? handleRemoveFromFavorites : handleSaveToFavorites}
            variant="outline"
            size="sm"
            className={`${isFavorite ? 'bg-red-500 hover:bg-red-600' : 'bg-transparent hover:bg-gray-700'} border-gray-600`}
          >
            <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-white' : ''}`} />
            {isFavorite ? 'Saved' : 'Save'}
          </Button>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList className="bg-transparent">
                <TabsTrigger value="profile" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">Company Profile</TabsTrigger>
                <TabsTrigger value="ranking" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">Ranking</TabsTrigger>
                <TabsTrigger value="dividends" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">Dividends</TabsTrigger>
                <TabsTrigger value="financials" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">Financials</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-2">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Company Information</CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-300 space-y-2">
                    <p><strong>Sector:</strong> {companyProfile?.sector || "N/A"}</p>
                    <p><strong>Industry:</strong> {companyProfile?.industry || "N/A"}</p>
                    <p><strong>Employees:</strong> {companyProfile?.full_time_employees || "N/A"}</p>
                    <p><strong>Summary:</strong> {companyProfile?.long_business_summary || "N/A"}</p>
                    <p><strong>Website:</strong> <a href={companyProfile?.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{companyProfile?.website}</a></p>
                    <p><strong>Phone:</strong> {companyProfile?.phone || "N/A"}</p>
                    <p><strong>Address:</strong> {companyProfile?.address || "N/A"}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-300 space-y-2">
                    <p><strong>Market Cap:</strong> {companyProfile?.market_cap ? `$${companyProfile.market_cap.toLocaleString()}` : "N/A"}</p>
                    <p><strong>Trailing P/E:</strong> {companyProfile?.trailing_pe || "N/A"}</p>
                    <p><strong>Forward P/E:</strong> {companyProfile?.forward_pe || "N/A"}</p>
                    <p><strong>Book Value:</strong> {companyProfile?.book_value || "N/A"}</p>
                    <p><strong>Price to Book:</strong> {companyProfile?.price_to_book || "N/A"}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ranking">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Ranking Data</CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-300 space-y-2">
                    {rankingData ? (
                      <>
                        <p><strong>Overall Rank:</strong> {rankingData.rank || "N/A"} out of {rankingData.totalStocks || "N/A"} stocks</p>
                        <p><strong>Score:</strong> {rankingData.score || "N/A"}</p>
                        <p><strong>Sector:</strong> {rankingData.sector || "N/A"}</p>
                        <p><strong>Industry:</strong> {rankingData.industry || "N/A"}</p>
                        <p><strong>Industry Rank:</strong> {rankingData.industryRank || "N/A"} out of {rankingData.totalIndustryStocks || "N/A"} stocks in the industry</p>
                      </>
                    ) : (
                      <p>No ranking data available for this stock.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dividends">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Dividend Data</CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-300 space-y-2">
                    {dividendData && dividendData.length > 0 ? (
                      dividendData.map((dividend, index) => (
                        <div key={index} className="border-b border-gray-700 pb-2 mb-2 last:border-none">
                          <p><strong>Dividend:</strong> {dividend.dividend || "N/A"}</p>
                          <p><strong>Ex-Dividend Date:</strong> {dividend.exdividenddate || "N/A"}</p>
                          <p><strong>Earnings Date:</strong> {dividend.earningsdate || "N/A"}</p>
                          <p><strong>Current Price:</strong> {dividend.currentprice || "N/A"}</p>
                        </div>
                      ))
                    ) : (
                      <p>No dividend data available for this stock.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financials">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Financial Highlights</CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-300 space-y-2">
                    <p><strong>Revenue:</strong> {companyProfile?.total_revenue ? `$${companyProfile.total_revenue.toLocaleString()}` : "N/A"}</p>
                    <p><strong>Revenue Per Share:</strong> {companyProfile?.revenue_per_share || "N/A"}</p>
                    <p><strong>Revenue Growth:</strong> {companyProfile?.revenue_growth || "N/A"}</p>
                    <p><strong>Earnings Growth:</strong> {companyProfile?.earnings_growth || "N/A"}</p>
                    <p><strong>Total Cash:</strong> {companyProfile?.total_cash ? `$${companyProfile.total_cash.toLocaleString()}` : "N/A"}</p>
                    <p><strong>Total Debt:</strong> {companyProfile?.total_debt ? `$${companyProfile.total_debt.toLocaleString()}` : "N/A"}</p>
                    <p><strong>Debt to Equity:</strong> {companyProfile?.debt_to_equity || "N/A"}</p>
                    <p><strong>Current Ratio:</strong> {companyProfile?.current_ratio || "N/A"}</p>
                    <p><strong>Return on Assets:</strong> {companyProfile?.return_on_assets || "N/A"}</p>
                    <p><strong>Return on Equity:</strong> {companyProfile?.return_on_equity || "N/A"}</p>
                    <p><strong>Profit Margins:</strong> {companyProfile?.profit_margins || "N/A"}</p>
                    <p><strong>Operating Margins:</strong> {companyProfile?.operating_margins || "N/A"}</p>
                    <p><strong>Dividend Rate:</strong> {companyProfile?.dividend_rate || "N/A"}</p>
                    <p><strong>Dividend Yield:</strong> {companyProfile?.dividend_yield || "N/A"}</p>
                    <p><strong>Ex-Dividend Date:</strong> {companyProfile?.ex_dividend_date || "N/A"}</p>
                    <p><strong>Last Dividend Date:</strong> {companyProfile?.last_dividend_date || "N/A"}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StockDetailsDialog;
