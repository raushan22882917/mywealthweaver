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
  // Additional fields needed for integration
  buy_date?: string;
  payoutdate?: string;
  hist?: string;
  insight?: string;
  LogoURL?: string;
  industry?: string;
  employees?: string;
  founded?: string;
  address?: string;
  ceo?: string;
  website?: string;
  description?: string;
  marketCap?: string;
  peRatio?: string;
  weekRange?: string;
  volume?: string;
  status?: string;
  payout_ratio?: string;
  fcf_coverage?: string;
  debt_to_equity?: string;
  company_name?: string;
  domain?: string;
}

export interface DividendHistory {
  date: string;
  dividend?: number;
  dividends?: number;
  id?: number;
  symbol?: string;
  created_at?: string;
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
