import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import StockFilter from '../components/ui/stock-filter';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Calendar, Search, Filter, TrendingUp, TrendingDown, ChevronDown, X, Loader2, DollarSign } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StockDetailsDialog from '../components/StockDetailsDialog';

interface Stock {
  symbol: string;
  shortname: string;
  currentprice: number;
  dividendyield: number;
  marketcap: number;
  previousclose: number;
  volume: number;
  sector: string;
  industry: string;
  // Add other properties as needed
}

interface LogoData {
  Symbol: string;
  company_name: string;
  LogoURL: string;
}

const ITEMS_PER_PAGE = 25;

const Dividend: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [logos, setLogos] = useState<LogoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof Stock | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch stocks from database
        const { data: stocksData, error: stocksError } = await supabase
          .from('dividendsymbol')
          .select('*');

        if (stocksError) {
          throw new Error(`Error fetching stocks: ${stocksError.message}`);
        }

        // Fetch logos from CSV
        const logosResponse = await fetch('/logos.csv');
        const logosText = await logosResponse.text();
        const logosData = parseCSV(logosText);

        setStocks(stocksData || []);
        setLogos(logosData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const parseCSV = (csvText: string): LogoData[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const data: LogoData[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        data.push({
          Symbol: values[1]?.replace(/"/g, '') || '',
          company_name: values[2]?.replace(/"/g, '') || '',
          LogoURL: values[4]?.replace(/"/g, '') || ''
        });
      }
    }

    return data;
  };

  const getLogoForSymbol = (symbol: string): LogoData | undefined => {
    return logos.find(logo => logo.Symbol === symbol);
  };

  const formatAmount = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const applyFilters = useCallback((stock: Stock) => {
    if (appliedFilters && Object.keys(appliedFilters).length === 0) {
      return true;
    }

    for (const key in appliedFilters) {
      if (appliedFilters.hasOwnProperty(key)) {
        const filterValue = appliedFilters[key];

        if (filterValue === null || filterValue === undefined || filterValue === '') {
          continue;
        }

        const stockValue = stock[key as keyof Stock];

        if (stockValue === undefined) {
          continue;
        }

        if (typeof filterValue === 'string') {
          if (typeof stockValue === 'string' && !stockValue.toLowerCase().includes(filterValue.toLowerCase())) {
            return false;
          }
        } else if (typeof filterValue === 'number') {
          if (typeof stockValue === 'number' && stockValue !== filterValue) {
            return false;
          }
        } else if (Array.isArray(filterValue)) {
          if (!Array.isArray(stockValue)) {
            return false;
          }

          const filterSet = new Set(filterValue);
          const stockArray = Array.from(stockValue);

          if (!stockArray.some(item => filterSet.has(item))) {
            return false;
          }
        }
      }
    }

    return true;
  }, [appliedFilters]);

  const getFilteredStocks = useCallback(() => {
    let filtered = stocks.filter(stock => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        stock.symbol.toLowerCase().includes(searchTermLower) ||
        stock.shortname.toLowerCase().includes(searchTermLower)
      );
    });

    filtered = filtered.filter(applyFilters);

    return filtered;
  }, [stocks, searchTerm, applyFilters]);

  const filteredStocks = getFilteredStocks();

  const sortData = (data: Stock[], column: keyof Stock, direction: 'asc' | 'desc'): Stock[] => {
    return [...data].sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      if (valueA === null || valueA === undefined) return direction === 'asc' ? -1 : 1;
      if (valueB === null || valueB === undefined) return direction === 'asc' ? 1 : -1;

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return direction === 'asc' ? valueA - valueB : valueB - valueA;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }

      return 0;
    });
  };

  const handleSort = (column: keyof Stock) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedStocks = sortColumn ? sortData(filteredStocks, sortColumn, sortDirection) : filteredStocks;

  // Pagination logic
  const getCurrentData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedStocks.slice(startIndex, endIndex);
  };

  const getCurrentPageData = getCurrentData();

  const totalPages = Math.ceil(sortedStocks.length / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowClick = (stock: any) => {
    setSelectedStock(stock);
    setIsDialogOpen(true);
  };

  const handleFilterApply = (filters: any) => {
    console.log('Applied filters:', filters);
    setAppliedFilters(filters);
    setIsFilterDialogOpen(false);
  };

  const renderSortArrow = (column: keyof Stock) => {
    if (column === sortColumn) {
      return sortDirection === 'asc' ? <TrendingUp className="inline-block w-4 h-4 ml-1" /> : <TrendingDown className="inline-block w-4 h-4 ml-1" />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading stocks...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                <p>Error: {error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Dividend Stocks</h1>
            <div className="space-x-2">
              <Input
                type="text"
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              />
              <Button variant="outline" onClick={() => setIsFilterDialogOpen(true)}>
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Dividend Stocks</span>
              </div>
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedStocks.length)} of {sortedStocks.length} results
              </div>
            </CardTitle>
            <CardDescription>
              Explore dividend-paying stocks and their key metrics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedStocks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No stocks found matching your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead onClick={() => handleSort('symbol')} className="cursor-pointer">
                        Company {renderSortArrow('symbol')}
                      </TableHead>
                      <TableHead onClick={() => handleSort('currentprice')} className="cursor-pointer">
                        Price {renderSortArrow('currentprice')}
                      </TableHead>
                      <TableHead onClick={() => handleSort('dividendyield')} className="cursor-pointer">
                        Dividend Yield {renderSortArrow('dividendyield')}
                      </TableHead>
                      <TableHead onClick={() => handleSort('marketcap')} className="cursor-pointer">
                        Market Cap {renderSortArrow('marketcap')}
                      </TableHead>
                      <TableHead onClick={() => handleSort('volume')} className="cursor-pointer">
                        Volume {renderSortArrow('volume')}
                      </TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Industry</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentPageData.map((stock) => {
                      const logoData = getLogoForSymbol(stock.symbol);

                      return (
                        <TableRow key={stock.symbol} onClick={() => handleRowClick(stock)} className="cursor-pointer hover:bg-accent">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={logoData?.LogoURL}
                                  alt={logoData?.company_name || stock.symbol}
                                  onError={(e: any) => {
                                    e.target.onerror = null;
                                    e.target.src = '/placeholder-image.png';
                                  }}
                                />
                                <AvatarFallback>
                                  {stock.symbol.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{stock.shortname}</div>
                                <div className="text-gray-500 text-sm">{stock.symbol}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatAmount(stock.currentprice)}</TableCell>
                          <TableCell>{formatPercentage(stock.dividendyield)}</TableCell>
                          <TableCell>{stock.marketcap}</TableCell>
                          <TableCell>{stock.volume}</TableCell>
                          <TableCell>{stock.sector}</TableCell>
                          <TableCell>{stock.industry}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="join">
              <Button
                className="join-item"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                «
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  className="join-item"
                  variant={currentPage === page ? 'default' : 'outline'}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                className="join-item"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                »
              </Button>
            </div>
          </div>
        )}
        
        <StockDetailsDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          stock={selectedStock}
        />

        <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Filter Stocks</DialogTitle>
              <DialogDescription>
                Apply filters to find stocks that match your criteria
              </DialogDescription>
            </DialogHeader>
            <StockFilter onApply={handleFilterApply} />
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
};

export default Dividend;
