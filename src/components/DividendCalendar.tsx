import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, ExternalLink } from "lucide-react";
import { format, isSameDay, parseISO, getDaysInMonth, getDay, setDate } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, TrendingDown, Info } from "lucide-react";

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
  earnings_low: number;
  earnings_high: number;
  revenue_low: number;
  revenue_high: number;
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
  const [selectedDateEvents, setSelectedDateEvents] = useState<{date: Date, events: DividendEvent[]} | null>(null);

  const showDateEvents = (date: Date, events: DividendEvent[]) => {
    const sortedEvents = [...events].sort((a, b) => 
      a.symbol.localeCompare(b.symbol)
    );
    
    setSelectedDateEvents({
      date,
      events: sortedEvents
    });
  };

  const closeDateEvents = () => {
    setSelectedDateEvents(null);
  };

  useEffect(() => {
    const fetchDividendData = async () => {
      try {
        const { data: dividendData, error: dividendError } = await supabase
          .from("dividend_reports")
          .select("*, ex_dividend_date");

        if (dividendError) throw dividendError;

        const { data: logosData, error: logosError } = await supabase
          .from("company_logos")
          .select("Symbol, LogoURL");

        if (logosError) throw logosError;

        const logoMap = new Map(
          logosData.map((logo: { Symbol: string; LogoURL: string }) => [
            logo.Symbol.toUpperCase(),
            logo.LogoURL
          ])
        );
        setCompanyLogos(logoMap);

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

    const getEventsForDate = (date: string) => {
      return eventsByDate[date] || [];
    };

    const renderCalendarCell = (day: number) => {
      const currentDate = new Date(month.getFullYear(), month.getMonth(), day);
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      const events = getEventsForDate(dateKey).sort((a, b) => 
        a.symbol.localeCompare(b.symbol)
      );
      const isToday = isSameDay(currentDate, new Date());
      const hasEvents = events.length > 0;

      return (
        <div 
          key={dateKey}
          className={`
            relative p-3 min-h-[180px] rounded-xl transition-all 
            ${isToday ? 'bg-purple-900/20 border-purple-500/70' : 'bg-gray-900/80'}
            ${hasEvents ? 'border-2 border-blue-500/50 hover:border-blue-400' : 'border border-gray-700 hover:border-gray-600'}
            backdrop-blur-sm shadow-lg hover:shadow-xl
          `}
        >
          <div className={`
            absolute top-2 right-2 flex items-center justify-center
            ${isToday ? 'text-purple-400' : 'text-gray-400'}
            text-sm font-medium
          `}>
            {format(currentDate, 'EEE')}
          </div>
          
          <div className={`
            h-8 w-8 flex items-center justify-center rounded-full
            ${isToday ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-100'}
            ${hasEvents ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-gray-900' : ''}
            shadow-md
          `}>
            {day}
          </div>

          {hasEvents && (
            <div className="mt-4">
              <div className="grid grid-cols-3 gap-2">
                {events.slice(0, 6).map((event, index) => (
                  <div
                    key={`${event.id}-${index}`}
                    onClick={() => handleEventClick(event)}
                    className="flex flex-col items-center p-2 rounded-xl bg-gray-800/80 
                             hover:bg-blue-500/20 cursor-pointer transition-all border border-gray-700 hover:border-blue-400"
                  >
                    <div className="w-9 h-9 bg-white rounded-lg flex-shrink-0 overflow-hidden mb-1.5 shadow-sm">
                      <img
                        src={companyLogos.get(event.symbol.toUpperCase()) || '/stock.avif'}
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

              {events.length > 6 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showDateEvents(currentDate, events);
                  }}
                  className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors w-full text-center flex items-center justify-center gap-1.5
                            py-1.5 rounded-lg border border-gray-700 hover:border-blue-500 bg-gray-800/70 hover:bg-gray-800/90"
                >
                  <Plus className="w-3 h-3" />
                  Show {events.length - 6} more stocks
                </button>
              )}
            </div>
          )}
        </div>
      );
    };

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(month.getFullYear(), month.getMonth(), day);
      const dayOfWeek = getDay(currentDate);
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        calendarDays.push(day);
      }
    }

    return (
      <div className="grid grid-cols-5 gap-4">
        {dayNames.map(day => (
          <div key={day} className="text-center py-2 font-semibold text-gray-300 
                                  bg-gray-800/70 rounded-xl backdrop-blur-sm border border-gray-700">
            {day}
          </div>
        ))}
        
        {calendarDays.map(day => renderCalendarCell(day))}
      </div>
    );
  };

  return (
    <div className="p-4 h-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-300 bg-clip-text text-transparent flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-blue-400" />
          {`${selectedMonth} ${year}`}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[90px] bg-gray-800/90 border-gray-700 hover:border-blue-500 focus:ring-blue-500">
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
              <SelectTrigger className="w-[120px] bg-gray-800/90 border-gray-700 hover:border-blue-500 focus:ring-blue-500">
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
              <SelectTrigger className="w-[120px] bg-gray-800/90 border-gray-700 hover:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="Monthly View" className="text-white hover:bg-gray-700">Monthly View</SelectItem>
                <SelectItem value="Weekly View" className="text-white hover:bg-gray-700">Weekly View</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-1">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth} className="bg-gray-800/90 border-gray-700 hover:bg-gray-700 hover:border-blue-500">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth} className="bg-gray-800/90 border-gray-700 hover:bg-gray-700 hover:border-blue-500">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-800/80 shadow-2xl">
        {renderCalendarGrid()}
      </div>

      {selectedDateEvents && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeDateEvents}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto m-4 border border-blue-700/30 shadow-2xl animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <h3 className="text-xl font-semibold text-white flex items-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                <CalendarIcon className="mr-2 h-5 w-5 text-blue-400" />
                Dividend Stocks for {format(selectedDateEvents.date, 'MMMM d, yyyy')}
              </h3>
              <button
                onClick={closeDateEvents}
                className="text-gray-400 hover:text-white transition-colors bg-gray-800/60 p-2 rounded-full hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-600/20 rounded-lg text-blue-200 text-sm flex items-center">
              <Info className="w-4 h-4 mr-2" />
              <span>Showing {selectedDateEvents.events.length} stocks with dividend payments on this date.</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
              {selectedDateEvents.events.map((stock, index) => (
                <div 
                  key={index}
                  className="flex flex-col items-center p-4 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors
                            border border-gray-700 hover:border-blue-400 cursor-pointer"
                  onClick={() => handleEventClick(stock)}
                >
                  <div className="w-14 h-14 bg-white rounded-lg overflow-hidden mb-3 shadow-md flex items-center justify-center">
                    <img
                      src={companyLogos.get(stock.symbol.toUpperCase()) || '/stock.avif'}
                      alt={stock.symbol}
                      className="w-full h-full object-contain p-1.5"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/stock.avif';
                      }}
                    />
                  </div>
                  <p className="text-sm font-bold text-white text-center bg-gradient-to-r from-blue-200 to-blue-100 bg-clip-text text-transparent">
                    {stock.symbol}
                  </p>
                  <p className="text-xs text-gray-400 text-center truncate w-full mt-1">
                    {stock.company_name || 'Unknown Company'}
                  </p>
                  <div className="mt-2 flex items-center text-xs text-blue-300">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    <span>Ex-div: {stock.ex_dividend_date ? format(new Date(stock.ex_dividend_date), 'MMM d') : 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-gray-900 to-gray-950 text-white border border-gray-800 shadow-2xl rounded-xl">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-14 w-14 bg-white rounded-lg p-1.5 shadow-lg flex items-center justify-center">
                    <img 
                      src={selectedEvent.LogoURL || "/stock.avif"} 
                      alt={selectedEvent.symbol} 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/stock.avif';
                      }}
                    />
                  </div>
                  <div>
                    <DialogTitle className="text-xl bg-gradient-to-r from-blue-100 to-blue-300 bg-clip-text text-transparent">{selectedEvent.symbol}</DialogTitle>
                    <DialogDescription className="text-gray-400">{selectedEvent.company_name || selectedEvent.symbol}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 mb-4">
                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Dividend Date</h4>
                  <p className="text-blue-300 flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1 text-blue-400" />
                    {selectedEvent.dividend_date ? format(new Date(selectedEvent.dividend_date), 'MMMM d, yyyy') : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Ex-Dividend Date</h4>
                  <p className="text-purple-300 flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1 text-purple-400" />
                    {selectedEvent.ex_dividend_date ? format(new Date(selectedEvent.ex_dividend_date), 'MMMM d, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="overflow-x-auto mt-2">
                <div className="bg-gray-800/30 p-2 rounded-lg mb-4 flex items-center text-sm text-gray-300">
                  <Info className="w-4 h-4 mr-2 text-blue-400" />
                  Earnings and Revenue Estimates
                </div>
                <Table className="w-full border border-gray-700 bg-gray-900/80 rounded-lg shadow-lg">
                  <TableHeader>
                    <TableRow className="bg-gray-800/60 text-gray-400">
                      <TableHead className="p-3 text-left">Metric</TableHead>
                      <TableHead className="p-3 text-center">Average</TableHead>
                      <TableHead className="p-3 text-center">Low</TableHead>
                      <TableHead className="p-3 text-center">High</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Earnings (EPS) Row */}
                    <TableRow className="hover:bg-gray-800/60 transition">
                      <TableCell className="p-3 flex items-center gap-2 text-gray-300">
                        <DollarSign className="w-4 h-4 text-yellow-400" />
                        Earnings (EPS)
                      </TableCell>
                      <TableCell className="p-3 text-center font-medium text-green-400">
                        {selectedEvent.earnings_average?.toFixed(2) || "N/A"}
                      </TableCell>
                      <TableCell className="p-3 text-center font-medium text-red-400">
                        <span className="inline-flex items-center">
                          <TrendingDown className="w-4 h-4 inline-block mr-1" />
                          {selectedEvent.earnings_low?.toFixed(2) || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="p-3 text-center font-medium text-blue-400">
                        <span className="inline-flex items-center">
                          <TrendingUp className="w-4 h-4 inline-block mr-1" />
                          {selectedEvent.earnings_high?.toFixed(2) || "N/A"}
                        </span>
                      </TableCell>
                    </TableRow>

                    {/* Revenue Row */}
                    <TableRow className="hover:bg-gray-800/60 transition">
                      <TableCell className="p-3 flex items-center gap-2 text-gray-300">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        Revenue
                      </TableCell>
                      <TableCell className="p-3 text-center font-medium text-green-400">
                        {selectedEvent.revenue_average
                          ? new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              notation: "compact",
                              maximumFractionDigits: 1,
                            }).format(selectedEvent.revenue_average)
                          : "N/A"}
                      </TableCell>
                      <TableCell className="p-3 text-center font-medium text-red-400">
                        <span className="inline-flex items-center">
                          <TrendingDown className="w-4 h-4 inline-block mr-1" />
                          {selectedEvent.revenue_low
                            ? new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                                notation: "compact",
                                maximumFractionDigits: 1,
                              }).format(selectedEvent.revenue_low)
                            : "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="p-3 text-center font-medium text-blue-400">
                        <span className="inline-flex items-center">
                          <TrendingUp className="w-4 h-4 inline-block mr-1" />
                          {selectedEvent.revenue_high
                            ? new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                                notation: "compact",
                                maximumFractionDigits: 1,
                              }).format(selectedEvent.revenue_high)
                            : "N/A"}
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DividendCalendar;
