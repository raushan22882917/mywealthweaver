
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

interface Stock {
  cik_str: string;
  Symbol: string;
  title: string;
  price?: number;
  change?: number;
  changePercent?: number;
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

  useEffect(() => {
    fetchTopStocks();
  }, []);

  const fetchTopStocks = async () => {
    try {
      setIsLoading(true);
      // This is a placeholder - in a real app, you would fetch this data from your Supabase table
      // For now, we'll use dummy data to simulate the API response
      const dummyData: Stock[] = [
        { cik_str: '0000789019', Symbol: 'MSFT', title: 'Microsoft Corporation', price: 420.45, change: 2.45, changePercent: 0.59 },
        { cik_str: '0000320193', Symbol: 'AAPL', title: 'Apple Inc.', price: 175.52, change: -0.86, changePercent: -0.49 },
        { cik_str: '0001652044', Symbol: 'GOOG', title: 'Alphabet Inc.', price: 164.84, change: 1.23, changePercent: 0.75 },
        { cik_str: '0001018724', Symbol: 'AMZN', title: 'Amazon.com Inc.', price: 178.75, change: 3.45, changePercent: 1.97 },
        { cik_str: '0001318605', Symbol: 'TSLA', title: 'Tesla, Inc.', price: 176.75, change: -5.20, changePercent: -2.86 },
        { cik_str: '0000200406', Symbol: 'INTC', title: 'Intel Corporation', price: 43.75, change: 0.48, changePercent: 1.11 },
        { cik_str: '0001045810', Symbol: 'NFLX', title: 'Netflix, Inc.', price: 603.50, change: 12.75, changePercent: 2.16 },
        { cik_str: '0001326801', Symbol: 'META', title: 'Meta Platforms, Inc.', price: 485.22, change: 7.85, changePercent: 1.64 },
      ];
      
      // In a real implementation, you would fetch from Supabase like this:
      // const { data, error } = await supabase
      //   .from('top_stocks')
      //   .select('*')
      //   .order('changePercent', { ascending: false });
      
      // if (error) throw error;
      
      setStocks(dummyData);
    } catch (err: any) {
      console.error('Error fetching top stocks:', err);
      setError(err.message || 'Failed to load top stocks');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.Symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  {(limit ? filteredStocks.slice(0, limit) : filteredStocks).map((stock) => (
                    <TableRow key={stock.Symbol}>
                      <TableCell className="font-medium">{stock.Symbol}</TableCell>
                      <TableCell>{stock.title}</TableCell>
                      <TableCell className="text-right">${stock.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <span className={stock.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default TopStocks;

