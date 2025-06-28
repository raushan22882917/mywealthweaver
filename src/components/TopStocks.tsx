import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from '@/components/ui/loader';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StockDetailsDialog from '@/components/StockDetailsDialog';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Search, Star, BarChart2, Award, TrendingUp, Eye, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Stock {
  industry: string;
  sector: string;
  symbol: string;
  Score: number;
  Rank: number;
}

interface SavedStock {
  id?: string;
  user_id: string;
  symbol: string;
  company_name: string;
  is_favorite: boolean;
}

const TopStocks: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [savedStocks, setSavedStocks] = useState<SavedStock[]>([]);
  const { toast } = useToast();
  const itemsPerPage = 15;

  useEffect(() => {
    fetchTopStocks();
    fetchSavedStocks();
  }, []);

  const fetchTopStocks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('top_stocks')
        .select('*')
        .order('Rank', { ascending: true })
        .order('Score', { ascending: false });

      if (error) throw error;
      setStocks(data);
    } catch (err: Error | unknown) {
      console.error('Error fetching top stocks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load top stocks');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedStocks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('saved_stocks')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setSavedStocks(data || []);
    } catch (err) {
      console.error('Error fetching saved stocks:', err);
    }
  };

  const isStockSaved = (symbol: string) => {
    return savedStocks.some(stock => stock.symbol === symbol);
  };

  const toggleSaveStock = async (stock: Stock) => {
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

      const isSaved = isStockSaved(stock.symbol);

      if (isSaved) {
        // Remove the stock if it's already saved
        const { error } = await supabase
          .from('saved_stocks')
          .delete()
          .eq('user_id', user.id)
          .eq('symbol', stock.symbol);

        if (error) {
          console.error('Error removing stock:', error);
          toast({
            title: "Error",
            description: error.message || "Failed to remove stock from watchlist",
            variant: "destructive",
          });
          return;
        }

        // Update local state
        setSavedStocks(savedStocks.filter(s => s.symbol !== stock.symbol));

        toast({
          title: "Success",
          description: `${stock.symbol} removed from watchlist`,
        });
      } else {
        // Save new stock
        const stockData: SavedStock = {
          user_id: user.id,
          symbol: stock.symbol,
          company_name: stock.symbol, // Using symbol as company name since we don't have it
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

        // Update local state
        setSavedStocks([...savedStocks, stockData]);

        toast({
          title: "Success",
          description: `${stock.symbol} saved to watchlist`,
        });
      }
    } catch (error) {
      console.error('Error saving stock:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const industries = Array.from(new Set(stocks.map((s) => s.industry)));
  const sectors = Array.from(new Set(stocks.filter((s) => !industryFilter || s.industry === industryFilter).map((s) => s.sector)));

  const filteredStocks = stocks.filter(
    (stock) =>
      (!industryFilter || stock.industry === industryFilter) &&
      (!sectorFilter || stock.sector === sectorFilter) &&
      (stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stocksByRank = filteredStocks.reduce((acc, stock) => {
    const rank = stock.Rank || 999;
    if (!acc[rank]) acc[rank] = [];
    acc[rank].push(stock);
    return acc;
  }, {} as Record<number, Stock[]>);

  const sortedRanks = Object.keys(stocksByRank)
    .map(Number)
    .sort((a, b) => a - b);

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500 text-black";
    if (rank === 3) return "bg-gradient-to-r from-amber-600 to-amber-800 text-white";
    if (rank <= 10) return "bg-gradient-to-r from-blue-500 to-blue-700 text-white";
    if (rank <= 50) return "bg-gradient-to-r from-green-500 to-green-700 text-white";
    return "bg-gradient-to-r from-gray-600 to-gray-800 text-white";
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-blue-400";
    if (score >= 4) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="flex flex-col bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <Award className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Top Performing Stocks
              </h1>
              <p className="text-gray-400 text-lg">Discover the market's highest-ranked performers with real-time analysis</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#242938] border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Total Stocks</p>
                    <p className="text-2xl font-bold text-white">{stocks.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#242938] border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Filter className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Industries</p>
                    <p className="text-2xl font-bold text-white">{industries.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#242938] border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Star className="h-8 w-8 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Saved Stocks</p>
                    <p className="text-2xl font-bold text-white">{savedStocks.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#242938] border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart2 className="h-8 w-8 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Filtered Results</p>
                    <p className="text-2xl font-bold text-white">{filteredStocks.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters Section */}
        <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#242938] border-gray-700/50 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by symbol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#151a27] border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <Select onValueChange={(value) => setIndustryFilter(value === "all" ? null : value)} value={industryFilter || "all"}>
                <SelectTrigger className="w-[200px] bg-[#151a27] border-gray-600 text-gray-200">
                  <SelectValue placeholder="Filter by Industry" />
                </SelectTrigger>
                <SelectContent className="bg-[#151a27] border-gray-600">
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setSectorFilter(value === "all" ? null : value)} value={sectorFilter || "all"} disabled={!industryFilter}>
                <SelectTrigger className="w-[200px] bg-[#151a27] border-gray-600 text-gray-200">
                  <SelectValue placeholder="Filter by Sector" />
                </SelectTrigger>
                <SelectContent className="bg-[#151a27] border-gray-600">
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        {isLoading ? (
          <div className="flex justify-center my-12">
            <Loader message="Loading top stocks..." />
          </div>
        ) : error ? (
          <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#242938] border-red-500/50">
            <CardContent className="text-center py-12">
              <p className="text-red-400 text-lg">{error}</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#242938] border-gray-700/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart2 className="h-6 w-6 text-primary" />
                Market Leaders ({filteredStocks.length} stocks)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 bg-[#151a27]">
                      <TableHead className="text-gray-300 font-semibold">Rank</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Symbol</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Industry</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Sector</TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">Score</TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">Performance</TableHead>
                      <TableHead className="text-gray-300 font-semibold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedRanks.map(rank => (
                      <React.Fragment key={`rank-${rank}`}>
                        {stocksByRank[rank]
                          .filter((_, index) => {
                            const totalBefore = sortedRanks
                              .filter(r => r < rank)
                              .reduce((sum, r) => sum + stocksByRank[r].length, 0);
                            const startIndex = (currentPage - 1) * itemsPerPage;
                            const endIndex = currentPage * itemsPerPage - 1;
                            return totalBefore + index >= startIndex && totalBefore + index <= endIndex;
                          })
                          .map((stock) => (
                            <TableRow 
                              key={stock.symbol} 
                              className="border-gray-700/50 hover:bg-[#212738] transition-all duration-200 group"
                            >
                              <TableCell className="py-4">
                                <Badge className={`font-bold text-sm px-3 py-1 ${getRankBadgeColor(rank)}`}>
                                  #{rank}
                                </Badge>
                              </TableCell>
                              
                              <TableCell className="py-4">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSaveStock(stock);
                                    }}
                                    className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                                  >
                                    <Star
                                      className={`h-5 w-5 transition-colors ${
                                        isStockSaved(stock.symbol) 
                                          ? 'fill-yellow-400 text-yellow-400' 
                                          : 'text-gray-400 hover:text-yellow-400'
                                      }`}
                                    />
                                  </button>
                                  <div
                                    className="cursor-pointer"
                                    onClick={() => setSelectedStock(stock)}
                                  >
                                    <span className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">
                                      {stock.symbol}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              
                              <TableCell className="py-4">
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 font-medium">
                                  {stock.industry}
                                </Badge>
                              </TableCell>
                              
                              <TableCell className="py-4">
                                <span className="text-gray-300 font-medium">{stock.sector}</span>
                              </TableCell>
                              
                              <TableCell className="text-right py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <BarChart2 className="h-4 w-4 text-blue-400" />
                                  <span className={`font-bold text-lg ${getScoreColor(stock.Score || 0)}`}>
                                    {stock.Score?.toFixed(2) || 'N/A'}
                                  </span>
                                </div>
                              </TableCell>
                              
                              <TableCell className="text-right py-4">
                                <div className="w-full max-w-[120px] ml-auto">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-gray-400">Performance</span>
                                    <span className="text-xs font-semibold text-gray-300">
                                      {Math.min(100, (stock.Score || 0) * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                                    <div
                                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-1000"
                                      style={{ width: `${Math.min(100, (stock.Score || 0) * 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </TableCell>
                              
                              <TableCell className="text-center py-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedStock(stock)}
                                  className="text-gray-400 hover:text-white hover:bg-blue-600/20 transition-all"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        }
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center p-6 border-t border-gray-700/50 bg-[#151a27]">
                <div className="text-sm text-gray-400">
                  Showing <span className="font-medium text-white">{Math.min(filteredStocks.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{' '}
                  <span className="font-medium text-white">{Math.min(filteredStocks.length, currentPage * itemsPerPage)}</span> of{' '}
                  <span className="font-medium text-white">{filteredStocks.length}</span> stocks
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="bg-[#1a1f2e] border-gray-600 text-gray-300 hover:bg-[#242938] hover:text-white disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium text-gray-300 px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="bg-[#1a1f2e] border-gray-600 text-gray-300 hover:bg-[#242938] hover:text-white disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      
      <Footer />
      
      {selectedStock && (
        <StockDetailsDialog
          stock={{
            Symbol: selectedStock.symbol,
            title: selectedStock.symbol,
            cik_str: '',
          }}
          isOpen={!!selectedStock}
          setIsOpen={(open) => !open && setSelectedStock(null)}
        />
      )}
    </div>
  );
};

export default TopStocks;
