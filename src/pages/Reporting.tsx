
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { Search, BarChart3, DollarSign, Calendar, ArrowUpDown, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DividendCalendar from "@/components/DividendCalendar";

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

const Reporting: React.FC = () => {
  const [reports, setReports] = useState<DividendReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<DividendReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof DividendReport>("symbol");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchDividendReports();
  }, []);

  useEffect(() => {
    // Filter and sort reports whenever dependencies change
    const filtered = reports.filter(report =>
      report.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        // Handle dates as strings (convert to Date objects for comparison)
        const aDate = aValue ? new Date(aValue as string).getTime() : 0;
        const bDate = bValue ? new Date(bValue as string).getTime() : 0;
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
      }
    });

    setFilteredReports(sorted);
  }, [reports, searchTerm, sortField, sortDirection]);

  const fetchDividendReports = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("dividend_reports")
        .select("*");

      if (error) {
        throw error;
      }

      setReports(data);
      setFilteredReports(data);
    } catch (err: any) {
      console.error("Error fetching dividend reports:", err);
      setError(err.message || "Failed to load dividend reports");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof DividendReport) => {
    setSortDirection(current => 
      sortField === field && current === 'asc' ? 'desc' : 'asc'
    );
    setSortField(field);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (err) {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (!num) return "N/A";
    return num.toFixed(2);
  };

  // Prepare data for charts
  const earningsChartData = reports.slice(0, 10).map(report => ({
    symbol: report.symbol,
    "Highest Estimate": report.earnings_high,
    "Average": report.earnings_average,
    "Lowest Estimate": report.earnings_low,
  }));

  const revenueChartData = reports.slice(0, 10).map(report => ({
    symbol: report.symbol,
    "Highest Estimate": report.revenue_high / 1000000000,
    "Average": report.revenue_average / 1000000000,
    "Lowest Estimate": report.revenue_low / 1000000000,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Dividend Reporting Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis and visualization of dividend data
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Calendar (75%) */}
          <div className="lg:w-3/4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Dividend Calendar</CardTitle>
                <CardDescription>View upcoming dividend events with company logos</CardDescription>
              </CardHeader>
              <CardContent>
                <DividendCalendar />
              </CardContent>
            </Card>
          </div>

          {/* Right side - Analysis (25%) */}
          <div className="lg:w-1/4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="search">Search</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                {/* Dashboard Metrics */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Upcoming Dividends</CardTitle>
                    <CardDescription>Next 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        <span className="text-2xl font-bold">
                          {reports.filter(r => {
                            const divDate = r.dividend_date ? new Date(r.dividend_date) : null;
                            const today = new Date();
                            const thirtyDaysLater = new Date();
                            thirtyDaysLater.setDate(today.getDate() + 30);
                            return divDate && divDate > today && divDate < thirtyDaysLater;
                          }).length}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">Companies</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Average EPS</CardTitle>
                    <CardDescription>Across portfolio</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        <span className="text-2xl font-bold">
                          {reports.length > 0 
                            ? formatNumber(reports.reduce((sum, r) => sum + r.earnings_average, 0) / reports.length)
                            : "N/A"}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">Per share</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Total Revenue</CardTitle>
                    <CardDescription>All companies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-500" />
                        <span className="text-xl font-bold">
                          {reports.length > 0 
                            ? formatCurrency(reports.reduce((sum, r) => sum + r.revenue_average, 0))
                            : "N/A"}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">Combined</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="stats" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Earnings Distribution</CardTitle>
                    <CardDescription>Top 5 companies by EPS</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={earningsChartData.slice(0, 5)}>
                        <XAxis dataKey="symbol" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`$${value}`, 'EPS']}
                          labelFormatter={(label) => `Symbol: ${label}`}
                        />
                        <Bar dataKey="Average" fill="#0ea5e9" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Summary</CardTitle>
                    <CardDescription>Billion USD</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueChartData.slice(0, 5)}>
                        <XAxis dataKey="symbol" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`$${value}B`, 'Revenue']}
                          labelFormatter={(label) => `Symbol: ${label}`}
                        />
                        <Bar dataKey="Average" fill="#14b8a6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="search" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Find Report</CardTitle>
                    <CardDescription>Search for a specific company</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search by symbol..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="mt-4 max-h-[400px] overflow-y-auto">
                      {filteredReports.length === 0 ? (
                        <p className="text-center py-4 text-muted-foreground">No matching companies found</p>
                      ) : (
                        filteredReports.slice(0, 10).map(report => (
                          <div key={report.id} className="flex items-center py-2 border-b">
                            <div className="font-medium">{report.symbol}</div>
                            <div className="ml-auto text-sm text-muted-foreground">
                              {formatDate(report.dividend_date)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Report Table - Full width below the split layout */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Dividend & Earnings Reports</CardTitle>
            <CardDescription>
              {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
            </CardDescription>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by symbol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select
                value={sortField as string}
                onValueChange={(value) => setSortField(value as keyof DividendReport)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="symbol">Symbol</SelectItem>
                  <SelectItem value="dividend_date">Dividend Date</SelectItem>
                  <SelectItem value="ex_dividend_date">Ex-Dividend Date</SelectItem>
                  <SelectItem value="earnings_date">Earnings Date</SelectItem>
                  <SelectItem value="earnings_average">Earnings Average</SelectItem>
                  <SelectItem value="revenue_average">Revenue Average</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={() => setSortDirection(current => current === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('symbol')}
                      >
                        <div className="flex items-center gap-1">
                          Symbol
                          {sortField === 'symbol' && (
                            <ArrowUpDown size={16} className="text-muted-foreground" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('ex_dividend_date')}
                      >
                        <div className="flex items-center gap-1">
                          Ex-Dividend Date
                          {sortField === 'ex_dividend_date' && (
                            <ArrowUpDown size={16} className="text-muted-foreground" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('dividend_date')}
                      >
                        <div className="flex items-center gap-1">
                          Dividend Date
                          {sortField === 'dividend_date' && (
                            <ArrowUpDown size={16} className="text-muted-foreground" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('earnings_date')}
                      >
                        <div className="flex items-center gap-1">
                          Earnings Date
                          {sortField === 'earnings_date' && (
                            <ArrowUpDown size={16} className="text-muted-foreground" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-right"
                        onClick={() => handleSort('earnings_average')}
                      >
                        <div className="flex items-center gap-1 justify-end">
                          Earnings (EPS)
                          {sortField === 'earnings_average' && (
                            <ArrowUpDown size={16} className="text-muted-foreground" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-right"
                        onClick={() => handleSort('revenue_average')}
                      >
                        <div className="flex items-center gap-1 justify-end">
                          Revenue
                          {sortField === 'revenue_average' && (
                            <ArrowUpDown size={16} className="text-muted-foreground" />
                          )}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No reports found matching your search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReports.map((report) => (
                        <TableRow key={report.id} className="hover:bg-muted/40">
                          <TableCell className="font-medium">{report.symbol}</TableCell>
                          <TableCell>{formatDate(report.ex_dividend_date)}</TableCell>
                          <TableCell>{formatDate(report.dividend_date)}</TableCell>
                          <TableCell>{formatDate(report.earnings_date)}</TableCell>
                          <TableCell className="text-right">
                            ${formatNumber(report.earnings_average)}
                            <div className="text-xs text-muted-foreground">
                              Range: ${formatNumber(report.earnings_low)} - ${formatNumber(report.earnings_high)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(report.revenue_average)}
                            <div className="text-xs text-muted-foreground">
                              Range: {formatCurrency(report.revenue_low)} - {formatCurrency(report.revenue_high)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Reporting;
