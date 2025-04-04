
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Notification, fetchDividendAnnouncements, convertAnnouncementsToNotifications } from '@/utils/notifications';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Calendar, DollarSign, TrendingUp, AlertCircle, Mail, Search, Filter, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Helper function to parse query parameters
const useQueryParams = () => {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
};

const Announcements: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  const navigate = useNavigate();
  const queryParams = useQueryParams();
  const notificationId = queryParams.get('notification');

  useEffect(() => {
    loadAllNotifications();
  }, []);

  useEffect(() => {
    // Filter notifications based on the active tab and search query
    let filtered = notifications;
    
    if (activeTab !== 'all') {
      filtered = filtered.filter(notification => notification.type === activeTab);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(query) || 
        notification.message.toLowerCase().includes(query) ||
        (notification.related_symbol && notification.related_symbol.toLowerCase().includes(query))
      );
    }
    
    // If notification ID is provided in URL, highlight that notification
    if (notificationId) {
      const targetNotification = notifications.find(n => n.id === notificationId);
      if (targetNotification) {
        // If the notification exists and has a type that doesn't match the current tab,
        // switch to the appropriate tab
        if (activeTab !== 'all' && activeTab !== targetNotification.type) {
          setActiveTab(targetNotification.type);
          return; // Return early as the useEffect will run again with the new activeTab
        }
      }
    }
    
    setFilteredNotifications(filtered);
  }, [notifications, activeTab, searchQuery, notificationId]);

  const loadAllNotifications = async () => {
    setLoading(true);
    try {
      // Fetch dividend announcements
      const announcements = await fetchDividendAnnouncements();
      const dividendNotifications = convertAnnouncementsToNotifications(announcements);
      
      // Fetch other types of notifications from Supabase (if you have tables for them)
      // For now, we'll add some sample notifications
      
      const priceNotifications: Notification[] = [
        {
          id: 'price1',
          type: 'price',
          title: 'AAPL Price Alert',
          message: 'Apple stock has increased by 5% today',
          related_symbol: 'AAPL',
          read: false,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'price2',
          type: 'price',
          title: 'MSFT Price Alert',
          message: 'Microsoft stock has decreased by 2% today',
          related_symbol: 'MSFT',
          read: true,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      const earningsNotifications: Notification[] = [
        {
          id: 'earnings1',
          type: 'earnings',
          title: 'GOOGL Earnings Release',
          message: 'Google will release its earnings report tomorrow',
          related_symbol: 'GOOGL',
          read: false,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      const newsNotifications: Notification[] = [
        {
          id: 'news1',
          type: 'news',
          title: 'Market Analysis Available',
          message: 'New market analysis report is available',
          news_id: '101',
          read: false,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'news2',
          type: 'news',
          title: 'Federal Reserve Meeting',
          message: 'Federal Reserve announces interest rate decision',
          news_id: '102',
          read: true,
          created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      const systemNotifications: Notification[] = [
        {
          id: 'sys1',
          type: 'system',
          title: 'Welcome to Intelligent Investor',
          message: 'Track your favorite dividend stocks and stay updated.',
          read: true,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'sys2',
          type: 'system',
          title: 'New Features Available',
          message: 'Check out our latest features for stock analysis.',
          read: false,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      // Combine all notifications and sort by created date
      const allNotifications = [
        ...dividendNotifications,
        ...priceNotifications,
        ...earningsNotifications,
        ...newsNotifications,
        ...systemNotifications
      ].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setNotifications(allNotifications);
      
      // If a notification ID is in the URL, scroll to it after loading
      if (notificationId) {
        setTimeout(() => {
          const element = document.getElementById(`notification-${notificationId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            element.classList.add('bg-purple-900/20');
            setTimeout(() => {
              element.classList.remove('bg-purple-900/20');
              element.classList.add('bg-gray-700/50');
            }, 2000);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read logic would go here
    
    // Handle redirection based on notification type
    if (notification.type === 'dividend' && notification.related_symbol) {
      navigate(`/dividend/${notification.related_symbol}`);
    } else if (notification.type === 'news' && notification.news_id) {
      navigate(`/news?id=${notification.news_id}`);
    } else if (notification.type === 'earnings' && notification.related_symbol) {
      navigate(`/stock/${notification.related_symbol}?tab=earnings`);
    } else if (notification.type === 'price' && notification.related_symbol) {
      navigate(`/stock/${notification.related_symbol}`);
    }
    // No navigation for system notifications - they're just informational
  };

  const NotificationIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'dividend':
        return <DollarSign className="h-5 w-5 text-green-400" />;
      case 'price':
        return <TrendingUp className="h-5 w-5 text-blue-400" />;
      case 'earnings':
        return <Calendar className="h-5 w-5 text-purple-400" />;
      case 'news':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'system':
        return <Bell className="h-5 w-5 text-gray-400" />;
      default:
        return <Mail className="h-5 w-5 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Notifications</h1>
              <p className="text-gray-400 mt-1">Stay updated with the latest announcements and alerts</p>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search notifications..."
                  className="pl-9 bg-gray-800 border-gray-700 text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-gray-500 hover:text-gray-300" />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-gray-700 mb-6">
              <TabsList className="bg-transparent">
                <TabsTrigger value="all" className="data-[state=active]:text-purple-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-400 rounded-none">
                  All
                </TabsTrigger>
                <TabsTrigger value="dividend" className="data-[state=active]:text-green-400 data-[state=active]:border-b-2 data-[state=active]:border-green-400 rounded-none">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Dividend
                </TabsTrigger>
                <TabsTrigger value="price" className="data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 rounded-none">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Price
                </TabsTrigger>
                <TabsTrigger value="earnings" className="data-[state=active]:text-purple-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-400 rounded-none">
                  <Calendar className="h-4 w-4 mr-2" />
                  Earnings
                </TabsTrigger>
                <TabsTrigger value="news" className="data-[state=active]:text-yellow-400 data-[state=active]:border-b-2 data-[state=active]:border-yellow-400 rounded-none">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  News
                </TabsTrigger>
                <TabsTrigger value="system" className="data-[state=active]:text-gray-400 data-[state=active]:border-b-2 data-[state=active]:border-gray-400 rounded-none">
                  <Bell className="h-4 w-4 mr-2" />
                  System
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-0">
              {renderNotificationsList()}
            </TabsContent>
            <TabsContent value="dividend" className="mt-0">
              {renderNotificationsList()}
            </TabsContent>
            <TabsContent value="price" className="mt-0">
              {renderNotificationsList()}
            </TabsContent>
            <TabsContent value="earnings" className="mt-0">
              {renderNotificationsList()}
            </TabsContent>
            <TabsContent value="news" className="mt-0">
              {renderNotificationsList()}
            </TabsContent>
            <TabsContent value="system" className="mt-0">
              {renderNotificationsList()}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
  
  function renderNotificationsList() {
    if (loading) {
      return (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading notifications...</p>
        </div>
      );
    }
    
    if (filteredNotifications.length === 0) {
      return (
        <div className="p-8 text-center">
          <Bell className="h-12 w-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No notifications found</p>
          {searchQuery && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSearchQuery('')}
            >
              Clear search
            </Button>
          )}
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card 
            key={notification.id}
            id={`notification-${notification.id}`}
            className={`bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer ${
              !notification.read ? 'border-l-4 border-l-purple-500' : ''
            }`}
            onClick={() => handleNotificationClick(notification)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${
                  notification.type === 'dividend' ? 'bg-green-900/40' : 
                  notification.type === 'price' ? 'bg-blue-900/40' : 
                  notification.type === 'earnings' ? 'bg-purple-900/40' : 
                  notification.type === 'news' ? 'bg-yellow-900/40' : 
                  'bg-gray-700'
                }`}>
                  <NotificationIcon type={notification.type} />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-lg font-medium ${
                        notification.type === 'dividend' ? 'text-green-400' : 
                        notification.type === 'price' ? 'text-blue-400' : 
                        notification.type === 'earnings' ? 'text-purple-400' : 
                        notification.type === 'news' ? 'text-yellow-400' : 
                        'text-gray-300'
                      }`}>
                        {notification.title}
                      </p>
                      <p className="text-gray-300 mt-1">{notification.message}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <span className="inline-block w-3 h-3 rounded-full bg-purple-500"></span>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {notification.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">
                      {formatDate(notification.created_at)}
                    </span>
                    
                    {notification.related_symbol && (
                      <Badge className="bg-gray-700 hover:bg-gray-600">
                        {notification.related_symbol}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
};

export default Announcements;
