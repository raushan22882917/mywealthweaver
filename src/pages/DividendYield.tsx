import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "@/components/ui/loader";
import { InsightCard } from "@/pages/insight";

interface YieldData {
  id: string;
  date: string;
  close: number;
  dividends: number;
  yield: number;
  symbol: string;
}

interface ChartData {
  date: string;
  displayDate: string;
  yield: number;
  dividends: number;
}

interface DividendYieldProps {
  symbol?: string;
}

const timeRangeOptions = [
  { value: '3M', label: '3M', months: 3 },
  { value: '1Y', label: '1Y', months: 12 },
  { value: '3Y', label: '3Y', months: 36 },
  { value: '5Y', label: '5Y', months: 60 },
];

const CURRENT_DATE = new Date('2025-04-09');

const filterChartData = (data: YieldData[], range: string): YieldData[] => {
  const endDate = new Date();
  let startDate = new Date();

  switch (range) {
    case '3M':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case '1Y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case '3Y':
      startDate.setFullYear(endDate.getFullYear() - 3);
      break;
    case '5Y':
      startDate.setFullYear(endDate.getFullYear() - 5);
      break;
    default:
      return data;
  }

  const filteredData = data.filter(item => {
    const date = new Date(item.date);
    return date >= startDate && date <= endDate;
  });

  // Format display dates based on range
  return filteredData.map(item => {
    const date = new Date(item.date);
    let displayDate = '';

    switch (range) {
      case '3M':
        // For 3M, show month-year only on first day of month
        if (date.getDate() === 1 || 
            date.getTime() === Math.min(...filteredData.map(d => new Date(d.date).getTime()))) {
          displayDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
        break;
      case '1Y':
        // For 1Y, show month-year only on first day of month
        if (date.getDate() === 1 || 
            date.getTime() === Math.min(...filteredData.map(d => new Date(d.date).getTime()))) {
          displayDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
        break;
      case '3Y':
      case '5Y':
        const currentYear = date.getFullYear();
        const startYear = range === '3Y' ? 2022 : 2020;
        const endYear = 2025;
        
        // Create array of years we want to show
        const yearsToShow = Array.from(
          { length: endYear - startYear + 1 }, 
          (_, i) => startYear + i
        );
        
        // Show year if it's the first data point of that year
        const isFirstDataPointOfYear = (year: number) => {
          const yearData = filteredData.filter(d => 
            new Date(d.date).getFullYear() === year
          );
          if (yearData.length === 0) return false;
          
          const firstDateOfYear = Math.min(...yearData.map(d => new Date(d.date).getTime()));
          return date.getTime() === firstDateOfYear;
        };

        // Show year labels on first data point of each year
        if (yearsToShow.includes(currentYear) && isFirstDataPointOfYear(currentYear)) {
          displayDate = currentYear.toString();
        }
        break;
    }

    return {
      ...item,
      displayDate
    };
  });
};

const formatChartData = (data: YieldData[]): ChartData[] => {
  return data.map(item => {
    return {
      date: item.date,
      displayDate: item.displayDate,
      yield: parseFloat((item.yield || 0).toFixed(2)),
      dividends: parseFloat((item.dividends || 0).toFixed(2))
    };
  });
};

const DividendYield: React.FC<DividendYieldProps> = ({ symbol: propSymbol }) => {
  const { symbol: urlSymbol } = useParams<{ symbol: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [yieldData, setYieldData] = useState<YieldData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(searchParams.get("range") || "1Y");
  const [error, setError] = useState<string | null>(null);

  // Get the stock symbol from props, URL params, or search params
  const stockSymbol = propSymbol || urlSymbol || searchParams.get("symbol") || "HEQ";

  useEffect(() => {
    fetchYieldData();
  }, [stockSymbol, timeRange]);

  const fetchYieldData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let startDate: Date | null = new Date(CURRENT_DATE);
      
      const selectedRange = timeRangeOptions.find(option => option.value === timeRange);
      if (selectedRange && selectedRange.months) {
        startDate.setMonth(CURRENT_DATE.getMonth() - selectedRange.months);
      } else {
        startDate = null;
      }

      let query = supabase
        .from("yield_data")
        .select("*")
        .eq('symbol', stockSymbol.toUpperCase())
        .order("date", { ascending: true });

      if (startDate) {
        query = query.gte("date", startDate.toISOString().split("T")[0]);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const filteredData = filterChartData(data, timeRange);
        setYieldData(filteredData);
        setChartData(formatChartData(filteredData));
      } else {
        setYieldData([]);
        setChartData([]);
        setError(`No yield data found for symbol: ${stockSymbol}`);
      }
    } catch (err: any) {
      console.error("Error fetching yield data:", err);
      setError(err.message || "Failed to load yield data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    
    // Update URL search params
    searchParams.set("range", range);
    setSearchParams(searchParams);
  };

  const getYAxisDomain = () => {
    if (chartData.length === 0) return [0, 1];
    
    const minYield = Math.min(...chartData.map(item => item.yield));
    const maxYield = Math.max(...chartData.map(item => item.yield));
    
    // Add some padding
    const padding = (maxYield - minYield) * 0.1;
    return [Math.max(0, minYield - padding), maxYield + padding];
  };

  return (
    <div className=" flex flex-col bg-background">
        <div className="mb-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-0.5">
                  {timeRangeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={timeRange === option.value ? "default" : "outline"}
                      size="sm"
                      className={`min-w-[40px] h-7 px-2 text-xs font-medium`}
                      onClick={() => handleTimeRangeChange(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                <div className="w-[300px]">
                  <InsightCard 
                    symbol={stockSymbol} 
                    className="h-[80px] !p-0 !shadow-none !bg-transparent"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-[180px]">
                  <Loader message="Loading yield data..." />
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-[180px]">
                  <div className="text-red-500">{error}</div>
                </div>
              ) : chartData.length > 0 ? (
                <div className="relative">
                  <div style={{ height: '180px' }}>
                    <div className="absolute inset-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{ top: 10, right: 65, left: 65, bottom: 5 }}
                        >
                          <defs>
                            <filter id="card-shadow" height="200%">
                              <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.15"/>
                            </filter>
                          </defs>
                          <XAxis 
                            dataKey="displayDate" 
                            tick={{ fontSize: 12 }}
                            tickMargin={10}
                            interval={0}
                            minTickGap={60}
                            height={30}
                            axisLine={{ stroke: '#666' }}
                            tickLine={{ stroke: '#666' }}
                          />
                          <YAxis 
                            yAxisId="left"
                            orientation="left"
                            tickFormatter={(value) => `$${value.toFixed(2)}`}
                            width={60}
                            domain={['auto', 'auto']}
                            axisLine={{ stroke: '#666' }}
                            tickLine={{ stroke: '#666' }}
                            label={{ 
                              value: 'Dividend ($)', 
                              angle: -90, 
                              position: 'insideLeft',
                              offset: -45,
                              style: { fill: '#666', fontSize: 12 }
                            }}
                          />
                          <YAxis 
                            yAxisId="right"
                            orientation="right"
                            domain={getYAxisDomain()}
                            tickFormatter={(value) => `${value.toFixed(1)}%`}
                            width={60}
                            axisLine={{ stroke: '#666' }}
                            tickLine={{ stroke: '#666' }}
                            label={{ 
                              value: 'Yield (%)', 
                              angle: 90, 
                              position: 'insideRight',
                              offset: -45,
                              style: { fill: '#666', fontSize: 12 }
                            }}
                          />
                          <Tooltip
                            formatter={(value: number, name: string) => {
                              if (name === "Dividend") return [`$${value.toFixed(2)}`, name];
                              return [`${value.toFixed(1)}%`, name];
                            }}
                            labelFormatter={(label) => `Date: ${label}`}
                          />
                          <Legend verticalAlign="top" height={30} />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="yield"
                            stroke="#4CAF50"
                            strokeWidth={2}
                            name="Yield (%)"
                            dot={timeRange === '3M'}
                          />

                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="dividends"
                            strokeWidth={2}
                            stroke="#2196F"
                            name="Dividend"
                            dot={timeRange === '3M'}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center my-4 text-muted-foreground">
                  <p>No data available for the selected time range.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

       
    </div>
  );
};

export default DividendYield;