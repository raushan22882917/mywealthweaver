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
import StockFilter, { StockFilterCriteria, StockFilterData } from "@/components/ui/stock-filter";
import StockDetailsDialog from "@/components/StockDetailsDialog";

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
  quantity?: number;
  price?: number;
  dividend_yield?: number;
}

const dayNames = ["MON", "TUE", "WED", "THU", "FRI"];

const DividendCalendar = () => {
  const [date, setCalendarDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [dividendEvents, setDividendEvents] = useState<DividendEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<DividendEvent | null>(null);
  const [isStockDetailsOpen, setIsStockDetailsOpen] = useState(false);
  const [selectedStockForDetails, setSelectedStockForDetails] = useState<any>(null);
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
  const [filterCriteria, setFilterCriteria] = useState<StockFilterCriteria>({});
  const [filteredEvents, setFilteredEvents] = useState<DividendEvent[]>([]);
  const [stockFilterData, setStockFilterData] = useState<StockFilterData[]>([]);

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

        // Create mock quantity data for testing
        const quantityMap = new Map<string, number>();
        // Add some mock quantity data for common stocks
        const mockQuantities = [
          { symbol: 'AAPL', quantity: 25 },
          { symbol: 'MSFT', quantity: 15 },
          { symbol: 'GOOGL', quantity: 10 },
          { symbol: 'AMZN', quantity: 8 },
          { symbol: 'META', quantity: 20 },
          { symbol: 'TSLA', quantity: 30 },
          { symbol: 'NVDA', quantity: 12 },
          { symbol: 'JPM', quantity: 18 },
          { symbol: 'V', quantity: 22 },
          { symbol: 'JNJ', quantity: 15 }
        ];

        // Add mock quantities to the map
        mockQuantities.forEach(item => {
          quantityMap.set(item.symbol, item.quantity);
        });

        // For other stocks, generate random quantities
        dividendData.forEach((event: any) => {
          if (!quantityMap.has(event.symbol.toUpperCase())) {
            quantityMap.set(event.symbol.toUpperCase(), Math.floor(Math.random() * 50) + 1);
          }
        });

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
          company_name: event.company_name || event.symbol,
          quantity: quantityMap.get(event.symbol.toUpperCase()) || null
        }));

        setDividendEvents(eventsWithLogos);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchDividendData();
  }, []);

  useEffect(() => {
    const fetchStockFilterData = async () => {
      try {
        const { data, error } = await supabase
          .from('stock_filter')
          .select('*');

        if (error) {
          console.error("Error fetching stock filter data:", error);
          // Fall back to transformed data if we can't fetch from database
          const transformedData = dividendEvents.map(event => ({
            symbol: event.symbol,
            sector: "Technology",
            exchange: "NASDAQ",
            dividendYield: Math.random() * 10,
            payoutRatio: Math.random() * 100,
            financialHealthScore: Math.floor(Math.random() * 10) + 1,
            debtLevels: Math.floor(Math.random() * 10) + 1,
            revenue: Math.random() * 50000000000,
            earningsPerShare: Math.random() * 10,
          }));

          setStockFilterData(transformedData);
          return;
        }

        // Create a map of stock filter data by symbol
        const stockFilterMap = new Map(data.map(item => [item.Symbol, item]));

        // For each dividend event, find matching stock filter data or create default data
        const transformedData = dividendEvents.map(event => {
          const filterData = stockFilterMap.get(event.symbol) || {};

          return {
            symbol: event.symbol,
            sector: filterData.Sector || "Technology",
            exchange: filterData.Exchange || "NASDAQ",
            dividendYield: filterData["Dividend-Yield"] !== undefined ? filterData["Dividend-Yield"] : Math.random() * 10,
            payoutRatio: filterData["Payout Ratio"] !== undefined ? filterData["Payout Ratio"] : Math.random() * 100,
            financialHealthScore: filterData["Financial-Health-Score"] !== undefined ? filterData["Financial-Health-Score"] : Math.floor(Math.random() * 10) + 1,
            debtLevels: filterData["Debt Levels"] !== undefined ? filterData["Debt Levels"] : Math.floor(Math.random() * 10) + 1,
            revenue: filterData.Revenue !== undefined ? filterData.Revenue : Math.random() * 50000000000,
            earningsPerShare: filterData.Earnings_per_share !== undefined ? filterData.Earnings_per_share : Math.random() * 10,
          };
        });

        setStockFilterData(transformedData);
      } catch (error) {
        console.error("Error processing stock filter data:", error);

        // Fall back to generated data
        const transformedData = dividendEvents.map(event => ({
          symbol: event.symbol,
          sector: "Technology",
          exchange: "NASDAQ",
          dividendYield: Math.random() * 10,
          payoutRatio: Math.random() * 100,
          financialHealthScore: Math.floor(Math.random() * 10) + 1,
          debtLevels: Math.floor(Math.random() * 10) + 1,
          revenue: Math.random() * 50000000000,
          earningsPerShare: Math.random() * 10,
        }));

        setStockFilterData(transformedData);
      }
    };

    fetchStockFilterData();
  }, [dividendEvents]);

  useEffect(() => {
    if (Object.keys(filterCriteria).length === 0) {
      setFilteredEvents(dividendEvents);
      return;
    }

    const filtered = dividendEvents.filter(event => {
      const stockData = stockFilterData.find(stock => stock.symbol === event.symbol);
      if (!stockData) return false;

      if (filterCriteria.symbol && !event.symbol.toLowerCase().includes(filterCriteria.symbol.toLowerCase())) {
        return false;
      }

      if (filterCriteria.sector && stockData.sector !== filterCriteria.sector) {
        return false;
      }

      if (filterCriteria.exchange && stockData.exchange !== filterCriteria.exchange) {
        return false;
      }

      if (stockData.dividendYield !== undefined &&
          (stockData.dividendYield < (filterCriteria.minDividendYield || 0) ||
           stockData.dividendYield > (filterCriteria.maxDividendYield || 100))) {
        return false;
      }

      if (stockData.payoutRatio !== undefined &&
          (stockData.payoutRatio < (filterCriteria.minPayoutRatio || 0) ||
           stockData.payoutRatio > (filterCriteria.maxPayoutRatio || 100))) {
        return false;
      }

      if (stockData.financialHealthScore !== undefined &&
          stockData.financialHealthScore < (filterCriteria.minHealthScore || 0)) {
        return false;
      }

      if (filterCriteria.hasDebtConcerns && stockData.debtLevels !== undefined && stockData.debtLevels < 3) {
        return false;
      }

      return true;
    });

    setFilteredEvents(filtered);
  }, [filterCriteria, dividendEvents, stockFilterData]);

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

  const getEventsForDate = (dateString: string): DividendEvent[] => {
    // Filter events for the specific date
    const events = filteredEvents.filter(event => {
      if (!event.ex_dividend_date) return false;
      return event.ex_dividend_date === dateString;
    });

    // Sort events alphabetically by symbol
    return events.sort((a, b) => a.symbol.localeCompare(b.symbol));
  };

  const renderCalendarGrid = () => {
    if (view === "Weekly View") {
      return renderWeeklyView();
    } else {
      return renderMonthlyView();
    }
  };

  const renderWeeklyView = () => {
    const today = new Date();
    const currentDay = today.getDay();

    // Get the Monday of the current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

    // Get the Friday of the current week
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const calendarDays = [];
    let currentDate = new Date(monday);

    // Add all days from Monday to Friday
    while (currentDate <= friday) {
      calendarDays.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return (
      <div className="grid grid-cols-5 gap-4">
        {dayNames.map(day => (
          <div key={day} className="text-center py-2 font-semibold text-gray-300
                                  bg-gray-800/70 rounded-xl backdrop-blur-sm border border-gray-700">
            {day}
          </div>
        ))}

        {calendarDays.map((date, index) => {
          const day = date.getDate();

          return (
            <div
              key={`${date.getFullYear()}-${date.getMonth()}-${day}`}
              className={`
                relative p-3 min-h-[180px] rounded-xl transition-all
                bg-gray-900/80
                ${isSameDay(date, new Date()) ? 'bg-purple-900/20 border-purple-500/70' : ''}
                border border-gray-700 hover:border-gray-600
                backdrop-blur-sm shadow-lg hover:shadow-xl
              `}
            >
              <div className={`
                absolute top-2 right-2 flex items-center justify-center
                ${isSameDay(date, new Date()) ? 'text-purple-400' : 'text-gray-400'}
                text-sm font-medium
              `}>
                {format(date, 'EEE')}
              </div>

              <div className={`
                h-8 w-8 flex items-center justify-center rounded-full
                ${isSameDay(date, new Date()) ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-100'}
                shadow-md
              `}>
                {day}
              </div>

              {getEventsForDate(format(date, 'yyyy-MM-dd')).length > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-3 gap-2">
                    {getEventsForDate(format(date, 'yyyy-MM-dd'))
                      .slice(0, 6)
                      .map((event, index) => (
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

                  {getEventsForDate(format(date, 'yyyy-MM-dd')).length > 6 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showDateEvents(date, getEventsForDate(format(date, 'yyyy-MM-dd')));
                      }}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-blue-400 hover:text-blue-300
                               transition-colors py-1.5 rounded-lg border border-gray-700 hover:border-blue-500
                               bg-gray-800/70 hover:bg-gray-800/90"
                    >
                      <Plus className="w-3 h-3" />
                      Show {getEventsForDate(format(date, 'yyyy-MM-dd')).length - 6} more stocks
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthlyView = () => {
    const daysInMonth = getDaysInMonth(month);
    const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Get the first day of the week for the first day of the month
    const firstDayOfWeek = firstDayOfMonth.getDay();

    // Calculate how many days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 5 : firstDayOfWeek - 1;

    // Calculate total number of days to display (5 weeks * 5 days)
    const totalDaysToShow = 25; // 5 weeks * 5 days (Mon-Fri)

    // Create array of all dates to display
    const calendarDays = [];
    let currentDate = new Date(firstDayOfMonth);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < daysFromPrevMonth; i++) {
      calendarDays.push(null);
    }

    // Add all days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
        calendarDays.push(date);
      }
    }

    // Add empty cells to complete the grid
    while (calendarDays.length < totalDaysToShow) {
      calendarDays.push(null);
    }

    return (
      <div className="grid grid-cols-5 gap-4">
        {dayNames.map(day => (
          <div key={day} className="text-center py-2 font-semibold text-gray-300
                                  bg-gray-800/70 rounded-xl backdrop-blur-sm border border-gray-700">
            {day}
          </div>
        ))}

        {calendarDays.map((date, index) => {
          if (!date) {
            return (
              <div
                key={`empty-${index}`}
                className="relative p-3 min-h-[180px] rounded-xl transition-all
                         bg-gray-900/20 border border-gray-700/50
                         backdrop-blur-sm shadow-lg"
              />
            );
          }

          const day = date.getDate();
          const isCurrentMonth = date.getMonth() === month.getMonth();

          return (
            <div
              key={`${date.getFullYear()}-${date.getMonth()}-${day}`}
              className={`
                relative p-3 min-h-[180px] rounded-xl transition-all
                ${isCurrentMonth ? 'bg-gray-900/80' : 'bg-gray-900/40'}
                ${isSameDay(date, new Date()) ? 'bg-purple-900/20 border-purple-500/70' : ''}
                border border-gray-700 hover:border-gray-600
                backdrop-blur-sm shadow-lg hover:shadow-xl
              `}
            >
              <div className={`
                absolute top-2 right-2 flex items-center justify-center
                ${isSameDay(date, new Date()) ? 'text-purple-400' : 'text-gray-400'}
                text-sm font-medium
              `}>
                {format(date, 'EEE')}
              </div>

              <div className={`
                h-8 w-8 flex items-center justify-center rounded-full
                ${isSameDay(date, new Date()) ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-100'}
                shadow-md
              `}>
                {day}
              </div>

              {getEventsForDate(format(date, 'yyyy-MM-dd')).length > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-3 gap-2">
                    {getEventsForDate(format(date, 'yyyy-MM-dd'))
                      .slice(0, 6)
                      .map((event, index) => (
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

                  {getEventsForDate(format(date, 'yyyy-MM-dd')).length > 6 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showDateEvents(date, getEventsForDate(format(date, 'yyyy-MM-dd')));
                      }}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-blue-400 hover:text-blue-300
                               transition-colors py-1.5 rounded-lg border border-gray-700 hover:border-blue-500
                               bg-gray-800/70 hover:bg-gray-800/90"
                    >
                      <Plus className="w-3 h-3" />
                      Show {getEventsForDate(format(date, 'yyyy-MM-dd')).length - 6} more stocks
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const handleFilterApply = (filters: StockFilterCriteria) => {
    setFilterCriteria(filters);
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
            <StockFilter
              onFilterApply={handleFilterApply}
              filterableStocks={stockFilterData}
              isCalendarView={true}
            />

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
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
          onClick={closeDateEvents}
        >
          <div
            className="bg-gradient-to-b from-[#1a2235] to-[#111827] rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto m-4 shadow-xl border border-gray-800 animate-slideUp"
            onClick={e => e.stopPropagation()}
          >
            {/* Header with glowing effect */}
            <div className="mb-6 pb-3 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">
                    Dividend Stocks
                  </h3>
                  <span className="text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded-md border border-gray-700">{selectedDateEvents.events.length} stocks found</span>
                </div>
                <button
                  onClick={closeDateEvents}
                  className="text-gray-400 hover:text-red-400 transition-all duration-300 bg-gray-800/60 p-2 rounded-full hover:bg-gray-800 hover:shadow-[0_0_10px_rgba(255,0,0,0.3)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Grid layout matching the image */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-4 gap-y-6 px-2 py-4">
              {selectedDateEvents.events.map((stock, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center cursor-pointer group relative w-[50px]"
                  onClick={() => handleEventClick(stock)}
                >
                  {/* Combined stock card with single border */}
                  <div className="relative w-[50px] h-[60px] border border-red-500 rounded overflow-hidden shadow-md group-hover:shadow-lg group-hover:shadow-red-500/20 transition-all duration-300">
                    {/* Logo container with gradient background */}
                    <div className="absolute top-0 left-0 right-0 h-[40px] bg-gradient-to-b from-white to-gray-100 overflow-hidden flex items-center justify-center">
                      <img
                        src={companyLogos.get(stock.symbol.toUpperCase()) || '/stock.avif'}
                        alt={stock.symbol}
                        className="max-w-[80%] max-h-[80%] object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/stock.avif';
                        }}
                      />
                    </div>

                    {/* Symbol text directly below logo in same container */}
                    <div className="absolute bottom-0 left-0 right-0 h-[20px] bg-[#1a2235] group-hover:bg-red-900 transition-colors flex items-center justify-center">
                      <p className="text-xs font-bold text-red-400 group-hover:text-red-300 truncate px-1 text-center">
                        {stock.symbol}
                      </p>
                    </div>

                    {/* Animated border effect on hover */}
                    <div className="absolute inset-0 border border-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent animate-borderRunHorizontal"></div>
                        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-red-500 to-transparent animate-borderRunVertical"></div>
                        <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent animate-borderRunHorizontalReverse"></div>
                        <div className="absolute bottom-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-red-500 to-transparent animate-borderRunVerticalReverse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded view on hover */}
                  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-0 pointer-events-none z-40 transition-opacity duration-300">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg w-[400px] h-[400px] flex items-center justify-center p-4 opacity-0 group-hover:opacity-0 transition-all duration-300">
                      <img
                        src={companyLogos.get(stock.symbol.toUpperCase()) || '/stock.avif'}
                        alt={stock.symbol}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/stock.avif';
                        }}
                      />
                    </div>
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
                  <div
                    className="h-14 w-14 bg-white rounded-lg p-1.5 shadow-lg flex items-center justify-center cursor-pointer hover:shadow-xl transition-all"
                    onClick={() => {
                      // Create a stock object in the format expected by StockDetailsDialog
                      const stockForDialog = {
                        Symbol: selectedEvent.symbol,
                        title: selectedEvent.company_name || selectedEvent.symbol,
                        LogoURL: selectedEvent.LogoURL,
                        marketCap: selectedEvent.price || 0,
                        dividendyield: selectedEvent.dividend_yield || 0
                      };
                      setSelectedStockForDetails(stockForDialog);
                      setIsStockDetailsOpen(true);
                    }}
                  >
                    <img
                      src={selectedEvent.LogoURL || "/stock.avif"}
                      alt={selectedEvent.symbol}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/stock.avif';
                      }}
                    />
                  </div>
                  <div
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      // Create a stock object in the format expected by StockDetailsDialog
                      const stockForDialog = {
                        Symbol: selectedEvent.symbol,
                        title: selectedEvent.company_name || selectedEvent.symbol,
                        LogoURL: selectedEvent.LogoURL,
                        marketCap: selectedEvent.price || 0,
                        dividendyield: selectedEvent.dividend_yield || 0
                      };
                      setSelectedStockForDetails(stockForDialog);
                      setIsStockDetailsOpen(true);
                    }}
                  >
                    <DialogTitle className="text-xl bg-gradient-to-r from-blue-100 to-blue-300 bg-clip-text text-transparent">{selectedEvent.symbol}</DialogTitle>
                    <DialogDescription className="text-gray-400">{selectedEvent.company_name || selectedEvent.symbol}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>



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
    Earnings (EPS)
  </TableCell>
  <TableCell className="p-3 text-center font-medium text-green-400">
    {selectedEvent.earnings_average
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 2,
        }).format(selectedEvent.earnings_average)
      : "N/A"}
  </TableCell>
  <TableCell className="p-3 text-center font-medium text-red-400">
    <span className="inline-flex items-center">
      {selectedEvent.earnings_low
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 2,
          }).format(selectedEvent.earnings_low)
        : "N/A"}
    </span>
  </TableCell>
  <TableCell className="p-3 text-center font-medium text-blue-400">
    <span className="inline-flex items-center">
      {selectedEvent.earnings_high
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 2,
          }).format(selectedEvent.earnings_high)
        : "N/A"}
    </span>
  </TableCell>
</TableRow>


                    {/* Revenue Row */}
                    <TableRow className="hover:bg-gray-800/60 transition">
                      <TableCell className="p-3 flex items-center gap-2 text-gray-300">
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

      {/* Stock Details Dialog */}
      {selectedStockForDetails && (
        <StockDetailsDialog
          stock={selectedStockForDetails}
          isOpen={isStockDetailsOpen}
          setIsOpen={setIsStockDetailsOpen}
        />
      )}
    </div>
  );
};

export default DividendCalendar;
