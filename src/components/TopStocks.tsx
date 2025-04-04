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
import { Search } from 'lucide-react';

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
        .order('Score', { ascending: false });

      if (error) throw error;
      setStocks(data);
    } catch (err: any) {
      console.error('Error fetching top stocks:', err);
      setError(err.message || 'Failed to load top stocks');
    } finally {
      setIsLoading(false);
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

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const paginatedStocks = filteredStocks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
              <Table>
                <TableCaption>Top performing stocks in the market today</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStocks.map((stock) => (
                    <TableRow key={stock.symbol}>
                      <TableCell className="font-medium">{stock.symbol}</TableCell>
                      <TableCell>{stock.industry}</TableCell>
                      <TableCell>{stock.sector}</TableCell>
                      <TableCell className="text-right">{stock.Score}</TableCell>
                      <TableCell className="text-right font-bold">{stock.Rank}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
