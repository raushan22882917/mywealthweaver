
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  type: 'dividend' | 'price' | 'earnings' | 'news' | 'system';
  title: string;
  message: string;
  related_symbol?: string;
  news_id?: string;        // Added for news redirection
  read: boolean;
  created_at: string;
}

export interface DividendAnnouncement {
  id: string;
  header: string;
  message: string;
  symbol: string;
  amount: number;
  date: string;
  created_at: string;
}

// Function to fetch dividend announcements
export const fetchDividendAnnouncements = async (): Promise<DividendAnnouncement[]> => {
  try {
    const { data, error } = await supabase
      .from('dividend_announcements')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching dividend announcements:', error);
    return [];
  }
};

// Convert dividend announcements to notifications format
export const convertAnnouncementsToNotifications = (
  announcements: DividendAnnouncement[]
): Notification[] => {
  return announcements.map((announcement) => ({
    id: announcement.id,
    type: 'dividend',
    title: announcement.header,
    message: announcement.message,
    related_symbol: announcement.symbol,
    read: false,
    created_at: announcement.created_at,
  }));
};

// Format date for notifications
export const formatNotificationDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    }
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};
