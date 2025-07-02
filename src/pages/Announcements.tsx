import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../components/ui/pagination';
import { Loader2, Calendar, DollarSign } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar as ReactCalendar } from '../components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DateRangePicker } from '../components/DateRangePicker';
import { DateRange } from 'react-day-picker';

interface DividendAnnouncement {
  symbol: string;
  shortname: string;
  message: string;
  dividend: number;
  exdividenddate: string;
  insight: string;
}

interface LogoData {
  Symbol: string;
  company_name: string;
  LogoURL: string;
}

const ROW_OPTIONS = [10, 25, 50];
const DEFAULT_ITEMS_PER_PAGE = 10;

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<DividendAnnouncement[]>([]);
  const [logos, setLogos] = useState<LogoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>({ from: new Date(), to: new Date() });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch announcements from dividendsymbol table
        const { data: announcementsData, error: announcementsError } = await supabase
          .from('dividendsymbol')
          .select('symbol, shortname, message, dividend, exdividenddate, insight')
          .order('exdividenddate', { ascending: false });

        if (announcementsError) {
          throw new Error(`Error fetching announcements: ${announcementsError.message}`);
        }
        // Fetch logos from CSV
        const logosResponse = await fetch('/logos.csv');
        const logosText = await logosResponse.text();
        const logosData = parseCSV(logosText);
        setAnnouncements(announcementsData || []);
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

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number): string => {
    if (amount == null) return '-';
    return `$${amount.toFixed(2)}`;
  };

  const getFilteredAnnouncements = () => {
    let filtered = announcements;
    if (selectedRange && selectedRange.from && selectedRange.to) {
      const fromDate = selectedRange.from;
      const toDate = selectedRange.to;
      filtered = filtered.filter(announcement => {
        if (!announcement.exdividenddate) return false;
        const exDate = new Date(announcement.exdividenddate);
        return exDate >= fromDate && exDate <= toDate;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(announcement =>
        announcement.symbol.toLowerCase().includes(q) ||
        (announcement.shortname && announcement.shortname.toLowerCase().includes(q)) ||
        (announcement.message && announcement.message.toLowerCase().includes(q))
      );
    }
    return filtered;
  };

  const filteredAnnouncements = getFilteredAnnouncements();

  // Pagination logic
  const getCurrentData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAnnouncements.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(filteredAnnouncements.length / itemsPerPage);
  };

  const totalPages = getTotalPages();
  const currentData = getCurrentData();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        />
      </PaginationItem>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <PaginationItem key="1">
          <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        pages.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
        </PaginationItem>
      );
    }

    // Next button
    pages.push(
      <PaginationItem key="next">
        <PaginationNext 
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        />
      </PaginationItem>
    );

    return pages;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading announcements...</span>
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
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white mb-2">Dividend Announcements</h1>
          {/* Search Bar */}
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="bg-gray-800 border border-gray-700 text-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ minWidth: 220 }}
            />
          </div>
        </div>

        {/* Date Filter */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <DateRangePicker
                date={selectedRange as DateRange}
                onDateChange={setSelectedRange}
              />
            </div>
          </CardHeader>
        </Card>

        <Card>
          
          <CardContent>
            {filteredAnnouncements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No announcements found for the selected date.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Insight & Message</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.map((announcement, idx) => {
                      const logoData = getLogoForSymbol(announcement.symbol);
                      return (
                        <TableRow key={announcement.symbol + idx}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage 
                                  src={logoData?.LogoURL} 
                                  alt={logoData?.company_name || announcement.symbol}
                                />
                                <AvatarFallback>
                                  {announcement.symbol.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {logoData?.company_name || announcement.shortname || 'Unknown Company'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md whitespace-pre-line break-words">
                            <div>
                              <span className="text-xs text-blue-400">{announcement.insight || '-'}</span>
                              {announcement.insight && announcement.message ? <span className="mx-1">|</span> : null}
                              <span>{announcement.message}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {formatDate(announcement.exdividenddate)}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {/* Pagination and summary UI */}
                {totalPages > 1 && (
                  <div className="mt-6 flex flex-col space-y-2">
                    <div className="flex w-full items-center justify-between">
                      {/* Left: summary and rows per page */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">{filteredAnnouncements.length} rows x 3 cols</span>
                        <select
                          className="bg-gray-800 border border-gray-700 text-gray-300 rounded px-2 py-1 ml-2"
                          value={itemsPerPage}
                          onChange={handleItemsPerPageChange}
                        >
                          {ROW_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        <span className="text-sm text-gray-400 ml-2">per page</span>
                      </div>
                      {/* Right: pagination controls */}
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">Page</span>
                        <input
                          type="number"
                          min={1}
                          max={totalPages}
                          value={currentPage}
                          onChange={e => handlePageChange(Number(e.target.value))}
                          className="w-10 bg-gray-800 border border-gray-700 text-gray-300 rounded px-1 py-0.5 text-center mx-1"
                          style={{ width: 40 }}
                        />
                        <span className="text-xs text-gray-400">of {totalPages}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="px-1"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                        >{'<<'}</Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="px-1"
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >{'<'}</Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="px-1"
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                        >{'>'}</Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="px-1"
                          onClick={() => handlePageChange(totalPages)}
                          disabled={currentPage === totalPages}
                        >{'>>'}</Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Announcements;
