
export interface DividendData {
  Symbol: string;
  shortname: string;
  title: string;
  dividendRate: number;
  dividendYield: number;
  payoutRatio: number;
  exdividenddate: string;
  previousClose: number;
  currentPrice: number;
  earningsdate: string;
  message: string;
  AnnualRate: number;
  buy_date: string;
  dividend: number;
  dividenddate: string;
  quotetype: string;
  date: string;
  insight: string;
  hist: string;
  'Ex-Dividend': string;
  payoutdate: string;
  amount?: number;
  yieldRange: string;
  logo?: string;
  companyName?: string;
  exdividenddate?: string;
  dividenddate?: string;
}

export interface Holiday {
  name: string;
  date: string;
  isHoliday: boolean;
}

export interface DividendHistoryData {
  id: number;
  symbol: string;
  date: string;
  dividends: number;
  created_at?: string;
}

export interface StockFilterData {
  symbol: string;
  Sector?: string;
  Exchange?: string;
  dividendYield?: number;
  "Dividend-Yield"?: number;
  payoutRatio?: number;
  "Payout Ratio"?: number;
  financialHealthScore?: number;
  "Financial-Health-Score"?: number;
  debtLevels?: number;
  "Debt Levels"?: number;
  Revenue?: number;
  Earnings_per_share?: number;
}

export const mapDatabaseToFilterData = (item: any): StockFilterData => {
  return {
    symbol: item.Symbol || "",
    Sector: item.Sector || "",
    Exchange: item.Exchange || "",
    "Dividend-Yield": item["Dividend-Yield"],
    "Payout Ratio": item["Payout Ratio"],
    "Financial-Health-Score": item["Financial-Health-Score"],
    "Debt Levels": item["Debt Levels"],
    Revenue: item.Revenue,
    Earnings_per_share: item.Earnings_per_share
  };
};

export const filterDividendData = (data: DividendHistoryData[], range: string): DividendHistoryData[] => {
  const now = new Date();
  const yearsAgo = new Date();
  
  switch (range) {
    case '1Y':
      yearsAgo.setFullYear(now.getFullYear() - 1);
      break;
    case '3Y':
      yearsAgo.setFullYear(now.getFullYear() - 3);
      break;
    case '5Y':
      yearsAgo.setFullYear(now.getFullYear() - 5);
      break;
    case '10Y':
      yearsAgo.setFullYear(now.getFullYear() - 10);
      break;
    case 'MAX':
      return data;
    default:
      yearsAgo.setFullYear(now.getFullYear() - 1);
  }

  return data.filter(item => new Date(item.date) >= yearsAgo);
};
