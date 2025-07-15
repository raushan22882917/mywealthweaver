import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, ExternalLink } from "lucide-react";
import { format, isSameDay, parseISO, getDaysInMonth, getDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import StockDetailsDialog from "./StockDetailsDialog";

interface DividendEvent {
  id: string;
  Symbol: string;
  earnings_date?: string;
  earnings_high?: number;
  earnings_low?: number;
  earnings_average?: number;
  revenue_high?: number;
  revenue_low?: number;
  revenue_average?: number;
  as_of_date?: string;
  company_name?: string;
  domain?: string;
  LogoURL?: string;
  ex_dividend_date?: string; // <-- add this
  dividend_date?: string;    // <-- add this
}

const dayNames = ["MON", "TUE", "WED", "THU", "FRI"];

// Robust CSV parsing for logo map
function parseCSVLine(line: string) {
  // Handles quoted values and commas inside quotes
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

const DividendCalendar = () => {
  const [date, setCalendarDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [dividendEvents, setDividendEvents] = useState<DividendEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<DividendEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'MMMM'));
  const [view, setView] = useState<string>("Monthly View");
  const [showAll, setShowAll] = useState(false);
  const [hoveredStock, setHoveredStock] = useState<DividendEvent | null>(null);
  const [showMoreDialogDay, setShowMoreDialogDay] = useState<string | null>(null);
  const [logoMap, setLogoMap] = useState<Record<string, string>>({});
  const [isStockDetailsOpen, setIsStockDetailsOpen] = useState(false);
  const [stockDetailsData, setStockDetailsData] = useState<any>(null);

  // Fetch and parse logos.csv
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const response = await fetch("/logos.csv");
        const text = await response.text();
        const lines = text.split(/\r?\n/);
        const map: Record<string, string> = {};
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;
          const cols = parseCSVLine(line);
          // Symbol is at index 1, LogoURL is at index 4
          if (cols[1] && cols[4]) {
            map[cols[1].trim().toUpperCase()] = cols[4].trim();
          }
        }
        setLogoMap(map);
      } catch (e) {
        console.error("Error loading logos.csv", e);
      }
    };
    fetchLogos();
  }, []);

  // Fetch earnings data and attach LogoURL
  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        const { data: earningsData, error } = await supabase
          .from('earnings_report')
          .select('*');
        if (error) throw error;

        setDividendEvents(
          (earningsData || []).map((event: any) => {
            return {
              ...event,
              id: `${event.Symbol}-${event.earnings_date}`,
              Symbol: event.Symbol,
              ex_dividend_date: event.earnings_date, // Use earnings_date as ex_dividend_date for calendar placement
              company_name: event.Symbol,
              LogoURL: logoMap[event.Symbol?.toUpperCase()] || null,
              dividend_date: null,
              earnings_date: event.earnings_date,
              earnings_average: event.earnings_average,
              revenue_average: event.revenue_average,
            };
          })
        );
      } catch (error) {
        console.error('Error fetching earnings data:', error);
      }
    };
    fetchEarningsData();
    // Re-run when logoMap changes
  }, [logoMap]);

  const handlePreviousMonth = () => {
    const newMonth = new Date(month);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setMonth(newMonth);
    setSelectedMonth(format(newMonth, 'MMMM'));
    setYear(newMonth.getFullYear().toString());
  };

  const handleNextMonth = () => {
    const newMonth = new Date(month);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setMonth(newMonth);
    setSelectedMonth(format(newMonth, 'MMMM'));
    setYear(newMonth.getFullYear().toString());
  };

  const handleEventClick = (event: DividendEvent) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const toggleExpandDay = (day: string) => {
    if (expandedDay === day) {
      setExpandedDay(null);
    } else {
      setExpandedDay(day);
    }
  };

  const formatMonthYear = (date: Date) => {
    return format(date, 'MMMM yyyy');
  };

  const getEventsForDateKey = (dateKey: string): DividendEvent[] => {
    return dividendEvents.filter(event => event.ex_dividend_date === dateKey);
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(month);
    const calendarDays = [];

    // Get events for the current month and organize them by ex_dividend_date
    const eventsByDate = dividendEvents.reduce((acc, event) => {
      if (!event.ex_dividend_date) return acc;
      const eventDate = new Date(event.ex_dividend_date);
      if (eventDate.getMonth() === month.getMonth() && 
          eventDate.getFullYear() === month.getFullYear()) {
        const dateKey = format(eventDate, 'yyyy-MM-dd');
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(event);
      }
      return acc;
    }, {} as Record<string, DividendEvent[]>);

    // Helper function to get events for a specific date (by ex_dividend_date)
    const getEventsForDate = (date: string) => {
      return eventsByDate[date] || [];
    };

    // Render calendar cell with improved UI
    const renderCalendarCell = (day: number) => {
      const currentDate = new Date(month.getFullYear(), month.getMonth(), day);
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      // Sort events alphabetically by Symbol
      const events = getEventsForDate(dateKey).sort((a, b) => 
        (a.Symbol || '').localeCompare(b.Symbol || '')
      );
      const isToday = isSameDay(currentDate, new Date());
      const hasEvents = events.length > 0;

      return (
        <Card 
          key={dateKey}
          className={`
            relative overflow-hidden h-full min-h-[180px] transition-all duration-200
            ${isToday ? 'bg-purple-900/20 border-purple-500/70' : 'bg-gray-900/80 border-gray-800'}
            ${hasEvents ? 'shadow-md shadow-purple-500/5' : ''}
            hover:shadow-lg hover:shadow-purple-500/10 group
          `}
        >
          <CardContent className="p-3 h-full">
            <div className="flex justify-between items-center mb-3">
              <div className={`
                h-8 w-8 flex items-center justify-center rounded-full font-medium
                ${isToday ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-200'}
                ${hasEvents ? 'ring-2 ring-purple-500/40 ring-offset-1 ring-offset-gray-900' : ''}
              `}>
                {day}
              </div>
              
              <span className={`
                text-xs font-medium px-2 py-1 rounded-full
                ${isToday ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-800 text-gray-400'}
              `}>
                {format(currentDate, 'EEE')}
              </span>
            </div>

            {hasEvents && (
              <div className="space-y-3">
                {/* Grid of first 6 stocks */}
                <div className="grid grid-cols-3 gap-2">
                  {(expandedDay === dateKey ? events : events.slice(0, 6)).map((event, index) => {
                    return (
                      <div
                        key={`${event.id}-${index}`}
                        onClick={() => handleEventClick(event)}
                        className="flex flex-col items-center p-2 rounded-lg bg-gray-800/70 backdrop-blur-sm
                                 hover:bg-purple-900/30 cursor-pointer transition-all transform hover:scale-105"
                      >
                        <div className="w-10 h-10 flex-shrink-0 overflow-hidden mb-1 border border-gray-300">
                          <img
                            src={event.LogoURL || '/stock.avif'}
                            alt={event.Symbol}
                            className="w-full h-full object-contain p-1"
                            onError={e => { (e.currentTarget as HTMLImageElement).src = '/stock.avif'; }}
                          />
                        </div>
                        <p className="text-xs font-semibold text-gray-100 text-center">
                          {event.Symbol}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Show More button if there are more than 6 stocks */}
                {events.length > 6 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMoreDialogDay(dateKey);
                    }}
                    className="mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors w-full text-center flex items-center justify-center gap-1 py-1 px-2 rounded-md bg-gray-800/50 hover:bg-gray-800"
                  >
                    <Plus className="w-3 h-3" />
                    Show {events.length - 6} more
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      );
    };

    // Generate calendar days (excluding weekends)
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(month.getFullYear(), month.getMonth(), day);
      const dayOfWeek = getDay(currentDate);
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        calendarDays.push(day);
      }
    }

    return (
      <div className="grid grid-cols-5 gap-4">
        {/* Header Row */}
        {dayNames.map(day => (
          <div key={day} className="text-center py-2 font-semibold text-gray-400 
                                  bg-gray-900/70 rounded-lg backdrop-blur-sm border border-gray-800">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {calendarDays.map(day => renderCalendarCell(day))}
      </div>
    );
  };

  const handleViewDetails = (event: DividendEvent) => {
    setStockDetailsData({
      Symbol: event.Symbol,
      title: event.company_name || event.Symbol,
      cik_str: '',
      LogoURL: event.LogoURL || '',
    });
    setIsStockDetailsOpen(true);
  };

  return (
    <div className="p-4 h-full bg-gray-950 text-white">
      <div className="flex items-center justify-between mb-6 bg-gray-900/70 p-4 rounded-xl border border-gray-800 shadow-md">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">{`${selectedMonth} ${year}`}</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[90px] bg-gray-800 border-gray-700">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {Array.from({ length: 5 }, (_, i) => (
                  <SelectItem 
                    key={new Date().getFullYear() - 2 + i} 
                    value={(new Date().getFullYear() - 2 + i).toString()}
                    className="text-white hover:bg-gray-700"
                  >
                    {new Date().getFullYear() - 2 + i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[120px] bg-gray-800 border-gray-700">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <SelectItem key={month} value={month} className="text-white hover:bg-gray-700">
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={view} onValueChange={setView}>
              <SelectTrigger className="w-[120px] bg-gray-800 border-gray-700">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="Monthly View" className="text-white hover:bg-gray-700">Monthly View</SelectItem>
                <SelectItem value="Weekly View" className="text-white hover:bg-gray-700">Weekly View</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-1">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth} className="bg-gray-800 border-gray-700 hover:bg-gray-700">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth} className="bg-gray-800 border-gray-700 hover:bg-gray-700">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {renderCalendarGrid()}

      <Dialog open={!!showMoreDialogDay} onOpenChange={() => setShowMoreDialogDay(null)}>
        <DialogContent className="w-full max-w-3xl h-[70vh] overflow-y-auto bg-gray-900 text-white border-gray-800 shadow-xl shadow-purple-500/10 animate-in zoom-in-90 duration-300">
          <DialogHeader>
            <DialogTitle>
              Events on {showMoreDialogDay && format(parseISO(showMoreDialogDay), 'MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4 mt-4">
            {showMoreDialogDay &&
              getEventsForDateKey(showMoreDialogDay).map((event, index) => {
                return (
                  <div
                    key={`${event.id}-${index}`}
                    onClick={() => handleEventClick(event)}
                    className="flex flex-col items-center p-2 rounded-lg bg-gray-800/70 backdrop-blur-sm
                              hover:bg-purple-900/30 cursor-pointer transition-all transform hover:scale-105"
                  >
                    <div className="w-12 h-12 flex-shrink-0 overflow-hidden mb-1 border border-gray-300">
                      <img
                        src={event.LogoURL || '/stock.avif'}
                        alt={event.Symbol}
                        className="w-full h-full object-contain p-1"
                        onError={e => { (e.currentTarget as HTMLImageElement).src = '/stock.avif'; }}
                      />
                    </div>
                    <p className="text-xs font-semibold text-gray-100 text-center">
                      {event.Symbol}
                    </p>
                  </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg  text-white border-gray-800 shadow-xl shadow-purple-500/10 animate-in zoom-in-90 duration-300">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <img 
                    src={selectedEvent.LogoURL || '/stock.avif'}
                    alt={selectedEvent.Symbol} 
                    className="w-12 h-12 p-1 border border-gray-300"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/stock.avif'; }}
                  />
                  <div>
                    <DialogTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                      {selectedEvent.Symbol}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      {selectedEvent.company_name || selectedEvent.Symbol}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              {/* Earnings/Revenue Table */}
              <div className="w-full mt-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="grid grid-cols-4 gap-2 items-center mb-2">
                  <div></div>
                  <div className="font-semibold text-sm text-gray-300 text-center">Low</div>
                  <div className="font-semibold text-sm text-gray-300 text-center">High</div>
                  <div className="font-semibold text-sm text-gray-300 text-center">Average</div>
                </div>
                {/* Earnings Row */}
                <div className="grid grid-cols-4 gap-2 items-center py-2 border-b border-gray-700">
                  <div className="font-medium text-sm text-purple-300">Earnings</div>
                  <div className="text-center text-white">{selectedEvent.earnings_low !== undefined && selectedEvent.earnings_low !== null ? `$${selectedEvent.earnings_low.toFixed(2)}` : 'N/A'}</div>
                  <div className="text-center text-white">{selectedEvent.earnings_high !== undefined && selectedEvent.earnings_high !== null ? `$${selectedEvent.earnings_high.toFixed(2)}` : 'N/A'}</div>
                  <div className="text-center text-white">{selectedEvent.earnings_average !== undefined && selectedEvent.earnings_average !== null ? `$${selectedEvent.earnings_average.toFixed(2)}` : 'N/A'}</div>
                </div>
                {/* Revenue Row */}
                <div className="grid grid-cols-4 gap-2 items-center py-2">
                  <div className="font-medium text-sm text-blue-300">Revenue</div>
                  <div className="text-center text-white">{selectedEvent.revenue_low !== undefined && selectedEvent.revenue_low !== null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(selectedEvent.revenue_low) : 'N/A'}</div>
                  <div className="text-center text-white">{selectedEvent.revenue_high !== undefined && selectedEvent.revenue_high !== null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(selectedEvent.revenue_high) : 'N/A'}</div>
                  <div className="text-center text-white">{selectedEvent.revenue_average !== undefined && selectedEvent.revenue_average !== null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(selectedEvent.revenue_average) : 'N/A'}</div>
                </div>
              </div>
              {/* Dates Row */}
              <div className="grid grid-cols-3 gap-4 mt-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-400">Dividend Date</h4>
                  <p className="font-medium text-white">
                    {selectedEvent.dividend_date ? format(parseISO(selectedEvent.dividend_date), 'MMMM d, yyyy') : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-400">Ex-Dividend Date</h4>
                  <p className="font-medium text-white">
                    {selectedEvent.ex_dividend_date ? format(parseISO(selectedEvent.ex_dividend_date), 'MMMM d, yyyy') : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-400">Earnings Date</h4>
                  <p className="font-medium text-white">
                    {selectedEvent.earnings_date ? format(parseISO(selectedEvent.earnings_date), 'MMMM d, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  className="bg-gray-800 border-gray-700 hover:bg-purple-900/30 hover:text-purple-300 transition-all"
                  onClick={() => handleViewDetails(selectedEvent)}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Stock Details Dialog */}
      {stockDetailsData && (
        <StockDetailsDialog
          stock={stockDetailsData}
          isOpen={isStockDetailsOpen}
          setIsOpen={setIsStockDetailsOpen}
        />
      )}
    </div>
  );
};

export default DividendCalendar;