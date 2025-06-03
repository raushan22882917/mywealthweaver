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
  shortName: string;
  longBusinessSummary: string;
  sector: string;
  industry: string;
  fullTimeEmployees: number;
  website: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  marketCap: number;
  trailingPE: number;
  forwardPE: number;
  pegRatio: number;
  bookValue: number;
  priceToBook: number;
  enterpriseValue: number;
  totalRevenue: number;
  revenuePerShare: number;
  revenueGrowth: number;
  earningsGrowth: number;
  totalCash: number;
  totalDebt: number;
  debtToEquity: number;
  currentRatio: number;
  returnOnAssets: number;
  returnOnEquity: number;
  profitMargins: number;
  operatingMargins: number;
  dividendRate: number;
  dividendYield: number;
  exDividendDate: string;
  lastDividendDate: string;
}

interface RankingDisplayData {
  rank: string;
  score: string;
  sector: string;
  industry: string;
  industryRank: string;
  totalStocks: string;
  totalIndustryStocks: string;
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
          .single();

        if (error) throw error;

        setCompanyProfile(data);
      } catch (error) {
        console.error('Error fetching company profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, [symbol]);

  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        const { data, error } = await supabase
          .from('top_stocks')
          .select('*')
          .eq('symbol', symbol)
          .single();

        if (error) throw error;

        const totalStocks = await supabase
          .from('top_stocks')
          .select('*', { count: 'exact' });

        const totalIndustryStocks = await supabase
          .from('top_stocks')
          .select('*', { count: 'exact' })
          .eq('Industry', data.Industry);

        setRankingData({
          rank: data.Rank,
          score: data.Score,
          sector: data.Sector,
          industry: data.Industry,
          industryRank: data.Industry_Rank,
          totalStocks: totalStocks.count,
          totalIndustryStocks: totalIndustryStocks.count
        } as RankingDisplayData);
      } catch (error) {
        console.error('Error fetching ranking data:', error);
      }
    };

    fetchRankingData();
  }, [symbol]);

  useEffect(() => {
    const fetchSimilarCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('company_profiles')
          .select('symbol, shortName, sector, industry')
          .eq('sector', companyProfile?.sector)
          .limit(5);

        if (error) throw error;

        setSimilarCompanies(data);
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

        setDividendData(data);
      } catch (error) {
        console.error('Error fetching dividend data:', error);
      }
    };

    fetchDividendData();
  }, [symbol]);

  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('pricehistory')
          .select('Date, Close')
          .eq('Symbol', symbol)
          .order('Date', { ascending: false })
          .limit(30);

        if (error) throw error;

        const formattedData = data.map(item => ({
          date: format(new Date(item.Date), 'MMM dd'),
          price: item.Close
        }));

        setPriceHistory(formattedData);
      } catch (error) {
        console.error('Error fetching price history:', error);
      }
    };

    fetchPriceHistory();
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
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        setIsFavorite(!!data);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
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
        company_name: companyProfile?.shortName || symbol,
        price: 0,
        dividend_yield: 0,
        is_favorite: true,
        logoUrl: "/logo.png"
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
              <p className="text-gray-400">{companyProfile?.shortName || "Loading..."}</p>
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
                <TabsTrigger value="pricehistory" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">Price History</TabsTrigger>
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
                    <p><strong>Employees:</strong> {companyProfile?.fullTimeEmployees || "N/A"}</p>
                    <p><strong>Summary:</strong> {companyProfile?.longBusinessSummary || "N/A"}</p>
                    <p><strong>Website:</strong> <a href={companyProfile?.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{companyProfile?.website}</a></p>
                    <p><strong>Phone:</strong> {companyProfile?.phone || "N/A"}</p>
                    <p><strong>Address:</strong> {companyProfile?.address || "N/A"}, {companyProfile?.city || "N/A"}, {companyProfile?.state || "N/A"} {companyProfile?.zip || "N/A"}, {companyProfile?.country || "N/A"}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-300 space-y-2">
                    <p><strong>Market Cap:</strong> {companyProfile?.marketCap ? `$${companyProfile.marketCap.toLocaleString()}` : "N/A"}</p>
                    <p><strong>Trailing P/E:</strong> {companyProfile?.trailingPE || "N/A"}</p>
                    <p><strong>Forward P/E:</strong> {companyProfile?.forwardPE || "N/A"}</p>
                    <p><strong>PEG Ratio:</strong> {companyProfile?.pegRatio || "N/A"}</p>
                    <p><strong>Book Value:</strong> {companyProfile?.bookValue || "N/A"}</p>
                    <p><strong>Price to Book:</strong> {companyProfile?.priceToBook || "N/A"}</p>
                    <p><strong>Enterprise Value:</strong> {companyProfile?.enterpriseValue ? `$${companyProfile.enterpriseValue.toLocaleString()}` : "N/A"}</p>
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
                        <p><strong>Overall Rank:</strong> {rankingData?.rank || "N/A"} out of {rankingData?.totalStocks || "N/A"} stocks</p>
                        <p><strong>Score:</strong> {rankingData?.score || "N/A"}</p>
                        <p><strong>Sector:</strong> {rankingData?.sector || "N/A"}</p>
                        <p><strong>Industry:</strong> {rankingData?.industry || "N/A"}</p>
                        <p><strong>Industry Rank:</strong> {rankingData?.industryRank || "N/A"} out of {rankingData?.totalIndustryStocks || "N/A"} stocks in the industry</p>
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

              <TabsContent value="pricehistory">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Price History</CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-300">
                    {priceHistory && priceHistory.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsLineChart data={priceHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                          <XAxis dataKey="date" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#374151', border: 'none', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Line type="monotone" dataKey="price" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p>No price history available for this stock.</p>
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
                    <p><strong>Revenue:</strong> {companyProfile?.totalRevenue ? `$${companyProfile.totalRevenue.toLocaleString()}` : "N/A"}</p>
                    <p><strong>Revenue Per Share:</strong> {companyProfile?.revenuePerShare || "N/A"}</p>
                    <p><strong>Revenue Growth:</strong> {companyProfile?.revenueGrowth || "N/A"}</p>
                    <p><strong>Earnings Growth:</strong> {companyProfile?.earningsGrowth || "N/A"}</p>
                    <p><strong>Total Cash:</strong> {companyProfile?.totalCash ? `$${companyProfile.totalCash.toLocaleString()}` : "N/A"}</p>
                    <p><strong>Total Debt:</strong> {companyProfile?.totalDebt ? `$${companyProfile.totalDebt.toLocaleString()}` : "N/A"}</p>
                    <p><strong>Debt to Equity:</strong> {companyProfile?.debtToEquity || "N/A"}</p>
                    <p><strong>Current Ratio:</strong> {companyProfile?.currentRatio || "N/A"}</p>
                    <p><strong>Return on Assets:</strong> {companyProfile?.returnOnAssets || "N/A"}</p>
                    <p><strong>Return on Equity:</strong> {companyProfile?.returnOnEquity || "N/A"}</p>
                    <p><strong>Profit Margins:</strong> {companyProfile?.profitMargins || "N/A"}</p>
                    <p><strong>Operating Margins:</strong> {companyProfile?.operatingMargins || "N/A"}</p>
                    <p><strong>Dividend Rate:</strong> {companyProfile?.dividendRate || "N/A"}</p>
                    <p><strong>Dividend Yield:</strong> {companyProfile?.dividendYield || "N/A"}</p>
                    <p><strong>Ex-Dividend Date:</strong> {companyProfile?.exDividendDate || "N/A"}</p>
                    <p><strong>Last Dividend Date:</strong> {companyProfile?.lastDividendDate || "N/A"}</p>
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
