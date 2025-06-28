
import { supabase } from '@/integrations/supabase/client';
import { isToday } from 'date-fns';

export interface Notification {
  id: string;
  type: 'dividend' | 'price' | 'earnings' | 'news' | 'announcement' | 'system' | 'symbol' | 'report';
  title: string;
  message: string;
  related_symbol?: string;
  read: boolean;
  created_at: string;
  weblink?: string;
  news_id?: string;
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

export interface NewsItem {
  id: number;
  news_title: string;
  weblink: string;
  source: string;
  date: string;
  symbol?: string;
  sentiment_score?: string;
  sentiment?: string;
  original_link?: string;
}

// Fetch from Supabase
export const fetchDividendAnnouncements = async (): Promise<DividendAnnouncement[]> => {
  try {
    const { data, error } = await supabase
      .from('dividend_announcements')
      .select('*')
      .order('created_at', { ascending: false });

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
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching news items:', error);
    return [];
  }
};

export const fetchDividendSymbols = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('dividendsymbol')
      .select('*')
      .order('exdividenddate', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching dividend symbols:', error);
    return [];
  }
};

export const fetchDividendReports = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('dividend_reports')
      .select('*')
      .order('ex_dividend_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching dividend reports:', error);
    return [];
  }
};

// Convert to notification formats
export const convertAnnouncementsToNotifications = (
  announcements: DividendAnnouncement[]
): Notification[] => {
  return announcements
    .filter((a) => isToday(new Date(a.created_at)))
    .map((announcement) => ({
      id: announcement.id,
      type: 'dividend',
      title: `Dividend Announcement: ${announcement.symbol}`,
      message: `Amount: $${announcement.amount} | Ex-Date: ${new Date(announcement.date).toLocaleDateString()}`,
      related_symbol: announcement.symbol,
      read: false,
      created_at: announcement.created_at,
    }));
};

export const convertNewsToNotifications = (
  newsItems: NewsItem[]
): Notification[] => {
  return newsItems
    .filter((news) => isToday(new Date(news.date)))
    .map((news) => ({
      id: news.id.toString(),
      type: 'news',
      title: news.news_title,
      message: news.sentiment || news.source,
      related_symbol: news.symbol,
      read: false,
      created_at: news.date,
      weblink: news.weblink,
      news_id: news.id.toString(),
    }));
};

export const convertDividendSymbolsToNotifications = (
  items: any[]
): Notification[] => {
  return items
    .filter((item) => isToday(new Date(item.exdividenddate)))
    .map((item) => ({
      id: `symbol-${item.symbol}`,
      type: 'symbol',
      title: `Symbol Alert: ${item.symbol}`,
      message: `Ex-Dividend Date: ${item.exdividenddate}`,
      related_symbol: item.symbol,
      read: false,
      created_at: item.exdividenddate,
    }));
};

export const convertDividendReportsToNotifications = (
  items: any[]
): Notification[] => {
  return items
    .filter((item) => isToday(new Date(item.ex_dividend_date)))
    .map((item) => ({
      id: `report-${item.id}`,
      type: 'report',
      title: `Dividend Report: ${item.symbol}`,
      message: item.description || `Report available for ${item.symbol}`,
      related_symbol: item.symbol,
      read: false,
      created_at: item.ex_dividend_date,
    }));
};

export const formatNotificationDate = (date: string): string => {
  const notificationDate = new Date(date);
  const now = new Date();
  const diffInHours = Math.abs(now.getTime() - notificationDate.getTime()) / 36e5;

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else {
    return notificationDate.toLocaleDateString();
  }
};

// Optional: mark as read
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { data: divNotification, error } = await supabase
      .from('dividend_announcements')
      .select('id')
      .eq('id', notificationId)
      .maybeSingle();

    if (!error && divNotification) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Total unread count (today only)
export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const [ann, news, symbols, reports] = await Promise.all([
      fetchDividendAnnouncements(),
      fetchNewsItems(),
      fetchDividendSymbols(),
      fetchDividendReports()
    ]);

    const count = [
      ...convertAnnouncementsToNotifications(ann),
      ...convertNewsToNotifications(news),
      ...convertDividendSymbolsToNotifications(symbols),
      ...convertDividendReportsToNotifications(reports)
    ].length;

    return count;
  } catch (error) {
    console.error('Error getting notification count:', error);
    return 0;
  }
};
