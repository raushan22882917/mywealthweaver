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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "@/components/ui/loader";

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
  yield: number;
  dividends: number;
}

interface DividendYieldProps {
  symbol?: string;
}

const timeRangeOptions = [
  { label: "1Y", value: "1Y", months: 12 },
  { label: "3Y", value: "3Y", months: 36 },
  { label: "5Y", value: "5Y", months: 60 },
  { label: "10Y", value: "10Y", months: 120 },
  { label: "MAX", value: "MAX", months: null },
];

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
      // Calculate date range based on selected time range
      const endDate = new Date();
      let startDate: Date | null = new Date();
      
      const selectedRange = timeRangeOptions.find(option => option.value === timeRange);
      if (selectedRange && selectedRange.months) {
        startDate.setMonth(endDate.getMonth() - selectedRange.months);
      } else {
        // For MAX range, set to null and we'll get all data
        startDate = null;
      }

      console.log("Fetching data for symbol:", stockSymbol); // Debug log

      // Build query
      let query = supabase
        .from("yield_data")
        .select("*")
        .eq('symbol', stockSymbol.toUpperCase()) // Ensure symbol is uppercase
        .order("date", { ascending: true });

      // Add date filter if not MAX
      if (startDate) {
        query = query.gte("date", startDate.toISOString().split("T")[0]);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      console.log("Received data:", data); // Debug log

      if (data && data.length > 0) {
        setYieldData(data);
        
        // Format data for the chart
        const formattedData = data.map((item) => ({
          date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          yield: parseFloat((item.yield || 0).toFixed(2)),
          dividends: parseFloat((item.dividends || 0).toFixed(2)),
        }));
        
        setChartData(formattedData);
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
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dividend Yield History for {stockSymbol}</h1>
          <p className="text-muted-foreground">
            Track dividend yield changes over time for better investment decisions
          </p>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Dividend Yield Over Time</CardTitle>
                <div className="flex space-x-2">
                  {timeRangeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={timeRange === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTimeRangeChange(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              <CardDescription>
                The relationship between stock price, dividends, and yield over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center my-12">
                  <Loader message="Loading dividend yield data..." />
                </div>
              ) : error ? (
                <div className="text-center my-12 text-red-500">
                  <p>{error}</p>
                </div>
              ) : chartData.length > 0 ? (
                <Tabs defaultValue="yield">
                  <TabsList className="mb-4">
                    <TabsTrigger value="yield">Yield %</TabsTrigger>
                    <TabsTrigger value="dividends">Dividends $</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="yield">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            tickMargin={10}
                            tickFormatter={(value) => value}
                          />
                          <YAxis 
                            domain={getYAxisDomain()}
                            tickFormatter={(value) => `${value}%`}
                            width={60}
                          />
                          <Tooltip 
                            formatter={(value: number) => [`${value}%`, 'Yield']}
                            labelFormatter={(label) => `Date: ${label}`}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="yield"
                            stroke="#4CAF50"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 6 }}
                            name="Yield (%)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="dividends">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            tickMargin={10}
                          />
                          <YAxis 
                            tickFormatter={(value) => `$${value}`}
                            width={60}
                          />
                          <Tooltip 
                            formatter={(value: number) => [`$${value}`, 'Dividend']}
                            labelFormatter={(label) => `Date: ${label}`}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="dividends"
                            stroke="#2196F3"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 6 }}
                            name="Dividend Amount ($)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center my-12 text-muted-foreground">
                  <p>No data available for the selected time range.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {yieldData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Dividend Yield Data Table</CardTitle>
              <CardDescription>
                Historical dividend yield data for {stockSymbol}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse table-auto">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left font-medium">Date</th>
                      <th className="px-4 py-2 text-left font-medium">Stock Price</th>
                      <th className="px-4 py-2 text-left font-medium">Dividend Amount</th>
                      <th className="px-4 py-2 text-left font-medium">Yield (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yieldData.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-2">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">${item.close.toFixed(2)}</td>
                        <td className="px-4 py-2">${item.dividends.toFixed(2)}</td>
                        <td className="px-4 py-2">{item.yield.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default DividendYield;
