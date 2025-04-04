
import React, { useState, useEffect } from 'react';
import { Bell, Calendar, DollarSign, TrendingUp, AlertCircle, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Notification, fetchDividendAnnouncements, convertAnnouncementsToNotifications, formatNotificationDate } from '@/utils/notifications';

interface NotificationDropdownProps {
  open: boolean;
  onClose: () => void;
}

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'dividend':
      return <DollarSign className="h-4 w-4 text-green-400" />;
    case 'price':
      return <TrendingUp className="h-4 w-4 text-blue-400" />;
    case 'earnings':
      return <Calendar className="h-4 w-4 text-purple-400" />;
    case 'news':
      return <AlertCircle className="h-4 w-4 text-yellow-400" />;
    case 'system':
      return <Bell className="h-4 w-4 text-gray-400" />;
    default:
      return <Mail className="h-4 w-4 text-gray-400" />;
  }
};

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ open, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Fetch dividend announcements
      const announcements = await fetchDividendAnnouncements();
      
      // Convert to notification format
      const dividendNotifications = convertAnnouncementsToNotifications(announcements);
      
      // Sample system and news notifications
      const systemNotifications: Notification[] = [
        {
          id: 'sys1',
          type: 'system',
          title: 'Welcome to Intelligent Investor',
          message: 'Track your favorite dividend stocks and stay updated.',
          read: true,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
        }
      ];
      
      const newsNotifications: Notification[] = [
        {
          id: 'news1',
          type: 'news',
          title: 'Market Analysis Available',
          message: 'New market analysis report is available',
          news_id: '101', // Adding a news ID for specific redirection
          read: false,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        }
      ];
      
      // Combine all notifications and sort by created date
      const allNotifications = [
        ...dividendNotifications, 
        ...systemNotifications, 
        ...newsNotifications
      ].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    onClose();
    
    // Handle redirection based on notification type
    if (notification.type === 'dividend' && notification.related_symbol) {
      // Redirect to the specific stock's dividend page
      navigate(`/dividend/${notification.related_symbol}`);
    } else if (notification.type === 'news' && notification.news_id) {
      // Redirect to the specific news article
      navigate(`/news?id=${notification.news_id}`);
    } else if (notification.type === 'earnings' && notification.related_symbol) {
      // Redirect to the stock details with earnings tab
      navigate(`/stock/${notification.related_symbol}?tab=earnings`);
    } else if (notification.type === 'price' && notification.related_symbol) {
      // Redirect to the stock details
      navigate(`/stock/${notification.related_symbol}`);
    } else if (notification.id) {
      // For other types or when specific IDs aren't available, 
      // redirect to the announcements page with a filter
      navigate(`/announcements?notification=${notification.id}`);
    } else {
      // Fallback to announcements page
      navigate('/announcements');
    }
  };

  if (!open) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Notifications</h3>
        <Badge className="bg-purple-600">{notifications.filter(n => !n.read).length} new</Badge>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-400">
            Loading notifications...
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <div 
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors ${
                !notification.read ? 'bg-gray-700/50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  notification.type === 'dividend' ? 'bg-green-900/40' : 
                  notification.type === 'price' ? 'bg-blue-900/40' : 
                  notification.type === 'earnings' ? 'bg-purple-900/40' : 
                  notification.type === 'news' ? 'bg-yellow-900/40' : 
                  'bg-gray-800'
                }`}>
                  <NotificationIcon type={notification.type} />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className={`text-sm font-medium ${
                      notification.type === 'dividend' ? 'text-green-400' : 
                      notification.type === 'price' ? 'text-blue-400' : 
                      notification.type === 'earnings' ? 'text-purple-400' : 
                      notification.type === 'news' ? 'text-yellow-400' : 
                      'text-gray-400'
                    }`}>
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    )}
                  </div>
                  
                  <p className="text-gray-300 text-sm mt-1">{notification.message}</p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {formatNotificationDate(notification.created_at)}
                    </span>
                    
                    {notification.related_symbol && (
                      <Badge variant="outline" className="text-xs border-gray-600">
                        {notification.related_symbol}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 mx-auto text-gray-600 mb-2" />
            <p className="text-gray-400">No notifications yet</p>
          </div>
        )}
      </div>
      
      <div className="p-2 flex justify-center border-t border-gray-700">
        <Button 
          variant="link"
          className="w-full text-center text-blue-400 text-sm hover:text-blue-300"
          onClick={() => {
            onClose();
            navigate('/announcements');
          }}
        >
          View all notifications
        </Button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
