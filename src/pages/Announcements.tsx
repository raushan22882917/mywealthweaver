
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, Calendar, Info, Search, Bell, TrendingUp } from 'lucide-react';
import { fetchDividendAnnouncements, convertAnnouncementsToNotifications, formatNotificationDate, Notification } from '@/utils/notifications';
import { useToast } from '@/components/ui/use-toast';

const Announcements = () => {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');
  const type = searchParams.get('type') || 'all';
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>(type);
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Load dividend announcements
      const announcements = await fetchDividendAnnouncements();
      const notificationItems = convertAnnouncementsToNotifications(announcements);
      
      setNotifications(notificationItems);
      
      // If we have a highlighted ID, show a toast to highlight it
      if (highlightId) {
        const notification = notificationItems.find(n => n.id === highlightId);
        if (notification) {
          toast({
            title: "Notification highlighted",
            description: notification.title,
          });
        }
      }
      
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: "Failed to load notifications",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'dividend':
        return <DollarSign className="h-5 w-5 text-green-400" />;
      case 'price':
        return <TrendingUp className="h-5 w-5 text-blue-400" />;
      case 'earnings':
        return <Calendar className="h-5 w-5 text-purple-400" />;
      case 'news':
        return <Info className="h-5 w-5 text-yellow-400" />;
      default:
        return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  // Filter notifications based on search term and active filter
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notification.related_symbol && notification.related_symbol.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = activeFilter === 'all' || notification.type === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
        <p className="text-gray-400 mb-8">
          Stay updated with the latest financial news and announcements.
        </p>
        
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search notifications..."
                className="pl-10 bg-gray-900 border-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-shrink-0">
              <Button
                variant="outline"
                className={`mr-2 ${activeFilter === 'all' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
                onClick={() => setActiveFilter('all')}
              >
                All
              </Button>
              <Button
                variant="outline"
                className={`mr-2 ${activeFilter === 'dividend' ? 'bg-green-900/50 text-green-400 border-green-700' : 'text-gray-400'}`}
                onClick={() => setActiveFilter('dividend')}
              >
                <DollarSign className="h-4 w-4 mr-1" />
                Dividends
              </Button>
              <Button
                variant="outline"
                className={`${activeFilter === 'news' ? 'bg-yellow-900/50 text-yellow-400 border-yellow-700' : 'text-gray-400'}`}
                onClick={() => setActiveFilter('news')}
              >
                <Info className="h-4 w-4 mr-1" />
                News
              </Button>
            </div>
          </div>
        </div>
        
        {/* Notifications List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-6 bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors ${
                  notification.id === highlightId ? 'border-blue-500 bg-blue-900/20' : ''
                }`}
              >
                <div className="flex gap-4">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-white text-lg">{notification.title}</h3>
                      <span className="text-xs text-gray-500">{formatNotificationDate(notification.created_at)}</span>
                    </div>
                    <p className="text-gray-400 mt-2">{notification.message}</p>
                    {notification.related_symbol && (
                      <div className="mt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-blue-400 border-blue-800 hover:bg-blue-900/20"
                          onClick={() => window.location.href = `/stock/${notification.related_symbol}`}
                        >
                          View Stock Details
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
            <Bell className="mx-auto h-12 w-12 text-gray-700 mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No notifications found</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? `No results matching "${searchTerm}"`
                : activeFilter !== 'all' 
                  ? `No ${activeFilter} notifications available`
                  : "You don't have any notifications yet"}
            </p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Announcements;
