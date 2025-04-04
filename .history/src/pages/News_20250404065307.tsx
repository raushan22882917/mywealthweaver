
import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Clock, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Papa from 'papaparse';

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
        const response = await fetch('/news/news_sentiment_analysis.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          delimiter: ',',
          complete: (results) => {
            const processedNews = results.data
              .filter((item: any) => item.news_title && item.weblink)
              .map((item: NewsItem, index: number) => ({
                ...item,
                id: index + 1,
                sentiment_score: item.sentiment_score === 'N/A' ? '0' : item.sentiment_score
              }));
            
            setNewsData(processedNews);
            
            // If a specific news ID is provided, scroll to it
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
        });
      } catch (error) {
        console.error('Error fetching news data:', error);
        setLoading(false);
      }
    };

    fetchNewsData();
    // Refresh data every 2 minutes
    const interval = setInterval(fetchNewsData, 120000);
    return () => clearInterval(interval);
  }, [highlightedNewsId, toast]);

  // Filter news based on search query and highlighted ID
  const filteredNews = newsData.filter(news => {
    const matchesSearch = news.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         news.news_title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // If highlighting a specific ID, only show that news item first
    if (highlightedNewsId && news.id?.toString() === highlightedNewsId) {
      return true;
    }
    
    return matchesSearch;
  });

  // Sort to ensure highlighted news appears at the top
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

  // Calculate sentiment counts for filtered news
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

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#1a1f2e] p-2 rounded">
              <svg width="24" height="24" viewBox="0 0 24 24" className="text-white">
                <path fill="currentColor" d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                <path fill="currentColor" d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-medium text-white">Market News</h1>
              <p className="text-sm text-gray-400">Stay updated with the latest market insights</p>
            </div>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              placeholder="Search by stock symbol..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#1a1f2e] border border-gray-700 text-white
                focus:outline-none focus:ring-1 focus:ring-gray-600"
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : currentNews.length > 0 ? (
              currentNews.map((news) => (
                <Card 
                  key={news.id} 
                  id={`news-${news.id}`}
                  className={`bg-[#1a1f2e] border-gray-700 ${highlightedNewsId && news.id?.toString() === highlightedNewsId ? 'border-blue-500 bg-[#212738]' : ''}`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <a 
                        href={news.original_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-medium text-white hover:text-blue-400"
                      >
                        {news.news_title}
                      </a>
                      <Badge className="bg-[#2a3142] text-gray-300 border-0">
                        {news.symbol}
                      </Badge>
                    </div>
                    
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {new Date(news.date).toLocaleDateString()}
                      </div>
                      <span className="text-gray-600">•</span>
                      <span>{news.source}</span>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-gray-300 border-gray-700 hover:bg-[#242938]"
                      >
                        Like
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-gray-300 border-gray-700 hover:bg-[#242938]"
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="bg-[#1a1f2e] rounded-lg border border-gray-700 p-8 text-center">
                <p className="text-gray-400">No news found matching your search.</p>
              </div>
            )}

            {/* Pagination */}
            {filteredNews.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-[#1a1f2e] p-4 rounded-lg border border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="text-gray-300 border-gray-700 hover:bg-[#242938] disabled:opacity-50"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="text-sm text-gray-400">
                    {indexOfFirstNews + 1}-{Math.min(indexOfLastNews, filteredNews.length)} of {filteredNews.length}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="text-gray-300 border-gray-700 hover:bg-[#242938] disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          <div>
            <Card className="bg-[#1a1f2e] border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-base font-medium text-white">Sentiment Analysis</h2>
              </div>
              <div className="p-4 space-y-4">
                {["Positive", "Negative", "Neutral"].map((sentiment) => {
                  const stats = getSentimentCounts();
                  const count = stats.counts[sentiment as keyof typeof stats.counts];
                  const percentage = stats.percentages[sentiment as keyof typeof stats.percentages];
                  
                  return (
                    <div key={sentiment} className="space-y-2">
                      <div className="flex justify-between items-center text-gray-300">
                        <span className="text-sm">{sentiment}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">{percentage.toFixed(1)}%</span>
                          <Badge variant="outline" className="bg-[#2a3142] border-gray-700">
                            {count}
                          </Badge>
                        </div>
                      </div>
                      <div className="h-1.5 bg-[#2a3142] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            sentiment === "Positive" ? "bg-green-500" :
                            sentiment === "Negative" ? "bg-red-500" :
                            "bg-yellow-500"
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
