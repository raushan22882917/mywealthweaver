
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Bell, 
  ChevronRight, 
  Calendar, 
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
import { format, isToday, isTomorrow, parseISO, isValid } from 'date-fns';

interface DividendEvent {
  id: string;
  symbol: string;
  dividend_date?: string;
  ex_dividend_date?: string;
  earnings_date?: string;
  earnings_average?: number;
  revenue_average?: number;
  LogoURL?: string;
  company_name?: string;
  earnings_low?: number;
  earnings_high?: number;
  revenue_low?: number;
  revenue_high?: number;
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

interface DayGroup {
  date: Date;
  label: string;
  notifications: (DividendEvent | NewsEvent | DividendSymbol)[];
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
  const [dayGroups, setDayGroups] = useState<DayGroup[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [companyLogos, setCompanyLogos] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadCompanyLogos = async () => {
      try {
        const { data, error } = await supabase
          .from('company_logos')
          .select('Symbol, LogoURL');
        
        if (error) {
          console.log('Company logos query error:', error);
          return;
        }
        
        const logos: Record<string, string> = {};
        data?.forEach(item => {
          if (item.Symbol && item.LogoURL) {
            logos[item.Symbol] = item.LogoURL;
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
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        const friday = new Date(monday);
        friday.setDate(monday.getDate() + 4);

        // Fetch from dividendsymbol table (this table exists and has exdividenddate)
        const { data: dividendSymbolsData, error: dividendSymbolsError } = await supabase
          .from("dividendsymbol")
          .select("*")
          .gte('exdividenddate', monday.toISOString().split('T')[0])
          .lte('exdividenddate', friday.toISOString().split('T')[0]);

        if (dividendSymbolsError) {
          console.log('Dividend symbols query error:', dividendSymbolsError);
        }

        // Fetch from dividend_reports table
        const { data: dividendReportsData, error: dividendReportsError } = await supabase
          .from("dividend_reports")
          .select("*")
          .gte('ex_dividend_date', monday.toISOString().split('T')[0])
          .lte('ex_dividend_date', friday.toISOString().split('T')[0]);

        if (dividendReportsError) {
          console.log('Dividend reports query error:', dividendReportsError);
        }

        // Fetch from dividend_announcements table
        const { data: dividendAnnouncementsData, error: dividendAnnouncementsError } = await supabase
          .from("dividend_announcements")
          .select("*")
          .gte('created_at', monday.toISOString())
          .lte('created_at', friday.toISOString());

        if (dividendAnnouncementsError) {
          console.log('Dividend announcements query error:', dividendAnnouncementsError);
        }

        // Transform and combine all notifications
        const allNotifications = [
          ...(dividendSymbolsData?.map((item: any) => ({
            id: `symbol-${item.symbol}`,
            type: 'dividend',
            symbol: item.symbol,
            exdividenddate: item.exdividenddate,
            ...item
          })) || []),
          ...(dividendReportsData?.map((item: any) => ({
            id: `report-${item.id}`,
            type: 'earnings',
            ...item
          })) || []),
          ...(dividendAnnouncementsData?.map((item: any) => ({
            id: `announcement-${item.id}`,
            type: 'news',
            title: item.header,
            content: item.message,
            published_at: item.created_at,
            ...item
          })) || [])
        ];

        // Group notifications by day
        const groupedNotifications = allNotifications.reduce((groups: { [key: string]: any[] }, notification) => {
          const date = notification.exdividenddate || notification.ex_dividend_date || notification.published_at;
          if (!date) return groups;
          
          const dateKey = format(new Date(date), 'yyyy-MM-dd');
          if (!groups[dateKey]) {
            groups[dateKey] = [];
          }
          groups[dateKey].push(notification);
          return groups;
        }, {});

        // Convert to array and sort by date
        const sortedGroups = Object.entries(groupedNotifications)
          .map(([dateKey, notifications]) => {
            const date = parseISO(dateKey);
            let label = format(date, 'EEEE, MMMM d');
            if (isToday(date)) {
              label = 'Today';
            } else if (isTomorrow(date)) {
              label = 'Tomorrow';
            }
            return {
              date,
              label,
              notifications
            };
          })
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        setDayGroups(sortedGroups);
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
  }, [toast]);

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

  const renderNotification = (notification: any) => {
    const logoUrl = notification.symbol ? companyLogos[notification.symbol] : null;

    if (notification.type === 'dividend') {
      return (
        <div key={notification.id} className="p-4 hover:bg-gray-100 rounded-md transition-colors">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${notification.symbol} logo`}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/40';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              )}
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
                Ex-Dividend Date: {formatDate(notification.exdividenddate)}
              </p>
              {notification.shortname && (
                <p className="text-xs text-gray-400 mt-1 truncate">{notification.shortname}</p>
              )}
            </div>
          </div>
        </div>
      );
    } else if (notification.type === 'earnings') {
      return (
        <div key={notification.id} className="p-4 hover:bg-gray-100 rounded-md transition-colors">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${notification.symbol} logo`}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/40';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              )}
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
              {notification.ex_dividend_date && (
                <p className="text-xs text-gray-500 mt-1">
                  Ex-Dividend Date: {formatDate(notification.ex_dividend_date)}
                </p>
              )}
              {notification.earnings_average && notification.revenue_average && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-xs text-gray-500">Earnings</p>
                    <p className="text-sm font-medium text-gray-900">
                      ${notification.earnings_average.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="text-sm font-medium text-gray-900">
                      ${(notification.revenue_average / 1000000).toFixed(2)}M
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div key={notification.id} className="p-4 hover:bg-gray-100 rounded-md transition-colors">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${notification.symbol} logo`}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/40';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{notification.title}</p>
                  <NotificationBadge type={notification.type} />
                </div>
                {notification.url && (
                  <a href={notification.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Published: {formatDate(notification.published_at)}
              </p>
              {notification.symbol && (
                <p className="text-xs text-gray-400 mt-1 truncate">Related: {notification.symbol}</p>
              )}
              {notification.content && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.content}</p>
              )}
            </div>
          </div>
        </div>
      );
    }
  };

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
          
          {dayGroups.length > 0 ? (
            <div className="space-y-4">
              {dayGroups.map((group) => (
                <Card 
                  key={group.label} 
                  className="bg-gray-900/60 backdrop-blur-sm border border-gray-800"
                >
                  <div className="px-4 py-2 bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-300">{group.label}</h4>
                  </div>
                  <div className="divide-y divide-gray-800">
                    {group.notifications
                      .filter(notification => filter === 'all' || notification.type === filter)
                      .map(renderNotification)}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 bg-gray-900/60 backdrop-blur-sm border border-gray-800 text-center">
              <Bell className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Notifications</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {filter === 'all' 
                  ? "You don't have any notifications yet. They'll appear here when we have updates for you." 
                  : `No ${filter} notifications found.`}
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
