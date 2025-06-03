import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Filter, Search, TrendingUp, DollarSign, Building } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import HolidayCalendarCell from "./HolidayCalendarCell";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useIsMobile } from "@/hooks/use-mobile";

const localizer = momentLocalizer(moment);

interface DividendEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  symbol: string;
  type: 'dividend' | 'earnings' | 'holiday';
  amount?: number;
  yield?: number;
  sector?: string;
  exchange?: string;
}

const DividendCalendar: React.FC = () => {
  const [events, setEvents] = useState<DividendEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<DividendEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<DividendEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [holidays, setHolidays] = useState<any[]>([]);
  const [stockData, setStockData] = useState<Record<string, any>>({});
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch holidays
        const { data: holidayData } = await supabase
          .from('holidays')
          .select('*');
        
        if (holidayData) {
          console.log('Loaded holiday data from Supabase:', holidayData.length);
          setHolidays(holidayData);
        }

        // Fetch dividend data
        const { data: dividendSymbols } = await supabase
          .from('dividendsymbol')
          .select('*')
          .limit(100);

        console.log('Total symbols in dividend table:', dividendSymbols?.length || 0);

        // Fetch company logos
        const { data: companyLogos } = await supabase
          .from('company_logos')
          .select('*');

        console.log('Loaded company logos from Supabase:', companyLogos?.length || 0);

        // Create events from data
        const calendarEvents: DividendEvent[] = [];

        // Add holiday events
        holidayData?.forEach(holiday => {
          calendarEvents.push({
            id: `holiday-${holiday.id}`,
            title: holiday.name,
            start: new Date(holiday.date),
            end: new Date(holiday.date),
            symbol: '',
            type: 'holiday'
          });
        });

        // Add dividend events
        dividendSymbols?.forEach(dividend => {
          if (dividend.exdividenddate) {
            calendarEvents.push({
              id: `dividend-${dividend.symbol}`,
              title: `${dividend.symbol} Dividend`,
              start: new Date(dividend.exdividenddate),
              end: new Date(dividend.exdividenddate),
              symbol: dividend.symbol,
              type: 'dividend',
              amount: dividend.dividend,
              yield: dividend.dividendyield
            });
          }

          if (dividend.earningsdate) {
            calendarEvents.push({
              id: `earnings-${dividend.symbol}`,
              title: `${dividend.symbol} Earnings`,
              start: new Date(dividend.earningsdate),
              end: new Date(dividend.earningsdate),
              symbol: dividend.symbol,
              type: 'earnings'
            });
          }
        });

        setEvents(calendarEvents);
        setFilteredEvents(calendarEvents);

      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = events.filter(event =>
      event.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (typeFilter !== "all") {
      filtered = filtered.filter(event => event.type === typeFilter);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, typeFilter]);

  const handleSelectEvent = (event: DividendEvent) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const eventStyleGetter = (event: DividendEvent) => {
    let backgroundColor = '#3174ad';
    
    switch (event.type) {
      case 'dividend':
        backgroundColor = '#10b981';
        break;
      case 'earnings':
        backgroundColor = '#f59e0b';
        break;
      case 'holiday':
        backgroundColor = '#ef4444';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: isMobile ? '10px' : '12px',
        padding: '2px 4px'
      }
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filters */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className={`text-white flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className={`flex gap-2 sm:gap-4 ${isMobile ? 'flex-col' : 'flex-row'}`}>
            <div className="flex-1">
              <Input
                placeholder="Search symbols..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`bg-gray-800 border-gray-600 text-white ${isMobile ? 'text-sm' : ''}`}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className={`bg-gray-800 border-gray-600 text-white ${isMobile ? 'text-sm' : 'w-40'}`}>
                <SelectValue placeholder="Event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="dividend">Dividends</SelectItem>
                <SelectItem value="earnings">Earnings</SelectItem>
                <SelectItem value="holiday">Holidays</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-2 sm:p-6">
          <div style={{ height: isMobile ? '400px' : '600px' }}>
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              className="dividend-calendar"
              views={isMobile ? ['month'] : ['month', 'week', 'day']}
              defaultView="month"
              components={{
                dateCellWrapper: HolidayCalendarCell,
              }}
              style={{
                color: 'white',
                fontSize: isMobile ? '12px' : '14px'
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 text-white">
              <div className="flex items-center gap-2">
                <Badge variant={
                  selectedEvent.type === 'dividend' ? 'default' :
                  selectedEvent.type === 'earnings' ? 'secondary' : 'destructive'
                }>
                  {selectedEvent.type}
                </Badge>
                <span className="text-gray-400">
                  {moment(selectedEvent.start).format('MMMM Do, YYYY')}
                </span>
              </div>
              
              {selectedEvent.symbol && (
                <div className="space-y-2">
                  <p><strong>Symbol:</strong> {selectedEvent.symbol}</p>
                  {selectedEvent.amount && (
                    <p><strong>Amount:</strong> ${selectedEvent.amount.toFixed(4)}</p>
                  )}
                  {selectedEvent.yield && (
                    <p><strong>Yield:</strong> {(selectedEvent.yield * 100).toFixed(2)}%</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DividendCalendar;
