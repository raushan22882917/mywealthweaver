import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Expand, Minimize, Plus, Search, X, Calendar, CheckCircle, AlertTriangle, XCircle, Info, CalendarIcon, Bell, TrendingUp } from "lucide-react";
import StockDetailsDialog from "@/components/StockDetailsDialog";
import { supabase } from "@/lib/supabase/client";
import StockFilter, { StockFilterCriteria, StockFilterData } from "@/components/ui/stock-filter";
import { FaDollarSign, FaChartLine, FaCalendarAlt, FaInfoCircle, FaHistory } from "react-icons/fa";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Papa from 'papaparse';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Benchmark from "@/components/Benchmark";

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
  dividend: string;

  dividendYield: string;
  payoutRatio: string;
  AnnualRate: string;
  message: string;
  exdividenddate: string;
  buy_date: string;
  DividendDate: string;
  earningsdate: string;
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
  amount: string;
  status?: string;
  payout_ratio?: string;
  fcf_coverage?: string;
  debt_to_equity?: string;
  company_name?: string;
  domain?: string;
}

interface HoveredStockDetails {
  stock: DividendData;
  exdividenddate: string;
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

  const [dateType, setDateType] = useState<'exdividenddate' | 'payoutdate'>('exdividenddate');

  const [totalSymbolCount, setTotalSymbolCount] = useState<number>(0);
  const [currentMonthStockCount, setCurrentMonthStockCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedPopup, setExpandedPopup] = useState<{
    stocks: any[];
  } | null>(null);

  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(null);

  const [clickCount, setClickCount] = useState<{[key: string]: {count: number, timestamp: number}}>({});
  const [isHoveringSymbol, setIsHoveringSymbol] = useState(false);

