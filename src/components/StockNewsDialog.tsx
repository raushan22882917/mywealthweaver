import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";
import { AlertCircle, Globe, CalendarDays, FileText, Link as LinkIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface NewsItem {
  id: number;
  news_title: string;
  weblink: string;
  source: string;
  date: string;
  symbol: string;
  original_link: string;
  sentiment_score: string;
  sentiment: string;
  as_of_date?: string;
  summary?: string;
  func?: string;
}

interface StockNewsDialogProps {
  symbol: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const sentimentIcon = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    case 'negative':
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    default:
      return <Minus className="w-4 h-4 text-gray-500" />;
  }
};

const StockNewsDialog: React.FC<StockNewsDialogProps> = ({ symbol, isOpen, setIsOpen }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !symbol) return;
    setLoading(true);
    setError(null);
    setNews([]);
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('symbol', symbol)
          .order('date', { ascending: false })
          .limit(20);
        if (error) throw error;
        setNews(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch news.');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [isOpen, symbol]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl rounded-lg shadow-lg text-sm bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" /> News for <span className="uppercase">{symbol}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">
          {loading && (
            <div className="flex justify-center items-center h-32">
              <Loader />
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
          {!loading && !error && news.length === 0 && (
            <div className="text-gray-500 text-center py-8">No news found for this symbol.</div>
          )}
          {!loading && !error && news.length > 0 && (
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {news.map((item) => (
                <Card key={item.id} className="p-4 flex flex-col gap-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={item.weblink || item.original_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-700 hover:underline text-base flex items-center gap-1"
                    >
                      <LinkIcon className="w-4 h-4 text-blue-400" />
                      {item.news_title}
                    </a>
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${item.sentiment === 'positive' ? 'bg-green-100 text-green-700 border-green-200' : item.sentiment === 'negative' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {sentimentIcon(item.sentiment)}
                      {item.sentiment}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Globe className="w-4 h-4" />{item.source}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4" />{new Date(item.date).toLocaleString()}</span>
                    {item.sentiment_score && (
                      <span className="ml-2 text-gray-400">Score: {item.sentiment_score}</span>
                    )}
                  </div>
                  {item.summary && (
                    <div className="flex items-start gap-2 text-xs text-gray-700 mt-1 bg-white/80 dark:bg-gray-900/60 p-2 rounded">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="line-clamp-4">{item.summary}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockNewsDialog; 