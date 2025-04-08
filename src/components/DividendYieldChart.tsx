import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

interface ChartData {
  date: string;
  yield: number;
  dividends: number;
}

interface TimeRangeOption {
  label: string;
  value: string;
  months: number | null;
}

interface DividendYieldChartProps {
  chartData: ChartData[];
  symbol: string;
  isLoading: boolean;
  error: string | null;
  timeRange: string;
  timeRangeOptions: TimeRangeOption[];
  onTimeRangeChange: (range: string) => void;
}

const DividendYieldChart: React.FC<DividendYieldChartProps> = ({
  chartData,
  symbol,
  isLoading,
  error,
  timeRange,
  timeRangeOptions,
  onTimeRangeChange
}) => {
  const getYAxisDomain = () => {
    if (chartData.length === 0) return [0, 1];

    const minYield = Math.min(...chartData.map(item => item.yield));
    const maxYield = Math.max(...chartData.map(item => item.yield));

    const padding = (maxYield - minYield) * 0.1;
    return [Math.max(0, minYield - padding), maxYield + padding];
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Dividend Yield History for {symbol}</CardTitle>
          <div className="flex space-x-2">
            {timeRangeOptions.map(option => (
              <Button
                key={option.value}
                variant={timeRange === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => onTimeRangeChange(option.value)}
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
                    {/* Removed CartesianGrid */}
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis
                      domain={getYAxisDomain()}
                      tickFormatter={value => `${value}%`}
                      width={60}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, "Yield"]}
                      labelFormatter={label => `Date: ${label}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="yield"
                      stroke="#4CAF50"
                      strokeWidth={2}
                      dot={false}
                      activeDot={false}
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
                    {/* Removed CartesianGrid */}
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis
                      tickFormatter={value => `$${value}`}
                      width={60}
                    />
                    {/* <Tooltip
                      formatter={(value: number) => [`$${value}`, "Dividend"]}
                      labelFormatter={label => `Date: ${label}`}
                    /> */}
                    {/* <Legend /> */}
                    {/* <Line
                      type="monotone"
                      dataKey="dividends"
                      stroke="#2196F3"
                      strokeWidth={2}
                      dot={false}
                      activeDot={false}
                      name="Dividend Amount ($)"
                    />
                  </LineChart> */}
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
  );
};

export default DividendYieldChart;
