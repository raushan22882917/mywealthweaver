import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, TrendingUp, Info, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import StockDetailsDialog from '@/components/StockDetailsDialog';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface DividendFrequency {
  id: number;
  as_of_date: string;
  symbol: string | null;
  frequency: number | null;
  special_dividend: string | null;
  frequency_tx: string | null;
  days: number | null;
}

interface Stock {
  cik_str: string;
  Symbol: string;
  title: string;
  LogoURL?: string;
  marketCap?: number;
  dividendyield?: number;
}

const DividendFrequency = () => {
  const [frequencyData, setFrequencyData] = useState<DividendFrequency[]>([]);
  const [filteredData, setFilteredData] = useState<DividendFrequency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof DividendFrequency>('symbol');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const { toast } = useToast();

  // Fetch dividend frequency data
  useEffect(() => {
    const fetchFrequencyData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('div_frequency')
          .select('*')
          .order('symbol', { ascending: true });

        if (error) {
          console.error('Error fetching frequency data:', error);
          toast({
            title: "Error",
            description: "Failed to fetch dividend frequency data",
            variant: "destructive",
          });
          return;
        }

        setFrequencyData(data || []);
        setFilteredData(data || []);
      } catch (error) {
        console.error('Exception fetching frequency data:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFrequencyData();
  }, [toast]);

  // Filter and sort data
  useEffect(() => {
    let filtered = frequencyData.filter(item => 
      item.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.frequency_tx?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort data
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [frequencyData, searchTerm, sortField, sortDirection]);

  const handleSort = (field: keyof DividendFrequency) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDetailsClick = async (symbol: string) => {
    try {
      // Fetch stock details from company_profiles table
      const { data: companyData, error: companyError } = await supabase
        .from('company_profiles')
        .select('symbol, short_name')
        .eq('symbol', symbol)
        .single();

      if (companyError && companyError.code !== 'PGRST116') {
        console.error('Error fetching company data:', companyError);
        toast({
          title: "Error",
          description: "Failed to fetch stock details",
          variant: "destructive",
        });
        return;
      }

      // Create stock object for dialog
      const stock: Stock = {
        cik_str: '',
        Symbol: symbol,
        title: companyData?.short_name || symbol,
        LogoURL: undefined,
        marketCap: undefined,
        dividendyield: undefined
      };

      setSelectedStock(stock);
      setIsStockDialogOpen(true);
    } catch (error) {
      console.error('Error preparing stock details:', error);
      toast({
        title: "Error",
        description: "Failed to open stock details",
        variant: "destructive",
      });
    }
  };

  const getFrequencyColor = (frequency: number | null) => {
    if (!frequency) return 'bg-gray-100 text-gray-600';
    if (frequency === 4) return 'bg-green-100 text-green-700';
    if (frequency === 12) return 'bg-blue-100 text-blue-700';
    if (frequency === 2) return 'bg-yellow-100 text-yellow-700';
    return 'bg-purple-100 text-purple-700';
  };

  const getFrequencyLabel = (frequency: number | null) => {
    if (!frequency) return 'Unknown';
    if (frequency === 4) return 'Quarterly';
    if (frequency === 12) return 'Monthly';
    if (frequency === 2) return 'Semi-Annual';
    return `Every ${frequency} months`;
  };

  const getDaysColor = (days: number | null) => {
    if (!days) return 'text-gray-500';
    if (days <= 30) return 'text-green-600';
    if (days <= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Pagination helpers
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading dividend frequency data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Dividend Frequency Analysis
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track dividend payment frequencies and schedules across all stocks
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Total Records: {frequencyData.length}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <TrendingUp className="w-4 h-4" />
                <span>Active Stocks: {new Set(frequencyData.map(item => item.symbol)).size}</span>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by symbol or frequency type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Quarterly Dividends",
              value: frequencyData.filter(item => item.frequency === 4).length,
              icon: Calendar,
              color: "bg-green-500",
              description: "Stocks paying quarterly"
            },
            {
              title: "Monthly Dividends",
              value: frequencyData.filter(item => item.frequency === 12).length,
              icon: Clock,
              color: "bg-blue-500",
              description: "Stocks paying monthly"
            },
            {
              title: "Semi-Annual",
              value: frequencyData.filter(item => item.frequency === 2).length,
              icon: TrendingUp,
              color: "bg-yellow-500",
              description: "Stocks paying semi-annually"
            },
            {
              title: "Special Dividends",
              value: frequencyData.filter(item => item.special_dividend === 'Y').length,
              icon: Info,
              color: "bg-purple-500",
              description: "Stocks with special dividends"
            }
          ].map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color} text-white`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Data Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Dividend Frequency Data</span>
              <Badge variant="secondary">
                {filteredData.length} of {frequencyData.length} records
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    {[
                      { key: 'symbol', label: 'Symbol' },
                      { key: 'frequency_tx', label: 'Frequency' },
                      { key: 'frequency', label: 'Payments/Year' },
                      { key: 'days', label: 'Days Between' },
                      { key: 'special_dividend', label: 'Special Dividend' },
                      { key: 'as_of_date', label: 'Last Updated' },
                      { key: 'actions', label: 'Actions' }
                    ].map((column) => (
                      <th
                        key={column.key}
                        className={`px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 ${
                          column.key !== 'actions' ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''
                        }`}
                        onClick={() => column.key !== 'actions' && handleSort(column.key as keyof DividendFrequency)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{column.label}</span>
                          {column.key !== 'actions' && (
                            <ArrowUpDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {item.symbol || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getFrequencyColor(item.frequency)}>
                          {getFrequencyLabel(item.frequency)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {item.frequency || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${getDaysColor(item.days)}`}>
                          {item.days ? `${item.days} days` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.special_dividend === 'Y' ? (
                          <Badge variant="destructive">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {item.as_of_date ? new Date(item.as_of_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => item.symbol && handleDetailsClick(item.symbol)}
                          className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No results found for your search.' : 'No dividend frequency data available.'}
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredData.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rows per page:</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} results
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="h-8 w-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>

      {/* Stock Details Dialog */}
      {selectedStock && (
        <StockDetailsDialog
          stock={selectedStock}
          isOpen={isStockDialogOpen}
          setIsOpen={setIsStockDialogOpen}
        />
      )}
      <Footer />
    </>
  );
};

export default DividendFrequency; 