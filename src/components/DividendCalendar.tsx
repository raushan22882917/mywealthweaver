import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/lib/supabase";
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
  const [expandedPopup, setExpandedPopup] = useState<{
    stocks: any[];
  } | null>(null);
  const [showPopup, setShowPopup] = useState<{ [key: string]: boolean }>({});
  const [holidayData, setHolidayData] = useState([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [dateType, setDateType] = useState<'ExDividendDate' | 'payoutdate'>('ExDividendDate');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyLogos, setCompanyLogos] = useState<Map<string, string>>(new Map());
  const [hoveredStockDetails, setHoveredStockDetails: any] = useState<{
    stock: any;
    exDividendDate: string;
    dividendDate: string;
    position: { x: number; y: number };
  } | null>(null);
  const [expandedStock, setExpandedStock] = useState<any | null>(null);
  const [hoveredStock, setHoveredStock: any] = useState<any | null>(null);
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());
  const [selectedStock, setSelectedStock] = useState<any | null>(null);

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
          const matchingLogo = logosData.find((logo: any) => logo.Symbol === event.symbol);
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
                {displayEvents.map((event, eventIndex) => (
                  <div 
                    key={`${event.id}-${eventIndex}`}
                    className="flex justify-center"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded overflow-hidden cursor-pointer hover:border-blue-500 transition-colors">
                      <img 
                        src={event.LogoURL || '/stock.avif'} 
                        alt={event.symbol}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/stock.avif';
                        }}
                      />
                    </div>
                  </div>
                ))}
                
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

  const renderFilters = () => {
    return (
      <div className="flex gap-4 mb-4">
        <Select 
          value={selectedYear.toString()} 
          onValueChange={(value) => setSelectedYear(parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem 
                key={year} 
                value={year.toString()}
                className={year === new Date().getFullYear() ? "font-semibold text-primary" : ""}
              >
                {year === new Date().getFullYear() ? `${year} ` : year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={selectedMonth.toString()} 
          onValueChange={(value) => setSelectedMonth(parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((month) => (
              <SelectItem 
                key={month.value} 
                value={month.value.toString()}
                className={
                  month.value === new Date().getMonth() 
                    ? "font-semibold text-primary" 
                    : ""
                }
              >
                {month.value === new Date().getMonth() 
                  ? `${month.label} ` 
                  : month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const [showHolidayPopup, setShowHolidayPopup] = useState(false);
  
  const startOfWeekDate = (date: Date) => {
    const newDate = new Date(date);
    const day = newDate.getDay();
    const diff = newDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    newDate.setDate(diff);
    return newDate;
  };

  const endOfWeekDate = (date: Date) => {
    const newDate = new Date(date);
    const day = newDate.getDay();
    const diff = newDate.getDate() - day + (day === 0 ? 0 : 7); // adjust when day is sunday
    newDate.setDate(diff);
    return newDate;
  };

  const handleMoreClick = (stocks: any[], event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedPopup({ stocks });
  };

  const getStatusBorderColor = (status?: string) => {
    if (!status) return 'border-gray-200 dark:border-gray-700'; // default status
    
    switch (status) {
      case 'This stock has a safe dividend.':
        return 'border-green-500 dark:border-green-400';
      case 'This stock may have a risky dividend.':
        return 'border-yellow-500 dark:border-yellow-400';
      case 'This stock does not pay a dividend.':
        return 'border-red-500 dark:border-red-400';
      default:
        return 'border-gray-200 dark:border-gray-700';
    }
  };

  const handleStockClick = (stock: any) => {
    const stockData: Stock = {
      cik_str: "", // You might want to fetch this from somewhere
      Symbol: stock.Symbol,
      title: stock.title
    };
    setSelectedStock(stockData);
    setIsDialogOpen(true);
    handleCloseExpanded();
  };

  const isCurrentWeek = (date: Date) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
    
    return date >= startOfWeek && date <= endOfWeek;
  };

  const getWeekStocks = () => {
    const startOfWeek = startOfWeekDate(currentMonth);
    const endOfWeek = endOfWeekDate(currentMonth);
    return filteredDividendData.filter((stock) => {
      const stockDate = new Date(stock[dateType]);
      return stockDate >= startOfWeek && stockDate <= endOfWeek;
    });
  };

  const getMonthStocks = () => {
    return filteredDividendData.filter((stock) => {
      const stockDate = new Date(stock[dateType]);
      return stockDate.getMonth() === currentMonth.getMonth() &&
             stockDate.getFullYear() === currentMonth.getFullYear();
    });
  };

  const getRunningHistory = () => {
    const stocks = viewMode === 'weekly' ? getWeekStocks() : getMonthStocks();
    return stocks.map(stock => stock.hist).join(' | ');
  };

  const handleStockHover = (stock: any, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setHoveredStockDetails({
      stock,
      exDividendDate: stock['ExDividendDate'],
      dividendDate: stock['DividendDate'],
      position: { 
        x: rect.left + (rect.width / 2), 
        y: rect.top
      }
    });
  };

  const handleStockLeave = () => {
    // Don't clear the hover state anymore
  };

  const handleCloseHover = () => {
    setHoveredStockDetails(null);
    setExpandedStock(null);
  };

  const handleSeeMoreClick = (e: React.MouseEvent, stock: any) => {
    e.stopPropagation();
    setExpandedStock(stock);
  };

  const handleCloseExpanded = () => {
    setExpandedStock(null);
  };

  const getMarketTiming = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'Before Open';
    return 'After Close';
  };

  const toggleCellExpansion = (dateString: string) => {
    const newExpandedCells = new Set(expandedCells);
    if (newExpandedCells.has(dateString)) {
      newExpandedCells.delete(dateString);
    } else {
      newExpandedCells.add(dateString);
    }
    setExpandedCells(newExpandedCells);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredDividendData = dividendEvents.filter(stock => 
    stock && (
      (stock.symbol?.toLowerCase().includes(searchTerm) || false) ||
      (stock.title?.toLowerCase().includes(searchTerm) || false)
    )
  );

  const renderStockCard = (stock: any, borderColorClass: string) => (
    <div 
    className="relative group stock-element w-[50px] h-[50px] mt-2"
    onMouseEnter={(e) => handleStockHover(stock, e)}
  >
    <div
      className={`w-[50px] h-[60px] flex flex-col items-center justify-between rounded-lg overflow-hidden border-2 ${borderColorClass} transition-all hover:scale-105 hover:shadow-lg bg-white dark:bg-gray-900`}
    >
      {/* Stock Logo Container */}
      <div className="w-[50px] h-[45px] flex items-center justify-center bg-white dark:bg-gray-800">
        <img
          src={companyLogos.get(stock.Symbol) || stock.LogoURL || 'stock.avif'}
          alt={stock.Symbol}
          className="object-contain"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'stock.avif';
          }}
        />
      </div>
  
      {/* Stock Symbol Container */}
      <div className="w-[50px] h-[15px] bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <span className="text-[12px] font-bold text-red-600 dark:text-red-400 leading-none truncate">
          {stock.Symbol.length > 8 
            ? `${stock.Symbol.slice(0, 8)}..`
            : stock.Symbol
          }
        </span>
      </div>
    </div>
    
    {/* Add danger triangle for unsafe statuses */}
    {(stock.status === 'This stock may have a risky dividend.' || 
      stock.status === 'This stock does not pay a dividend.') && (
      <div className="absolute -top-1 -right-1 text-red-500 dark:text-red-400">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-4 h-4"
        >
          <path 
            fillRule="evenodd" 
            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
          />
        </svg>
      </div>
    )}
  </div>
  
  
  );
  
  const isDateInCurrentWeek = (date: Date): boolean => {
    if (viewMode !== 'weekly') return true;
    const startOfWeek = startOfWeekDate(currentMonth);
    const endOfWeek = endOfWeekDate(currentMonth);
    return date >= startOfWeek && date <= endOfWeek;
  };

  const togglePopup = (dateString: string) => {
    setShowPopup(prev => ({
      ...prev,
      [dateString]: !prev[dateString]
    }));
  };

  const renderCalendarCell = (date: Date) => {
    const dateString = formatDate(date);
    const isExpanded = expandedCells.has(dateString);

    // Find holiday for this date
    const holiday = holidayData.find(h => h.date === dateString);

    const stocksForDate = filteredDividendData.filter(
      (stock) => stock && stock[dateType] === dateString
    );
    const hasMoreStocks = stocksForDate.length > 6;
    const displayStocks = hasMoreStocks && !isExpanded ? stocksForDate.slice(0, 6) : stocksForDate;

    const isToday = new Date().toDateString() === date.toDateString();
    const currentWeek = isCurrentWeek(date);

    return (
      <div
        key={dateString}
        className={`relative p-3 min-h-[200px] transition-all duration-300 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${
          isExpanded ? 'row-span-2 col-span-2' : ''
        }`}
        onClick={() => {
          if (stocksForDate.length > 0) {
            togglePopup(dateString);
          }
        }}
      >
       

        {/* Content Layer with backdrop filter */}
        <div className={`relative z-10 h-full rounded-lg backdrop-blur-sm ${
          isToday ? 'bg-blue-50/70 dark:bg-blue-900/30' : 
          holiday ? 'bg-red-50/70 dark:bg-red-900/30' :
          currentWeek ? 'bg-green-50/70 dark:bg-green-950/30' : 
          'hover:bg-gray-50/70 dark:hover:bg-gray-800/30'
        }`}>
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
                isToday 
                  ? 'bg-purple-100/90 text-purple-700 dark:bg-purple-900/80 dark:text-purple-300' 
                  : 'bg-gray-100/90 text-gray-700 dark:bg-gray-800/80 dark:text-gray-300'
              }`}>
                {date.getDate()}
              </span>
              {holiday && (
                <div className="w-[200px] h-[150px] ml-2 mt-2 p-3 rounded-lg bg-red-100/90 dark:bg-red-900/50 border border-red-300 dark:border-red-700 shadow-sm">
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">{holiday.name}</p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">{holiday.description}</p>
              </div>
              
              )}
            </div>
            {stocksForDate.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePopup(dateString);
                }}
                className="hover:bg-gray-100/80 dark:hover:bg-gray-800/80 z-20"
              >
                {showPopup[dateString] ? <Minimize className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
              </Button>
            )}
          </div>

          <div className={`grid gap-2 mt-3 ${isExpanded ? 'grid-cols-4' : 'grid-cols-3'}`}>
            {displayStocks.map((stock, index) => (
              <div 
                key={index} 
                className="flex justify-center"
                onMouseEnter={() => setHoveredStock(stock)}
                onMouseLeave={() => setHoveredStock(null)}
              >
                <div 
                  className="cursor-pointer"
                  onClick={() => {
                    handleStockClick(stock);
                  }}
                >
                  {renderStockCard(stock, getStatusBorderColor(stock.status))}
                </div>
              </div>
            ))}
            {hasMoreStocks && !isExpanded && (
              <div
                className="w-full h-[50px] flex items-center justify-center rounded-lg cursor-pointer transition-colors col-span-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 px-2"
                onClick={(e) => handleMoreClick(stocksForDate, e)}
              >
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Plus className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="underline">{stocksForDate.length - 6} more</span>
                </div>
              </div>
            )}
          </div>

          {showPopup[dateString] && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50" 
              onClick={() => togglePopup(dateString)}
            >
              <div 
                className="relative bg-white/90 dark:bg-gray-900/90 p-6 rounded-xl shadow-xl border border-gray-300 dark:border-gray-700 overflow-hidden" 
                onClick={(e) => e.stopPropagation()}
              >
                {/* Background for popup */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-5"
                  style={{ 
                    backgroundImage: `url(${monthBackgrounds[date.getMonth()]})`,
                  }}
                />
                
                {/* Popup content with relative positioning */}
                <div className="relative z-10">
                  {/* Date with Icon */}
                  <div className="flex items-center justify-center mb-4 text-gray-900 dark:text-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xl font-bold">{dateString}</h3>
                  </div>
              
                  {/* Horizontal Line */}
                  <hr className="mb-6 border-gray-400/50" />
              
                  {/* Stock Grid */}
                  <div className="grid grid-cols-4 gap-6">
                    {stocksForDate.map((stock, index) => (
                      <div 
                        key={index} 
                        className="flex justify-center"
                        onMouseEnter={() => setHoveredStock(stock)}
                        onMouseLeave={() => setHoveredStock(null)}
                      >
                        <div 
                          className="cursor-pointer"
                          onClick={() => {
                            handleStockClick(stock);
                          }}
                        >
                          {renderStockCard(stock, getStatusBorderColor(stock.status))}
                        </div>
                      </div>
                    ))}
                  </div>
              
                  {/* Close Button */}
                  <Button
                    className="mt-6 mx-auto block bg-transparent border border-blue-500 text-blue-500 font-semibold py-2 px-6 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-300"
                    onClick={() => togglePopup(dateString)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
  
    let adjustedFirstDay = firstDay;
    if (firstDay >= 5) {
      adjustedFirstDay = firstDay - 5;
    }// Adjust offset to start from Monday
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
  
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dayOfWeek = date.getDay();
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days.push(day);
      }
    }
  
    return days.map((day, index) => {
      if (day === null) {
        return <div key={index} className="h-[250px] bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800" />;
      }
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      return renderCalendarCell(date);
    });
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
            </
