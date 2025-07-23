import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import {
  fetchDividendAnnouncements,
  convertAnnouncementsToNotifications,
  fetchNewsItems,
  convertNewsToNotifications,
  Notification
} from '@/utils/notifications';
import { supabase } from '@/integrations/supabase/client';

const NavbarNotificationSection: React.FC = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

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
          loadNotifications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dividendsymbol'
        },
        () => {
          loadNotifications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'earnings_report'
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    // Check for new notifications every 2 minutes
    const interval = setInterval(loadNotifications, 120000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const announcements = await fetchDividendAnnouncements();
      const filteredAnnouncements = convertAnnouncementsToNotifications(announcements)
        .filter(n => n.created_at.startsWith(todayStr));

      const news = await fetchNewsItems();
      const filteredNews = convertNewsToNotifications(news)
        .filter(n => n.created_at.startsWith(todayStr));

      // You can add dividendSymbols and earningsReports here if needed, similar to NotificationDropdown

      const allNotifications = [
        ...filteredAnnouncements,
        ...filteredNews
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setNotificationsOpen(!notificationsOpen)}
        className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors relative"
        aria-label="Open notifications"
      >
        <Bell className="h-5 w-5 text-gray-300" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      <NotificationDropdown
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
      />
    </div>
  );
};

export default NavbarNotificationSection;
