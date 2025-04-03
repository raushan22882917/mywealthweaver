import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Expand, Minimize, Plus, Search, X, Calendar, CheckCircle, AlertTriangle, XCircle, Info, CalendarIcon, Bell } from "lucide-react";
import StockDetailsDialog from "@/components/StockDetailsDialog";
import { supabase } from "@/lib/supabase/client";
import Papa from "papaparse";
import StockFilter, { StockFilterCriteria, StockFilterData } from "@/components/ui/stock-filter";
import { FaDollarSign, FaChartLine, FaCalendarAlt, FaInfoCircle, FaHistory } from "react-icons/fa";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

interface Stock {
  cik_str: string;
  Symbol: string;
  title: string;
}

interface Holiday {
  date: string;
  name: string;
  type: string;
}

interface StockFilterData {
  id: number;
  symbol: string;
  sector: string;
  exchange: string;
  dividend_yield: number;
  payout_ratio: number;
  financial_health_score: number;
  debt_levels: number;
  revenue: number;
  earnings_per_share: number;
  five_year_dividend_yield: number;
  status?: string;
}

interface DividendData {
  Symbol: string;
  title: string;
  amount: number;
  dividendRate: number;
  previousClose: number;
  currentPrice: number;
  dividendYield: number;
  payoutRatio: number;
  AnnualRate: number;
  message: string;
  ExDividendDate: string;
  DividendDate: string;
  EarningsDate: string;
  payoutdate: string;
  insight?: string;
  LogoURL?: string;
  status?: string;  // Add status field
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
const startYear = 2020;
const yearOptions = Array.from(
  { length: currentYear - startYear + 1 },
  (_, index) => currentYear - index
).sort((a, b) => b - a);

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
  if (!status) return 'border-gray-200 dark:border-gray-700';
  
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

const Dividend: React.FC = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('monthly');
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

  const [isTouched, setIsTouched] = useState(false);
  const [isHoveringSymbol, setIsHoveringSymbol] = useState(false);

  const [showInsight, setShowInsight] = useState(false);

  const handleCardTouch = useCallback(() => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
    }
    
    const timer = setTimeout(() => {
      setHoveredStockDetails(null);
    }, 7000);
    
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

        const safetyMap = new Map(safetyData?.map(item => [item.symbol, item]) || []);
        const logoMap = new Map(logoData?.map(item => [item.Symbol, item]) || []);

