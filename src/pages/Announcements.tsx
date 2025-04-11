import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, Calendar, Info, Search, Bell, TrendingUp, ExternalLink, ChevronLeft, ChevronRight, Newspaper, AlertCircle, CalendarDays, CalendarRange } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, isWithinInterval, startOfWeek, endOfWeek, subDays, addDays, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText } from 'lucide-react';

interface DividendEvent {
  id: string;
  symbol: string;
  ex_dividend_date: string;
  amount: number;
  created_at: string;
  company_name: string;
  logo_url: string;
  earnings_date?: string;
  earnings_average?: number;
  earnings_low?: number;
  earnings_high?: number;
}

interface NewsEvent {
  id: string;
  title: string;
  content: string;
  published_at: string;
  source: string;
  url: string;
  symbol: string;
  date: string;
  created_at: string;
}

interface DividendSymbol {
  id: string;
  symbol: string;
  exdividenddate: string;
  amount: number;
  created_at: string;
  company_name: string;
  logo_url: string;
}

interface DividendReport {
  id: string;
  symbol: string;
  ex_dividend_date: string;
  dividend_date: string;
  amount: number;
  created_at: string;
  company_name: string;
  logo_url: string;
  earnings_average?: number;
  revenue_average?: number;
}

type NotificationEvent = DividendEvent | NewsEvent | DividendSymbol | DividendReport;

interface DateRange {
  from: Date;
  to: Date;
}

const ITEMS_PER_PAGE = 10;

