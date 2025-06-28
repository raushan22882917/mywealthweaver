import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface YieldData {
  date: string;
  symbol: string;
  yield: number;
  close: number;
  dividends: number;
}

const DividendYield = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  const [searchTerm, setSearchTerm] = useState('');
  const [allSymbols, setAllSymbols] = useState<string[]>([]);
  const [data, setData] = useState<YieldData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dividends');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData = await response.json();
        setData(rawData);
        processData(rawData);

        const uniqueSymbols = [...new Set(rawData.map((item: YieldData) => item.symbol))];
        setAllSymbols(uniqueSymbols);
      } catch (error) {
        console.error("Could not fetch dividend data", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      processData(data);
    }
  }, [data]);

  const processData = (data: YieldData[]) => {
    const groupedData = data.reduce((acc: { [key: string]: YieldData[] }, item) => {
      if (!acc[item.symbol]) {
        acc[item.symbol] = [];
      }
      acc[item.symbol].push(item);
      return acc;
    }, {});

    const chartData = Object.entries(groupedData).map(([symbol, items]) => {
      const sortedItems = items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return {
        symbol,
        data: sortedItems.map(item => ({
          date: new Date(item.date).toLocaleDateString(),
          yield: item.yield,
          close: item.close,
          dividends: item.dividends
        }))
      };
    });

    setChartData(chartData);
  };

  const filteredSymbols = allSymbols.filter(symbol =>
    symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedChartData = chartData.find(item => item.symbol === selectedSymbol);

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Dividend Yield Analysis</h1>
          <p className="mt-2 text-gray-500">Explore historical dividend yields for various stocks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Symbol Selection and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Select a Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for a symbol..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a stock symbol" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSymbols.map(symbol => (
                    <SelectItem key={symbol} value={symbol}>
                      {symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Dividend Yield Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Historical Dividend Yield for {selectedSymbol}</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedChartData ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={selectedChartData.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="yield" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p>No data available for the selected symbol.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DividendYield;
