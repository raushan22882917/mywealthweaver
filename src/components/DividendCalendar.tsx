
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Filter, TrendingUp, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const localizer = momentLocalizer(moment);

interface DividendEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    symbol: string;
    amount: number;
    yield: number;
    sector?: string;
    exchange?: string;
  };
}

interface StockFilterData {
  sectors: string[];
  exchanges: string[];
  minRevenue: number;
  maxRevenue: number;
  minEPS: number;
  maxEPS: number;
}

const DividendCalendar: React.FC = () => {
  const [events, setEvents] = useState<DividendEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<DividendEvent | null>(null);
  const [filterData, setFilterData] = useState<StockFilterData>({
    sectors: [],
    exchanges: [],
    minRevenue: 0,
    maxRevenue: 0,
    minEPS: 0,
    maxEPS: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedExchange, setSelectedExchange] = useState<string>('all');

  useEffect(() => {
    fetchDividendData();
  }, []);

  const fetchDividendData = async () => {
    try {
      setLoading(true);
      
      const { data: dividendData, error } = await supabase
        .from('dividendsymbol')
        .select('*')
        .not('exdividenddate', 'is', null)
        .order('exdividenddate', { ascending: true });

      if (error) {
        console.error('Error fetching dividend data:', error);
        return;
      }

      const formattedEvents: DividendEvent[] = (dividendData || []).map((item, index) => ({
        id: `${item.symbol}-${index}`,
        title: `${item.symbol} - $${item.dividend || 0}`,
        start: new Date(item.exdividenddate),
        end: new Date(item.exdividenddate),
        resource: {
          symbol: item.symbol,
          amount: item.dividend || 0,
          yield: item.yield || 0,
          sector: 'N/A',
          exchange: 'N/A'
        }
      }));

      setEvents(formattedEvents);
      
      // Extract unique sectors and exchanges for filtering
      const sectors = [...new Set(formattedEvents.map(e => e.resource.sector).filter(Boolean))];
      const exchanges = [...new Set(formattedEvents.map(e => e.resource.exchange).filter(Boolean))];
      
      setFilterData({
        sectors,
        exchanges,
        minRevenue: 0,
        maxRevenue: 1000000,
        minEPS: 0,
        maxEPS: 100
      });

    } catch (error) {
      console.error('Error fetching dividend data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.resource.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSector = selectedSector === 'all' || 
      event.resource.sector === selectedSector;
    
    const matchesExchange = selectedExchange === 'all' || 
      event.resource.exchange === selectedExchange;

    return matchesSearch && matchesSector && matchesExchange;
  });

  const handleSelectEvent = (event: DividendEvent) => {
    setSelectedEvent(event);
  };

  const CustomEvent = ({ event }: { event: DividendEvent }) => (
    <div className="text-xs p-1 bg-blue-600 text-white rounded">
      <div className="font-semibold">{event.resource.symbol}</div>
      <div>${event.resource.amount}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Dividend Calendar</h1>
          <p className="text-gray-400">Track upcoming dividend payments and ex-dividend dates</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{filteredEvents.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {filteredEvents.filter(e => moment(e.start).isSame(moment(), 'month')).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {filteredEvents.filter(e => moment(e.start).isSame(moment(), 'week')).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {filteredEvents.filter(e => moment(e.start).isSame(moment(), 'day')).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900 border-gray-700 mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Dividend Calendar
              </CardTitle>
              
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search symbols..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-600 text-white w-full md:w-64"
                  />
                </div>
                
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white w-full md:w-40">
                    <SelectValue placeholder="Sector" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Sectors</SelectItem>
                    {filterData.sectors.map(sector => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedExchange} onValueChange={setSelectedExchange}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white w-full md:w-40">
                    <SelectValue placeholder="Exchange" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Exchanges</SelectItem>
                    {filterData.exchanges.map(exchange => (
                      <SelectItem key={exchange} value={exchange}>{exchange}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="h-[600px]">
                <Calendar
                  localizer={localizer}
                  events={filteredEvents}
                  startAccessor="start"
                  endAccessor="end"
                  onSelectEvent={handleSelectEvent}
                  components={{
                    event: CustomEvent,
                  }}
                  style={{
                    height: '100%',
                    background: 'transparent',
                    color: 'white',
                  }}
                  eventPropGetter={() => ({
                    style: {
                      backgroundColor: '#3B82F6',
                      borderRadius: '4px',
                      border: 'none',
                      color: 'white',
                    },
                  })}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {selectedEvent && (
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{selectedEvent.resource.symbol}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ex-Dividend Date:</span>
                      <span>{moment(selectedEvent.start).format('MMMM DD, YYYY')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dividend Amount:</span>
                      <span className="text-green-400">${selectedEvent.resource.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dividend Yield:</span>
                      <span className="text-blue-400">{selectedEvent.resource.yield}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sector:</span>
                      <Badge variant="secondary">{selectedEvent.resource.sector}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Exchange:</span>
                      <Badge variant="outline">{selectedEvent.resource.exchange}</Badge>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                    onClick={() => window.open(`/stock/${selectedEvent.resource.symbol}`, '_blank')}
                  >
                    View Stock Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DividendCalendar;
