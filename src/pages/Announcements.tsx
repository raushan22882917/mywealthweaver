
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Bell, Calendar, ChevronRight, DollarSign, Megaphone, Search, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchDividendAnnouncements, convertAnnouncementsToNotifications, Notification, formatNotificationDate } from '@/utils/notifications';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function Announcements() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  useEffect(() => {
    // If there's an ID in the URL, highlight that notification
    if (id) {
      const element = document.getElementById(`notification-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        element.classList.add('bg-blue-900/30');
        setTimeout(() => {
          element.classList.remove('bg-blue-900/30');
          element.classList.add('transition-colors', 'duration-1000');
        }, 1500);
      }
    }
  }, [id, notifications]);
  
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // Fetch dividend announcements
      const divAnnouncements = await fetchDividendAnnouncements();
      const dividendNotifications = convertAnnouncementsToNotifications(divAnnouncements);
      
      // Add simulated notifications for other types
      const allNotifications: Notification[] = [
        ...dividendNotifications,
        // News notifications
        {
          id: 'news1',
          type: 'news',
          title: 'Market Report Available',
          message: 'The weekly market report is now available for review.',
          news_id: '101',
          read: false,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'news2',
          type: 'news',
          title: 'Earnings Season Update',
          message: 'Read our analysis of the ongoing earnings season results.',
          news_id: '102',
          read: true,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        // Price notifications
        {
          id: 'price1',
          type: 'price',
          title: 'AAPL Price Alert',
          message: 'Apple Inc. stock has increased by 5% today.',
          related_symbol: 'AAPL',
          read: false,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        // System notifications
        {
          id: 'sys1',
          type: 'system',
          title: 'Welcome to Intelligent Investor',
          message: 'Thank you for joining! Start by adding stocks to your watchlist.',
          read: true,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getFilteredNotifications = () => {
    return notifications.filter(notification => {
      // Filter by search query
      const matchesSearch = searchQuery === '' || 
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (notification.related_symbol && notification.related_symbol.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by type
      const matchesType = activeTab === 'all' || notification.type === activeTab;
      
      return matchesSearch && matchesType;
    });
  };
  
  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === 'dividend' && notification.related_symbol) {
      navigate(`/dividend/${notification.related_symbol}`);
    } else if (notification.type === 'news' && notification.news_id) {
      navigate(`/news/${notification.news_id}`);
    } else if (notification.type === 'price' && notification.related_symbol) {
      navigate(`/stock/${notification.related_symbol}`);
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'dividend':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'price':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'earnings':
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case 'news':
        return <Megaphone className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const filteredNotifications = getFilteredNotifications();
  
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Notifications & Announcements</h1>
            <p className="text-gray-400">Stay updated with the latest dividend announcements, price alerts, and news.</p>
          </header>
          
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-5 w-full md:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="dividend">Dividends</TabsTrigger>
                <TabsTrigger value="price">Price</TabsTrigger>
                <TabsTrigger value="news">News</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="relative w-full md:w-auto md:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search notifications..."
                className="pl-10 bg-gray-900 border-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  id={`notification-${notification.id}`}
                  className="border-gray-800 bg-gray-900/50 hover:bg-gray-900 transition-colors overflow-hidden"
                >
                  <div className="flex">
                    <div className={`w-2 ${
                      notification.type === 'dividend' ? 'bg-green-500' :
                      notification.type === 'price' ? 'bg-blue-500' :
                      notification.type === 'news' ? 'bg-yellow-500' :
                      notification.type === 'earnings' ? 'bg-purple-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <CardHeader className="flex flex-row items-start justify-between pb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            notification.type === 'dividend' ? 'bg-green-500/20' :
                            notification.type === 'price' ? 'bg-blue-500/20' :
                            notification.type === 'news' ? 'bg-yellow-500/20' :
                            notification.type === 'earnings' ? 'bg-purple-500/20' :
                            'bg-gray-500/20'
                          }`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{notification.title}</CardTitle>
                            <CardDescription className="text-gray-400">
                              {formatNotificationDate(notification.created_at)}
                            </CardDescription>
                          </div>
                        </div>
                        {!notification.read && (
                          <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                            New
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent className="pb-3">
                        <p className="text-gray-200">{notification.message}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center pt-0">
                        <div className="flex items-center gap-2">
                          {notification.related_symbol && (
                            <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-700">
                              {notification.related_symbol}
                            </Badge>
                          )}
                          <Badge variant="outline" className={`${
                            notification.type === 'dividend' ? 'bg-green-500/10 text-green-300 border-green-500/30' :
                            notification.type === 'price' ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' :
                            notification.type === 'news' ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' :
                            notification.type === 'earnings' ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' :
                            'bg-gray-500/10 text-gray-300 border-gray-500/30'
                          }`}>
                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                          </Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 gap-1"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-900/30 rounded-lg border border-gray-800">
              <Bell className="h-16 w-16 mx-auto text-gray-700 mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? "No notifications match your search criteria" 
                  : activeTab !== 'all' 
                    ? `You don't have any ${activeTab} notifications yet` 
                    : "You don't have any notifications yet"}
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
