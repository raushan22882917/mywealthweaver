import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from '@/components/ui/loader';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
import { Search, Award, Star, BarChart2, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Stock {
  industry: string;
  sector: string;
  symbol: string;
  Score: number;
  Rank: number;
}

const TopStocks: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTopStocks();
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
    <div className="flex flex-col bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Top Performing Stocks</h1>
          <p className="text-muted-foreground">Track the market's top performers</p>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select onValueChange={(value) => setIndustryFilter(value === "all" ? null : value)} value={industryFilter || "all"}>
            <SelectTrigger className="w-[200px]">
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
            <SelectTrigger className="w-[200px]">
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
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Market Movers</CardTitle>
            </CardHeader>
            <CardContent>
              <TooltipProvider>
                <Table>
                  <TableCaption>Top performing stocks in the market today</TableCaption>
                  <TableHeader>
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
                            <TableRow key={stock.symbol} className={rank <= 3 ? 'bg-opacity-10 bg-primary' : ''}>
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
                                  <Badge variant={rank <= 3 ? "default" : "outline"} className="font-bold">
                                    {rank}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-green-500" />
                                  <span className="font-medium">{stock.symbol}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-normal">
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
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
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
              <div className="flex justify-between mt-4">
                <Button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                  Previous
                </Button>
                <span>Page {currentPage} of {totalPages}</span>
                <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TopStocks;
