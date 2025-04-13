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
import { Search, Award, Star, BarChart2, DollarSign, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const itemsPerPage = 10;

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

  // Filter stocks based on user selections
  const filteredStocks = stocks.filter(
    (stock) =>
      (!industryFilter || stock.industry === industryFilter) &&
      (!sectorFilter || stock.sector === sectorFilter) &&
      (stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group stocks by rank for display
  const stocksByRank = filteredStocks.reduce((acc, stock) => {
    const rank = stock.Rank || 999; // Default high rank if undefined
    if (!acc[rank]) acc[rank] = [];
    acc[rank].push(stock);
    return acc;
  }, {} as Record<number, Stock[]>);

  // Get sorted ranks for display
  const sortedRanks = Object.keys(stocksByRank)
    .map(Number)
    .sort((a, b) => a - b);

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);

  return (
    <div className="flex flex-col bg-background dark:bg-[#0f1117]">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            Top Performing Stocks
          </h1>
          <p className="text-muted-foreground">Track the market's top performers ranked by performance metrics</p>
        </div>



        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 dark:bg-[#151a27] dark:border-gray-700 dark:text-gray-200"
            />
          </div>

          <Select onValueChange={(value) => setIndustryFilter(value === "all" ? null : value)} value={industryFilter || "all"}>
            <SelectTrigger className="w-[200px] dark:bg-[#151a27] dark:border-gray-700 dark:text-gray-200">
              <SelectValue placeholder="Filter by Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => setSectorFilter(value === "all" ? null : value)} value={sectorFilter || "all"} disabled={!industryFilter}>
            <SelectTrigger className="w-[200px] dark:bg-[#151a27] dark:border-gray-700 dark:text-gray-200">
              <SelectValue placeholder="Filter by Sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              {sectors.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <Loader message="Loading top stocks..." />
          </div>
        ) : error ? (
          <div className="text-center my-12 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <Card className="shadow-lg dark:bg-[#1a1f2e] dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Market Movers by Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TooltipProvider>
                <Table className="dark:border-gray-700">
                  <TableCaption className="dark:text-gray-400">Top performing stocks in the market today</TableCaption>
                  <TableHeader className="dark:bg-[#151a27]">
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-right">Performance</TableHead>
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
                            <TableRow key={stock.symbol} className={rank <= 3 ? 'bg-opacity-10 bg-primary dark:bg-[#212738]' : 'dark:bg-[#1a1f2e]'}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {rank === 1 && (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Award className="h-5 w-5 text-yellow-500" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Top Ranked Stock</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {rank === 2 && (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Award className="h-5 w-5 text-gray-400" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Second Ranked Stock</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {rank === 3 && (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Award className="h-5 w-5 text-amber-700" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Third Ranked Stock</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {rank > 3 && rank <= 10 && (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Star className="h-5 w-5 text-blue-500" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Top 10 Stock</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  <Badge variant={rank <= 3 ? "default" : "outline"} className={`font-bold ${rank > 3 ? 'dark:bg-[#151a27] dark:border-gray-700' : ''}`}>
                                    {rank}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="flex items-center gap-2 group cursor-pointer px-2 py-1 rounded-md transition-all duration-200
                                      hover:bg-primary/5 hover:border-primary/20 hover:border
                                      focus:bg-primary/5 focus:border-primary/20 focus:border focus:outline-none
                                      active:bg-primary/10 active:border-primary/30 active:border"
                                    onClick={() => setSelectedStock(stock)}
                                    tabIndex={0}
                                  >
                                    <Info className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <span className="font-medium group-hover:text-primary group-hover:underline transition-all">{stock.symbol}</span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSaveStock(stock);
                                    }}
                                    className="ml-2 focus:outline-none"
                                  >
                                    <Star
                                      className={`h-5 w-5 transition-colors ${isStockSaved(stock.symbol) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                                    />
                                  </button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-normal dark:bg-[#151a27] dark:border-gray-700">
                                  {stock.industry}
                                </Badge>
                              </TableCell>
                              <TableCell>{stock.sector}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <BarChart2 className="h-4 w-4 text-blue-500" />
                                  <span className="font-bold">{stock.Score?.toFixed(2) || 'N/A'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5">
                                  <div
                                    className="bg-primary h-2.5 rounded-full"
                                    style={{ width: `${Math.min(100, (stock.Score || 0) * 10)}%` }}
                                  ></div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        }
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TooltipProvider>
              <div className="flex justify-between items-center mt-6 pt-4 border-t dark:border-gray-700">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{Math.min(filteredStocks.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{' '}
                  <span className="font-medium">{Math.min(filteredStocks.length, currentPage * itemsPerPage)}</span> of{' '}
                  <span className="font-medium">{filteredStocks.length}</span> stocks
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="h-8 w-8 p-0 dark:bg-[#151a27] dark:border-gray-700 dark:hover:bg-[#1f2937]"
                  >
                    <span className="sr-only">Previous</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </Button>
                  <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="h-8 w-8 p-0 dark:bg-[#151a27] dark:border-gray-700 dark:hover:bg-[#1f2937]"
                  >
                    <span className="sr-only">Next</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
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
            LogoURL: undefined,
            marketCap: undefined,
            dividendyield: undefined
          }}
          isOpen={!!selectedStock}
          setIsOpen={(open) => !open && setSelectedStock(null)}
        />
      )}
    </div>
  );
};

export default TopStocks;
