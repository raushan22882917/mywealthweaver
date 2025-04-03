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
import { TrendingUp, TrendingDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Stock {
  cik_str: string;
  symbol?: string;
  title?: string;
  price?: number;
  change_value?: number;
  change_percent?: number;
}

interface TopStocksProps {
  limit?: number;
  compact?: boolean;
  showNavbar?: boolean;
  transparentBg?: boolean;
}

const TopStocks: React.FC<TopStocksProps> = ({ 
  limit = 10, 
  compact = false, 
  showNavbar = true,
  transparentBg = false 
}) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
        .order('change_percent', { ascending: false });
      
      if (error) throw error;
      setStocks(data);
    } catch (err: any) {
      console.error('Error fetching top stocks:', err);
      setError(err.message || 'Failed to load top stocks');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStocks = stocks.filter(
    (stock) =>
      (stock.symbol && stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (stock.title && stock.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const paginatedStocks = filteredStocks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={`flex flex-col ${transparentBg ? 'bg-transparent' : 'bg-background'}`}>
      {showNavbar && <Navbar />}
      <main className={`flex-1 container mx-auto px-4 py-8 ${compact ? 'py-2' : 'py-8'}`}>
        {!compact && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Top Performing Stocks</h1>
              <p className="text-muted-foreground">
                Track the market's top performers and trending stocks
              </p>
            </div>

            <div className="relative w-full md:w-auto mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by symbol or company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-[300px]"
              />
            </div>
          </>
        )}

        {isLoading ? (
          <div className="flex justify-center my-12">
            <Loader message="Loading top stocks..." />
          </div>
        ) : error ? (
          <div className="text-center my-12 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <Card className={`${transparentBg ? 'bg-transparent border-0 shadow-none' : 'shadow-lg'}`}>
            {!compact && (
              <CardHeader>
                <CardTitle>Market Movers</CardTitle>
              </CardHeader>
            )}
            <CardContent>
              <Table>
                {!compact && (
                  <TableCaption>
                    Top performing stocks in the market today
                  </TableCaption>
                )}
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">% Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStocks.map((stock) => (
                    <TableRow key={stock.symbol || stock.cik_str}>
                      <TableCell className="font-medium">{stock.symbol || 'N/A'}</TableCell>
                      <TableCell>{stock.title || 'N/A'}</TableCell>
                      <TableCell className="text-right">${stock.price?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell className="text-right">
                        <span className={stock.change_value && stock.change_value >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {stock.change_value && stock.change_value >= 0 ? '+' : ''}{stock.change_value?.toFixed(2) || '0.00'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={stock.change_percent && stock.change_percent >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {stock.change_percent && stock.change_percent >= 0 ? '+' : ''}{stock.change_percent?.toFixed(2) || '0.00'}%
                        </span>
                      </TableCell>
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
    </div>
  );
};

export default TopStocks;