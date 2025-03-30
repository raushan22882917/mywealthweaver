import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart2, TrendingUp, TrendingDown, Info } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for charts - replace with real API data later
const mockChartData = Array(50).fill(0).map((_, i) => ({
  date: new Date(2023, i % 12, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
  value: 100 + Math.random() * 20
}));

const marketIndices = [
  {
    name: "S&P 500",
    value: "$4,783.83",
    change: "+16.85",
    changePercent: "(+1.45%)",
    data: mockChartData
  },
  {
    name: "DOW JONES",
    value: "$37,863.80",
    change: "+201.36",
    changePercent: "(+0.95%)",
    data: mockChartData
  },
  {
    name: "NASDAQ",
    value: "$15,310.97",
    change: "+256.31",
    changePercent: "(+1.70%)",
    data: mockChartData
  }
];

const topGainers = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: "$184.83",
    change: "+5.21",
    changePercent: "(+2.20%)"
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    price: "$390.27",
    change: "+8.34",
    changePercent: "(+2.35%)"
  },
  {
    symbol: "NVDA",
    name: "NVIDIA",
    price: "$547.10",
    change: "+13.51",
    changePercent: "(+2.97%)"
  }
];

const topLosers = [
  {
    symbol: "META",
    name: "Meta Platforms",
    price: "$383.45",
    change: "-2.77",
    changePercent: "(-1.23%)"
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: "$212.19",
    change: "-1.60",
    changePercent: "(-0.89%)"
  },
  {
    symbol: "AMZN",
    name: "Amazon.com",
    price: "$155.34",
    change: "-1.05",
    changePercent: "(-0.67%)"
  }
];

const MarketData = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6">📈 Market Data</h1>

          {/* Market Overview Section */}
          <div className="mb-8">
            <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4">Market Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketIndices.map((index) => (
                <Card key={index.name} className="bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-all p-6 rounded-xl border dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{index.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{index.value}</span>
                        <span className={`text-sm font-medium ${index.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {index.change} {index.changePercent}
                        </span>
                      </div>
                    </div>
                    {index.change.startsWith('+') ? (
                      <TrendingUp className="h-6 w-6 text-green-500" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                  <div className="h-[80px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={index.data}>
                        <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Top Movers Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Gainers */}
            <Card className="p-6 bg-white dark:bg-gray-900 shadow-md rounded-xl border dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">🚀 Top Gainers</h2>
                <Link to="/top-gainers">
                  <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 cursor-pointer hover:text-blue-700" />
                </Link>
              </div>
              <div className="space-y-4">
                {topGainers.map((stock) => (
                  <div key={stock.symbol} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{stock.symbol}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{stock.price}</div>
                      <div className="text-sm text-green-600">{stock.change} {stock.changePercent}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Losers */}
            <Card className="p-6 bg-white dark:bg-gray-900 shadow-md rounded-xl border dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">📉 Top Losers</h2>
                <Link to="/top-losers">
                  <Info className="h-5 w-5 text-red-500 dark:text-red-400 cursor-pointer hover:text-red-700" />
                </Link>
              </div>
              <div className="space-y-4">
                {topLosers.map((stock) => (
                  <div key={stock.symbol} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{stock.symbol}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{stock.price}</div>
                      <div className="text-sm text-red-600">{stock.change} {stock.changePercent}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MarketData;
