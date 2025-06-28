import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Bell, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Mail,
  AlertCircle,
  FileText,
  Check,
  X,
  Filter,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { format, isToday, isTomorrow, parseISO, isValid, startOfDay, endOfDay } from 'date-fns';

interface NotificationItem {
  id: string;
  type: 'dividend' | 'earnings' | 'news';
  symbol?: string;
  ex_dividend_date?: string;
  exdividenddate?: string;
  published_at?: string;
  company_name?: string;
  LogoURL?: string;
  title?: string;
  content?: string;
}

interface DividendEvent {
  id: string;
  symbol: string;
  dividend_date: string;
  ex_dividend_date: string;
  earnings_date: string;
  earnings_average: number;
  revenue_average: number;
  LogoURL?: string;
  company_name?: string;
  earnings_low: number;
  earnings_high: number;
  revenue_low: number;
  revenue_high: number;
}

interface DividendSymbol {
  id: string;
  symbol: string;
  exdividenddate: string;
  company_name?: string;
  LogoURL?: string;
}

interface NewsEvent {
  id: string;
  title: string;
  content: string;
  published_at: string;
  source: string;
  url: string;
  symbol?: string;
}

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'dividend':
      return <DollarSign className="h-6 w-6 text-green-400" />;
    case 'earnings':
      return <TrendingUp className="h-6 w-6 text-blue-400" />;
    case 'news':
      return <AlertCircle className="h-6 w-6 text-yellow-400" />;
    default:
      return <Mail className="h-6 w-6 text-gray-400" />;
  }
};

const NotificationBadge = ({ type }: { type: string }) => {
  switch (type) {
    case 'dividend':
      return <Badge className="ml-2 bg-green-900/60 text-green-300 hover:bg-green-800">Dividend</Badge>;
    case 'earnings':
      return <Badge className="ml-2 bg-blue-900/60 text-blue-300 hover:bg-blue-800">Earnings</Badge>;
    case 'news':
      return <Badge className="ml-2 bg-yellow-900/60 text-yellow-300 hover:bg-yellow-800">News</Badge>;
    default:
      return null;
  }
};

const Notifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<string>('news');
  const [companyLogos, setCompanyLogos] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    const loadCompanyLogos = async () => {
      try {
        const response = await fetch('/logos.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n').slice(1);
        const logos: Record<string, string> = {};
        
        rows.forEach(row => {
          const columns = row.split(',');
          if (columns.length >= 5) {
            const symbol = columns[1]?.trim();
            const logoUrl = columns[4]?.trim();
            if (symbol && logoUrl && logoUrl !== 'LogoURL') {
              logos[symbol] = logoUrl;
            }
          }
        });
        
        setCompanyLogos(logos);
      } catch (error) {
        console.error('Error loading company logos:', error);
      }
    };

    loadCompanyLogos();
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        const startDate = startOfDay(selectedDate);
        const endDate = endOfDay(selectedDate);
        const dateString = format(selectedDate, 'yyyy-MM-dd');

        // Fetch from dividendsymbol table
        const { data: dividendSymbolsData, error: dividendSymbolsError } = await supabase
          .from("dividendsymbol")
          .select("*")
          .eq('exdividenddate', dateString);

        if (dividendSymbolsError) throw dividendSymbolsError;

        // Fetch from dividend_reports table
        const { data: dividendReportsData, error: dividendReportsError } = await supabase
          .from("dividend_reports")
          .select("*")
          .eq('ex_dividend_date', dateString);

        if (dividendReportsError) throw dividendReportsError;

        // Fetch from dividend_announcements table
        const { data: dividendAnnouncementsData, error: dividendAnnouncementsError } = await supabase
          .from("dividend_announcements")
          .select("*")
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        if (dividendAnnouncementsError) throw dividendAnnouncementsError;

        // Transform and combine all notifications
        const allNotifications: NotificationItem[] = [
          ...(dividendSymbolsData?.map((item: any) => ({
            id: `symbol-${item.id}`,
            type: 'dividend' as const,
            symbol: item.symbol,
            exdividenddate: item.exdividenddate,
            company_name: item.company_name,
            LogoURL: item.LogoURL
          })) || []),
          ...(dividendReportsData?.map((item: any) => ({
            id: `report-${item.id}`,
            type: 'earnings' as const,
            symbol: item.symbol,
            ex_dividend_date: item.ex_dividend_date,
            company_name: item.company_name,
            LogoURL: item.LogoURL
          })) || []),
          ...(dividendAnnouncementsData?.map((item: any) => ({
            id: `announcement-${item.id}`,
            type: 'news' as const,
            symbol: item.symbol,
            published_at: item.created_at,
            title: item.header,
            content: item.message
          })) || [])
        ];

        setNotifications(allNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
        toast({
          title: "Error",
          description: "Failed to load notifications. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [selectedDate, toast]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (!isValid(date)) {
        console.warn('Invalid date:', dateString);
        return 'Invalid date';
      }
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else {
      return format(date, 'EEEE, MMMM d, yyyy');
    }
  };

  const renderNotification = (notification: NotificationItem) => {
    const logoUrl = notification.symbol ? companyLogos[notification.symbol] : null;

    if (notification.type === 'dividend') {
      return (
        <div key={notification.id} className="p-4 rounded-md transition-colors">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${notification.symbol} logo`}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-10 h-10 rounded-full bg-green-100 flex items-center justify-center ${logoUrl ? 'hidden' : ''}`}>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{notification.symbol}</p>
                  {/* <NotificationBadge type={notification.type} /> */}
                </div>
                <a href={`/dividend?type=buy`} className="text-gray-400 hover:text-gray-600">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ex-Dividend Date: {formatDate(notification.ex_dividend_date || notification.exdividenddate || '')}
              </p>
              {notification.company_name && (
                <p className="text-xs text-gray-400 mt-1 truncate">{notification.company_name}</p>
              )}
              <p className="text-xs text-green-400 mt-1 font-medium">Announcement: Dividend payment scheduled</p>
            </div>
          </div>
        </div>
      );
    } else if (notification.type === 'earnings') {
      return (
        <div key={notification.id} className="p-4 rounded-md transition-colors">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${notification.symbol} logo`}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center ${logoUrl ? 'hidden' : ''}`}>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{notification.symbol}</p>
                  <NotificationBadge type={notification.type} />
                </div>
                <a href={`/stock/${notification.symbol}`} className="text-gray-400 hover:text-gray-600">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ex-Dividend Date: {formatDate(notification.ex_dividend_date || notification.exdividenddate || '')}
              </p>
              {notification.company_name && (
                <p className="text-xs text-gray-400 mt-1 truncate">{notification.company_name}</p>
              )}
              <p className="text-xs text-blue-400 mt-1 font-medium">Announcement: Earnings report expected</p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div key={notification.id} className="p-4 rounded-md transition-colors">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${notification.symbol} logo`}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center ${logoUrl ? 'hidden' : ''}`}>
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{notification.title || 'Announcement'}</p>
                  <NotificationBadge type={notification.type} />
                </div>
                {notification.symbol && (
                  <a href={`/stock/${notification.symbol}`} className="text-gray-400 hover:text-gray-600">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(notification.published_at || '')}
              </p>
              {notification.symbol && (
                <p className="text-xs text-gray-400 mt-1 truncate">Related: {notification.symbol}</p>
              )}
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.content}</p>
            </div>
          </div>
        </div>
      );
    }
  };

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || notification.type === filter
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
              <p className="text-gray-400">
                Stay updated with important alerts and information.
              </p>
            </div>
            
            <div className="flex space-x-3">
              {/* Date Picker */}
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {getDateLabel(selectedDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setCalendarOpen(false);
                      }
                    }}
                    className="bg-gray-900 text-white"
                    classNames={{
                      day_selected: "bg-purple-600 text-white hover:bg-purple-700",
                      day_today: "bg-gray-700 text-white",
                      day: "hover:bg-gray-800",
                      head_cell: "text-gray-400",
                      caption: "text-white",
                      nav_button: "text-gray-400 hover:text-white",
                    }}
                  />
                </PopoverContent>
              </Popover>

              {/* Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter: {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-700 text-white">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    className={`hover:bg-gray-800 ${filter === 'all' ? 'text-purple-400' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    All
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    className={`hover:bg-gray-800 ${filter === 'dividend' ? 'text-green-400' : ''}`}
                    onClick={() => setFilter('dividend')}
                  >
                    Dividend
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`hover:bg-gray-800 ${filter === 'earnings' ? 'text-blue-400' : ''}`}
                    onClick={() => setFilter('earnings')}
                  >
                    Earnings
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`hover:bg-gray-800 ${filter === 'news' ? 'text-yellow-400' : ''}`}
                    onClick={() => setFilter('news')}
                  >
                    News
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {filteredNotifications.length > 0 ? (
            <Card className="bg-gray-900/60 backdrop-blur-sm border border-gray-800">
              <div className="px-4 py-2 bg-gray-800/50">
                <h4 className="text-sm font-medium text-gray-300">{getDateLabel(selectedDate)}</h4>
              </div>
              <div className="divide-y divide-gray-800">
                {filteredNotifications.map(renderNotification)}
              </div>
            </Card>
          ) : (
            <Card className="p-12 bg-gray-900/60 backdrop-blur-sm border border-gray-800 text-center">
              <Bell className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Notifications</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {filter === 'all' 
                  ? `No notifications found for ${getDateLabel(selectedDate)}. Try selecting a different date or check back later.` 
                  : `No ${filter} notifications found for ${getDateLabel(selectedDate)}.`}
              </p>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Notifications;
