
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const localizer = momentLocalizer(moment);

const DividendCalendar: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [filterData, setFilterData] = useState({
    sectors: [] as string[],
    exchanges: [] as string[],
    minRevenue: 0,
    maxRevenue: 0,
    minEPS: 0,
    maxEPS: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedExchange, setSelectedExchange] = useState('all');

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

      const formattedEvents = (dividendData || []).map((item: any, index: number) => ({
        id: `${item.symbol}-${index}`,
        title: `${item.symbol} - $${item.dividend || 0}`,
        start: new Date(item.exdividenddate),
        end: new Date(item.exdividenddate),
        resource: {
          symbol: item.symbol,
          amount: item.dividend || 0,
          yield: item.dividendyield || 0,
          sector: 'N/A',
          exchange: 'N/A'
        }
      }));

      setEvents(formattedEvents);

      // Extract unique sectors and exchanges for filtering
      const sectors = Array.from(new Set(formattedEvents.map((e: any) => e.resource.sector).filter(Boolean)));
      const exchanges = Array.from(new Set(formattedEvents.map((e: any) => e.resource.exchange).filter(Boolean)));

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

  const filteredEvents = events.filter((event) => {
    const matchesSearch = searchTerm === '' || event.resource.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'all' || event.resource.sector === selectedSector;
    const matchesExchange = selectedExchange === 'all' || event.resource.exchange === selectedExchange;

    return matchesSearch && matchesSector && matchesExchange;
  });

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
  };

  const CustomEvent = ({ event }: { event: any }) => (
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
              <CardTitle className="text-sm font-medium text-gray-400">Next Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {filteredEvents.filter(e => moment(e.start).isBetween(moment(), moment().add(1, 'week'))).length}
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

        {/* Filters */}
        <Card className="bg-gray-900 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by symbol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Filter by sector" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Sectors</SelectItem>
                  {filterData.sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedExchange} onValueChange={setSelectedExchange}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Filter by exchange" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Exchanges</SelectItem>
                  {filterData.exchanges.map((exchange) => (
                    <SelectItem key={exchange} value={exchange}>
                      {exchange}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div style={{ height: '600px' }}>
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
                    backgroundColor: 'transparent',
                    color: 'white'
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="bg-gray-900 border-gray-700 max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle className="text-white">Dividend Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400">Symbol:</span>
                    <span className="text-white ml-2 font-semibold">{selectedEvent.resource.symbol}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-green-400 ml-2 font-semibold">${selectedEvent.resource.amount}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Yield:</span>
                    <span className="text-blue-400 ml-2 font-semibold">{selectedEvent.resource.yield}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Date:</span>
                    <span className="text-white ml-2">{moment(selectedEvent.start).format('MMMM D, YYYY')}</span>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => setSelectedEvent(null)}
                    className="bg-gray-700 hover:bg-gray-600"
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DividendCalendar;
