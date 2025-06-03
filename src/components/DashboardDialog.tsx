
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, DollarSign, Target, PieChart } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

interface DashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reports: any[];
  metrics: any;
  trendAnalysisData: any[];
  earningsChartData: any[];
  priceDistributionData: any[];
}

const DashboardDialog: React.FC<DashboardDialogProps> = ({
  open,
  onOpenChange,
  reports,
  metrics,
  trendAnalysisData,
  earningsChartData,
  priceDistributionData
}) => {
  const formatNumber = (num: number) => {
    if (!num) return "N/A";
    return num.toFixed(2);
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

  const getPriceStatusIndicator = (status?: 'high' | 'low' | 'medium') => {
    return (
      <div className="inline-flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          status === 'high' ? 'bg-red-400' : 
          status === 'low' ? 'bg-green-400' : 
          'bg-yellow-400'
        }`}></div>
        <span className={`${
          status === 'high' ? 'text-red-400' : 
          status === 'low' ? 'text-green-400' : 
          'text-yellow-400'
        }`}>
          {status === 'high' ? 'Overvalued' : 
           status === 'low' ? 'Undervalued' : 
           'Fair Value'}
        </span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-400" />
            Dashboard Overview
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Left Section - Main Charts (8 columns) */}
          <div className="col-span-8 space-y-6">
            {/* Trend Analysis */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                  Market Trend Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendAnalysisData}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{fill: '#9ca3af'}} />
                    <YAxis tick={{fill: '#9ca3af'}} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#e5e7eb' }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorEarnings)"
                      name="Earnings"
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenue (B)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Earnings Comparison */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Earnings Comparison</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={earningsChartData}>
                    <XAxis dataKey="symbol" tick={{fill: '#9ca3af'}} />
                    <YAxis tick={{fill: '#9ca3af'}} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#e5e7eb' }}
                    />
                    <Legend />
                    <Bar dataKey="High" fill="#ef4444" name="High Estimate" />
                    <Bar dataKey="Average" fill="#3b82f6" name="Average" />
                    <Bar dataKey="Low" fill="#10b981" name="Low Estimate" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Analysis (4 columns) */}
          <div className="col-span-4 space-y-6">
            {/* Price Distribution */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-400" />
                  Price Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      dataKey="value"
                      data={priceDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {priceDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#e5e7eb' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Market Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Highest EPS</span>
                  <span className="text-green-400 font-semibold">
                    ${Math.max(...reports.map(r => r.earnings_high)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Lowest EPS</span>
                  <span className="text-red-400 font-semibold">
                    ${Math.min(...reports.map(r => r.earnings_low)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Avg Revenue</span>
                  <span className="text-blue-400 font-semibold">
                    {formatCurrency(reports.reduce((sum, r) => sum + r.revenue_average, 0) / reports.length)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Top Performers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reports.slice(0, 5).map((report, index) => (
                  <div key={report.id} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{report.symbol}</span>
                      {getPriceStatusIndicator(report.price_status)}
                    </div>
                    <span className="text-sm text-gray-400">
                      ${formatNumber(report.earnings_average)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardDialog;
