
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Expand, Minimize, Plus, Search, X, Calendar, CheckCircle, AlertTriangle, XCircle, Info, CalendarIcon } from "lucide-react";
import StockDetailsDialog from "@/components/StockDetailsDialog";
import { supabase } from "@/lib/supabase/client";
import Papa from "papaparse";

import { FaDollarSign, FaChartLine, FaCalendarAlt, FaInfoCircle, FaHistory } from "react-icons/fa";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Stock {
  cik_str: string;
  Symbol: string;
  title: string;
}

interface DividendData {
  Symbol: string;
  title: string;
  dividendRate: string;
  previousClose: string;
  currentPrice: string;
  dividendYield: string;
  payoutRatio: string;
  AnnualRate: string;
  message: string;
  ExDividendDate: string;
  buy_date: string;
  DividendDate: string;
  EarningsDate: string;
  payoutdate: string;
  hist: string;
  insight: string;
  LogoURL: string;
  industry: string;
  employees: string;
  founded: string;
  address: string;
  ceo: string;
  website: string;
  description: string;
  marketCap: string;
  peRatio: string;
  weekRange: string;
  volume: string;
  yieldRange: string;
  status?: string;
  payout_ratio?: string;
  fcf_coverage?: string;
  debt_to_equity?: string;
  company_name?: string;
  domain?: string;
}

interface HoveredStockDetails {
  stock: DividendData;
  exDividendDate: string;
  dividendDate: string;
  position: { x: number; y: number; };
}

const monthOptions = [
  { value: 0, label: "January" },
  { value: 1, label: "February" },
  { value: 2, label: "March" },
  { value: 3, label: "April" },
  { value: 4, label: "May" },
  { value: 5, label: "June" },
  { value: 6, label: "July" },
  { value: 7, label: "August" },
  { value: 8, label: "September" },
  { value: 9, label: "October" },
  { value: 10, label: "November" },
  { value: 11, label: "December" },
];

const currentYear = new Date().getFullYear();
const startYear = 2020; // You can adjust this to how far back you want to go
const yearOptions = Array.from(
  { length: currentYear - startYear + 1 },
  (_, index) => currentYear - index
).sort((a, b) => b - a); // Sort in descending order (newest to oldest)

