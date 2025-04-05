import { supabase } from '@/integrations/supabase/client';

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
  eps?: number;
  pe?: number;
  divRate?: number;
  yield?: number;
  shortInterest?: number;
  prevClose?: number;
  sector?: string;
  industry?: string;
  exchange?: string;
  dayRange?: { low: number; high: number };
  weekRange?: { low: number; high: number };
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
    netIncomeToCommon: 96995000000,
    eps: 7.02,
    pe: 28.5,
    divRate: 0.96,
    yield: 0.65,
    shortInterest: 0.84,
    prevClose: 181.29,
    sector: "Technology",
    industry: "Consumer Electronics",
    exchange: "NASDAQ",
    dayRange: { low: 180.17, high: 183.25 },
    weekRange: { low: 124.17, high: 199.62 }
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
    netIncomeToCommon: 72361000000,
    eps: 11.65,
    pe: 35.2,
    divRate: 3.00,
    yield: 0.73,
    shortInterest: 0.56,
    prevClose: 409.11,
    sector: "Technology",
    industry: "Software",
    exchange: "NASDAQ",
    dayRange: { low: 408.93, high: 413.78 },
    weekRange: { low: 309.18, high: 430.82 }
  },
  "GT": {
    symbol: "GT",
    longName: "The Goodyear Tire & Rubber Company",
    regularMarketPrice: 9.56,
    regularMarketChange: -0.63,
    regularMarketChangePercent: -6.23,
    marketCap: 2.91e9,
    regularMarketVolume: 4226851,
    trailingPE: 1.45,
    dividendYield: undefined,
    longBusinessSummary: "The Goodyear Tire & Rubber Company develops, manufactures, distributes, and sells tires and related products and services worldwide.",
    totalRevenue: 20.8e9,
    netIncomeToCommon: 202e6,
    eps: 1.45,
    pe: 7.02,
    divRate: 0,
    yield: 0,
    shortInterest: 6.84,
    prevClose: 10.19,
    sector: "Consumer Cyclical",
    industry: "Auto Parts",
    exchange: "NASDAQ",
    dayRange: { low: 9.52, high: 9.97 },
    weekRange: { low: 7.57, high: 13.48 }
  }
};

// Define table names
const stockTables = {
  STOCK_FILTER: 'stock_filter',
  TOP_STOCKS: 'top_stocks',
  STOCK_PRICES: 'stock_prices',
  STOCK_HISTORICAL_PRICES: 'stock_historical_prices',
  SIMILAR_STOCKS: 'similar_stocks'
};

export const fetchStockData = async (symbol: string): Promise<StockData> => {
  try {
    // First try to fetch from Supabase stock_filter table
    const { data: stockFilterData, error: stockFilterError } = await supabase
      .from(stockTables.STOCK_FILTER)
      .select('*')
      .eq('Symbol', symbol.toUpperCase())
      .single();

    if (stockFilterError && stockFilterError.code !== 'PGRST116') {
      console.error('Error fetching from stock_filter:', stockFilterError);
    }

    // Also try to fetch from top_stocks table
    const { data: topStockData, error: topStockError } = await supabase
      .from(stockTables.TOP_STOCKS)
      .select('*')
      .eq('symbol', symbol.toUpperCase())
      .single();

    if (topStockError && topStockError.code !== 'PGRST116') {
      console.error('Error fetching from top_stocks:', topStockError);
    }

    // If we have data from Supabase, use it
    if (stockFilterData || topStockData) {
      // Combine data from both sources
      const combinedData = {
        symbol: symbol.toUpperCase(),
        longName: stockFilterData?.Symbol || topStockData?.symbol || symbol.toUpperCase(),
        regularMarketPrice: 0,
        regularMarketChange: 0,
        regularMarketChangePercent: 0,
        marketCap: 0,
        regularMarketVolume: 0,
        sector: stockFilterData?.Sector || topStockData?.sector || 'N/A',
        industry: stockFilterData?.['Sub-Sector'] || topStockData?.industry || 'N/A',
        exchange: stockFilterData?.Exchange || 'N/A',
      } as StockData;

      // Fetch additional price data if available
      const { data: priceData } = await supabase
        .from(stockTables.STOCK_PRICES)
        .select('*')
        .eq('symbol', symbol.toUpperCase())
        .single();

      if (priceData) {
        combinedData.regularMarketPrice = priceData.current_price || 0;
        combinedData.regularMarketChange = priceData.price_change || 0;
        combinedData.regularMarketChangePercent = priceData.percent_change || 0;
        combinedData.prevClose = priceData.previous_close || 0;
      }

      // Add financial metrics if available
      if (stockFilterData) {
        combinedData.trailingPE = stockFilterData['Payout Ratio'] || undefined;
        combinedData.dividendYield = stockFilterData['Dividend-Yield'] || undefined;
        combinedData.eps = stockFilterData.Earnings_per_share || undefined;
        combinedData.shortInterest = 6.84; // Example value
        combinedData.marketCap = stockFilterData.Revenue || 0;
      }

      return combinedData;
    }

    // Fallback to mock data if no Supabase data is available
    const stock = mockStocks[symbol.toUpperCase()];
    if (!stock) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }
    return stock;
  } catch (error) {
    console.error('Error fetching stock data:', error);

    // Fallback to mock data
    const stock = mockStocks[symbol.toUpperCase()];
    if (!stock) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }
    return stock;
  }
};

export const fetchChartData = async (symbol: string): Promise<ChartData[]> => {
  try {
    // Try to fetch historical price data from Supabase
    const { data: historicalData } = await supabase
      .from(stockTables.STOCK_HISTORICAL_PRICES)
      .select('date, price')
      .eq('symbol', symbol.toUpperCase())
      .order('date', { ascending: true });

    if (historicalData && historicalData.length > 0) {
      return historicalData.map(item => ({
        date: item.date,
        price: Number(item.price)
      }));
    }

    // Fallback to generating mock data
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
  } catch (error) {
    console.error('Error fetching chart data:', error);

    // Fallback to generating mock data
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
  }
};

export interface SimilarStock {
  symbol: string;
  last_price: number;
  change: number;
  change_percent: number;
  company_name: string;
}

export const fetchSimilarStocks = async (symbol: string): Promise<SimilarStock[]> => {
  try {
    const { data: similarData } = await supabase
      .from(stockTables.SIMILAR_STOCKS)
      .select('*')
      .eq('symbol', symbol.toUpperCase());

    if (similarData && similarData.length > 0) {
      return similarData.map(item => ({
        symbol: item.similar_symbol,
        last_price: item.last_price || 0,
        change: item.change || 0,
        change_percent: item.change_percent || 0,
        company_name: item.company_name || item.similar_symbol
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching similar stocks:', error);
    return [];
  }
};
