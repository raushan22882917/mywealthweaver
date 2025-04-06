import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DividendData {
  Symbol: string;
  title: string;
  LogoURL: string;
  exdividenddate: string;
  amount: string;
  status?: string;
}

interface FetchStats {
  totalCount: number;
  incompleteCount: number;
  errorMessages: string[];
}

type SortOrder = 'asc' | 'desc' | null;

const DividendDetail: React.FC = () => {
  const navigate = useNavigate();
  const [dividendData, setDividendData] = useState<DividendData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("");
  const [dateRange, setDateRange] = useState<'all' | 'past' | 'future' | 'empty'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [fetchStats, setFetchStats] = useState<FetchStats>({
    totalCount: 0,
    incompleteCount: 0,
    errorMessages: [],
  });
  const rowsPerPage = 100;

  useEffect(() => {
    fetchDividendData();
  }, [dateFilter, dateRange, sortOrder]);

  const fetchDividendData = async () => {
    try {
      const { count: totalCount, error: countError } = await supabase
        .from('dividendsymbol')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      let query = supabase.from('dividendsymbol').select('*');
      
      // Apply date range filter
      const today = new Date().toISOString().split('T')[0];
      
      if (dateFilter) {
        // If date is selected, filter by exact date
        if (dateRange === 'empty') {
          query = query.or('exdividenddate.is.null,exdividenddate.eq.');
        } else {
          query = query.eq('exdividenddate', dateFilter);
        }
      } else {
        // If no date selected, apply range filters
        if (dateRange === 'past') {
          query = query.lt('exdividenddate', today);
        } else if (dateRange === 'future') {
          query = query.gt('exdividenddate', today);
        } else if (dateRange === 'empty') {
          query = query.or('exdividenddate.is.null,exdividenddate.eq.');
        }
      }

      // Apply sorting
      if (sortOrder) {
        query = query.order('exdividenddate', { ascending: sortOrder === 'asc', nullsFirst: true });
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats: FetchStats = {
        totalCount: totalCount || 0,
        incompleteCount: 0,
        errorMessages: [],
      };

      const formattedData = data.map((item: any) => {
        const missingFields: string[] = [];
        
        if (!item.symbol) missingFields.push('symbol');
        if (!item.exdividenddate) missingFields.push('ex-dividend date');
        if (!item.amount) missingFields.push('amount');
        
        if (missingFields.length > 0) {
          stats.incompleteCount++;
          const recordId = item.symbol || item.id || 'unknown';
          stats.errorMessages.push(
            `Record ${recordId} is missing: ${missingFields.join(', ')}`
          );
        }

        return {
          Symbol: item.symbol || 'N/A',
          title: item.shortname || 'N/A',
          LogoURL: item.LogoURL || '',
          exdividenddate: item.exdividenddate 
            ? new Date(item.exdividenddate).toLocaleDateString()
            : 'Empty',
          amount: item.amount || 'N/A',
          status: item.status || 'N/A'
        };
      });

      setDividendData(formattedData);
      setFetchStats(stats);

    } catch (error) {
      console.error('Error fetching dividend data:', error);
      setFetchStats(prev => ({
        ...prev,
        errorMessages: [...prev.errorMessages, `Error fetching data: ${error}`]
      }));
    }
  };

  const handleSortClick = () => {
    setSortOrder(current => {
      if (current === null) return 'asc';
      if (current === 'asc') return 'desc';
      return null;
    });
  };

  const getSortIcon = () => {
    if (sortOrder === 'asc') return <ChevronUp className="h-4 w-4" />;
    if (sortOrder === 'desc') return <ChevronDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const totalPages = Math.ceil(dividendData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = dividendData.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Dividend Details
              </h1>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {dateFilter ? (
                  <>Showing records for date: {new Date(dateFilter).toLocaleDateString()}</>
                ) : (
                  <>Total Records: {fetchStats.totalCount}</>
                )} | 
                Complete Records: {dividendData.length - fetchStats.incompleteCount} |
                Incomplete Records: {fetchStats.incompleteCount}
                {fetchStats.incompleteCount > 0 && (
                  <div className="mt-2 text-yellow-500">
                    <details>
                      <summary>View Incomplete Records Details</summary>
                      <ul className="list-disc pl-5 mt-2">
                        {fetchStats.errorMessages.map((msg, idx) => (
                          <li key={idx}>{msg}</li>
                        ))}
                      </ul>
                    </details>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={dateRange}
                onValueChange={(value: 'all' | 'past' | 'future' | 'empty') => {
                  setDateRange(value);
                  if (value === 'empty') {
                    setDateFilter(''); // Clear date filter when showing empty dates
                  }
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="past">Past Dates</SelectItem>
                  <SelectItem value="future">Future Dates</SelectItem>
                  <SelectItem value="empty">Empty Dates</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filter by date"
                className="w-[200px]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Logo</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={handleSortClick}>
                      Ex-Dividend Date
                      {getSortIcon()}
                    </div>
                  </TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.Symbol}</TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>
                      {item.LogoURL ? (
                        <img
                          src={item.LogoURL}
                          alt={item.Symbol}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">N/A</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.exdividenddate !== 'Empty' 
                          ? item.exdividenddate
                          : <span className="text-yellow-500">Missing</span>
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.amount !== 'N/A' 
                          ? item.amount 
                          : <span className="text-yellow-500">Missing</span>
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status?.includes('safe') ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        item.status?.includes('risky') ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                      }`}>
                        {item.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {dividendData.length > 0 ? (
                <>
                  Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, dividendData.length)} of {dividendData.length} entries
                  {dateFilter && (
                    <span className="ml-2">
                      (filtered from {fetchStats.totalCount} total records)
                    </span>
                  )}
                </>
              ) : (
                <span>No records found</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || dividendData.length === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || dividendData.length === 0}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default DividendDetail;