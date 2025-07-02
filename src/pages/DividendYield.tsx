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
            month: timeRange === "1Y" ? "short" : undefined,
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
    <div className="flex flex-col bg-background">
        <div className="mb-6">
          <Card className="rounded-2xl shadow-lg border border-gray-100 bg-white/90 dark:bg-gray-900/80">
            <CardHeader className="pb-2 pt-4 px-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle className="text-xl font-bold mb-1">Dividend Yield Over Time</CardTitle>
                </div>
                <div className="flex space-x-2 mt-2 sm:mt-0">
                  {timeRangeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={timeRange === option.value ? "default" : "outline"}
                      size="sm"
                      className={`rounded-full px-4 py-1.5 font-medium transition-colors duration-150 ${timeRange === option.value ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-gray-700'}`}
                      onClick={() => handleTimeRangeChange(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-4 px-6">
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
                  <TabsList className="mb-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
                    <TabsTrigger value="yield">Yield %</TabsTrigger>
                  </TabsList>
                  <TabsContent value="yield">
                    <div className="h-[260px] bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-800 p-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            tickMargin={10}
                            tickFormatter={(value) => value}
                          />
                          <YAxis 
                            domain={getYAxisDomain()}
                            tickFormatter={(value) => `${value.toFixed(2)}%`}
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
                            name="Yield (%)"
                            dot={false}
                            activeDot={false}
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
    </div>
  );
};

export default DividendYield;