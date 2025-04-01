
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, ExternalLink } from "lucide-react";
import { format, isSameDay, parseISO, getDaysInMonth, getDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

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
  const [showAll, setShowAll] = useState(false);
  const [companyLogos, setCompanyLogos] = useState<Map<string, string>>(new Map());
  const [hoveredStock, setHoveredStock] = useState<DividendEvent | null>(null);
  const [showPopup, setShowPopup] = useState<Record<string, boolean>>({});

  const togglePopup = (dateKey: string) => {
    setShowPopup(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };

  useEffect(() => {
    const fetchDividendData = async () => {
      try {
        // Fetch dividend reports
        const { data: dividendData, error: dividendError } = await supabase
          .from("dividend_reports")
          .select("*, ex_dividend_date");

        if (dividendError) throw dividendError;

        // Fetch company logos - using correct column name "Symbol"
        const { data: logosData, error: logosError } = await supabase
          .from("company_logos")
          .select("Symbol, LogoURL");

        if (logosError) throw logosError;

        // Create a Map of symbols to logo URLs
        const logoMap = new Map(
          logosData.map((logo: { Symbol: string; LogoURL: string }) => [
            logo.Symbol.toUpperCase(),
            logo.LogoURL
          ])
        );
        setCompanyLogos(logoMap);

        // Map logos to dividend data
        const eventsWithLogos = dividendData.map((event: any) => ({
          ...event,
          LogoURL: logoMap.get(event.symbol.toUpperCase()) || null,
          company_name: event.company_name || event.symbol
        }));

        setDividendEvents(eventsWithLogos);
      } catch (error) {
        console.error("Error fetching data:", error);
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

    // Get events for the current month and organize them by date
    const eventsByDate = dividendEvents.reduce((acc, event) => {
      if (!event.dividend_date) return acc;
      
      const eventDate = new Date(event.dividend_date);
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

    // Helper function to get events for a specific date
    const getEventsForDate = (date: string) => {
      return eventsByDate[date] || [];
    };

    // Render calendar cell with improved UI
    const renderCalendarCell = (day: number) => {
      const currentDate = new Date(month.getFullYear(), month.getMonth(), day);
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      // Sort events alphabetically by symbol
      const events = getEventsForDate(dateKey).sort((a, b) => 
        a.symbol.localeCompare(b.symbol)
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
                  {events.slice(0, 6).map((event, index) => (
                    <div
                      key={`${event.id}-${index}`}
                      onClick={() => handleEventClick(event)}
                      className="flex flex-col items-center p-2 rounded-lg bg-gray-800/70 backdrop-blur-sm
                               hover:bg-purple-900/30 cursor-pointer transition-all transform hover:scale-105"
                    >
                      <div className="w-10 h-10 bg-white rounded-full flex-shrink-0 overflow-hidden mb-1 border border-gray-300">
                        <img
                          src={event.LogoURL || '/stock.avif'}
                          alt={event.symbol}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/stock.avif';
                          }}
                        />
                      </div>
                      <p className="text-xs font-semibold text-gray-100 text-center">
                        {event.symbol}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Show More button if there are more than 6 stocks */}
                {events.length > 6 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePopup(dateKey);
                    }}
                    className="mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors w-full text-center flex items-center justify-center gap-1 py-1 px-2 rounded-md bg-gray-800/50 hover:bg-gray-800"
                  >
                    <Plus className="w-3 h-3" />
                    Show {events.length - 6} more
                  </button>
                )}

                {showPopup[dateKey] && (
                  <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in-0 duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePopup(dateKey);
                    }}
                  >
                    <div 
                      className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4 border border-purple-500/30 shadow-xl shadow-purple-500/10"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5 text-purple-500" />
                          All Stocks for {format(currentDate, 'MMMM d, yyyy')}
                        </h3>
                        <button
                          onClick={() => togglePopup(dateKey)}
                          className="text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800 p-1"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                        {events.map((stock, index) => (
                          <div 
                            key={index}
                            className="flex flex-col items-center p-3 rounded-lg bg-gray-800/80 hover:bg-gray-700/80 transition-colors cursor-pointer"
                            onClick={() => handleEventClick(stock)}
                          >
                            <div className="w-12 h-12 bg-white rounded-full overflow-hidden mb-2 border border-gray-300">
                              <img
                                src={stock.LogoURL || '/stock.avif'}
                                alt={stock.symbol}
                                className="w-full h-full object-contain p-1"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/stock.avif';
                                }}
                              />
                            </div>
                            <p className="text-sm font-semibold text-white text-center">
                              {stock.symbol}
                            </p>
                            <p className="text-xs text-gray-400 text-center truncate w-full mt-1">
                              {stock.company_name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-gray-900 text-white border-gray-800 shadow-xl shadow-purple-500/10 animate-in zoom-in-90 duration-300">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <img 
                    src={selectedEvent.LogoURL || "/stock.avif"} 
                    alt={selectedEvent.symbol} 
                    className="w-12 h-12 rounded-full bg-white p-1 border border-gray-300"
                  />
                  <div>
                    <DialogTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                      {selectedEvent.symbol}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      {selectedEvent.company_name || selectedEvent.symbol}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 mt-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
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
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-400">Earnings (EPS)</h4>
                  <p className="font-medium text-white">${selectedEvent.earnings_average?.toFixed(2) || 'N/A'}</p>
                </div>
                <div className="col-span-2 space-y-2">
                  <h4 className="font-medium text-sm text-gray-400">Revenue</h4>
                  <p className="font-medium text-white">
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
              
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  className="bg-gray-800 border-gray-700 hover:bg-purple-900/30 hover:text-purple-300 transition-all"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DividendCalendar;