        const transformedData = (dividendData || []).map((stock: any) => {
          const safetyInfo = safetyMap.get(stock.symbol);
          const logoInfo = logoMap.get(stock.symbol);

          const newData: DividendData = {
            Symbol: stock.symbol,
            title: stock.shortname,
            amount: stock.amount,
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
            status: safetyInfo?.status || 'Status not available',
            payout_ratio: safetyInfo?.payout_ratio?.toString(),
            fcf_coverage: safetyInfo?.fcf_coverage?.toString(),
            debt_to_equity: safetyInfo?.debt_to_equity?.toString(),
            LogoURL: logoInfo?.LogoURL || '',
            company_name: logoInfo?.company_name || stock.shortname,
            domain: logoInfo?.domain || '',
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

  const [dividendAnnouncements, setDividendAnnouncements] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('dividend_announcements')
          .select('symbol, message');
        
        if (error) throw error;
        
        const announcements = data.reduce((acc: {[key: string]: string}, curr) => {
          acc[curr.symbol] = curr.message;
          return acc;
        }, {});
        
        setDividendAnnouncements(announcements);
      } catch (error) {
        console.error('Error fetching dividend announcements:', error);
      }
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const newDate = new Date(selectedYear, selectedMonth);
    setCurrentMonth(newDate);
  }, [selectedYear, selectedMonth]);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  
  const getFirstDayOfMonth = (date: Date) => {
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
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
      cik_str: "",
      Symbol: stock.Symbol,
      title: stock.title
    };
    setSelectedStock(stockData);
    setDialogOpen(true);
    handleCloseExpanded();
  };

  const isCurrentWeek = (date: Date): boolean => {
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
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
    }

    setHoveredStock(stock);
    
    const event = window.event as MouseEvent;
    
    setHoveredStockDetails({
      stock,
      position: { x: event?.clientX || 0, y: event?.clientY || 0 },
      exDividendDate: stock.ExDividendDate,
      dividendDate: stock.DividendDate
    });

    if (!isTouched) {
      const timer = setTimeout(() => {
        setHoveredStock(null);
        setHoveredStockDetails(null);
      }, 1000);
      setAutoCloseTimer(timer);
    }
  }, [autoCloseTimer, isTouched]);

  const handleStockLeave = () => {
    setHoveredStockDetails(null);
    setExpandedStock(null);
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

  const [filterCriteria, setFilterCriteria] = useState<StockFilterCriteria>({});
  const [stockFilterData, setStockFilterData] = useState<StockFilterData[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<StockFilterData[]>([]);
  const [showResultsPopup, setShowResultsPopup] = useState(false);

  const fetchFilterData = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_financial_details')
        .select('*');

      if (error) throw error;

      const transformedData = data.map(stock => ({
        id: stock.id,
        symbol: stock.symbol,
        sector: stock.sector || 'N/A',
        exchange: stock.exchange || 'N/A',
        dividend_yield: stock.dividend_yield || 0,
        payout_ratio: stock.payout_ratio || 0,
        financial_health_score: stock.financial_health_score || 0,
        debt_levels: stock.debt_levels || 0,
        revenue: stock.revenue || 0,
        earnings_per_share: stock.earnings_per_share || 0,
        five_year_dividend_yield: stock.five_year_dividend_yield || stock.dividend_yield || 0,
        status: stock.status || 'N/A'
      }));

      setStockFilterData(transformedData);
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  };

  useEffect(() => {
    fetchFilterData();
  }, []);

  const handleFilterApply = async (filterCriteria: StockFilterCriteria) => {
    try {
      let query = supabase
        .from('stock_financial_details')
        .select('*');

      // Apply filters
      if (filterCriteria.symbol && filterCriteria.symbol !== '_all') {
        query = query.ilike('symbol', `%${filterCriteria.symbol}%`);
      }

      if (filterCriteria.sector && filterCriteria.sector !== '_all') {
        query = query.eq('sector', filterCriteria.sector);
      }

      if (filterCriteria.exchange && filterCriteria.exchange !== '_all') {
        query = query.eq('exchange', filterCriteria.exchange);
      }

      if (filterCriteria.minDividendYield !== undefined) {
        query = query.gte('dividend_yield', filterCriteria.minDividendYield);
      }
      if (filterCriteria.maxDividendYield !== undefined) {
        query = query.lte('dividend_yield', filterCriteria.maxDividendYield);
      }

      if (filterCriteria.minPayoutRatio !== undefined) {
        query = query.gte('payout_ratio', filterCriteria.minPayoutRatio);
      }
      if (filterCriteria.maxPayoutRatio !== undefined) {
        query = query.lte('payout_ratio', filterCriteria.maxPayoutRatio);
      }

      if (filterCriteria.minHealthScore !== undefined) {
        query = query.gte('financial_health_score', filterCriteria.minHealthScore);
      }

      if (filterCriteria.hasDebtConcerns) {
        query = query.gte('debt_levels', 3);
      }

      const { data, error } = await query;

      if (error) throw error;

      const filteredData = data.map(stock => ({
        id: stock.id,
        symbol: stock.symbol,
        sector: stock.sector || 'N/A',
        exchange: stock.exchange || 'N/A',
        dividend_yield: stock.dividend_yield || 0,
        payout_ratio: stock.payout_ratio || 0,
        financial_health_score: stock.financial_health_score || 0,
        debt_levels: stock.debt_levels || 0,
        revenue: stock.revenue || 0,
        earnings_per_share: stock.earnings_per_share || 0,
        five_year_dividend_yield: stock.five_year_dividend_yield || stock.dividend_yield || 0,
        status: stock.status || 'N/A'
      }));

      setFilteredStocks(filteredData);
      setShowResultsPopup(true);
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  };

  const filteredDividendData = dividendData
    .filter(stock => {
      if (Object.keys(filterCriteria).length === 0) return true;
      
      const stockData = stockFilterData.find(data => data.symbol === stock.Symbol);
      if (!stockData) return true;
      
      if (filterCriteria.symbol && !stock.Symbol.toLowerCase().includes(filterCriteria.symbol.toLowerCase())) {
        return false;
      }
      
      if (filterCriteria.sector && stockData.sector !== filterCriteria.sector) {
        return false;
      }
      
      if (filterCriteria.exchange && stockData.exchange !== filterCriteria.exchange) {
        return false;
      }
      
      if (stockData.dividend_yield !== undefined && 
          (stockData.dividend_yield < (filterCriteria.minDividendYield || 0) || 
           stockData.dividend_yield > (filterCriteria.maxDividendYield || 100))) {
        return false;
      }
      
      if (stockData.payout_ratio !== undefined && 
          (stockData.payout_ratio < (filterCriteria.minPayoutRatio || 0) || 
           stockData.payout_ratio > (filterCriteria.maxPayoutRatio || 100))) {
        return false;
      }
      
      if (stockData.financial_health_score !== undefined && 
          stockData.financial_health_score < (filterCriteria.minHealthScore || 0)) {
        return false;
      }
      
      if (filterCriteria.hasDebtConcerns && stockData.debt_levels !== undefined && stockData.debt_levels < 3) {
        return false;
      }
      
      return true;
    })
    .filter(stock => 
      stock && (
        (stock.Symbol?.toLowerCase().includes(searchTerm) || false) ||
        (stock.title?.toLowerCase().includes(searchTerm) || false)
      )
    )
    .sort((a, b) => {
      const symbolA = a.Symbol?.toUpperCase() || '';
      const symbolB = b.Symbol?.toUpperCase() || '';
      return symbolA.localeCompare(symbolB);
    });

  const convertToDividendData = (stock: StockFilterData): DividendData => ({
    Symbol: stock.symbol,
    title: stock.symbol,
    amount: stock.dividend_yield,
    dividendRate: stock.dividend_yield,
    previousClose: 0,
    currentPrice: 0,
    dividendYield: stock.dividend_yield,
    payoutRatio: stock.payout_ratio,
    AnnualRate: stock.dividend_yield * 4, // Assuming quarterly dividends
    message: '',
    ExDividendDate: new Date().toISOString(),
    DividendDate: new Date().toISOString(),
    EarningsDate: new Date().toISOString(),
    payoutdate: new Date().toISOString(),
    insight: `Financial Health Score: ${stock.financial_health_score}, Debt Levels: ${stock.debt_levels}`,
    LogoURL: undefined,
    status: stock.status
  });

  const renderStockCard = (stock: DividendData, borderColorClass: string) => (
    <div 
      className="relative group stock-element w-[50px] h-[50px] mt-2"
      onClick={(e) => {
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setHoveredStockDetails({
          stock,
          position: { 
            x: rect.left + rect.width / 2,
            y: rect.top 
          },
          exDividendDate: stock.ExDividendDate,
          dividendDate: stock.DividendDate
        });
        setShowInsight(true);
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setHoveredStockDetails({
          stock,
          position: { 
            x: rect.left + rect.width / 2,
            y: rect.top 
          },
          exDividendDate: stock.ExDividendDate,
          dividendDate: stock.DividendDate
        });
        setShowInsight(true);
      }}
    >
      <div
        className={`w-full h-full flex flex-col items-center justify-center rounded-lg border-2 ${borderColorClass} bg-white dark:bg-gray-800 transition-transform transform hover:scale-110 overflow-hidden`}
      >
        <div className="w-full h-[35px] flex items-center justify-center">
          <img
            src={companyLogos.get(stock.Symbol) || stock.LogoURL || 'stock.avif'}
            alt={stock.Symbol}
            className="h-full w-full object-contain p-1"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'stock.avif';
            }}
          />
        </div>
        <div className="w-full h-[15px] bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-[10px] font-bold text-gray-900 dark:text-gray-100 leading-none truncate px-1">
            {stock.Symbol}
          </span>
        </div>
      </div>
    </div>
  );

  const [showFilterPopup, setShowFilterPopup] = useState(false);

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

    const holiday = holidayData.find(h => h.date === dateString);

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
        <div
          className={`relative z-10 h-full rounded-lg backdrop-blur-sm ${
            isToday ? 'bg-blue-50/70 dark:bg-blue-900/30' : 
            holiday ? 'bg-red-50/70 dark:bg-red-900/30' :
            currentWeek ? 'bg-green-50/70 dark:bg-green-950/30' : 
            'hover:bg-gray-50/70 dark:hover:bg-gray-800/30'
          }`}
        >
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
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 overflow-hidden" 
                onClick={(e) => e.stopPropagation()}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-5"
                  style={{ 
                    backgroundImage: `url(${monthBackgrounds[date.getMonth()]})`,
                  }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-4 text-gray-900 dark:text-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xl font-bold">{dateString}</h3>
                  </div>
              
                  <hr className="mb-6 border-gray-400/50" />
              
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
    }
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
    const diff = newDate.getDate() - day + (day === 0 ? -6 : 1);
    newDate.setDate(diff);
    return newDate;
  };

  const endOfWeekDate = (date: Date) => {
    const newDate = new Date(date);
    const day = newDate.getDay();
    const diff = newDate.getDate() - day + (day === 0 ? 0 : 7);
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
            <div 
              className="absolute inset-0 bg-cover bg-center transition-opacity"
              style={{ 
                backgroundImage: `url(${monthBackgrounds[currentMonth.getMonth()]})`,
                opacity: '0.08'
              }}
            />
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  {formatMonth(currentMonth)}
                </h1>
                
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full md:w-auto">
                  <Button
                    onClick={() => setShowFilterPopup(true)}
                    className="flex items-center gap-2"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Filter Stocks
                  </Button>
                  
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
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setHoveredStockDetails(null);
              setShowInsight(false);
              setIsTouched(false);
            }}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
              <img
                src={companyLogos.get(hoveredStockDetails.stock?.Symbol) || hoveredStockDetails.stock?.LogoURL || 'stock.avif'}
                alt={hoveredStockDetails.stock?.Symbol}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'stock.avif';
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{hoveredStockDetails.stock?.Symbol}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{hoveredStockDetails.stock?.title}</p>
            </div>
          </div>

          {dividendAnnouncements[hoveredStockDetails.stock?.Symbol] && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-green-600 dark:text-blue-400">
                  Dividend Announcement
                </span>
              </div>
              <p className="text-sm text-blue-800 dark:text-green-200">
                {dividendAnnouncements[hoveredStockDetails.stock?.Symbol]}
              </p>
            </div>
          )}

          {showInsight && hoveredStockDetails.stock?.insight && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-b-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <FaInfoCircle className="text-blue-800 dark:text-blue-100 text-lg" />
                <span className="font-semibold text-blue-800 dark:text-blue-100">Important</span>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-100 mt-1">{hoveredStockDetails.stock?.insight}</p>
            </div>
          )}

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
                }%
              </span>
            </div>
          </div>

          <button
            onClick={(e) => handleSeeMoreClick(e, hoveredStockDetails.stock)}
            className="w-full mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-center py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            See More Details
          </button>
        </div>
      )}

      {/* Filter Popup */}
      {showFilterPopup && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center"
          onClick={() => setShowFilterPopup(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700 w-[800px] max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Filter Stocks</h3>
                <button 
                  onClick={() => setShowFilterPopup(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <StockFilter 
              onFilterApply={handleFilterApply}
              stocks={stockFilterData}
            />
          </div>
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
            {dividendAnnouncements[expandedStock.Symbol] && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                    Dividend Announcement
                  </h4>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {dividendAnnouncements[expandedStock.Symbol]}
                </p>
              </div>
            )}

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
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <FaInfoCircle className="text-blue-800 dark:text-blue-100 text-lg" />
                <span className="font-semibold text-blue-800 dark:text-blue-100">Important</span>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-100 mt-1">{expandedStock.insight}</p>
              <p className="text-sm text-blue-800 dark:text-blue-100 mt-1">{expandedStock.amount}</p>
            </div>
      
            <div className="overflow-y-auto flex-1 space-y-4 pr-2">
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
      
              <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-md">
                <h4 className="text-md font-semibold mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <FaChartLine /> Payout Ratio
                </h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div><span className="font-medium">Payout Ratio:</span> {expandedStock.payoutRatio}</div>
                  <div><span className="font-medium"></span> {expandedStock.message}</div>
                </div>
              </div>
      
              <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-md">
                <h4 className="text-md font-semibold mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <FaHistory className="text-blue-500 dark:text-blue-400" /> History
                </h4>
                <div className="text-sm">
                  <div>{expandedStock.hist}</div>
                </div>
              </div>

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
      {showResultsPopup && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 flex items-center justify-center"
          onClick={() => {
            setShowResultsPopup(false);
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700 w-[600px] max-h-[500px] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100">
                    Filtered Stocks
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {filteredStocks.length} stocks found
                  </p>
                </div>
                <button 
                  onClick={() => setShowResultsPopup(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-4">
              {filteredStocks.map((stock, index) => (
                <div key={index} className="flex justify-center">
                  <div 
                    className="cursor-pointer transition-transform hover:scale-105"
                    onClick={(e) => {
                      const dividendData = convertToDividendData(stock);
                      setHoveredStockDetails({
                        stock: dividendData,
                        position: { 
                          x: e.currentTarget.getBoundingClientRect().left + e.currentTarget.getBoundingClientRect().width / 2,
                          y: e.currentTarget.getBoundingClientRect().top 
                        },
                        exDividendDate: dividendData.ExDividendDate,
                        dividendDate: dividendData.DividendDate
                      });
                      e.stopPropagation();
                    }}
                  >
                    {renderStockCard(convertToDividendData(stock), 
                      stock.financial_health_score > 7 ? 'border-green-500' : 
                      stock.financial_health_score > 4 ? 'border-yellow-500' : 
                      'border-red-500'
                    )}
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
