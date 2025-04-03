export interface DividendHistoryData {
  date: string;
  dividends: number;
}

export interface DividendData {
  Symbol: string;
  title: string;
  dividendRate: number;
  previousClose: number;
  currentPrice: number;
  dividendYield: number;
  payoutRatio: number;
  AnnualRate: number;
  amount: number;
  message: string;
  ExDividendDate: string;
  DividendDate: string;
  EarningsDate: string;
  adjustedClosePrice: number[];
  DeclaredDate: string;
  logo: string;
  historicalData: DividendHistoryData[];
  data: number[];
  labels: string[];
  payable: boolean;
  yield: number;
  avgYield: number;
  yearlyYield: number;
  totalYield: number;
  projectedYield: number;
  paymentFrequency: string;
  announcementDate: string;
  recordDate: string;
  yieldRange: string;
  companyName?: string;
  announcements?: string[];
  // Filter-related fields
  location?: string;
  exchange?: string;
  sector?: string;
  subSector?: string;
  revenueGrowth?: number;
  netIncome?: number;
  debtLevels?: number;
  fiveYearDividendYield?: number;
  dividendHistory?: string;
  financialHealthScore?: number;
  revenue?: number;
  earningsPerShare?: number;
  adjustedDividendYield?: number;
  payoutRatioPenalty?: number;
}

export const filterDividendData = (data: DividendHistoryData[], range: string) => {
  if (!data || data.length === 0) return [];
  if (range === 'MAX') return data;

  const currentYear = new Date().getFullYear();
  const yearsToShow = parseInt(range);
  const startYear = currentYear - yearsToShow;

  return data.filter(item => {
    const itemYear = parseInt(item.date);
    return itemYear >= startYear;
  });
};

export interface StockFilterData {
  Symbol: string;
  Location?: string;
  Exchange?: string;
  Sector?: string;
  "Sub-Sector"?: string; 
  "Revenue Growth"?: number;
  Net_Income?: number;
  "Debt Levels"?: number;
  "Payout Ratio"?: number;
  "Dividend-Yield"?: number;
  "5-Year-Dividend-Yield"?: number;
  "Dividend-History"?: string;
  "Financial-Health-Score"?: number;
  Revenue?: number;
  Earnings_per_share?: number;
  "Adjusted-Dividend-Yield"?: number;
  "Payout-Ratio-Penalty"?: number;
}

export const mapDatabaseToFilterData = (dbData: any): StockFilterData => {
  return {
    Symbol: dbData.Symbol || "",
    Location: dbData.Location,
    Exchange: dbData.Exchange,
    Sector: dbData.Sector,
    "Sub-Sector": dbData["Sub-Sector"],
    "Revenue Growth": dbData["Revenue Growth"],
    Net_Income: dbData.Net_Income,
    "Debt Levels": dbData["Debt Levels"],
    "Payout Ratio": dbData["Payout Ratio"],
    "Dividend-Yield": dbData["Dividend-Yield"],
    "5-Year-Dividend-Yield": dbData["5-Year-Dividend-Yield"],
    "Dividend-History": dbData["Dividend-History"],
    "Financial-Health-Score": dbData["Financial-Health-Score"],
    Revenue: dbData.Revenue,
    Earnings_per_share: dbData.Earnings_per_share,
    "Adjusted-Dividend-Yield": dbData["Adjusted-Dividend-Yield"],
    "Payout-Ratio-Penalty": dbData["Payout-Ratio-Penalty"]
  };
};
