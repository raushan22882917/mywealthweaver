
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, Calendar, Info, Search, Bell, TrendingUp, ExternalLink } from 'lucide-react';
import { fetchDividendAnnouncements, convertAnnouncementsToNotifications, fetchNewsItems, convertNewsToNotifications, formatNotificationDate, Notification } from '@/utils/notifications';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Announcements = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const highlightId = searchParams.get('id');
  const type = searchParams.get('type') || 'all';

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>(type);
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();

    // Set up a real-time subscription for new notifications
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dividend_announcements'
        },
        () => {
          // Refresh notification data when new dividend announcements are added
          loadNotifications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'news'
        },
        () => {
          // Refresh notification data when new news items are added
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      // Load dividend announcements
      const announcements = await fetchDividendAnnouncements();
      const dividendNotifications = convertAnnouncementsToNotifications(announcements);

      // Load news items
      const newsItems = await fetchNewsItems();
      const newsNotifications = convertNewsToNotifications(newsItems);

      // Combine all notifications
      const allNotifications = [...dividendNotifications, ...newsNotifications].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      if (allNotifications.length === 0) {
        toast({
          title: "No notifications found",
          description: "There are currently no notifications available.",
          variant: "default",
        });
      }

      setNotifications(allNotifications);

      // If we have a highlighted ID, show a toast to highlight it
      if (highlightId) {
        const notification = allNotifications.find(n => n.id === highlightId);
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

  const handleStockClick = (symbol: string | undefined) => {
    if (symbol) {
      navigate(`/stock/${symbol}`);
    }
  };

  const handleNotificationAction = (notification: Notification) => {
    if (notification.type === 'news' && notification.weblink) {
      window.open(notification.weblink, '_blank');
    } else if (notification.related_symbol) {
      navigate(`/stock/${notification.related_symbol}`);
    }
  };

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
                    <div className="mt-3 flex gap-2">
                      {notification.related_symbol && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-400 border-blue-800 hover:bg-blue-900/20"
                          onClick={() => handleStockClick(notification.related_symbol)}
                        >
                          View Stock Details
                        </Button>
                      )}
                      {notification.type === 'news' && notification.weblink && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-400 border-green-800 hover:bg-green-900/20 flex items-center gap-1"
                          onClick={() => window.open(notification.weblink, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Read Full Article
                        </Button>
                      )}
                    </div>
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
