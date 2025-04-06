
import { supabase } from '@/lib/supabase/client';
import { NewsItem } from '@/utils/types';

export const fetchLatestAnnouncements = async (limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('dividend_announcements')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
};

export const fetchUpcomingEarnings = async (limit = 5) => {
  try {
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('next_week_earnings')
      .select('*')
      .gte('report_date', formattedDate)
      .order('report_date', { ascending: true })
      .limit(limit);
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching upcoming earnings:', error);
    return [];
  }
};

export const fetchStockUpgrades = async (limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('stock_upgrades')
      .select('*')
      .order('grade_date', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching stock upgrades:', error);
    return [];
  }
};

export const fetchNewsForStock = async (symbol: string, limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('symbol', symbol)
      .order('date', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    // Convert id from number to string to match the NewsItem type
    return data.map(item => ({
      ...item,
      id: String(item.id)
    })) as NewsItem[];
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return [];
  }
};

export const fetchLatestNews = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    // Convert id from number to string to match the NewsItem type
    return data.map(item => ({
      ...item,
      id: String(item.id)
    })) as NewsItem[];
  } catch (error) {
    console.error('Error fetching latest news:', error);
    return [];
  }
};

export const fetchAllNotifications = async (limit = 20) => {
  try {
    const [announcements, earnings, upgrades, news] = await Promise.all([
      fetchLatestAnnouncements(limit / 4),
      fetchUpcomingEarnings(limit / 4),
      fetchStockUpgrades(limit / 4),
      fetchLatestNews(limit / 4)
    ]);
    
    const combinedNotifications = [
      ...announcements.map(item => ({
        ...item,
        type: 'announcement'
      })),
      ...earnings.map(item => ({
        ...item,
        type: 'earnings'
      })),
      ...upgrades.map(item => ({
        ...item,
        type: 'upgrade'
      })),
      ...news.map(item => ({
        ...item,
        type: 'news'
      }))
    ];
    
    // Sort by date descending
    return combinedNotifications.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    return [];
  }
};
