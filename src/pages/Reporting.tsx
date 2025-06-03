
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  BarChart3, 
  DollarSign, 
  Calendar, 
  ArrowUpDown, 
  Filter, 
  ChevronDown, 
  AlertTriangle,
  ChevronUp, 
  LineChart as LineChartIcon,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  PieChart
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import DividendCalendar from "@/components/DividendCalendar";
import DashboardDialog from "@/components/DashboardDialog";
import AnalyticsDialog from "@/components/AnalyticsDialog";
import { useIsMobile } from "@/hooks/use-mobile";

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
  price_history?: {
    date: string;
    price: number;
  }[];
  current_price?: number;
  price_status?: 'high' | 'low' | 'medium';
}

const Reporting: React.FC = () => {
  const [reports, setReports] = useState<DividendReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchDividendReports();
  }, []);

  const fetchDividendReports = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration since we don't have the actual table
      const mockData = Array.from({ length: 50 }, (_, i) => ({
        id: `report-${i}`,
        symbol: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'PYPL', 'ADBE'][i % 10],
        dividend_date: new Date(Date.now() + (i * 7 * 24 * 60 * 60 * 1000)).toISOString(),
        ex_dividend_date: new Date(Date.now() + ((i * 7 - 2) * 24 * 60 * 60 * 1000)).toISOString(),
        earnings_date: new Date(Date.now() + ((i * 14) * 24 * 60 * 60 * 1000)).toISOString(),
        earnings_high: 2.5 + (Math.random() * 5),
        earnings_low: 1.8 + (Math.random() * 2),
        earnings_average: 2.1 + (Math.random() * 3),
        revenue_high: 50000000000 + (Math.random() * 100000000000),
        revenue_low: 30000000000 + (Math.random() * 50000000000),
        revenue_average: 40000000000 + (Math.random() * 70000000000),
        current_price: Math.random() * 200 + 50,
        price_status: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        price_history: Array.from({ length: 30 }, (_, j) => ({
          date: format(new Date(Date.now() - (29 - j) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          price: Math.random() * 50 + 100 + (j * 0.5) + (Math.random() * 10 - 5)
        }))
      }));

      setReports(mockData);
    } catch (err: any) {
      console.error("Error fetching dividend reports:", err);
      setError(err.message || "Failed to load dividend reports");
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const totalCompanies = reports.length;
    const avgEarnings = reports.reduce((sum, r) => sum + r.earnings_average, 0) / totalCompanies;
    const totalRevenue = reports.reduce((sum, r) => sum + r.revenue_average, 0);
    const upcomingDividends = reports.filter(r => {
      const divDate = r.dividend_date ? new Date(r.dividend_date) : null;
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);
      return divDate && divDate > today && divDate < thirtyDaysLater;
    }).length;

    return { totalCompanies, avgEarnings, totalRevenue, upcomingDividends };
  };

  const metrics = calculateMetrics();

  // Prepare data for charts
  const earningsChartData = reports.slice(0, 10).map(report => ({
    symbol: report.symbol,
    "High": report.earnings_high,
    "Average": report.earnings_average,
    "Low": report.earnings_low,
  }));

  const revenueChartData = reports.slice(0, 10).map(report => ({
    symbol: report.symbol,
    "High": report.revenue_high / 1000000000,
    "Average": report.revenue_average / 1000000000,
    "Low": report.revenue_low / 1000000000,
  }));

  const priceDistributionData = [
    { name: 'High Price', value: reports.filter(r => r.price_status === 'high').length, color: '#ef4444' },
    { name: 'Medium Price', value: reports.filter(r => r.price_status === 'medium').length, color: '#f59e0b' },
    { name: 'Low Price', value: reports.filter(r => r.price_status === 'low').length, color: '#10b981' },
  ];

  const trendAnalysisData = reports.slice(0, 7).map((report, index) => ({
    date: format(new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000), 'MMM dd'),
    earnings: report.earnings_average,
    revenue: report.revenue_average / 1000000000,
    price: report.current_price
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-4 sm:py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 sm:p-3 rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 className={`font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
                Investment Analytics Dashboard
              </h1>
              <p className={`text-gray-400 mt-1 sm:mt-2 ${isMobile ? 'text-base' : 'text-lg'}`}>Comprehensive market analysis and reporting</p>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className={`grid gap-4 sm:gap-6 mb-6 sm:mb-8 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'}`}>
          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/20 hover:border-blue-400/40 transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-blue-300 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Total Companies</p>
                  <p className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-3xl'}`}>{metrics.totalCompanies}</p>
                </div>
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/20 hover:border-green-400/40 transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-green-300 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Avg EPS</p>
                  <p className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-3xl'}`}>${metrics.avgEarnings.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/20 hover:border-purple-400/40 transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-purple-300 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Total Revenue</p>
                  <p className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-3xl'}`}>
                    {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: 'USD',
                      notation: 'compact',
                      maximumFractionDigits: 1
                    }).format(metrics.totalRevenue)}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-500/20 hover:border-orange-400/40 transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-orange-300 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Upcoming Dividends</p>
                  <p className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-3xl'}`}>{metrics.upcomingDividends}</p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar with Header Actions */}
        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <div className={`flex items-center ${isMobile ? 'flex-col space-y-3' : 'justify-between'}`}>
              <div>
                <CardTitle className={`text-white flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                  Dividend Calendar
                </CardTitle>
                <CardDescription className={isMobile ? 'text-sm' : ''}>Upcoming dividend and earnings dates</CardDescription>
              </div>
              <div className={`flex gap-2 sm:gap-3 ${isMobile ? 'w-full' : ''}`}>
                <Button
                  onClick={() => setDashboardOpen(true)}
                  className={`bg-blue-600 hover:bg-blue-700 text-white ${isMobile ? 'flex-1 text-xs' : ''}`}
                >
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Dashboard
                </Button>
                <Button
                  onClick={() => setAnalyticsOpen(true)}
                  className={`bg-green-600 hover:bg-green-700 text-white ${isMobile ? 'flex-1 text-xs' : ''}`}
                >
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Analytics
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DividendCalendar />
          </CardContent>
        </Card>

        {/* Dashboard Dialog */}
        <DashboardDialog
          open={dashboardOpen}
          onOpenChange={setDashboardOpen}
          reports={reports}
          metrics={metrics}
          trendAnalysisData={trendAnalysisData}
          earningsChartData={earningsChartData}
          priceDistributionData={priceDistributionData}
        />

        {/* Analytics Dialog */}
        <AnalyticsDialog
          open={analyticsOpen}
          onOpenChange={setAnalyticsOpen}
          revenueChartData={revenueChartData}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Reporting;
