
import { supabase } from '@/lib/supabase/client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'dividend' | 'price' | 'earnings' | 'news' | 'announcement' | 'system';
  created_at: string;
  read: boolean;
  related_symbol?: string;
  weblink?: string;
  news_id?: string;
}

export interface DividendAnnouncement {
  id: string;
  symbol: string;
  date: string;
  header: string;
  message: string;
  amount: number;
  created_at: string;
}

export interface NewsItem {
  id: string;
  date: string;
  news_title: string;
  original_link: string;
  sentiment: string;
  sentiment_score: string;
  source: string;
  symbol: string;
  weblink: string;
}

export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    // Count unread dividend announcements
    const { data: dividendData, error: dividendError } = await supabase
      .from('dividend_announcements')
      .select('id', { count: 'exact' })
      .eq('read', false);
    
    // Count unread news items with important sentiment
    const { data: newsData, error: newsError } = await supabase
      .from('news')
      .select('id', { count: 'exact' })
      .eq('read', false)
      .in('sentiment', ['positive', 'negative']);
    
    if (dividendError || newsError) {
      console.error('Error fetching unread notifications:', dividendError || newsError);
      return 0;
    }
    
    const dividendCount = dividendData?.length || 0;
    const newsCount = newsData?.length || 0;
    
    return dividendCount + newsCount;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
};

export const fetchDividendAnnouncements = async (): Promise<DividendAnnouncement[]> => {
  try {
    const { data, error } = await supabase
      .from('dividend_announcements')
      .select('*')
      .order('date', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching dividend announcements:', error);
    return [];
  }
};

export const fetchNewsItems = async (): Promise<NewsItem[]> => {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('date', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching news items:', error);
    return [];
  }
};

export const convertAnnouncementsToNotifications = (announcements: DividendAnnouncement[]): Notification[] => {
  return announcements.map(announcement => ({
    id: announcement.id,
    title: `Dividend Announcement: ${announcement.symbol}`,
    message: announcement.message || `${announcement.symbol} has announced a dividend of $${announcement.amount}`,
    type: 'dividend',
    created_at: announcement.created_at,
    read: false,
    related_symbol: announcement.symbol
  }));
};

export const convertNewsToNotifications = (news: NewsItem[]): Notification[] => {
  return news.map(item => ({
    id: item.id,
    title: `${item.symbol} News: ${item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}`,
    message: item.news_title,
    type: 'news',
    created_at: item.date,
    read: false,
    related_symbol: item.symbol,
    weblink: item.weblink,
    news_id: item.id
  }));
};

export const formatNotificationDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};
