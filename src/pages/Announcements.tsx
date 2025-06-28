import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { DateRangePicker } from '../components/DateRangePicker';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../components/ui/pagination';
import { Loader2, Calendar, DollarSign } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';

interface DividendAnnouncement {
  id: string;
  symbol: string;
  header: string;
  message: string;
  date: string;
  amount: number;
  created_at: string | null;
}

interface LogoData {
  Symbol: string;
  company_name: string;
  LogoURL: string;
}

const ITEMS_PER_PAGE = 25;

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<DividendAnnouncement[]>([]);
  const [logos, setLogos] = useState<LogoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date()
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch announcements from database
        const { data: announcementsData, error: announcementsError } = await supabase
          .from('dividend_announcements')
          .select('*')
          .order('date', { ascending: false });

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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const getFilteredAnnouncements = () => {
    if (!dateRange.from) return announcements;
    
    return announcements.filter(announcement => {
      const announcementDate = new Date(announcement.date);
      const fromDate = dateRange.from;
      const toDate = dateRange.to || dateRange.from;
      
      return announcementDate >= fromDate && announcementDate <= toDate;
    });
  };

  const filteredAnnouncements = getFilteredAnnouncements();

  // Pagination logic
  const getCurrentData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAnnouncements.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(filteredAnnouncements.length / ITEMS_PER_PAGE);
  };

  const totalPages = getTotalPages();
  const currentData = getCurrentData();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dividend Announcements</h1>
        </div>

        {/* Date Filter */}
        <Card className="mb-6">
          <CardHeader>
            
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <DateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => setDateRange({ from: new Date(), to: new Date() })}
              >
                Today
              </Button>
              <Button
                variant="outline"
                onClick={() => setDateRange({ from: addDays(new Date(), -7), to: new Date() })}
              >
                Last 7 Days
              </Button>
              <Button
                variant="outline"
                onClick={() => setDateRange({ from: addDays(new Date(), -30), to: new Date() })}
              >
                Last 30 Days
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Recent Announcements</span>
              </div>
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAnnouncements.length)} of {filteredAnnouncements.length} results
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAnnouncements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No announcements found for the selected date range.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.map((announcement) => {
                      const logoData = getLogoForSymbol(announcement.symbol);
                      
                      return (
                        <TableRow key={announcement.id}>
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
                                  {logoData?.company_name || 'Unknown Company'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {announcement.symbol}
                            </Badge>
                          </TableCell>
                          
                          <TableCell className="max-w-md">
                            <div className="truncate" title={announcement.message}>
                              {announcement.message}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-600">
                              {formatAmount(announcement.amount)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {formatDate(announcement.date)}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        {renderPagination()}
                      </PaginationContent>
                    </Pagination>
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
