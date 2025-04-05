import React, { useState } from 'react';
import { DateRange as ReactDayPickerDateRange } from 'react-day-picker';
import { DateRange } from '@/utils/types';
import { useNavigate } from 'react-router-dom';
import { Calendar, CalendarIcon, ChevronLeft, ChevronRight, Download, FileText, Filter, LineChart, PieChart, Share2, Sliders } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart as ReLineChart, Line } from 'recharts';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DateRangePicker from '@/components/DateRangePicker';

const Reporting = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    to: new Date()
  });
  const [chartType, setChartType] = useState('bar');
  const [reportType, setReportType] = useState('dividend-income');

  const handleDateChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  const handleDateRangeChange = (range: ReactDayPickerDateRange | undefined) => {
    if (range?.from) {
      // Convert from react-day-picker DateRange to our DateRange
      const newRange: DateRange = {
        from: range.from,
        to: range.to || range.from
      };
      setDateRange(newRange);
    }
  };

  // Sample data for charts
  const dividendData = [
    { month: 'Jan', amount: 120.45 },
    { month: 'Feb', amount: 135.22 },
    { month: 'Mar', amount: 142.87 },
    { month: 'Apr', amount: 150.32 },
    { month: 'May', amount: 165.78 },
    { month: 'Jun', amount: 170.45 },
    { month: 'Jul', amount: 180.23 },
    { month: 'Aug', amount: 190.56 },
    { month: 'Sep', amount: 195.67 },
    { month: 'Oct', amount: 210.34 },
    { month: 'Nov', amount: 220.45 },
    { month: 'Dec', amount: 235.78 },
  ];

  const sectorData = [
    { name: 'Technology', value: 35 },
    { name: 'Healthcare', value: 20 },
    { name: 'Financials', value: 15 },
    { name: 'Consumer Staples', value: 10 },
    { name: 'Energy', value: 10 },
    { name: 'Others', value: 10 },
  ];

  const growthData = [
    { year: '2018', growth: 5.2 },
    { year: '2019', growth: 6.8 },
    { year: '2020', growth: 3.5 },
    { year: '2021', growth: 8.2 },
    { year: '2022', growth: 7.5 },
    { year: '2023', growth: 9.3 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dividendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: '#9CA3AF' }} />
              <YAxis tick={{ fill: '#9CA3AF' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#F9FAFB' }}
                itemStyle={{ color: '#F9FAFB' }}
              />
              <Legend wrapperStyle={{ color: '#9CA3AF' }} />
              <Bar dataKey="amount" name="Dividend Amount ($)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RePieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#F9FAFB' }}
              />
              <Legend wrapperStyle={{ color: '#9CA3AF' }} />
            </RePieChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ReLineChart data={growthData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" tick={{ fill: '#9CA3AF' }} />
              <YAxis tick={{ fill: '#9CA3AF' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#F9FAFB' }}
                itemStyle={{ color: '#F9FAFB' }}
              />
              <Legend wrapperStyle={{ color: '#9CA3AF' }} />
              <Line type="monotone" dataKey="growth" name="Growth Rate (%)" stroke="#10B981" strokeWidth={2} dot={{ r: 5 }} />
            </ReLineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const renderReportTitle = () => {
    switch (reportType) {
      case 'dividend-income':
        return 'Dividend Income Report';
      case 'portfolio-allocation':
        return 'Portfolio Allocation Report';
      case 'growth-analysis':
        return 'Dividend Growth Analysis';
      default:
        return 'Dividend Report';
    }
  };

  const renderReportDescription = () => {
    switch (reportType) {
      case 'dividend-income':
        return 'Monthly dividend income breakdown showing payment trends over time.';
      case 'portfolio-allocation':
        return 'Sector-based allocation of your dividend portfolio.';
      case 'growth-analysis':
        return 'Year-over-year dividend growth rate analysis.';
      default:
        return 'Comprehensive dividend analysis and reporting.';
    }
  };

  const renderReportData = () => {
    switch (reportType) {
      case 'dividend-income':
        return dividendData;
      case 'portfolio-allocation':
        return sectorData;
      case 'growth-analysis':
        return growthData;
      default:
        return dividendData;
    }
  };

  const getAppropriateChartType = () => {
    switch (reportType) {
      case 'dividend-income':
        return 'bar';
      case 'portfolio-allocation':
        return 'pie';
      case 'growth-analysis':
        return 'line';
      default:
        return 'bar';
    }
  };

  // Update chart type when report type changes
  React.useEffect(() => {
    setChartType(getAppropriateChartType());
  }, [reportType]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dividend Reporting
            </h1>
            <p className="text-gray-400 mt-2">
              Generate comprehensive reports and visualizations for your dividend portfolio
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate(-1)} className="border-gray-700 text-gray-300 hover:text-white">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                <DropdownMenuItem className="text-gray-200 hover:bg-gray-700 cursor-pointer">
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-200 hover:bg-gray-700 cursor-pointer">
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-200 hover:bg-gray-700 cursor-pointer">
                  Export as Image
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  Report Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="dividend-income" className="text-gray-200 hover:bg-gray-700">
                      Dividend Income
                    </SelectItem>
                    <SelectItem value="portfolio-allocation" className="text-gray-200 hover:bg-gray-700">
                      Portfolio Allocation
                    </SelectItem>
                    <SelectItem value="growth-analysis" className="text-gray-200 hover:bg-gray-700">
                      Growth Analysis
                    </SelectItem>
                    <SelectItem value="tax-report" className="text-gray-200 hover:bg-gray-700">
                      Tax Report
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Date Range</p>
                  <DateRangePicker
                    value={dateRange}
                    onChange={handleDateChange}
                  />
                </div>
                
                <Separator className="my-4 bg-gray-800" />
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Chart Type</p>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant={chartType === 'bar' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setChartType('bar')}
                        className={chartType !== 'bar' ? 'border-gray-700 text-gray-300' : ''}
                      >
                        <BarChart className="h-4 w-4 mr-1" />
                        Bar
                      </Button>
                      <Button 
                        variant={chartType === 'line' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setChartType('line')}
                        className={chartType !== 'line' ? 'border-gray-700 text-gray-300' : ''}
                      >
                        <LineChart className="h-4 w-4 mr-1" />
                        Line
                      </Button>
                      <Button 
                        variant={chartType === 'pie' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setChartType('pie')}
                        className={chartType !== 'pie' ? 'border-gray-700 text-gray-300' : ''}
                      >
                        <PieChart className="h-4 w-4 mr-1" />
                        Pie
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Additional Options</p>
                    <Button variant="outline" size="sm" className="w-full justify-start border-gray-700 text-gray-300">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-purple-400" />
                  Report Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Currency</p>
                  <Select defaultValue="usd">
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="usd" className="text-gray-200 hover:bg-gray-700">USD ($)</SelectItem>
                      <SelectItem value="eur" className="text-gray-200 hover:bg-gray-700">EUR (€)</SelectItem>
                      <SelectItem value="gbp" className="text-gray-200 hover:bg-gray-700">GBP (£)</SelectItem>
                      <SelectItem value="cad" className="text-gray-200 hover:bg-gray-700">CAD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-2">Data Grouping</p>
                  <Select defaultValue="monthly">
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                      <SelectValue placeholder="Select grouping" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="daily" className="text-gray-200 hover:bg-gray-700">Daily</SelectItem>
                      <SelectItem value="weekly" className="text-gray-200 hover:bg-gray-700">Weekly</SelectItem>
                      <SelectItem value="monthly" className="text-gray-200 hover:bg-gray-700">Monthly</SelectItem>
                      <SelectItem value="quarterly" className="text-gray-200 hover:bg-gray-700">Quarterly</SelectItem>
                      <SelectItem value="yearly" className="text-gray-200 hover:bg-gray-700">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-2">Include Taxes</p>
                  <Select defaultValue="after-tax">
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                      <SelectValue placeholder="Tax settings" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="pre-tax" className="text-gray-200 hover:bg-gray-700">Pre-tax</SelectItem>
                      <SelectItem value="after-tax" className="text-gray-200 hover:bg-gray-700">After-tax</SelectItem>
                      <SelectItem value="both" className="text-gray-200 hover:bg-gray-700">Show both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">{renderReportTitle()}</CardTitle>
                    <CardDescription className="text-gray-400 mt-1">
                      {renderReportDescription()}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-500/30">
                      <Calendar className="mr-1 h-3 w-3" />
                      {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderChart()}
              </CardContent>
              <CardFooter className="border-t border-gray-800 pt-4 flex justify-between items-center">
                <p className="text-sm text-gray-400">
                  Data updated as of {new Date().toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Report Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        {reportType === 'dividend-income' && (
                          <>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Month</th>
                            <th className="text-right py-3 px-4 text-gray-400 font-medium">Amount ($)</th>
                          </>
                        )}
                        {reportType === 'portfolio-allocation' && (
                          <>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Sector</th>
                            <th className="text-right py-3 px-4 text-gray-400 font-medium">Allocation (%)</th>
                          </>
                        )}
                        {reportType === 'growth-analysis' && (
                          <>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Year</th>
                            <th className="text-right py-3 px-4 text-gray-400 font-medium">Growth Rate (%)</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {reportType === 'dividend-income' && dividendData.map((item, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-3 px-4">{item.month}</td>
                          <td className="py-3 px-4 text-right font-medium text-green-400">${item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                      {reportType === 'portfolio-allocation' && sectorData.map((item, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-3 px-4">{item.name}</td>
                          <td className="py-3 px-4 text-right font-medium text-blue-400">{item.value}%</td>
                        </tr>
                      ))}
                      {reportType === 'growth-analysis' && growthData.map((item, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-3 px-4">{item.year}</td>
                          <td className="py-3 px-4 text-right font-medium text-purple-400">{item.growth}%</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      {reportType === 'dividend-income' && (
                        <tr>
                          <td className="py-3 px-4 font-bold">Total</td>
                          <td className="py-3 px-4 text-right font-bold text-green-400">
                            ${dividendData.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                          </td>
                        </tr>
                      )}
                      {reportType === 'portfolio-allocation' && (
                        <tr>
                          <td className="py-3 px-4 font-bold">Total</td>
                          <td className="py-3 px-4 text-right font-bold text-blue-400">100%</td>
                        </tr>
                      )}
                      {reportType === 'growth-analysis' && (
                        <tr>
                          <td className="py-3 px-4 font-bold">Average</td>
                          <td className="py-3 px-4 text-right font-bold text-purple-400">
                            {(growthData.reduce((sum, item) => sum + item.growth, 0) / growthData.length).toFixed(2)}%
                          </td>
                        </tr>
                      )}
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Report Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {reportType === 'dividend-income' && (
                    <>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Total Income</p>
                        <p className="text-2xl font-bold text-green-400">
                          ${dividendData.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Monthly Average</p>
                        <p className="text-2xl font-bold text-blue-400">
                          ${(dividendData.reduce((sum, item) => sum + item.amount, 0) / dividendData.length).toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Highest Month</p>
                        <p className="text-2xl font-bold text-purple-400">
                          ${Math.max(...dividendData.map(item => item.amount)).toFixed(2)}
                        </p>
                      </div>
                    </>
                  )}
                  
                  {reportType === 'portfolio-allocation' && (
                    <>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Top Sector</p>
                        <p className="text-2xl font-bold text-green-400">
                          {sectorData.sort((a, b) => b.value - a.value)[0].name}
                        </p>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Sectors Count</p>
                        <p className="text-2xl font-bold text-blue-400">
                          {sectorData.length}
                        </p>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Diversification Score</p>
                        <p className="text-2xl font-bold text-purple-400">
                          7.5/10
                        </p>
                      </div>
                    </>
                  )}
                  
                  {reportType === 'growth-analysis' && (
                    <>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Average Growth</p>
                        <p className="text-2xl font-bold text-green-400">
                          {(growthData.reduce((sum, item) => sum + item.growth, 0) / growthData.length).toFixed(2)}%
                        </p>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Highest Growth</p>
                        <p className="text-2xl font-bold text-blue-400">
                          {Math.max(...growthData.map(item => item.growth)).toFixed(2)}%
                        </p>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">CAGR</p>
                        <p className="text-2xl font-bold text-purple-400">
                          6.8%
                        </p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-300 mb-2">Analysis Insights</h3>
                  {reportType === 'dividend-income' && (
                    <p className="text-gray-300">
                      Your dividend income shows a consistent upward trend throughout the year, with the highest payments received in December. 
                      The fourth quarter (Oct-Dec) accounts for 32% of your annual dividend income, suggesting a concentration of dividend payers 
                      that distribute in this period.
                    </p>
                  )}
                  {reportType === 'portfolio-allocation' && (
                    <p className="text-gray-300">
                      Your portfolio has a significant allocation to Technology (35%), which may provide growth but could increase volatility. 
                      Consider increasing exposure to defensive sectors like Consumer Staples for better balance. Your current diversification 
                      score of 7.5/10 indicates a reasonably diversified portfolio.
                    </p>
                  )}
                  {reportType === 'growth-analysis' && (
                    <p className="text-gray-300">
                      Your dividend growth has been strong with a 6.8% CAGR over the past 5 years, outpacing inflation. 
                      The growth rate accelerated in 2021-2023, indicating recovery and expansion after the pandemic-related 
                      dividend cuts in 2020. This trend suggests companies in your portfolio have healthy financials.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Reporting;
