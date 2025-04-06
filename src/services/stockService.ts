
export interface StockData {
  symbol: string;
  longName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  marketCap: number;
  regularMarketVolume: number;
  trailingPE?: number;
  dividendYield?: number;
  longBusinessSummary?: string;
  totalRevenue?: number;
  netIncomeToCommon?: number;
}

export interface ChartData {
  date: string;
  price: number;
}

// Mock data for stock details
const mockStocks: Record<string, StockData> = {
  "AAPL": {
    symbol: "AAPL",
    longName: "Apple Inc.",
    regularMarketPrice: 182.52,
    regularMarketChange: 1.23,
    regularMarketChangePercent: 0.68,
    marketCap: 2800000000000,
    regularMarketVolume: 58000000,
    trailingPE: 28.5,
    dividendYield: 0.65,
    longBusinessSummary: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.",
    totalRevenue: 394328000000,
    netIncomeToCommon: 96995000000
  },
  "MSFT": {
    symbol: "MSFT",
    longName: "Microsoft Corporation",
    regularMarketPrice: 411.65,
    regularMarketChange: 2.54,
    regularMarketChangePercent: 0.62,
    marketCap: 3100000000000,
    regularMarketVolume: 22000000,
    trailingPE: 35.2,
    dividendYield: 0.73,
    longBusinessSummary: "Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.",
    totalRevenue: 211915000000,
    netIncomeToCommon: 72361000000
  }
};

export const fetchStockData = async (symbol: string): Promise<StockData> => {
  const stock = mockStocks[symbol.toUpperCase()];
  if (!stock) {
    throw new Error(`No data found for symbol: ${symbol}`);
  }
  return stock;
};

export const fetchChartData = async (symbol: string): Promise<ChartData[]> => {
  // Generate mock chart data for 3 months
  const chartData: ChartData[] = [];
  const today = new Date();
  let basePrice = mockStocks[symbol.toUpperCase()]?.regularMarketPrice || 100;

  for (let i = 90; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Add some random variation to the price
    basePrice = basePrice * (1 + (Math.random() - 0.5) * 0.02);
    
    chartData.push({
      date: date.toISOString().split('T')[0],
      price: Number(basePrice.toFixed(2))
    });
  }

  return chartData;
};
