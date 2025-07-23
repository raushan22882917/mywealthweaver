
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Search,
  Filter,
  Star,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface DummyData {
  id: string;
  symbol: string;
  name: string;
  currentPrice?: number;
  dividendRate?: number;
  dividendYield?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  marketCap?: number;
  sector?: string;
  industry?: string;
  exDividendDate?: string;
  paymentDate?: string;
  frequency?: string;
  type: 'stock' | 'dividend' | 'news' | 'announcement';
}

const DummyComponent: React.FC = () => {
  const [data, setData] = useState<DummyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from multiple sources
      const [announcementsRes, newsRes, dividendsRes, reportsRes] = await Promise.all([
        supabase.from('dividend_announcements').select('*').limit(20),
        supabase.from('news').select('*').limit(20),
        supabase.from('dividendsymbol').select('*').limit(20),
        supabase.from('earnings_report').select('*').limit(20)
      ]);

      const combinedData: DummyData[] = [];

      // Process announcements
      if (announcementsRes.data) {
        announcementsRes.data.forEach(item => {
          combinedData.push({
            id: item.id,
            symbol: item.symbol,
            name: item.header || `${item.symbol} Announcement`,
            dividendRate: item.amount,
            type: 'announcement' as const,
            exDividendDate: item.date
          });
        });
      }

      // Process news
      if (newsRes.data) {
        newsRes.data.forEach(item => {
          combinedData.push({
            id: item.id.toString(),
            symbol: item.symbol || 'N/A',
            name: item.news_title,
            type: 'news' as const
          });
        });
      }

      // Process dividend symbols
      if (dividendsRes.data) {
        dividendsRes.data.forEach(item => {
          combinedData.push({
            id: item.symbol,
            symbol: item.symbol,
            name: `${item.symbol} Dividend`,
            dividendRate: item.dividend || 0,
            dividendYield: (item.dividend && item.currentprice) ? 
              (item.dividend / item.currentprice * 100) : 0,
            currentPrice: item.currentprice || 0,
            type: 'dividend' as const,
            exDividendDate: item.exdividenddate
          });
        });
      }

      // Process earnings reports
      if (reportsRes.data) {
        reportsRes.data.forEach(item => {
          combinedData.push({
            id: `${item.symbol}-${item.earnings_date}`,
            symbol: item.symbol,
            name: `${item.symbol} Earnings Report`,
            dividendRate: item.earnings_average || 0,
            dividendYield: 0,
            type: 'earnings' as const,
            exDividendDate: item.earnings_date
          });
        });
      }

      setData(combinedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || item.type === selectedType;
    
    const matchesSector = selectedSector === 'all' || item.sector === selectedSector;

    return matchesSearch && matchesType && matchesSector;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stock':
        return <BarChart3 className="h-4 w-4" />;
      case 'dividend':
        return <DollarSign className="h-4 w-4" />;
      case 'news':
        return <Activity className="h-4 w-4" />;
      case 'announcement':
        return <Star className="h-4 w-4" />;
      default:
        return <PieChart className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'stock':
        return 'bg-blue-600';
      case 'dividend':
        return 'bg-green-600';
      case 'news':
        return 'bg-yellow-600';
      case 'announcement':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Market Data Dashboard</h1>
          <p className="text-gray-400">Comprehensive view of stocks, dividends, news, and announcements</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Dividends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {data.filter(item => item.type === 'dividend').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                News
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {data.filter(item => item.type === 'news').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {data.filter(item => item.type === 'announcement').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by symbol or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white w-full md:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="stock">Stocks</SelectItem>
                  <SelectItem value="dividend">Dividends</SelectItem>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="announcement">Announcements</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data Grid */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle>Market Data ({filteredData.length} items)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredData.map((item) => (
                  <Card key={item.id} className="bg-gray-800 border-gray-600 hover:bg-gray-750 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white text-lg">{item.symbol}</h3>
                          <p className="text-gray-400 text-sm truncate">{item.name}</p>
                        </div>
                        <Badge className={`${getTypeColor(item.type)} text-white flex items-center gap-1`}>
                          {getTypeIcon(item.type)}
                          {item.type}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {item.currentPrice && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Price:</span>
                            <span className="text-white font-medium">${item.currentPrice.toFixed(2)}</span>
                          </div>
                        )}
                        
                        {item.dividendRate && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Dividend:</span>
                            <span className="text-green-400 font-medium">${item.dividendRate.toFixed(4)}</span>
                          </div>
                        )}
                        
                        {item.dividendYield && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Yield:</span>
                            <span className="text-blue-400 font-medium">{item.dividendYield.toFixed(2)}%</span>
                          </div>
                        )}
                        
                        {item.exDividendDate && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Ex-Date:</span>
                            <span className="text-gray-300">{new Date(item.exDividendDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-3 border-gray-600 hover:bg-gray-700"
                        onClick={() => console.log('View details for:', item.symbol)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DummyComponent;
