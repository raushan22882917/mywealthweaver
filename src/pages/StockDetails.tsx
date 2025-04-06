
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchStockData, fetchChartData } from "@/services/stockService";
import type { StockData, ChartData } from "@/services/stockService";

const StockDetails = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stockData, isLoading: isStockLoading } = useQuery<StockData>({
    queryKey: ['stock', symbol],
    queryFn: () => fetchStockData(symbol!),
    meta: {
      onError: (error: Error) => {
        toast.error(error.message);
      }
    }
  });

  const { data: chartData, isLoading: isChartLoading } = useQuery<ChartData[]>({
    queryKey: ['stockChart', symbol],
    queryFn: () => fetchChartData(symbol!),
    meta: {
      onError: (error: Error) => {
        toast.error(error.message);
      }
    }
  });

  const formatMarketCap = (value: number | undefined) => {
    if (!value || value === 0) return 'N/A';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  };

  if (isStockLoading || isChartLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Loader message={`Loading data for ${symbol}...`} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <p>No data found for {symbol}</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{stockData.longName}</h1>
              <p className="text-xl text-muted-foreground">{stockData.symbol}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                ${stockData.regularMarketPrice.toFixed(2)}
              </p>
              <p className={`${stockData.regularMarketChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {stockData.regularMarketChange.toFixed(2)} ({stockData.regularMarketChangePercent.toFixed(2)}%)
              </p>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Market Cap</p>
              <p className="text-lg font-bold">{formatMarketCap(stockData.marketCap)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Volume</p>
              <p className="text-lg font-bold">{stockData.regularMarketVolume.toLocaleString()}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">P/E Ratio</p>
              <p className="text-lg font-bold">{stockData.trailingPE?.toFixed(2) || 'N/A'}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Dividend Yield</p>
              <p className="text-lg font-bold">
                {stockData.dividendYield ? `${(stockData.dividendYield * 100).toFixed(2)}%` : 'N/A'}
              </p>
            </Card>
          </div>

          {/* Tabs and Content */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Price History</h3>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['auto', 'auto']} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">About {stockData.longName}</h3>
                <p className="text-muted-foreground">
                  {stockData.longBusinessSummary || 'No company description available.'}
                </p>
              </Card>
            </TabsContent>
            <TabsContent value="financials">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Financial Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-lg font-bold">{stockData.totalRevenue ? formatMarketCap(stockData.totalRevenue) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net Income</p>
                    <p className="text-lg font-bold">{stockData.netIncomeToCommon ? formatMarketCap(stockData.netIncomeToCommon) : 'N/A'}</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="news">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Latest News</h3>
                <p className="text-muted-foreground">
                  News feed coming soon.
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StockDetails;