const Announcements = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const highlightId = searchParams.get('id');
  const type = searchParams.get('type') || 'dividend';

  const [activeTab, setActiveTab] = useState<string>(type);
  const [dividendNotifications, setDividendNotifications] = useState<DividendEvent[]>([]);
  const [newsNotifications, setNewsNotifications] = useState<NewsEvent[]>([]);
  const [dividendSymbols, setDividendSymbols] = useState<DividendSymbol[]>([]);
  const [dividendReports, setDividendReports] = useState<DividendReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [companyLogos, setCompanyLogos] = useState<Map<string, string>>(new Map());
  const { toast } = useToast();
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const loadDividendNotifications = useCallback(async () => {
    try {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const { data: dividendData, error: dividendError } = await supabase
        .from("dividend_reports")
        .select("*")
        .gte('ex_dividend_date', monthStart.toISOString())
        .lte('ex_dividend_date', monthEnd.toISOString());

      if (dividendError) throw dividendError;

      const { data: logosData, error: logosError } = await supabase
        .from("company_logos")
        .select("Symbol, LogoURL");

      if (logosError) throw logosError;

      const logoMap = new Map(
        logosData.map((logo: { Symbol: string; LogoURL: string }) => [
          logo.Symbol.toUpperCase(),
          logo.LogoURL
        ])
      );
      setCompanyLogos(logoMap);

      const transformedNotifications = dividendData.map((event: any) => ({
        ...event,
        LogoURL: logoMap.get(event.symbol.toUpperCase()) || null,
        company_name: event.company_name || event.symbol
      }));

      const sortedNotifications = transformedNotifications.sort((a, b) => {
        return new Date(b.ex_dividend_date).getTime() - new Date(a.ex_dividend_date).getTime();
      });

      setDividendNotifications(sortedNotifications);
    } catch (error) {
      console.error('Error loading dividend notifications:', error);
      toast({
        title: "Failed to load dividend notifications",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  }, [toast]);

  const loadNewsNotifications = useCallback(async () => {
    try {
      const { data: newsData, error: newsError } = await supabase
        .from("news")
        .select("*")
        .order('date', { ascending: false })
        .limit(50);

      if (newsError) throw newsError;

      const transformedNews = newsData.map((news: any) => ({
        id: news.id.toString(),
        title: news.news_title,
        content: news.sentiment,
        published_at: news.date,
        source: news.source,
        url: news.weblink,
        symbol: news.symbol
      }));

      setNewsNotifications(transformedNews);
    } catch (error) {
      console.error('Error loading news notifications:', error);
      toast({
        title: "Failed to load news notifications",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  }, [toast]);

  const loadDividendSymbols = useCallback(async () => {
    try {
      const { data: symbolData, error: symbolError } = await supabase
        .from("dividend")
        .select("*");

      if (symbolError) throw symbolError;

      const { data: logosData, error: logosError } = await supabase
        .from("company_logos")
        .select("Symbol, LogoURL, company_name");

      if (logosError) throw logosError;

      const logoMap = new Map(
        logosData.map((logo: { Symbol: string; LogoURL: string; company_name: string }) => [
          logo.Symbol.toUpperCase(),
          { LogoURL: logo.LogoURL, company_name: logo.company_name }
        ])
      );

      const transformedSymbols = symbolData.map((symbol: any) => {
        const logoInfo = logoMap.get(symbol.symbol.toUpperCase());
        return {
          id: symbol.id.toString(),
          symbol: symbol.symbol,
          exdividenddate: symbol.exdividenddate,
          LogoURL: logoInfo?.LogoURL,
          company_name: logoInfo?.company_name
        };
      });

      setDividendSymbols(transformedSymbols);
    } catch (error) {
      console.error('Error loading dividend symbols:', error);
      toast({
        title: "Failed to load dividend symbols",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  }, [toast]);

  const loadDividendReports = useCallback(async () => {
    try {
      const { data: reportData, error: reportError } = await supabase
        .from("dividend_reports")
        .select("*");

      if (reportError) throw reportError;

      const { data: logosData, error: logosError } = await supabase
        .from("company_logos")
        .select("Symbol, LogoURL, company_name");

      if (logosError) throw logosError;

      const logoMap = new Map(
        logosData.map((logo: { Symbol: string; LogoURL: string; company_name: string }) => [
          logo.Symbol.toUpperCase(),
          { LogoURL: logo.LogoURL, company_name: logo.company_name }
        ])
      );

      const transformedReports = reportData.map((report: any) => {
        const logoInfo = logoMap.get(report.symbol.toUpperCase());
        return {
          id: report.id,
          symbol: report.symbol,
          ex_dividend_date: report.ex_dividend_date,
          earnings_average: report.earnings_average,
          revenue_average: report.revenue_average,
          LogoURL: logoInfo?.LogoURL,
          company_name: logoInfo?.company_name
        };
      });

      setDividendReports(transformedReports);
    } catch (error) {
      console.error('Error loading dividend reports:', error);
      toast({
        title: "Failed to load dividend reports",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      loadDividendNotifications(),
      loadNewsNotifications(),
      loadDividendSymbols(),
      loadDividendReports()
    ]).finally(() => setLoading(false));

    // Set up real-time subscriptions
    const dividendChannel = supabase
      .channel('dividend-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dividend_reports'
        },
        () => {
          loadDividendNotifications();
        }
      )
      .subscribe();

    const newsChannel = supabase
      .channel('news-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'news'
        },
        () => {
          loadNewsNotifications();
        }
      )
      .subscribe();

    const symbolChannel = supabase
      .channel('symbol-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dividend'
        },
        () => {
          loadDividendSymbols();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dividendChannel);
      supabase.removeChannel(newsChannel);
      supabase.removeChannel(symbolChannel);
    };
  }, [loadDividendNotifications, loadNewsNotifications, loadDividendSymbols, loadDividendReports]);

  // Filter notifications based on search term and active tab
  const getFilteredNotifications = useCallback(() => {
    let notifications: NotificationEvent[] = [];
    
    switch (activeTab) {
      case 'all':
        notifications = [
          ...newsNotifications,
          ...dividendSymbols,
          ...dividendReports
        ];
        break;
      case 'news':
        notifications = newsNotifications;
        break;
      case 'dividends':
        notifications = dividendSymbols;
        break;
      case 'reports':
        notifications = dividendReports;
        break;
    }

    return notifications.filter(notification => {
      // Apply search filter
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        if ('title' in notification) {
          // News notification
          return notification.title.toLowerCase().includes(query) ||
                 notification.symbol.toLowerCase().includes(query);
        } else if ('exdividenddate' in notification) {
          // Dividend symbol
          return notification.symbol.toLowerCase().includes(query) ||
                 notification.company_name.toLowerCase().includes(query);
        } else {
          // Dividend report
          return notification.symbol.toLowerCase().includes(query) ||
                 notification.company_name.toLowerCase().includes(query);
        }
      }

      // Apply date filter
      if (dateFilter !== 'all') {
        const notificationDate = new Date(notification.created_at);
        switch (dateFilter) {
          case 'today':
            if (!isToday(notificationDate)) return false;
            break;
          case 'week':
            if (!isThisWeek(notificationDate)) return false;
            break;
          case 'month':
            if (!isThisMonth(notificationDate)) return false;
            break;
        }
      }

      return true;
    });
  }, [activeTab, searchTerm, dateFilter, newsNotifications, dividendSymbols, dividendReports]);

  const filteredNotifications = getFilteredNotifications();
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentNotifications = filteredNotifications.slice(startIndex, endIndex);

  const handleStockClick = (symbol: string) => {
    navigate(`/stock/${symbol}`);
  };

  const renderDividendNotification = (notification: DividendEvent) => (
    <Card
      key={notification.id}
      className={`p-6 bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors ${
        notification.id === highlightId ? 'border-blue-500 bg-blue-900/20' : ''
      }`}
    >
      <div className="flex gap-4">
        <div className="mt-1">
          <div className="w-12 h-12 bg-white rounded-lg p-1.5 shadow-lg flex items-center justify-center">
            <img 
              src={notification.LogoURL || "/stock.avif"} 
              alt={notification.symbol} 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/stock.avif';
              }}
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-white text-lg">{notification.symbol}</h3>
              <p className="text-gray-400">{notification.company_name}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500">
                Ex-Dividend: {format(new Date(notification.ex_dividend_date), 'MMM d, yyyy')}
              </span>
              {notification.earnings_date && (
                <span className="text-xs text-gray-500">
                  Earnings: {format(new Date(notification.earnings_date), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Earnings Estimate</div>
              <div className="text-white font-medium">
                {notification.earnings_average
                  ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 2,
                    }).format(notification.earnings_average)
                  : "N/A"}
              </div>
              <div className="text-xs text-gray-500">
                Range: {notification.earnings_low} - {notification.earnings_high}
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Revenue Estimate</div>
              <div className="text-white font-medium">
                {notification.revenue_average
                  ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(notification.revenue_average)
                  : "N/A"}
              </div>
              <div className="text-xs text-gray-500">
                Range: {notification.revenue_low} - {notification.revenue_high}
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-blue-400 border-blue-800 hover:bg-blue-900/20"
              onClick={() => handleStockClick(notification.symbol)}
            >
              View Stock Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderNewsNotification = (notification: NewsEvent) => (
    <Card
      key={notification.id}
      className="p-6 bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors"
    >
      <div className="flex gap-4">
        <div className="mt-1">
          <div className="w-12 h-12 bg-white rounded-lg p-1.5 shadow-lg flex items-center justify-center">
            <Newspaper className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-white text-lg">{notification.title}</h3>
              <p className="text-gray-400 text-sm mt-1">{notification.source}</p>
            </div>
            <span className="text-xs text-gray-500">
              {format(new Date(notification.published_at), 'MMM d, yyyy')}
            </span>
          </div>
          
          <p className="text-gray-400 mt-3 line-clamp-2">{notification.content}</p>

          <div className="mt-4 flex gap-2">
            {notification.symbol && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-400 border-blue-800 hover:bg-blue-900/20"
                onClick={() => handleStockClick(notification.symbol!)}
              >
                View Stock Details
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-green-400 border-green-800 hover:bg-green-900/20 flex items-center gap-1"
              onClick={() => window.open(notification.url, '_blank')}
            >
              <ExternalLink className="h-3 w-3" />
              Read Full Article
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderDividendSymbol = (symbol: DividendSymbol) => (
    <Card
      key={symbol.id}
      className="p-6 bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors"
    >
      <div className="flex gap-4">
        <div className="mt-1">
          <div className="w-12 h-12 bg-white rounded-lg p-1.5 shadow-lg flex items-center justify-center">
            <img 
              src={symbol.LogoURL || "/stock.avif"} 
              alt={symbol.symbol} 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/stock.avif';
              }}
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-white text-lg">{symbol.symbol}</h3>
              <p className="text-gray-400">{symbol.company_name}</p>
            </div>
            <span className="text-xs text-gray-500">
              Ex-Dividend: {format(new Date(symbol.exdividenddate), 'MMM d, yyyy')}
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-blue-400 border-blue-800 hover:bg-blue-900/20"
              onClick={() => handleStockClick(symbol.symbol)}
            >
              View Stock Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderDividendReport = (report: DividendReport) => (
    <Card
      key={report.id}
      className="p-6 bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors"
    >
      <div className="flex gap-4">
        <div className="mt-1">
          <div className="w-12 h-12 bg-white rounded-lg p-1.5 shadow-lg flex items-center justify-center">
            <img 
              src={report.LogoURL || "/stock.avif"} 
              alt={report.symbol} 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/stock.avif';
              }}
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-white text-lg">{report.symbol}</h3>
              <p className="text-gray-400">{report.company_name}</p>
            </div>
            <span className="text-xs text-gray-500">
              Ex-Dividend: {format(new Date(report.ex_dividend_date), 'MMM d, yyyy')}
            </span>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Earnings Estimate</div>
              <div className="text-white font-medium">
                {report.earnings_average
                  ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 2,
                    }).format(report.earnings_average)
                  : "N/A"}
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Revenue Estimate</div>
              <div className="text-white font-medium">
                {report.revenue_average
                  ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(report.revenue_average)
                  : "N/A"}
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-blue-400 border-blue-800 hover:bg-blue-900/20"
              onClick={() => handleStockClick(report.symbol)}
            >
              View Stock Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Announcements</h1>
        <p className="text-gray-400 mb-8">
          Stay updated with the latest dividend announcements and news.
        </p>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Date Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Date Filter</label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px] bg-gray-900 border-gray-800">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder={`Search ${activeTab}...`}
                className="pl-10 bg-gray-900 border-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              News
            </TabsTrigger>
            <TabsTrigger value="dividends" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Dividends
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card className="p-4">
              {newsNotifications.map(renderNewsNotification)}
              {dividendSymbols.map(renderDividendSymbol)}
              {dividendReports.map(renderDividendReport)}
            </Card>
          </TabsContent>

          <TabsContent value="news">
            <Card className="p-4">
              {newsNotifications.map(renderNewsNotification)}
            </Card>
          </TabsContent>

          <TabsContent value="dividends">
            <Card className="p-4">
              {dividendSymbols.map(renderDividendSymbol)}
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="p-4">
              {dividendReports.map(renderDividendReport)}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Announcements;