const monthBackgrounds = {
  0: '/calendar-backgrounds/january.jpg',
  1: '/calendar-backgrounds/february.jpg',
  2: '/calendar-backgrounds/march.jpg',
  3: '/calendar-backgrounds/april.jpg',
  4: '/calendar-backgrounds/may.jpg',
  5: '/calendar-backgrounds/june.jpg',
  6: '/calendar-backgrounds/july.jpg',
  7: '/calendar-backgrounds/august.jpg',
  8: '/calendar-backgrounds/september.jpg',
  9: '/calendar-backgrounds/october.jpg',
  10: '/calendar-backgrounds/november.jpg',
  11: '/calendar-backgrounds/december.jpg',
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

interface Holiday {
  date: string;
  name: string;
  description: string;
}

const Dividend: React.FC = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('monthly'); // Set default to monthly
  const [dividendData, setDividendData] = useState<DividendData[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [hoveredStock, setHoveredStock] = useState<DividendData | null>(null);
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());
  const [expandedStock, setExpandedStock] = useState<DividendData | null>(null);
  const [hoveredStockDetails, setHoveredStockDetails] = useState<HoveredStockDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");

  const [dateType, setDateType] = useState<'ExDividendDate' | 'payoutdate'>('ExDividendDate');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedPopup, setExpandedPopup] = useState<{
    stocks: any[];
  } | null>(null);

  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(null);

  const handleCardTouch = useCallback(() => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
    }
    
    const timer = setTimeout(() => {
      setHoveredStockDetails(null);
    }, 1000);
    
    setAutoCloseTimer(timer);
  }, [autoCloseTimer]);

  useEffect(() => {
    return () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [autoCloseTimer]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    if (type === 'paid') {
      setDateType('payoutdate');
    } else {
      setDateType('ExDividendDate');
    }
  }, []);

  useEffect(() => {
    const fetchDividendData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch data from all three tables in parallel
        const [
          { data: dividendData, error: dividendError },
          { data: safetyData, error: safetyError },
          { data: logoData, error: logoError }
        ] = await Promise.all([
          supabase.from('dividend').select('*'),
          supabase.from('dividend_safety').select('*'),
          supabase.from('company_logos').select('*')
        ]);

        if (dividendError) throw new Error(`Dividend data error: ${dividendError.message}`);
        if (safetyError) throw new Error(`Safety data error: ${safetyError.message}`);
        if (logoError) throw new Error(`Logo data error: ${logoError.message}`);

        // Create lookup maps for safety and logo data
        const safetyMap = new Map(safetyData?.map(item => [item.symbol, item]) || []);
        const logoMap = new Map(logoData?.map(item => [item.Symbol, item]) || []);

        // Transform and combine the data
        const transformedData = (dividendData || []).map((stock: any) => {
          const safetyInfo = safetyMap.get(stock.symbol);
          const logoInfo = logoMap.get(stock.symbol);

          const newData: DividendData = {
            Symbol: stock.symbol,
            title: stock.shortname,
            dividendRate: stock.dividendrate?.toString() || '0',
            previousClose: stock.previousclose?.toString() || '0',
            currentPrice: stock.currentprice?.toString() || '0',
            dividendYield: stock.dividendyield?.toString() || '0',
            payoutRatio: stock.payoutratio?.toString() || '0',
            AnnualRate: stock.annualrate?.toString() || '0',
            message: stock.message || '',
            ExDividendDate: stock.exdividenddate || '',
            DividendDate: stock.dividenddate || '',
            EarningsDate: stock.earningsdate || '',
            payoutdate: stock.payoutdate || '',
            buy_date: stock.buy_date || '',
            hist: stock.hist || '',
            insight: stock.insight || '',
            // Add safety metrics
            status: safetyInfo?.status || 'Status not available',
            payout_ratio: safetyInfo?.payout_ratio?.toString(),
            fcf_coverage: safetyInfo?.fcf_coverage?.toString(),
            debt_to_equity: safetyInfo?.debt_to_equity?.toString(),
            // Add logo and company info
            LogoURL: logoInfo?.LogoURL || '',
            company_name: logoInfo?.company_name || stock.shortname,
            domain: logoInfo?.domain || '',
            // Add default required fields that might be undefined
            industry: '',
            employees: '',
            founded: '',
            address: '',
            ceo: '',
            website: '',
            description: '',
            marketCap: '',
            peRatio: '',
            weekRange: '',
            volume: '',
            yieldRange: ''
          };
          
          return newData;
        });

        setDividendData(transformedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError('Failed to load dividend data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDividendData();
  }, []);

  const [companyLogos, setCompanyLogos] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const loadCompanyLogos = async () => {
      try {
        const response = await fetch('/sp500_company_logos.csv');
        const csvText = await response.text();
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const logoMap = new Map(
              results.data.map((row: any) => [row.Symbol, row.LogoURL])
            );
            setCompanyLogos(logoMap);
          }
        });
      } catch (error) {
        console.error('Error loading company logos:', error);
      }
    };

    loadCompanyLogos();
  }, []);

  const [holidayData, setHolidayData] = useState<Holiday[]>([]);

  useEffect(() => {
    const fetchHolidayData = async () => {
      try {
        const response = await fetch('/calender/holiday.json');
        const data = await response.json();
        setHolidayData(data.holidays);
      } catch (error) {
        console.error('Error loading holiday data:', error);
      }
    };

    fetchHolidayData();
  }, []);

  useEffect(() => {
    const newDate = new Date(selectedYear, selectedMonth);
    setCurrentMonth(newDate);
  }, [selectedYear, selectedMonth]);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  
  const getFirstDayOfMonth = (date: Date) => {
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Adjust for Monday start
  };

  const formatMonth = (date: Date) => date.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleStockClick = (stock: DividendData) => {
    const stockData: Stock = {
      cik_str: "", // You might want to fetch this from somewhere
      Symbol: stock.Symbol,
      title: stock.title
    };
    setSelectedStock(stockData);
    setDialogOpen(true);
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

  const handleStockHover = useCallback((stock: DividendData) => {
    // Clear any existing timer
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
    }

    setHoveredStock(stock);
    
    // Using MouseEvent for type safety
    const event = window.event as MouseEvent;
    
    setHoveredStockDetails({
      stock,
      position: { x: event?.clientX || 0, y: event?.clientY || 0 },
      exDividendDate: stock.ExDividendDate,
      dividendDate: stock.DividendDate
    });

    // Set new timer to close the card after 2 seconds
    const timer = setTimeout(() => {
      setHoveredStock(null);
      setHoveredStockDetails(null);
    }, 2000);

    setAutoCloseTimer(timer);
  }, [autoCloseTimer]);

  const handleStockLeave = () => {
    // Don't clear the hover state anymore
  };

  const handleCloseHover = () => {
    setHoveredStockDetails(null);
    setExpandedStock(null);
  };

  const handleSeeMoreClick = (e: React.MouseEvent, stock: DividendData) => {
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

  const filteredDividendData = dividendData
    .filter(stock => 
      stock && (
        (stock.Symbol?.toLowerCase().includes(searchTerm) || false) ||
        (stock.title?.toLowerCase().includes(searchTerm) || false)
      )
    )
    .sort((a, b) => {
      // Handle null/undefined cases
      const symbolA = a.Symbol?.toUpperCase() || '';
      const symbolB = b.Symbol?.toUpperCase() || '';
      return symbolA.localeCompare(symbolB);
    });

  const renderStockCard = (stock: DividendData, borderColorClass: string) => (
    <div 
      className="relative group stock-element w-[50px] h-[50px] mt-2"
      onMouseEnter={() => handleStockHover(stock)}
      onMouseLeave={() => {
        // Start the close timer when mouse leaves
        const timer = setTimeout(() => {
          setHoveredStock(null);
          setHoveredStockDetails(null);
        }, 2000);
        setAutoCloseTimer(timer);
      }}
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

  const [showPopup, setShowPopup] = useState<{ [key: string]: boolean }>({});

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

    // Get and sort stocks for this date
    const stocksForDate = filteredDividendData
      .filter((stock) => stock && stock[dateType] === dateString)
      .sort((a, b) => {
        const symbolA = a.Symbol?.toUpperCase() || '';
        const symbolB = b.Symbol?.toUpperCase() || '';
        return symbolA.localeCompare(symbolB);
      });

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
                className={year === currentYear ? "font-semibold text-primary" : ""}
              >
                {year === currentYear ? `${year} ` : year}
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

  const handleMoreClick = (stocks: DividendData[], event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedPopup({ stocks });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container ml-[150px] mr-[100px] px-4 py-6">
        <div className="grid grid-cols-1 gap-6">
          <Card className="p-8 shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden rounded-xl">
            {/* Monthly Background with improved opacity */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-opacity"
              style={{ 
                backgroundImage: `url(${monthBackgrounds[currentMonth.getMonth()]})`,
                opacity: '0.08' // Slightly increased opacity
              }}
            />
            
            {/* Content with improved spacing */}
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  {formatMonth(currentMonth)}
                </h1>
                
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full md:w-auto">
                  {renderFilters()}
                  
                  <div className="flex gap-4 items-center mb-3">
                    <Select value={viewMode} onValueChange={(value: 'weekly' | 'monthly') => setViewMode(value)}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly View</SelectItem>
                        <SelectItem value="monthly">Monthly View</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Improved weekday header styling */}
              <div className="grid grid-cols-5 gap-4 mb-4">
                {["MON", "TUE", "WED", "THU", "FRI"].map(day => (
                  <div 
                    key={day} 
                    className="text-center font-semibold p-3 bg-gray-50/80 dark:bg-gray-800/50 
                             text-sm rounded-lg text-gray-600 dark:text-gray-400
                             border border-gray-200/50 dark:border-gray-700/50
                             backdrop-blur-sm"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid with improved spacing */}
              <div className="grid grid-cols-5 gap-6">
                {renderCalendar()}
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
      {selectedStock && (
        <StockDetailsDialog
          stock={selectedStock}
          isOpen={dialogOpen}
          setIsOpen={setDialogOpen}
        />
      )}
      {hoveredStockDetails && (
        <div 
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 transform transition-all duration-200 hover-card w-[320px]"
          style={{
            left: hoveredStockDetails.position.x,
            top: Math.max(hoveredStockDetails.position.y - 350, 10),
            transform: 'translateX(-50%)',
          }}
          onMouseEnter={() => {
            if (autoCloseTimer) {
              clearTimeout(autoCloseTimer);
            }
          }}
          onMouseLeave={() => {
            // Start the close timer when mouse leaves
            const timer = setTimeout(() => {
              setHoveredStock(null);
              setHoveredStockDetails(null);
            }, 2000);
            setAutoCloseTimer(timer);
          }}
        >
          <div 
            className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700"
          />
          {hoveredStockDetails.stock?.insight && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-b-lg border border-blue-200 dark:border-blue-800">
              <div className="flex flex-col gap-2">
                <div className="mt-2">
                <div
  className={`mt-1 flex items-center gap-2 ${
    hoveredStockDetails.stock.status === 'This stock has a safe dividend.'
      ? 'text-green-600 dark:text-green-400'
      : hoveredStockDetails.stock.status === 'This stock may have a risky dividend.'
      ? 'text-yellow-600 dark:text-yellow-400'
      : hoveredStockDetails.stock.status === 'This stock does not pay a dividend.'
      ? 'text-red-600 dark:text-red-400'
      : 'text-gray-600 dark:text-gray-400'
  }`}
>
  {/* Icon Selection Based on Status */}
  {hoveredStockDetails.stock.status === 'This stock has a safe dividend.' && (
    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
  )}
  {hoveredStockDetails.stock.status === 'This stock may have a risky dividend.' && (
    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
  )}
  {hoveredStockDetails.stock.status === 'This stock does not pay a dividend.' && (
    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
  )}
  {!['This stock has a safe dividend.', 'This stock may have a risky dividend.', 'This stock does not pay a dividend.'].includes(
    hoveredStockDetails.stock.status
  ) && (
    <Info className="h-5 w-5 text-gray-600 dark:text-gray-400" />
  )}

  {/* Status Text */}
  
  <span>{hoveredStockDetails.stock.status}</span>
</div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-between items-end mb-2 w-[200px]">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 bg-center bg-no-repeat bg-contain aspect-square border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
                  style={{ backgroundImage: `url(${companyLogos.get(hoveredStockDetails.stock?.Symbol) || hoveredStockDetails.stock?.LogoURL || 'stock.avif'})` }}
                  onClick={() => {
                    handleStockClick(hoveredStockDetails.stock);
                    setHoveredStockDetails(null);
                  }}
                />
                <div>
                  <div 
                    className="font-semibold cursor-pointer hover:text-blue-500 transition-colors"
                    onClick={() => {
                      handleStockClick(hoveredStockDetails.stock);
                      setHoveredStockDetails(null);
                    }}
                  >
                    {hoveredStockDetails.stock?.Symbol}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {hoveredStockDetails.stock?.title}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleCloseHover}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Ex-Dividend Date:</span>
              <span className="font-medium">
                {new Date(hoveredStockDetails.exDividendDate)
                .toISOString()
                .split('T')[0]}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Payout Date:</span>
              <span className="font-medium">
                {new Date(hoveredStockDetails.stock?.payoutdate)
                .toISOString()
                .split('T')[0]}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Dividend Rate:</span>
              <span className="font-medium">${hoveredStockDetails.stock?.dividendRate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Yield:</span>
              <span className="font-medium">
                {Number.isNaN(Number(hoveredStockDetails.stock?.dividendYield))
                  ? 'N/A'
                  : (Number(hoveredStockDetails.stock?.dividendYield) * (0.98 + Math.random() * 0.04)).toFixed(2)
                }
              </span>
            </div>
          </div>
          <button
            onClick={(e) => handleSeeMoreClick(e, hoveredStockDetails.stock)}
            className="w-full mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-center py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            See More Details
          </button>
        </div>
      )}

{expandedStock && (
        <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4"
        onClick={() => {
          handleCloseExpanded();
          setHoveredStockDetails(null);
        }}
      >
        <div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-3xl w-full max-h-[90vh] flex flex-col relative"
          onClick={e => e.stopPropagation()}
        >
          

      
          {/* Header Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 bg-center bg-no-repeat bg-contain rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
                style={{ backgroundImage: `url(${companyLogos.get(expandedStock.Symbol) || expandedStock.LogoURL || 'stock.avif'})` }}
                onClick={() => {
                  handleStockClick(expandedStock);
                  handleCloseExpanded();
                }}
              />
              <h3 className="text-lg font-bold">
                <span 
                  className="cursor-pointer hover:text-blue-500 transition-colors"
                  onClick={() => {
                    handleStockClick(expandedStock);
                    handleCloseExpanded();
                  }}
                >
                  {expandedStock.Symbol}
                </span>
                <br />
                <span className="text-sm">{expandedStock.title}</span>
              </h3>
            </div>
            <button
              onClick={() => {
                handleCloseExpanded();
                setHoveredStockDetails(null);
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Insight Section */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <FaInfoCircle className="text-blue-800 dark:text-blue-100 text-lg" />
              <span className="font-semibold text-blue-800 dark:text-blue-100">Important</span>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-100 mt-1">{expandedStock.insight}</p>
          </div>
      
          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 space-y-4 pr-2">
      {/* Table 5: Dates */}
      <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-md font-semibold mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FaCalendarAlt /> Important Dates
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
              <span className="font-medium">Ex-Dividend Date:</span> 
              <span className="ml-2">
 
    {new Date(expandedStock.ExDividendDate)
    .toISOString()
    .split('T')[0]}

    
</span>

              
            </div>

            <div>
              <span className="font-medium">Payout Date:</span> 
              <span className="ml-2">

    {new Date(expandedStock.payoutdate)
    .toISOString()
    .split('T')[0]}
    
      
</span>

            </div>

            <div>
              <span className="font-medium">Earnings Date:</span> 
              <span className="ml-2">
    {new Date(expandedStock.EarningsDate)
    .toISOString()
    .split('T')[0]}
    
</span>

            </div>

              </div>
            </div>
            {/* Table 3: Dividend Information */}
            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-md font-semibold mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FaDollarSign /> Dividend Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Dividend Rate:</span> {expandedStock.dividendRate}</div>
                <div><span className="font-medium">Dividend Yield:</span> {
                  Number.isNaN(Number(expandedStock.dividendYield))
                    ? 'N/A'
                    : (Number(expandedStock.dividendYield) * (0.98 + Math.random() * 0.04)).toFixed(2)
                }</div>
                <div><span className="font-medium">Annual Rate:</span> {expandedStock.AnnualRate}</div>
              </div>
            </div>
      
            {/* Table 2: Payout Ratio Information */}
            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-md font-semibold mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FaChartLine /> Payout Ratio
              </h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div><span className="font-medium">Payout Ratio:</span> {expandedStock.payoutRatio}</div>
                <div><span className="font-medium"></span> {expandedStock.message}</div>
              </div>
            </div>
      
            

            {/* History Section */}
            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-md font-semibold mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FaHistory className="text-blue-500 dark:text-blue-400" /> History
              </h4>
              <div className="text-sm">
                <div>{expandedStock.hist}</div>
              </div>
            </div>

            {/* Table 4: Stock Price Information */}
            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-md font-semibold mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FaChartLine /> Stock Prices
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Current Price:</span> {expandedStock.currentPrice}</div>
                <div><span className="font-medium">Previous Close:</span> {expandedStock.previousClose}</div>
              </div>
            </div>
      
            
      
          </div>
        </div>
      </div>
      )}

      {expandedPopup && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 flex items-center justify-center"
          onClick={() => {
            setExpandedPopup(null);
            setHoveredStockDetails(null);
          }}
        >
          {hoveredStockDetails && (
            <div 
              className="absolute z-[60]"
              style={{
                top: `${Math.max(hoveredStockDetails.position.y - 320, 10)}px`,
                left: `${hoveredStockDetails.position.x}px`
              }}
            >
              {/* Your hoveredStockDetails content */}
            </div>
          )}

          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700 w-[600px] max-h-[500px] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100">
                    Dividend Stocks
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {expandedPopup.stocks.length} stocks found
                  </p>
                </div>
                <button 
                  onClick={() => setExpandedPopup(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-4">
              {expandedPopup.stocks.map((stock, index) => (
                <div key={index} className="flex justify-center">
                  <div 
                    className="cursor-pointer transition-transform hover:scale-105"
                    onClick={(e) => {
                      handleStockClick(stock);
                      e.stopPropagation();
                    }}
                    onMouseEnter={() => setHoveredStock(stock)}
                    onMouseLeave={() => setHoveredStock(null)}
                  >
                    {renderStockCard(stock, getStatusBorderColor(stock.status))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dividend;


