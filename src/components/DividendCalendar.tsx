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

const monthToImage: Record<string, string> = {
  January: "/calendar-backgrounds/january.jpg",
  February: "/calendar-backgrounds/february.jpg",
  March: "/calendar-backgrounds/march.jpg",
  April: "/calendar-backgrounds/april.jpg",
  May: "/calendar-backgrounds/may.jpg",
  June: "/calendar-backgrounds/june.jpg",
  July: "/calendar-backgrounds/july.jpg",
  August: "/calendar-backgrounds/august.jpg",
  September: "/calendar-backgrounds/september.jpg",
  October: "/calendar-backgrounds/october.jpg",
  November: "/calendar-backgrounds/november.jpg",
  December: "/calendar-backgrounds/december.jpg",
};

interface Holiday {
  date: string;
  name: string;
  description: string;
}

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
  const [holidays, setHolidays] = useState<Holiday[]>([]);

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

  // Fetch holidays from holiday.json
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await fetch("/calender/holiday.json");
        const data = await response.json();
        setHolidays(data.holidays || []);
      } catch (e) {
        console.error("Error loading holiday.json", e);
      }
    };
    fetchHolidays();
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

  const getEventsForDateKey = (dateKey: string): DividendEvent[] => {
    return dividendEvents.filter(event => event.ex_dividend_date === dateKey);
  };

  // Helper to check if a date is a holiday
  const getHolidayForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return holidays.find(h => h.date === dateKey);
  };

  const renderCalendarCell = (
    day: number,
    month: Date,
    expandedDay: string | null,
    handleEventClick: (event: DividendEvent) => void,
    getEventsForDate: (date: string) => DividendEvent[],
    getHolidayForDate: (date: Date) => Holiday | undefined,
    setShowMoreDialogDay: (dateKey: string) => void
  ) => {
    const currentDate = new Date(month.getFullYear(), month.getMonth(), day);
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    // Sort events alphabetically by Symbol
    const events = getEventsForDate(dateKey).sort((a, b) =>
      (a.Symbol || '').localeCompare(b.Symbol || '')
    );
    const isToday = isSameDay(currentDate, new Date());
    const holiday = getHolidayForDate(currentDate);

    return (
      <div
        key={dateKey}
        className={`relative p-3 min-h-[200px] transition-all duration-300 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden`}
      >
        <div
          className={`relative z-10 h-full rounded-lg backdrop-blur-sm ${
            isToday ? 'bg-blue-50/70 dark:bg-blue-900/30' :
            holiday ? 'bg-red-50/70 dark:bg-red-900/30' :
            'hover:bg-gray-50/70 dark:hover:bg-gray-800/30'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
                  isToday
                    ? 'bg-purple-100/90 text-purple-700 dark:bg-purple-900/80 dark:text-purple-300'
                    : 'bg-gray-100/90 text-gray-700 dark:bg-gray-800/80 dark:text-gray-300'
                }`}>
                  {day}
                </span>
              </div>
              {holiday && (
                <div className="w-[200px] h-[150px] ml-2 mt-2 p-3 rounded-lg bg-red-100/90 dark:bg-red-900/50 border border-red-300 dark:border-red-700 shadow-sm">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200">{holiday.name}</p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1">{holiday.description}</p>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {(expandedDay === dateKey ? events : events.slice(0, 6)).map((event, index) => (
              <div key={`${event.id}-${index}`} className="flex justify-center">
                <div
                  className="cursor-pointer"
                  onClick={() => handleEventClick(event)}
                >
                  <div className={`w-[50px] h-[60px] flex flex-col items-center justify-between rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 transition-all hover:scale-105 hover:shadow-lg bg-white dark:bg-gray-900`}>
                    <div className="w-[50px] h-[45px] flex items-center justify-center bg-white dark:bg-gray-800">
                      <img
                        src={event.LogoURL || '/stock.avif'}
                        alt={event.Symbol}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        onError={e => { (e.currentTarget as HTMLImageElement).src = '/stock.avif'; }}
                      />
                    </div>
                    <div className="w-[50px] h-[15px] bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-[12px] font-bold text-red-600 dark:text-red-400 leading-none truncate">
                        {event.Symbol.length > 8 ? `${event.Symbol.slice(0, 8)}..` : event.Symbol}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {events.length > 6 && (
              <div className="w-[300px] rounded-lg cursor-pointer transition-colors mt-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 px-2">
                <button
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors rounded-lg border border-blue-500/30 hover:border-blue-400 bg-blue-500/10 hover:bg-blue-500/20 dark:bg-blue-500/5 dark:hover:bg-blue-500/10"
                  onClick={e => { e.stopPropagation(); setShowMoreDialogDay(dateKey); }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Show {events.length - 6} more stocks</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(month);
    const calendarCells = [];

    // Get the weekday (0=Sunday, 1=Monday, ..., 6=Saturday) of the 1st of the month
    const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    let firstWeekday = getDay(firstDayOfMonth); // 0=Sunday, 1=Monday, ...
    // Adjust so Monday=0, ..., Friday=4 (skip weekends)
    // If Sunday (0), treat as 6 (after Friday)
    if (firstWeekday === 0) firstWeekday = 7;
    // Number of empty cells before the first day (Monday=1, so 0 empty; Tuesday=2, so 1 empty, ...)
    const emptyCells = firstWeekday - 1;

    // Add empty cells for alignment
    for (let i = 0; i < emptyCells && i < 5; i++) {
      calendarCells.push(<div key={`empty-${i}`}></div>);
    }

    // Add day cells (only weekdays)
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(month.getFullYear(), month.getMonth(), day);
      const dayOfWeek = getDay(currentDate);
      // Only add Monday (1) to Friday (5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        calendarCells.push(renderCalendarCell(day, month, expandedDay, handleEventClick, getEventsForDateKey, getHolidayForDate, setShowMoreDialogDay));
      }
    }

    return (
      <div className="grid grid-cols-5 gap-1 md:gap-2 mb-2">
        {dayNames.map(day => (
          <div
            key={day}
            className="text-center font-semibold p-2 bg-gray-50/80 dark:bg-gray-800/50 text-sm rounded-lg text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
          >
            {day}
          </div>
        ))}
        {calendarCells}
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

  // Set background image for the selected month
  const backgroundImage = monthToImage[selectedMonth] || monthToImage[format(new Date(), 'MMMM')];

  return (
    <div
      className="p-4 h-full text-white relative"
      style={{
        minHeight: '100vh',
      }}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6  p-4 rounded-xl border border-gray-800 shadow-md">
          <h2 className="text-2xl font-bold text-transparent  from-purple-400 to-indigo-400">{`${selectedMonth} ${year}`}</h2>
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

        {/* Show More Stocks Popup (refactored for overlay style) */}
        {showMoreDialogDay && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMoreDialogDay(null)}
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
          >
            <div
              className="relative bg-[#232a36] text-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 pt-8 pb-2">
                <div>
                  <h2 className="text-2xl font-bold text-white">Dividend Stocks</h2>
                  <p className="text-sm text-gray-400 mt-1">{getEventsForDateKey(showMoreDialogDay).length} stocks found</p>
                </div>
                <button
                  onClick={() => setShowMoreDialogDay(null)}
                  className="text-gray-400 hover:text-white transition-colors text-2xl"
                  aria-label="Close"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>
              <div className="border-b border-gray-700 mx-8 my-2" />
              {/* Stock Grid */}
              <div className="grid grid-cols-7 gap-4 px-8 pb-8">
                {getEventsForDateKey(showMoreDialogDay).map((event, index) => {
                  // Risky status for warning icon
                  const isRisky = event.status === 'This stock may have a risky dividend.' || event.status === 'This stock does not pay a dividend.';
                  return (
                    <div
                      key={`${event.id}-${index}`}
                      onClick={() => handleEventClick(event)}
                      className="flex flex-col items-center justify-center cursor-pointer"
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for ${event.Symbol}`}
                    >
                      <div className="relative w-14 h-14 flex items-center justify-center bg-[#1a202c] rounded-lg border border-gray-700 overflow-hidden">
                        <img
                          src={event.LogoURL || '/stock.avif'}
                          alt={event.Symbol}
                          className="w-full h-full object-contain"
                          onError={e => { (e.currentTarget as HTMLImageElement).src = '/stock.avif'; }}
                        />
                        {isRisky && (
                          <span className="absolute top-1 right-1 text-red-400" title="Risky Dividend">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-white text-center mt-1 truncate w-full">
                        {event.Symbol}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

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
                    <div className="flex items-center gap-2 font-medium text-sm">
                      <span className="bg-purple-600 text-white px-2 py-1 rounded flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 16v-4m8-4a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>
                        Earnings
                      </span>
                    </div>
                    <div className="text-center text-white">{selectedEvent.earnings_low !== undefined && selectedEvent.earnings_low !== null ? `$${selectedEvent.earnings_low.toFixed(2)}` : 'N/A'}</div>
                    <div className="text-center text-white">{selectedEvent.earnings_high !== undefined && selectedEvent.earnings_high !== null ? `$${selectedEvent.earnings_high.toFixed(2)}` : 'N/A'}</div>
                    <div className="text-center text-white">{selectedEvent.earnings_average !== undefined && selectedEvent.earnings_average !== null ? `$${selectedEvent.earnings_average.toFixed(2)}` : 'N/A'}</div>
                  </div>
                  {/* Revenue Row */}
                  <div className="grid grid-cols-4 gap-2 items-center py-2">
                    <div className="flex items-center gap-2 font-medium text-sm">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3v18h18M18 17V9a2 2 0 00-2-2H7a2 2 0 00-2 2v8m13 0h-4m-4 0H5" /></svg>
                        Revenue
                      </span>
                    </div>
                    <div className="text-center text-white">{selectedEvent.revenue_low !== undefined && selectedEvent.revenue_low !== null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(selectedEvent.revenue_low) : 'N/A'}</div>
                    <div className="text-center text-white">{selectedEvent.revenue_high !== undefined && selectedEvent.revenue_high !== null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(selectedEvent.revenue_high) : 'N/A'}</div>
                    <div className="text-center text-white">{selectedEvent.revenue_average !== undefined && selectedEvent.revenue_average !== null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(selectedEvent.revenue_average) : 'N/A'}</div>
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
    </div>
  );
};

export default DividendCalendar;