import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  TrendingUp, TrendingDown, Star, StarOff, DollarSign,
  Calendar, Shield, Building, Globe, ExternalLink,
  Bookmark, BookmarkCheck, Target, AlertTriangle,
  BarChart3, PieChart, Activity, Zap, Award, Clock
} from 'lucide-react';

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
  companyName?: string;
  exchange?: string;
  industry?: string;
  sector?: string;
  description?: string;
  ceo?: string;
  employees?: number;
  website?: string;
  price?: number;
  beta?: number;
  volAvg?: number;
  mktCap?: number;
  lastDiv?: number;
  range?: string;
  changes?: number;
  changesPercentage?: number;
  dcfDiff?: number;
  dcf?: number;
  image?: string;
}

interface SavedStock {
  id?: string;
  symbol: string;
  name: string;
  logoUrl?: string;
  userId?: string;
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

const StockDetailsDialog: React.FC<StockDetailsDialogProps> = ({ stock, isOpen, setIsOpen }) => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [rankings, setRankings] = useState<RankingDisplayData | null>(null);
  const [companyData, setCompanyData] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && stock) {
      fetchStockDetails();
      checkIfStockIsSaved();
    }
  }, [isOpen, stock]);

  const fetchStockDetails = async () => {
    if (!stock) return;
    
    setLoading(true);
    try {
      // Fetch company profile from API
      const response = await fetch(`/api/stock/profile/${stock.Symbol}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }

      // Fetch company rankings
      const rankingsResponse = await fetch(`/api/stock/rankings/${stock.Symbol}`);
      if (rankingsResponse.ok) {
        const rankingsData = await rankingsResponse.json();
        setRankings(rankingsData);
      }

      // Fetch additional company data
      const { data: companyData, error } = await supabase
        .from('companies')
        .select('*')
        .eq('symbol', stock.Symbol)
        .maybeSingle();

      if (!error && companyData) {
        setCompanyData(companyData);
      }
    } catch (error) {
      console.error('Error fetching stock details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfStockIsSaved = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('saved_stocks')
        .select('*')
        .eq('symbol', stock.Symbol)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!error && data) {
        setIsSaved(true);
      } else {
        setIsSaved(false);
      }
    } catch (error) {
      console.error('Error checking if stock is saved:', error);
    }
  };

  const handleSaveStock = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save stocks",
          variant: "destructive",
        });
        return;
      }

      if (isSaved) {
        const { error } = await supabase
          .from('saved_stocks')
          .delete()
          .eq('symbol', stock.Symbol)
          .eq('user_id', session.user.id);

        if (error) throw error;
        
        setIsSaved(false);
        toast({
          title: "Stock Removed",
          description: `${stock.Symbol} has been removed from your watchlist`,
        });
      } else {
        const stockData: SavedStock = {
          symbol: stock.Symbol,
          name: stock.title,
          logoUrl: profile?.image || '',
        };

        const { error } = await supabase
          .from('saved_stocks')
          .insert([{
            ...stockData,
            user_id: session.user.id
          }]);

        if (error) throw error;
        
        setIsSaved(true);
        toast({
          title: "Stock Saved",
          description: `${stock.Symbol} has been added to your watchlist`,
        });
      }
    } catch (error) {
      console.error('Error saving stock:', error);
      toast({
        title: "Error",
        description: "Failed to save stock. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return 'N/A';
    
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else {
      return `$${marketCap.toLocaleString()}`;
    }
  };

  const formatLargeNumber = (num?: number) => {
    if (num === undefined) return 'N/A';
    return num.toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {profile?.image && (
                <img 
                  src={profile.image} 
                  alt={`${stock.Symbol} logo`}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">{stock.Symbol}</h2>
                <p className="text-gray-400">{stock.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSaveStock}
                variant="outline"
                size="sm"
                className="border-gray-600 hover:bg-gray-800"
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 mr-2" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
              <Button
                onClick={() => navigate(`/stock/${stock.Symbol}`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                View Details
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-gray-800">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="financials">Financials</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="news">News</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Building className="mr-2 h-5 w-5 text-blue-400" />
                        Company Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {profile ? (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Exchange:</span>
                              <span className="text-white">{profile.exchange || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Industry:</span>
                              <span className="text-white">{profile.industry || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Sector:</span>
                              <span className="text-white">{profile.sector || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">CEO:</span>
                              <span className="text-white">{profile.ceo || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Employees:</span>
                              <span className="text-white">{formatLargeNumber(profile.employees)}</span>
                            </div>
                            {profile.website && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Website:</span>
                                <a 
                                  href={profile.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline flex items-center"
                                >
                                  Visit <ExternalLink className="ml-1 h-3 w-3" />
                                </a>
                              </div>
                            )}
                          </div>
                          {profile.description && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Description:</h4>
                              <p className="text-sm text-gray-300 line-clamp-4">{profile.description}</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-400">No company profile available</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5 text-green-400" />
                        Market Data
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {profile ? (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Price:</span>
                            <span className="text-white">${profile.price?.toFixed(2) || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Change:</span>
                            <span className={profile.changes && profile.changes > 0 ? 'text-green-400' : 'text-red-400'}>
                              {profile.changes ? `${profile.changes > 0 ? '+' : ''}${profile.changes.toFixed(2)} (${profile.changesPercentage?.toFixed(2)}%)` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Market Cap:</span>
                            <span className="text-white">{formatMarketCap(profile.mktCap)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Beta:</span>
                            <span className="text-white">{profile.beta?.toFixed(2) || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Avg. Volume:</span>
                            <span className="text-white">{formatLargeNumber(profile.volAvg)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">52-Week Range:</span>
                            <span className="text-white">{profile.range || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Last Dividend:</span>
                            <span className="text-green-400">${profile.lastDiv?.toFixed(4) || 'N/A'}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-400">No market data available</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {rankings && (
                  <Card className="bg-gray-800 border-gray-700 mt-6">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Award className="mr-2 h-5 w-5 text-yellow-400" />
                        Stock Rankings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-700 rounded-lg p-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400 mb-1">{rankings.rank}</div>
                            <div className="text-sm text-gray-300">Overall Rank</div>
                            <div className="text-xs text-gray-400 mt-1">out of {rankings.totalStocks} stocks</div>
                          </div>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-400 mb-1">{rankings.industryRank}</div>
                            <div className="text-sm text-gray-300">Industry Rank</div>
                            <div className="text-xs text-gray-400 mt-1">in {rankings.industry}</div>
                          </div>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-purple-400 mb-1">{rankings.score}</div>
                            <div className="text-sm text-gray-300">Quality Score</div>
                            <div className="text-xs text-gray-400 mt-1">out of 100</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="financials" className="mt-6">
                <div className="grid grid-cols-1 gap-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <DollarSign className="mr-2 h-5 w-5 text-green-400" />
                        Financial Highlights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-gray-400">Financial data is available in the full stock details page.</p>
                        <Button
                          onClick={() => navigate(`/stock/${stock.Symbol}`)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          View Full Financial Data
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="mt-6">
                <div className="grid grid-cols-1 gap-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Target className="mr-2 h-5 w-5 text-blue-400" />
                        Analyst Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-gray-400">Analyst recommendations are available in the full stock details page.</p>
                        <Button
                          onClick={() => navigate(`/stock/${stock.Symbol}`)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          View Full Analysis
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="news" className="mt-6">
                <div className="grid grid-cols-1 gap-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Activity className="mr-2 h-5 w-5 text-yellow-400" />
                        Recent News
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-gray-400">Latest news is available in the full stock details page.</p>
                        <Button
                          onClick={() => navigate(`/stock/${stock.Symbol}`)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          View All News
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockDetailsDialog;
