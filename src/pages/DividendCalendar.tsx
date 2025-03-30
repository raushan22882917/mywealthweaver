
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Expand, X, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Papa from "papaparse";

interface CompanyLogo {
  symbol: string;
  logo_url: string;
  company_name: string;
}

interface DividendReport {
  id: string;
  symbol: string;
  dividend_date: string;
  ex_dividend_date: string;
  earnings_date: string;
  earnings_high: number;
  earnings_low: number;
  earnings_average: number;
  revenue_high: number;
  revenue_low: number;
  revenue_average: number;
}

const DividendCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dividendReports, setDividendReports] = useState<DividendReport[]>([]);
  const [companyLogos, setCompanyLogos] = useState<Map<string, string>>(new Map());
  const [companyNames, setCompanyNames] = useState<Map<string, string>>(new Map());
  const [selectedReport, setSelectedReport] = useState<DividendReport | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Month and Year options for selectors
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
    { value: 11, label: "December" }
  ];
  
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: 5 },
    (_, index) => currentYear - 2 + index
  );
  
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth.getMonth());

  // Fetch dividend reports and company logos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [dividendsResponse, logosResponse] = await Promise.all([
          supabase.from("dividend_reports").select("*"),
          supabase.from("company_logos").select("*")
        ]);
        
        if (dividendsResponse.error) throw dividendsResponse.error;
        if (logosResponse.error) throw logosResponse.error;
        
        setDividendReports(dividendsResponse.data);
        
        // Create maps for logos and company names
        const logoMap = new Map();
        const nameMap = new Map();
        
        logosResponse.data.forEach((logo: CompanyLogo) => {
          logoMap.set(logo.symbol, logo.logo_url);
          nameMap.set(logo.symbol, logo.company_name || logo.symbol);
        });
        
        setCompanyLogos(logoMap);
        setCompanyNames(nameMap);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Update current month when selection changes
  useEffect(() => {
    setCurrentMonth(new Date(selectedYear, selectedMonth));
  }, [selectedYear, selectedMonth]);
  
  // Calendar helper functions
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  
  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Adjust for Monday start (0 = Monday, 6 = Sunday)
  };
  
  const formatMonth = (date: Date) => date.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 2,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(amount);
  };
  
  // Handle company click to show details popup
  const handleCompanyClick = (report: DividendReport) => {
    setSelectedReport(report);
    setShowPopup(true);
  };
  
  // Render calendar day cell with companies that have dividend on that day
  const renderCalendarCell = (date: Date) => {
    const dateString = formatDate(date);
    
    // Find companies with dividend on this date
    const companiesOnDate = dividendReports.filter(
      report => report.dividend_date === dateString
    );
    
    const isToday = new Date().toDateString() === date.toDateString();
    
    return (
      <div
        key={dateString}
        className={`min-h-[120px] p-2 border rounded-lg ${
          isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-gray-800'
        }`}
      >
        <div className="text-right mb-1">
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            isToday ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {date.getDate()}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {companiesOnDate.map(report => (
            <div 
              key={report.id}
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleCompanyClick(report)}
            >
              <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center p-1 border border-gray-200 dark:border-gray-600 overflow-hidden">
                {companyLogos.get(report.symbol) ? (
                  <img 
                    src={companyLogos.get(report.symbol)} 
                    alt={report.symbol}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/stock.avif';
                    }}
                  />
                ) : (
                  <div className="text-xs font-bold text-center">{report.symbol}</div>
                )}
              </div>
              <div className="text-xs text-center mt-1 font-medium">{report.symbol}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render calendar grid
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days.map((day, index) => {
      if (day === null) {
        return <div key={`empty-${index}`} className="bg-gray-50 dark:bg-gray-900/20 border rounded-lg" />;
      }
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      return renderCalendarCell(date);
    });
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Dividend Calendar</h1>
          <p className="text-muted-foreground">
            View upcoming dividend payments by date
          </p>
        </div>
        
        <Card className="p-6 shadow-lg mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-semibold">{formatMonth(currentMonth)}</h2>
            
            <div className="flex gap-4 items-center">
              <Select 
                value={selectedMonth.toString()} 
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={selectedYear.toString()} 
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const previousMonth = new Date(currentMonth);
                    previousMonth.setMonth(previousMonth.getMonth() - 1);
                    setSelectedMonth(previousMonth.getMonth());
                    setSelectedYear(previousMonth.getFullYear());
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const nextMonth = new Date(currentMonth);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    setSelectedMonth(nextMonth.getMonth());
                    setSelectedYear(nextMonth.getFullYear());
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <>
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-4 mb-4">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                  <div key={day} className="text-center font-semibold p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">{day}</div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-4">
                {renderCalendar()}
              </div>
            </>
          )}
        </Card>
      </main>
      
      {/* Company Details Popup */}
      {showPopup && selectedReport && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowPopup(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center p-2 border border-gray-200 dark:border-gray-600">
                  <img 
                    src={companyLogos.get(selectedReport.symbol) || '/stock.avif'} 
                    alt={selectedReport.symbol}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/stock.avif';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedReport.symbol}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{companyNames.get(selectedReport.symbol) || selectedReport.symbol}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold border-b pb-2">Dividend Information</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Dividend Date:</span>
                    <span className="font-medium">{selectedReport.dividend_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Ex-Dividend Date:</span>
                    <span className="font-medium">{selectedReport.ex_dividend_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Earnings Date:</span>
                    <span className="font-medium">{selectedReport.earnings_date}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-semibold border-b pb-2">Earnings Information</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Earnings (High):</span>
                    <span className="font-medium">${selectedReport.earnings_high.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Earnings (Low):</span>
                    <span className="font-medium">${selectedReport.earnings_low.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Earnings (Average):</span>
                    <span className="font-medium">${selectedReport.earnings_average.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 md:col-span-2">
                <h4 className="text-lg font-semibold border-b pb-2">Revenue Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Revenue (High)</div>
                    <div className="text-xl font-bold">{formatCurrency(selectedReport.revenue_high)}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Revenue (Low)</div>
                    <div className="text-xl font-bold">{formatCurrency(selectedReport.revenue_low)}</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                    <div className="text-sm text-blue-500 dark:text-blue-400">Revenue (Average)</div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-300">{formatCurrency(selectedReport.revenue_average)}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <Button onClick={() => setShowPopup(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default DividendCalendar;
