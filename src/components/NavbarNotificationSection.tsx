
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { getUnreadNotificationCount } from '@/utils/notifications';
import { supabase } from '@/integrations/supabase/client';

const NavbarNotificationSection: React.FC = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  
  useEffect(() => {
    loadNotificationCount();
    
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
          // Refresh notification count when new dividend announcements are added
          loadNotificationCount();
        }
      )
      .subscribe();
    
    // Check for new notifications every 2 minutes
    const interval = setInterval(loadNotificationCount, 120000);
    
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);
  
  const loadNotificationCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      setNotificationCount(count);
    } catch (error) {
      console.error('Error loading notification count:', error);
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
        {notificationCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {notificationCount}
          </span>
        )}
      </button>
      
      <NotificationDropdown 
        open={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </div>
  );
};

export default NavbarNotificationSection;
