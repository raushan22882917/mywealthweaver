
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Loader } from '@/components/ui/loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, DollarSign, ExternalLink, Filter, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface Announcement {
  id: string;
  header: string;
  message: string;
  symbol: string;
  amount: number;
  date: string;
  created_at: string;
}

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState<'all' | 'recent' | 'upcoming'>('all');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    fetchAnnouncements();
  }, []);
  
  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('dividend_announcements')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      setAnnouncements(data || []);
      setFilteredAnnouncements(data || []);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load announcements",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter announcements based on search term and filter type
  useEffect(() => {
    let filtered = announcements;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (announcement) =>
          announcement.symbol.toLowerCase().includes(term) ||
          announcement.header.toLowerCase().includes(term) ||
          announcement.message.toLowerCase().includes(term)
      );
    }
    
    // Apply time filters
    if (currentFilter !== 'all') {
      const now = new Date();
      const threeDaysAgo = new Date(now);
      threeDaysAgo.setDate(now.getDate() - 3);
      
      filtered = filtered.filter((announcement) => {
        const announcementDate = new Date(announcement.date);
        
        if (currentFilter === 'recent') {
          return announcementDate >= threeDaysAgo && announcementDate <= now;
        } else if (currentFilter === 'upcoming') {
          return announcementDate > now;
        }
        
        return true;
      });
    }
    
    setFilteredAnnouncements(filtered);
  }, [searchTerm, currentFilter, announcements]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const getTimeAgo = (dateString: string) => {
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
      return formatDate(dateString);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dividend Announcements</h1>
            <p className="text-muted-foreground max-w-3xl">
              Stay informed about upcoming dividend payments and important stock announcements. 
              Track your investments and never miss a dividend again.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by symbol or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-white"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={currentFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setCurrentFilter('all')}
                className={currentFilter === 'all' ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-700 text-gray-300'}
              >
                All
              </Button>
              <Button
                variant={currentFilter === 'recent' ? 'default' : 'outline'}
                onClick={() => setCurrentFilter('recent')}
                className={currentFilter === 'recent' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-700 text-gray-300'}
              >
                Recent
              </Button>
              <Button
                variant={currentFilter === 'upcoming' ? 'default' : 'outline'}
                onClick={() => setCurrentFilter('upcoming')}
                className={currentFilter === 'upcoming' ? 'bg-green-600 hover:bg-green-700' : 'border-gray-700 text-gray-300'}
              >
                Upcoming
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center my-12">
              <Loader message="Loading announcements..." />
            </div>
          ) : filteredAnnouncements.length > 0 ? (
            <div className="space-y-6">
              {filteredAnnouncements.map((announcement) => (
                <Card
                  key={announcement.id}
                  className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 hover:border-purple-900/50 transition-all duration-200 overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-1/4 bg-gradient-to-br from-gray-800 to-gray-900 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-purple-900/60 text-purple-300 hover:bg-purple-800">
                              {announcement.symbol}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {getTimeAgo(announcement.created_at)}
                            </span>
                          </div>
                          
                          <div className="mt-3 flex items-center text-gray-300">
                            <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                            <span className="text-sm">
                              {formatDate(announcement.date)}
                            </span>
                          </div>
                          
                          <div className="mt-3 flex items-center text-gray-300">
                            <DollarSign className="h-4 w-4 mr-2 text-green-400" />
                            <span className="text-sm">
                              ${announcement.amount.toFixed(2)} per share
                            </span>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-6 border-gray-700 hover:border-purple-500 hover:text-purple-400 text-sm"
                          onClick={() => navigate(`/stock/${announcement.symbol}`)}
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          View Stock
                        </Button>
                      </div>
                      
                      <div className="p-6 w-full md:w-3/4">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {announcement.header}
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          {announcement.message}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-900/30 border border-gray-800 rounded-xl">
              <Bell className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Announcements Found</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                {searchTerm 
                  ? "No announcements match your search criteria. Try a different search term." 
                  : currentFilter !== 'all' 
                    ? `No ${currentFilter} announcements available.`
                    : "There are no dividend announcements available at this time."}
              </p>
              {(searchTerm || currentFilter !== 'all') && (
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentFilter('all');
                  }}
                  className="bg-purple-700 hover:bg-purple-600 text-white"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Announcements;
