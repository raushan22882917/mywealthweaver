
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
  Filter
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

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'dividend' | 'price' | 'earnings' | 'news' | 'system';
  related_symbol?: string;
  read: boolean;
  created_at: string;
}

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'dividend':
      return <DollarSign className="h-6 w-6 text-green-400" />;
    case 'price':
      return <TrendingUp className="h-6 w-6 text-blue-400" />;
    case 'earnings':
      return <FileText className="h-6 w-6 text-purple-400" />;
    case 'news':
      return <AlertCircle className="h-6 w-6 text-yellow-400" />;
    case 'system':
      return <Bell className="h-6 w-6 text-gray-400" />;
    default:
      return <Mail className="h-6 w-6 text-gray-400" />;
  }
};

const NotificationBadge = ({ type }: { type: string }) => {
  switch (type) {
    case 'dividend':
      return <Badge className="ml-2 bg-green-900/60 text-green-300 hover:bg-green-800">Dividend</Badge>;
    case 'price':
      return <Badge className="ml-2 bg-blue-900/60 text-blue-300 hover:bg-blue-800">Price Alert</Badge>;
    case 'earnings':
      return <Badge className="ml-2 bg-purple-900/60 text-purple-300 hover:bg-purple-800">Earnings</Badge>;
    case 'news':
      return <Badge className="ml-2 bg-yellow-900/60 text-yellow-300 hover:bg-yellow-800">News</Badge>;
    case 'system':
      return <Badge className="ml-2 bg-gray-700/60 text-gray-300 hover:bg-gray-600">System</Badge>;
    default:
      return null;
  }
};

// Sample notification data
const sampleNotifications: Notification[] = [
  {
    id: '1',
    user_id: 'user123',
    title: 'Upcoming Dividend',
    message: 'AAPL will pay a dividend of $0.24 per share on August 15, 2023.',
    type: 'dividend',
    related_symbol: 'AAPL',
    read: false,
    created_at: '2023-08-10T14:30:00Z'
  },
  {
    id: '2',
    user_id: 'user123',
    title: 'Price Alert',
    message: 'MSFT has increased by 5% today, reaching a new high of $350.',
    type: 'price',
    related_symbol: 'MSFT',
    read: true,
    created_at: '2023-08-09T10:15:00Z'
  },
  {
    id: '3',
    user_id: 'user123',
    title: 'Earnings Report',
    message: 'AMZN reported quarterly earnings of $1.32 per share, exceeding analyst expectations.',
    type: 'earnings',
    related_symbol: 'AMZN',
    read: false,
    created_at: '2023-08-08T18:45:00Z'
  },
  {
    id: '4',
    user_id: 'user123',
    title: 'Market News',
    message: 'Fed announces interest rate hike. This may impact dividend-paying stocks.',
    type: 'news',
    read: true,
    created_at: '2023-08-07T09:30:00Z'
  },
  {
    id: '5',
    user_id: 'user123',
    title: 'Welcome to Intelligent Investor',
    message: 'Thank you for joining Intelligent Investor. Start tracking your favorite dividend stocks now!',
    type: 'system',
    read: true,
    created_at: '2023-08-01T12:00:00Z'
  },
  {
    id: '6',
    user_id: 'user123',
    title: 'Price Drop Alert',
    message: 'TSLA has decreased by 3.5% in the last hour.',
    type: 'price',
    related_symbol: 'TSLA',
    read: false,
    created_at: '2023-08-09T16:20:00Z'
  },
  {
    id: '7',
    user_id: 'user123',
    title: 'Dividend Ex-Date Reminder',
    message: 'Tomorrow is the ex-dividend date for KO. Make sure to hold shares to receive the upcoming dividend.',
    type: 'dividend',
    related_symbol: 'KO',
    read: false,
    created_at: '2023-08-08T14:00:00Z'
  }
];

const Notifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from the database
    // For now, using the sample data
    setIsLoading(true);
    setTimeout(() => {
      setNotifications(sampleNotifications);
      setIsLoading(false);
    }, 1000);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    
    // In a real app, you would update the database
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read.",
    });
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    
    // In a real app, you would update the database
    toast({
      title: "All notifications marked as read",
      description: "All notifications have been marked as read.",
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
    
    // In a real app, you would update the database
    toast({
      title: "Notification deleted",
      description: "The notification has been removed.",
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    
    // In a real app, you would update the database
    toast({
      title: "Notifications cleared",
      description: "All notifications have been deleted.",
    });
  };

  const loadMore = () => {
    // In a real app, this would fetch more notifications
    // For this demo, we'll just disable the button
    setHasMore(false);
    
    toast({
      title: "No more notifications",
      description: "You've reached the end of your notification history.",
    });
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.type === filter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
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
                    Filter: {filter === 'all' ? 'All' : filter === 'unread' ? 'Unread' : filter.charAt(0).toUpperCase() + filter.slice(1)}
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
                  <DropdownMenuItem 
                    className={`hover:bg-gray-800 ${filter === 'unread' ? 'text-purple-400' : ''}`}
                    onClick={() => setFilter('unread')}
                  >
                    Unread
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    className={`hover:bg-gray-800 ${filter === 'dividend' ? 'text-green-400' : ''}`}
                    onClick={() => setFilter('dividend')}
                  >
                    Dividend
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`hover:bg-gray-800 ${filter === 'price' ? 'text-blue-400' : ''}`}
                    onClick={() => setFilter('price')}
                  >
                    Price Alerts
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`hover:bg-gray-800 ${filter === 'earnings' ? 'text-purple-400' : ''}`}
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800">
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-700 text-white">
                  <DropdownMenuItem 
                    className="hover:bg-gray-800 flex items-center text-blue-400"
                    onClick={() => markAllAsRead()}
                  >
                    <Check className="mr-2 h-4 w-4" /> Mark all as read
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    className="hover:bg-gray-800 flex items-center text-red-400"
                    onClick={() => clearAllNotifications()}
                  >
                    <X className="mr-2 h-4 w-4" /> Clear all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`p-4 hover:shadow-md transition-shadow duration-200 ${
                    notification.read 
                      ? 'bg-gray-900/60 backdrop-blur-sm border border-gray-800' 
                      : 'bg-gray-900/80 backdrop-blur-sm border border-purple-900/40 shadow-lg'
                  }`}
                >
                  <div className="flex">
                    <div className={`p-3 rounded-full ${
                      notification.read ? 'bg-gray-800' : `bg-${notification.type === 'dividend' ? 'green' : notification.type === 'price' ? 'blue' : notification.type === 'earnings' ? 'purple' : notification.type === 'news' ? 'yellow' : 'gray'}-900/40`
                    } mr-4`}>
                      <NotificationIcon type={notification.type} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <h3 className={`font-semibold text-lg ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                              {notification.title}
                            </h3>
                            <NotificationBadge type={notification.type} />
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-purple-500 ml-2"></div>
                            )}
                          </div>
                          <p className="text-gray-400 mt-1">{notification.message}</p>
                          
                          {notification.related_symbol && (
                            <Button 
                              variant="link" 
                              className="px-0 py-1 text-purple-400 hover:text-purple-300"
                              onClick={() => navigate(`/stock/${notification.related_symbol}`)}
                            >
                              View {notification.related_symbol} <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-500 mb-2">
                            {formatDate(notification.created_at)}
                          </span>
                          
                          <div className="flex space-x-2">
                            {!notification.read && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={loadMore}
                    className="bg-gray-800 hover:bg-gray-700 text-white"
                  >
                    Load More
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card className="p-12 bg-gray-900/60 backdrop-blur-sm border border-gray-800 text-center">
              <Bell className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Notifications</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                {filter === 'all' 
                  ? "You don't have any notifications yet. They'll appear here when we have updates for you." 
                  : `No ${filter === 'unread' ? 'unread' : filter} notifications found.`}
              </p>
              {filter !== 'all' && (
                <Button 
                  onClick={() => setFilter('all')}
                  className="bg-purple-700 hover:bg-purple-600 text-white"
                >
                  View All Notifications
                </Button>
              )}
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Notifications;