  const [csvLogoUrls, setCsvLogoUrls] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    // Load logo URLs from CSV file
    fetch('/logos.csv')
      .then(response => response.text())
      .then(csvData => {
        const result = Papa.parse(csvData, { header: true });
        const logoMap = new Map();
        result.data.forEach((row: any) => {
          if (row.Symbol && row.LogoURL) {
            logoMap.set(row.Symbol.toUpperCase(), row.LogoURL);
          }
        });
        setCsvLogoUrls(logoMap);
      })
      .catch(error => console.error('Error loading CSV logos:', error));
  }, []);

  const handleCardTouch = useCallback(() => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
    }
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
      setDateType('exdividenddate');
    }
  }, []);

  useEffect(() => {
    const fetchDividendData = async () => {
      try {
        setIsLoading(true);

        // Get total count of symbols in dividend table
        const { count, error: countError } = await supabase
          .from('dividendsymbol')
          .select('symbol', { count: 'exact', head: true });

        if (countError) throw new Error(`Count error: ${countError.message}`);

        // Set the total count
        setTotalSymbolCount(count || 0);
        console.log('Total symbols in dividend table:', count);

        const [
          { data: dividendData, error: dividendError },
          { data: safetyData, error: safetyError },
          { data: logoData, error: logoError }
        ] = await Promise.all([
          supabase.from('dividendsymbol').select('*'),
          supabase.from('dividend_safety').select('*'),
          supabase.from('company_logos').select('*')
        ]);

        if (dividendError) throw new Error(`Dividend data error: ${dividendError.message}`);
        if (safetyError) throw new Error(`Safety data error: ${safetyError.message}`);
        if (logoError) throw new Error(`Logo data error: ${logoError.message}`);

        const safetyMap = new Map(safetyData?.map(item => [item.symbol, item]) || []);
        // Create a case-insensitive map for logos
        const logoMap = new Map();
        logoData?.forEach(item => {
          if (item.Symbol && item.LogoURL) {
            // Store symbols in uppercase for case-insensitive lookup
            logoMap.set(item.Symbol.toUpperCase(), item.LogoURL);
          }
        });

        const transformedData = (dividendData || []).map((stock: any) => {
          const safetyInfo = safetyMap.get(stock.symbol);
          // Use uppercase for consistent matching with Symbol column
          const logoInfo = logoMap.get(stock.Symbol || stock.symbol);

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
            exdividenddate: stock.exdividenddate || '',
            DividendDate: stock.dividenddate || '',
            earningsdate: stock.earningsdate || '',
            payoutdate: stock.payoutdate || '',
            buy_date: stock.buy_date || '',
            dividend: stock.dividend || '',

            hist: stock.hist || '',
            insight: stock.insight || '',
            status: safetyInfo?.status || 'Status not available',
            payout_ratio: safetyInfo?.payout_ratio?.toString(),
            fcf_coverage: safetyInfo?.fcf_coverage?.toString(),
            debt_to_equity: safetyInfo?.debt_to_equity?.toString(),
            LogoURL: logoInfo || '',
            company_name: logoInfo ? logoData.find(item => item.LogoURL === logoInfo)?.company_name || stock.shortname : stock.shortname,
            domain: logoInfo ? logoData.find(item => item.LogoURL === logoInfo)?.domain || '' : '',
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
            yieldRange: '',
            amount: ''
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

  useEffect(() => {
    const fetchStockFilterData = async () => {
      try {
        const { data, error } = await supabase
          .from('stock_filter')
          .select('*');

        if (error) {
          console.error("Error fetching stock filter data:", error);
          return;
        }

        const filterData = data.map(item => ({
          symbol: item.Symbol,
          sector: item.Sector,
          exchange: item.Exchange,
          dividendYield: item["Dividend-Yield"],
          payoutRatio: item["Payout Ratio"],
          financialHealthScore: item["Financial-Health-Score"],
          debtLevels: item["Debt Levels"],
          revenue: item.Revenue,
          earningsPerShare: item.Earnings_per_share,
        }));

        setStockFilterData(filterData);
      } catch (error) {
        console.error("Error processing stock filter data:", error);
      }
    };

    fetchStockFilterData();
  }, []);

  const [companyLogos, setCompanyLogos] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const loadCompanyLogos = async () => {
      try {
        const { data, error } = await supabase
          .from('company_logos')
          .select('Symbol, LogoURL');

        if (error) throw error;

        // Create a case-insensitive map for logos
        const logoMap = new Map();
        data.forEach(row => {
          if (row.Symbol && row.LogoURL) {
            // Store symbols in uppercase for case-insensitive lookup
            logoMap.set(row.Symbol.toUpperCase(), row.LogoURL);
          }
        });
        setCompanyLogos(logoMap);
        console.log('Loaded company logos from Supabase:', data.length);
      } catch (error) {
        console.error('Error loading company logos:', error);
      }
    };

    loadCompanyLogos();
  }, []);

  interface Holiday {
    date: string;
    name: string;
    description: string;
  }

  const [holidayData, setHolidayData] = useState<Holiday[]>([]);

  useEffect(() => {
    const fetchHolidayData = async () => {
      try {
        const { data, error } = await supabase
          .from('holidays')
          .select('date, name, description');

        if (error) throw error;

        setHolidayData(data || []);
        console.log('Loaded holiday data from Supabase:', data?.length || 0);
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

  // This function is now replaced by the useCallback version below

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

  const handleStockClick = useCallback((stock: DividendData, event: React.MouseEvent) => {
    // Show hoveredStockDetails on click only
    setHoveredStockDetails({
      stock,
      position: { x: event.clientX || 0, y: event.clientY || 0 },
      exdividenddate: stock.exdividenddate,
      dividendDate: stock.DividendDate
    });
  }, []);

  const handleStockLeave = () => {
    // Only close if not clicking
    if (!hoveredStockDetails) {
      setHoveredStockDetails(null);
      setExpandedStock(null);
    }
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

  useEffect(() => {
    if (!dividendData.length) return;

    const transformedData = dividendData.map(stock => ({
      symbol: stock.Symbol,
      Sector: "Technology",
      Exchange: "NASDAQ",
      dividendYield: parseFloat(stock.dividendYield) || 0,
      payoutRatio: parseFloat(stock.payoutRatio) || 0,
      financialHealthScore: Math.floor(Math.random() * 10) + 1,
      debtLevels: Math.floor(Math.random() * 10) + 1,
      Revenue: Math.random() * 50000000000,
      Earnings_per_share: Math.random() * 10,
    }));

    setStockFilterData(transformedData);
  }, [dividendData]);

  const filteredDividendData = dividendData
    .filter(stock => {
      if (Object.keys(filterCriteria).length === 0) return true;

      const stockData = stockFilterData.find(data => data.symbol === stock.Symbol);
      if (!stockData) return true;

      if (filterCriteria.symbol && !stock.Symbol.toLowerCase().includes(filterCriteria.symbol.toLowerCase())) {
        return false;
      }

      if (filterCriteria.sector && filterCriteria.sector !== '' && stockData.Sector !== filterCriteria.sector) {
        return false;
      }

      if (filterCriteria.exchange && filterCriteria.exchange !== '' && stockData.Exchange !== filterCriteria.exchange) {
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
    })
    .filter(stock =>
      stock && (
        (stock.Symbol?.toLowerCase().includes(searchTerm) || false) ||
        (stock.title?.toLowerCase().includes(searchTerm) || false)
      )
    )
    .sort((a, b) => {
      const symbolA = a.Symbol || '';
      const symbolB = b.Symbol || '';
      return symbolA.localeCompare(symbolB);
    });

  const handleFilterApply = (filters: StockFilterCriteria) => {
    setFilterCriteria(filters);
  };

  const renderStockCard = (stock: DividendData, borderColorClass: string) => (
    <div
      className="relative group stock-element w-[50px] h-[50px] mt-2"
      onClick={(e) => handleStockClick(stock, e)}
    >
      <div
        className={`w-[50px] h-[60px] flex flex-col items-center justify-between rounded-lg overflow-hidden border-2 ${borderColorClass} transition-all hover:scale-105 hover:shadow-lg bg-white dark:bg-gray-900`}
      >
        <div className="w-[50px] h-[45px] flex items-center justify-center bg-white dark:bg-gray-800">
          <img
            src={companyLogos.get(stock.Symbol?.toUpperCase()) || stock.LogoURL || csvLogoUrls.get(stock.Symbol?.toUpperCase()) || 'stock.avif'}
            alt={stock.Symbol}
            className="w-full h-full object-contain"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'stock.avif';
              console.log('Failed to load logo for:', stock.Symbol);
            }}
          />
        </div>

        <div className="w-[50px] h-[15px] bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
          <span className="text-[12px] font-bold text-red-600 dark:text-red-400 leading-none truncate">
            {stock.Symbol.length > 8
              ? `${stock.Symbol.slice(0, 8)}..`
              : stock.Symbol
            }
          </span>
        </div>
      </div>

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

    const holiday = holidayData.find(h => h.date === dateString);

    const stocksForDate = filteredDividendData
      .filter((stock) => stock && stock[dateType] === dateString)
      .sort((a, b) => {
        const symbolA = a.Symbol || '';
        const symbolB = b.Symbol || '';
        return symbolA.localeCompare(symbolB);
      });

    const hasMoreStocks = stocksForDate.length > 6;
    const displayStocks = hasMoreStocks ? stocksForDate.slice(0, 6) : stocksForDate;

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
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
                  isToday
                    ? 'bg-purple-100/90 text-purple-700 dark:bg-purple-900/80 dark:text-purple-300'
                    : 'bg-gray-100/90 text-gray-700 dark:bg-gray-800/80 dark:text-gray-300'
                }`}>
                  {date.getDate()}
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
            {displayStocks.map((stock, index) => (
              <div
                key={index}
                className="flex justify-center"
              >
                <div
                  className="cursor-pointer"
                  onClick={(e) => {
                    handleStockClick(stock, e);
                  }}
                >
                  {renderStockCard(stock, getStatusBorderColor(stock.status))}
                </div>
              </div>
            ))}
            {hasMoreStocks  && (
              <div
                className=" w-[300px]  rounded-lg cursor-pointer transition-colors mt-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 px-2"
                onClick={(e) => handleMoreClick(stocksForDate, e)}
              >
                <button
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-500 hover:text-blue-400 
                           transition-colors rounded-lg border border-blue-500/30 hover:border-blue-400 
                           bg-blue-500/10 hover:bg-blue-500/20 dark:bg-blue-500/5 dark:hover:bg-blue-500/10"
                >
                  <Plus className="w-4 h-4" />
                  <span>Show {stocksForDate.length - 6} more stocks</span>
                </button>
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
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-5"
                  style={{
                    backgroundImage: `url(${monthBackgrounds[date.getMonth()]})`,
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-4 text-gray-900 dark:text-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2V9a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xl font-bold">{dateString}</h3>
                  </div>

                  <hr className="mb-6 border-gray-400/50" />

                  <div className="grid grid-cols-4 gap-6">
                    {stocksForDate.map((stock, index) => (
                      <div
                        key={index}
                        className="flex justify-center"
                      >
                        <div
                          className="cursor-pointer"
                          onClick={(e) => {
                            handleStockClick(stock, e);
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
      <main className="container mx-auto px-4 py-4 max-w-[1400px]">
        <div className="grid grid-cols-1 gap-4">
          <Card className="p-6 shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden rounded-xl mt-2">
            <div
              className="absolute inset-0 bg-cover bg-center transition-opacity"
              style={{
                backgroundImage: `url(${monthBackgrounds[currentMonth.getMonth()]})`,
                opacity: '0.08'
              }}
            />
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-1">
                    {formatMonth(currentMonth)}
                  </h1>
                </div>
                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center w-full md:w-auto">
                  <div className="mb-2">
                    <StockFilter
                      onFilterApply={handleFilterApply}
                      filterableStocks={stockFilterData}
                    />
                  </div>
                  {renderFilters()}
                  <div className="flex gap-3 items-center mb-2">
                    <Select value={viewMode} onValueChange={(value: 'weekly' | 'monthly') => setViewMode(value)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly View</SelectItem>
                        <SelectItem value="monthly">Monthly View</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-1">
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
              <div className="grid grid-cols-5 gap-1 md:gap-2 mb-2">
                {['MON', 'TUE', 'WED', 'THU', 'FRI'].map(day => (
                  <div
                    key={day}
                    className="text-center font-semibold p-2 bg-gray-50/80 dark:bg-gray-800/50 text-sm rounded-lg text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center ">
          <div
            className="bg-black dark:bg-black rounded-xl shadow-2xl border border-gray-700 backdrop-blur-sm transform transition-all duration-200 hover-card w-full max-w-[900px] overflow-auto p-8 max-h-[90vh]"
            style={{ maxHeight: '90vh' }}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between p-3 bg-black/90 backdrop-blur-sm border-b border-gray-700 rounded-t-xl">
              <div className="flex items-center gap-6 flex-1 min-w-0">
                {/* Logo, Title, Symbol */}
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg bg-white dark:bg-gray-900 overflow-hidden cursor-pointer border-2 border-blue-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      const stockData: Stock = {
                        cik_str: "",
                        Symbol: hoveredStockDetails.stock.Symbol,
                        title: hoveredStockDetails.stock.title
                      };
                      setSelectedStock(stockData);
                      setDialogOpen(true);
                      handleCloseHover();
                    }}
                  >
                    <img
                      src={companyLogos.get(hoveredStockDetails.stock?.Symbol?.toUpperCase()) || hoveredStockDetails.stock?.LogoURL || csvLogoUrls.get(hoveredStockDetails.stock?.Symbol?.toUpperCase()) || 'stock.avif'}
                      alt={hoveredStockDetails.stock?.Symbol}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'stock.avif';
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        const stockData: Stock = {
                          cik_str: "",
                          Symbol: hoveredStockDetails.stock.Symbol,
                          title: hoveredStockDetails.stock.title
                        };
                        setSelectedStock(stockData);
                        setDialogOpen(true);
                        handleCloseHover();
                      }}
                    >
                      <h3 className="font-bold text-white text-2xl truncate max-w-[250px]">{hoveredStockDetails.stock?.title}</h3>
                      <p className="text-base text-blue-300 font-semibold truncate max-w-[250px]">{hoveredStockDetails.stock?.Symbol}</p>
                    </div>
                  </div>
                </div>
                {/* Announcement (centered in row, after logo/title/symbol) */}
                {dividendAnnouncements[hoveredStockDetails.stock?.Symbol] && (
                  <div className="flex-1 flex justify-center">
                    <div className="p-3 border border-amber-500 rounded-lg shadow-lg overflow-hidden bg-black/80 flex flex-col items-center min-w-[250px] max-w-[400px]">
                      <div className="flex items-center gap-2 text-amber-300 text-xs font-medium text-center break-words w-full justify-center">
                        <Bell className="h-5 w-5 text-amber-400 animate-pulse" />
                        <span>{dividendAnnouncements[hoveredStockDetails.stock?.Symbol]}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseHover();
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transition-all duration-200 border border-red-400 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            </div>

            {/* Horizontal line above content */}
            <hr className="border-blue-900 mb-4 opacity-60" />
            {/* Important box (insight) restored above Tabs */}
            {hoveredStockDetails.stock?.insight && (
              <div className="p-3 border border-amber-500 rounded-xl shadow-lg mb-4 bg-[#232e47]">
                <div className="flex items-center gap-2 mb-2">
                  <FaInfoCircle className="text-amber-400 text-sm" />
                  <span className="font-bold text-amber-400 text-xs">Important</span>
                </div>
                <p className="text-xs text-amber-300 leading-relaxed">{hoveredStockDetails.stock?.insight}</p>
              </div>
            )}
            {/* Main Content Area with fixed height, no scrollable content wrapper */}
            <div>
              {/* Tabs for Dividend Info and Benchmark */}
              <Tabs defaultValue="dividend-info" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="dividend-info">Dividend Information</TabsTrigger>
                  <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
                </TabsList>
                <TabsContent value="dividend-info">
                  <div className="relative border border-blue-900 rounded-xl shadow-2xl p-6 pt-8 overflow-hidden mb-3 bg-[#1a2236]">
                    <div className="relative z-10">
                      {/* First row: Ex-Dividend, Payout, Report */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white mb-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider mb-1">Ex-Dividend Date:</span>
                          <span className="font-bold text-base text-blue-100">
                            {hoveredStockDetails.stock?.exdividenddate ? new Date(hoveredStockDetails.stock.exdividenddate).toISOString().split('T')[0] : 'N/A'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider mb-1">Payout Date:</span>
                          <span className="font-bold text-base text-blue-100">
                            {hoveredStockDetails.stock?.payoutdate ? new Date(hoveredStockDetails.stock.payoutdate).toISOString().split('T')[0] : 'N/A'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider mb-1">Report Date:</span>
                          <span className="font-bold text-base text-blue-100">
                            {hoveredStockDetails.stock?.earningsdate ? new Date(hoveredStockDetails.stock.earningsdate).toISOString().split('T')[0] : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <hr className="my-4 border-blue-800/40" />
                      {/* Second row: Quarter Dividend, Annual Dividend, Yield */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white mb-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider mb-1">Quarter Dividend:</span>
                          <span className="font-bold text-base text-emerald-300">
                            ${hoveredStockDetails.stock?.dividend || 'N/A'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider mb-1">Annual Dividend:</span>
                          <span className="font-bold text-base text-emerald-300">
                            {Number(hoveredStockDetails.stock?.dividend) && !isNaN(Number(hoveredStockDetails.stock?.dividend))
                              ? `$${(Number(hoveredStockDetails.stock.dividend) * 4).toFixed(2)}`
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider mb-1">Yield:</span>
                          <span className="font-bold text-base text-emerald-300">
                            {Number.isNaN(Number(hoveredStockDetails.stock?.dividendYield))
                              ? 'N/A'
                              : `${(Number(hoveredStockDetails.stock?.dividendYield)).toFixed(2)}%`}
                          </span>
                        </div>
                      </div>
                      <hr className="my-4 border-blue-800/40" />
                      {/* Payout Ratio and History in one row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Payout Ratio Section */}
                        <div className="p-4 border border-blue-800 rounded-xl shadow bg-[#232e47]">
                          <h4 className="text-base font-bold mb-3 flex items-center gap-2 text-blue-100 border-b border-blue-700 pb-2">
                            <FaChartLine className="text-blue-400 w-4 h-4" /> Payout Ratio
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center p-2 bg-[#1a2236] rounded shadow-sm">
                              <span className="font-semibold text-blue-200">Payout Ratio:</span>
                              <span className="font-bold text-sm text-blue-300">{hoveredStockDetails.stock?.payoutRatio}%</span>
                            </div>
                            <div className="p-2 bg-[#1a2236] rounded shadow-sm">
                              <p className="text-blue-200 leading-relaxed">
                                {hoveredStockDetails.stock?.message}
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* History Section */}
                        <div className="p-4 border border-blue-800 rounded-xl shadow bg-[#232e47]">
                          <h4 className="text-base font-bold mb-3 flex items-center gap-2 text-blue-100 border-b border-purple-700 pb-2">
                            <FaHistory className="text-purple-400 w-4 h-4" /> History
                          </h4>
                          <div className="p-2 bg-[#1a2236] rounded shadow-sm">
                            <p className="text-xs text-blue-200 leading-relaxed">
                              {hoveredStockDetails.stock?.hist}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="benchmark">
                  {hoveredStockDetails?.stock?.Symbol ? (
                    <Benchmark ticker={hoveredStockDetails.stock.Symbol} />
                  ) : (
                    <div className="border border-gray-700 rounded-xl shadow-lg p-8 flex flex-col items-center justify-center min-h-[200px] text-white">
                      <h3 className="text-xl font-bold mb-2">Benchmark Data</h3>
                      <p className="text-gray-300">No stock selected for benchmarking.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
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
                      handleStockClick(stock, e);
                      e.stopPropagation();
                    }}
                    onMouseEnter={() => {}}
                    onMouseLeave={() => {}}
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
