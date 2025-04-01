
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, ExternalLink } from "lucide-react";
import { format, isSameDay, parseISO, getDaysInMonth, getDay, setDate } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DividendEvent {
  id: string;
  symbol: string;
  dividend_date: string;
  ex_dividend_date: string;
  earnings_date: string;
  earnings_average: number;
  revenue_average: number;
  LogoURL?: string;
  company_name?: string;
}

const dayNames = ["MON", "TUE", "WED", "THU", "FRI"];

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

  useEffect(() => {
    const fetchDividendData = async () => {
      try {
        // Fetch dividend reports
        const { data: dividendData, error: dividendError } = await supabase
          .from("dividend_reports")
          .select("*");

        if (dividendError) throw dividendError;

        // Fetch company logos
        const { data: logosData, error: logosError } = await supabase
          .from("company_logos")
          .select("*");

        if (logosError) throw logosError;

        // Map logos to dividend data
        const eventsWithLogos = dividendData.map((event: any) => {
          const matchingLogo = logosData.find((logo: any) => logo.symbol === event.symbol);
          return {
            ...event,
            LogoURL: matchingLogo?.LogoURL || null,
            company_name: matchingLogo?.company_name || event.symbol
          };
        });

        setDividendEvents(eventsWithLogos);
      } catch (error) {
        console.error("Error fetching dividend data:", error);
      }
    };

    fetchDividendData();
  }, []);

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

  const getEventsForDate = (day: number): DividendEvent[] => {
    const currentDate = new Date(month.getFullYear(), month.getMonth(), day);
    const formattedDate = format(currentDate, 'yyyy-MM-dd');
    
    return dividendEvents.filter(event => {
      if (!event.dividend_date) return false;
      return event.dividend_date === formattedDate;
    });
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(month);
    const calendarDays = [];
    const [showAll, setShowAll] = useState(false);

    const sortedEvents = [...displayEvents].sort((a, b) => a.symbol.localeCompare(b.symbol));
    const visibleEvents = showAll ? sortedEvents : sortedEvents.slice(0, 6);

    // Filter out weekends (0 = Sunday, 6 = Saturday)
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(month.getFullYear(), month.getMonth(), day);
      const dayOfWeek = getDay(currentDate);
      
      // Skip weekends
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        calendarDays.push(day);
      }
    }

    // Group days into weeks
    const weeks = [];
    let week = [];
    
    calendarDays.forEach(day => {
      const currentDate = new Date(month.getFullYear(), month.getMonth(), day);
      const dayOfWeek = getDay(currentDate);
      const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust to start from Monday (0)
      
      // If we need to start a new week
      if (week.length === 5 || (week.length === 0 && adjustedDayOfWeek > 0)) {
        if (week.length > 0) {
          weeks.push(week);
          week = [];
        }
      }
      
      week.push(day);
    });
    
    // Add the last week
    if (week.length > 0) {
      weeks.push(week);
    }

    return (
      <div className="grid grid-cols-5 gap-4">
        {/* Header Row */}
        {dayNames.map(day => (
          <div key={day} className="text-center py-2 font-semibold text-gray-400 bg-gray-900 rounded">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const currentDate = new Date(month.getFullYear(), month.getMonth(), day);
          const dayOfWeek = getDay(currentDate);
          
          // Skip weekends
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            return null;
          }
          
          const formattedDay = format(currentDate, 'yyyy-MM-dd');
          const events = getEventsForDate(day);
          const isExpanded = expandedDay === formattedDay;
          const displayEvents = isExpanded ? events : events.slice(0, 12);
          
          return (
            <div 
              key={formattedDay} 
              className="bg-gray-900 border border-gray-800 rounded-md p-2 min-h-[180px] relative"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="h-8 w-8 flex items-center justify-center bg-gray-800 rounded-full text-white">
                  {day}
                </div>
                {events.length > 0 && (
                  <button 
                    onClick={() => toggleExpandDay(formattedDay)}
                    className="h-6 w-6 flex items-center justify-center text-gray-400 hover:text-white"
                  >
                    {isExpanded ? <X size={16} /> : <X size={16} />}
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-2">
              <div className="grid grid-cols-3 gap-4 p-4">
    {visibleEvents.map((event, eventIndex) => (
      <div 
        key={`${event.id}-${eventIndex}`}
        className="flex flex-col items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 border border-gray-700 rounded-xl shadow-lg p-2 hover:scale-105 transition-transform cursor-pointer"
        onClick={() => handleEventClick(event)}
      >
        <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full">
          <img 
            src={event.LogoURL || '/stock.avif'} 
            alt={event.symbol}
            className="w-10 h-10 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/stock.avif';
            }}
          />
        </div>
        <span className="text-sm font-bold text-white mt-1">{event.symbol}</span>
      </div>
    ))}

    {sortedEvents.length > 6 && !showAll && (
      <button 
        onClick={() => setShowAll(true)} 
        className="col-span-3 text-center text-blue-500 font-bold hover:underline mt-2"
      >
        See More
      </button>
    )}
  </div>
                
                {!isExpanded && events.length > 12 && (
                  <button 
                    className="col-span-3 text-center text-sm text-blue-400 hover:text-blue-300 mt-2 flex items-center justify-center"
                    onClick={() => toggleExpandDay(formattedDay)}
                  >
                    <Plus size={14} className="mr-1" /> {events.length - 12} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-4 h-full bg-gray-950 text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-purple-400">{`${selectedMonth} ${year}`}</h2>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-gray-900 text-white border-gray-800">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <img 
                    src={selectedEvent.LogoURL || "/stock.avif"} 
                    alt={selectedEvent.symbol} 
                    className="w-10 h-10 rounded-full bg-gray-800 p-1"
                  />
                  <div>
                    <DialogTitle className="text-xl">{selectedEvent.symbol}</DialogTitle>
                    <DialogDescription className="text-gray-400">{selectedEvent.company_name || selectedEvent.symbol}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-400">Dividend Date</h4>
                  <p className="font-medium">
                    {selectedEvent.dividend_date ? format(parseISO(selectedEvent.dividend_date), 'MMMM d, yyyy') : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-400">Ex-Dividend Date</h4>
                  <p className="font-medium">
                    {selectedEvent.ex_dividend_date ? format(parseISO(selectedEvent.ex_dividend_date), 'MMMM d, yyyy') : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-400">Earnings Date</h4>
                  <p className="font-medium">
                    {selectedEvent.earnings_date ? format(parseISO(selectedEvent.earnings_date), 'MMMM d, yyyy') : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-400">Earnings (EPS)</h4>
                  <p className="font-medium">${selectedEvent.earnings_average?.toFixed(2) || 'N/A'}</p>
                </div>
                <div className="col-span-2 space-y-2">
                  <h4 className="font-medium text-sm text-gray-400">Revenue</h4>
                  <p className="font-medium">
                    {selectedEvent.revenue_average
                      ? new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          notation: 'compact',
                          maximumFractionDigits: 1
                        }).format(selectedEvent.revenue_average)
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DividendCalendar;

