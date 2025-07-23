
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, X, Calendar, DollarSign, TrendingUp, Info,
  Star, AlertTriangle, Check, ExternalLink
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Notification, formatNotificationDate,
  fetchDividendAnnouncements, convertAnnouncementsToNotifications,
  fetchNewsItems, convertNewsToNotifications
} from '@/utils/notifications';
import { supabase } from '@/integrations/supabase/client';
import { isToday } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

interface NotificationDropdownProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ open, onClose, notifications }) => {
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === 'news') {
      if (notification.weblink) {
        window.open(notification.weblink, '_blank');
      } else if (notification.news_id) {
        navigate(`/news?id=${notification.news_id}`);
      }
    } else if (notification.type === 'announcement') {
      navigate('/announcements');
    }
    onClose();
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
      case 'announcement':
        return <Star className="h-5 w-5 text-amber-400" />;
      case 'system':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      default:
        return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  if (!open) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-gray-900 rounded-lg shadow-lg z-50 border border-gray-700"
    >
      <div className="p-3 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
        <h3 className="font-medium text-white">Notifications</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full hover:bg-gray-700"
        >
          <X className="h-4 w-4 text-gray-400" />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : notifications.length > 0 ? (
        <div>
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`border-none rounded-none transition-colors cursor-pointer ${
                notification.type === 'system' ? 'bg-red-950 border-l-4 border-red-500' : 'hover:bg-gray-800 border-l-4 border-transparent'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="p-4 flex gap-3">
                <div className="mt-1 flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div>
                  <p className={`font-medium ${notification.type === 'system' ? 'text-red-300' : 'text-white'}`}>
                    {notification.title}
                  </p>
                  <p className={`text-sm ${notification.type === 'system' ? 'text-red-400' : 'text-gray-400'} line-clamp-2 mb-1`}>
                    {notification.message}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-indigo-400 font-semibold">
                      {notification.type === 'dividend' ? 'Dividend' : 
                       notification.type === 'news' ? 'News' : 
                       notification.type === 'announcement' ? 'Announcement' : 'General'}
                    </span>
                    <p className={`text-xs ${notification.type === 'system' ? 'text-red-500' : 'text-gray-500'}`}>
                      {/* Always show current date in the format 'Today, Month Day, Year' */}
                      {`Today, ${new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`}
                    </p>
                    {notification.weblink && (
                      <ExternalLink className="h-3 w-3 text-blue-400 ml-2" />
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          <div className="p-3 border-t border-gray-700 text-center">
            <Button
              variant="ghost"
              className="text-blue-400 hover:text-blue-300 text-sm"
              onClick={() => {
                navigate('/notifications');
                onClose();
              }}
            >
              See More
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center">
          <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-gray-800 mb-4">
            <Check className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-400">No new notifications</p>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;