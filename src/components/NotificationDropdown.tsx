import React, { useState, useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface Notification {
  symbol: string;
  buy_date: string;
  currentprice: number;
  dividend: number;
  dividendrate: number;
  dividendyield: number;
  earningsdate: string;
  exdividenddate: string;
  hist: string;
  insight: string;
  message: string;
  payoutdate: string;
  payoutratio: number;
  previousclose: number;
  quotetype: string;
  shortname: string;
}

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', session.user.id)
          .limit(10);

        if (error) throw error;

        setNotifications(data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session]);

  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification);
    navigate(`/stock/${notification.symbol}`);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 border border-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuItem className="text-sm font-medium leading-none">
          Notifications
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {notifications.map((notification, index) => (
          <div
            key={`${notification.symbol}-${index}`}
            className="p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer"
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://logo.clearbit.com/${notification.shortname.toLowerCase().replace(/ /g, '')}.com`} alt={notification.shortname} />
                <AvatarFallback>{notification.shortname.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{notification.shortname}</p>
                <p className="text-xs text-gray-500">{notification.message}</p>
              </div>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <DropdownMenuItem className="text-center text-gray-500">
            No notifications
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
