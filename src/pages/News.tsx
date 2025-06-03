import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Clock, Share2, ExternalLink, TrendingUp, TrendingDown, Minus, Eye, BarChart3 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from '@supabase/supabase-js';

// Create a generic Supabase client without type constraints
const supabaseUrl = "https://imrrxaziqfppoiubayrs.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltcnJ4YXppcWZwcG9pdWJheXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NzEzNTQsImV4cCI6MjA1ODQ0NzM1NH0.hgpp54SWTMNSdMDC5_DE1Sl_tmxE_BAfcYxkIHrp3lg";
const supabase = createClient(supabaseUrl, supabaseKey);

interface NewsItem {
  news_title: string;
  weblink: string;
  source: string;
  date: string;
  symbol: string;
  original_link: string;
  sentiment_score: string;
  sentiment: string;
  id?: number;
}

const News = () => {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [highlightedNewsId, setHighlightedNewsId] = useState<string | null>(null);
  const newsPerPage = 10;
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const newsIdFromQuery = queryParams.get('id');
  const { toast } = useToast();

  useEffect(() => {
    const newsId = id || newsIdFromQuery;
    if (newsId) {
      setHighlightedNewsId(newsId);
    }
  }, [id, newsIdFromQuery]);

  useEffect(() => {
    const fetchNewsData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*');

        if (error) throw error;

        if (data) {
          const processedNews = data
            .filter((item) => item.news_title && item.weblink)
            .map((item, index) => ({
              news_title: item.news_title,
              weblink: item.weblink,
              source: item.source,
              date: item.date,
              symbol: item.symbol,
              original_link: item.original_link || item.weblink,
              sentiment_score: item.sentiment_score === 'N/A' ? '0' : item.sentiment_score,
              sentiment: item.sentiment,
              id: item.id || index + 1
            } as NewsItem));

          setNewsData(processedNews);

          if (highlightedNewsId) {
            setTimeout(() => {
              const element = document.getElementById(`news-${highlightedNewsId}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                element.classList.add('ring-2', 'ring-blue-500');
                toast({
                  title: "News highlighted",
                  description: "You were redirected to the specific news item.",
                });
              }
            }, 500);
          }

          setLoading(false);
        }

      } catch (error) {
        console.error('Error fetching news data:', error);
        setLoading(false);
      }
    };

    fetchNewsData();
    const interval = setInterval(fetchNewsData, 120000);
    return () => clearInterval(interval);
  }, [highlightedNewsId, toast]);

  const filteredNews = newsData.filter(news => {
    const matchesSearch = news.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         news.news_title.toLowerCase().includes(searchQuery.toLowerCase());

    if (highlightedNewsId && news.id?.toString() === highlightedNewsId) {
      return true;
    }

    return matchesSearch;
  });

  const sortedFilteredNews = [...filteredNews].sort((a, b) => {
    if (highlightedNewsId) {
      if (a.id?.toString() === highlightedNewsId) return -1;
      if (b.id?.toString() === highlightedNewsId) return 1;
    }
    return 0;
  });

  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = sortedFilteredNews.slice(indexOfFirstNews, indexOfLastNews);
  const totalPages = Math.ceil(sortedFilteredNews.length / newsPerPage);

  const getSentimentCounts = () => {
    const counts = {
      Positive: 0,
      Negative: 0,
      Neutral: 0
    };

    filteredNews.forEach(news => {
      if (news.sentiment) {
        counts[news.sentiment as keyof typeof counts]++;
      }
    });

    const total = filteredNews.length || 1;
    return {
      counts,
      percentages: {
        Positive: (counts.Positive / total) * 100,
        Negative: (counts.Negative / total) * 100,
        Neutral: (counts.Neutral / total) * 100
      }
    };
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'Negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'Negative':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117]">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" className="text-white">
                <path fill="currentColor" d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                <path fill="currentColor" d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Market News
              </h1>
              <p className="text-gray-400 text-lg">Stay updated with the latest market insights</p>
            </div>
          </div>
          
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              placeholder="Search by stock symbol or news..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#1a1f2e] border border-gray-700 text-white
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-200"
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-gray-800"></div>
                </div>
              </div>
            ) : currentNews.length > 0 ? (
              currentNews.map((news) => (
                <Card
                  key={news.id}
                  id={`news-${news.id}`}
                  className={`group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 
                    bg-gradient-to-r from-[#1a1f2e] to-[#242938] border-gray-700/50 hover:border-blue-500/30
                    ${highlightedNewsId && news.id?.toString() === highlightedNewsId ? 'ring-2 ring-blue-500 bg-gradient-to-r from-[#212738] to-[#2a3142]' : ''}
                    overflow-hidden`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30 px-3 py-1 font-semibold">
                          {news.symbol}
                        </Badge>
                        {news.sentiment && (
                          <Badge className={`border ${getSentimentColor(news.sentiment)} flex items-center gap-1`}>
                            {getSentimentIcon(news.sentiment)}
                            {news.sentiment}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        {new Date(news.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>

                    <a
                      href={news.original_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group-hover:translate-x-1 transition-transform duration-200"
                    >
                      <h3 className="text-lg font-semibold text-white hover:text-blue-400 transition-colors duration-200 
                        line-clamp-2 leading-relaxed mb-4">
                        {news.news_title}
                      </h3>
                    </a>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">{news.source}</span>
                        </div>
                        {news.sentiment_score && news.sentiment_score !== '0' && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span>Score: {parseFloat(news.sentiment_score).toFixed(2)}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Read
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        >
                          <a href={news.original_link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </Card>
              ))
            ) : (
              <Card className="bg-[#1a1f2e] border-gray-700 p-12 text-center">
                <div className="text-gray-400 space-y-3">
                  <Search className="h-12 w-12 mx-auto opacity-50" />
                  <h3 className="text-lg font-semibold">No news found</h3>
                  <p>Try adjusting your search criteria or check back later for new updates.</p>
                </div>
              </Card>
            )}

            <Card className="bg-gradient-to-r from-[#1a1f2e] to-[#242938] border-gray-700/50 p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <span className="text-gray-600">•</span>
                  <span>
                    Showing {indexOfFirstNews + 1}-{Math.min(indexOfLastNews, filteredNews.length)} of {filteredNews.length} articles
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#242938] border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Sentiment Analysis
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {["Positive", "Negative", "Neutral"].map((sentiment) => {
                  const stats = getSentimentCounts();
                  const count = stats.counts[sentiment as keyof typeof stats.counts];
                  const percentage = stats.percentages[sentiment as keyof typeof stats.percentages];

                  return (
                    <div key={sentiment} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-300">
                          {getSentimentIcon(sentiment)}
                          <span className="font-medium">{sentiment}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-400 font-mono">
                            {percentage.toFixed(1)}%
                          </span>
                          <Badge className={`${getSentimentColor(sentiment)} text-xs`}>
                            {count}
                          </Badge>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            sentiment === "Positive" ? "bg-gradient-to-r from-green-500 to-green-400" :
                            sentiment === "Negative" ? "bg-gradient-to-r from-red-500 to-red-400" :
                            "bg-gradient-to-r from-yellow-500 to-yellow-400"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default News;
