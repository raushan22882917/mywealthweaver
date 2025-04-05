export interface SimilarCompany {
  symbol: string;
  similar_symbol: string;
  similar_company: string;
  revenue_2024: string;
  logo?: string | null;
  LogoURL?: string | null;
  company_name?: string;
  company?: string;
  description?: string;
  logoUrl?: string;
}

export interface CompanyProfile {
  symbol: string;
  phone: string;
  website: string;
  industry: string;
  sector: string;
  long_business_summary: string;
  fullTimeEmployees: string;
  auditRisk: number;
  boardRisk: number;
  compensationRisk: number;
  shareHolderRightsRisk: number;
  overallRisk: number;
  dividendRate: string;
  dividendYield: string;
  exDividendDate: string;
  payoutRatio: string;
  fiveYearAvgDividendYield: number;
  beta: number;
  trailingPE: number;
  forwardPE: number;
  priceToSalesTrailing12Months: number;
  fiftyDayAverage: number;
  twoHundredDayAverage: number;
  trailingAnnualDividendRate: number;
  trailingAnnualDividendYield: number;
  profitMargins: number;
  heldPercentInsiders: number;
  heldPercentInstitutions: number;
  bookValue: number;
  priceToBook: number;
  lastFiscalYearEnd: string;
  earningsQuarterlyGrowth: number;
  netIncomeToCommon: number;
  trailingEps: number;
  forwardEps: number;
  enterpriseToRevenue: number;
  enterpriseToEbitda: number;
  weekChange52: number;
  sandP52WeekChange: number;
  lastDividendValue: number;
  lastDividendDate: string;
  exchange: string;
  quoteType: string;
  shortName: string;
  targetHighPrice: number;
  targetLowPrice: number;
  targetMeanPrice: number;
  targetMedianPrice: number;
  recommendationMean: number;
  recommendationKey: string;
  numberOfAnalystOpinions: number;
  totalCash: number;
  totalCashPerShare: number;
  ebitda: number;
  totalDebt: number;
  quickRatio: number;
  currentRatio: number;
  totalRevenue: number;
  debtToEquity: number;
  revenuePerShare: number;
  returnOnAssets: number;
  returnOnEquity: number;
  grossProfits: number;
  freeCashflow: number;
  operatingCashflow: number;
  earningsGrowth: number;
  revenueGrowth: number;
  grossMargins: number;
  ebitdaMargins: number;
  operatingMargins: number;
  trailingPegRatio: number;
  address: string;
}

export interface DividendHistory {
  date: string;
  dividend: number;
  dividends?: number;
  id?: number;
  symbol?: string;
  created_at?: string;
}

export interface RankingDisplayData {
  rank?: string;
  score?: string;
  industryRank?: string;
  totalStocks?: string;
  totalIndustryStocks?: string;
  industry?: string;
  sector?: string;
  Rank?: string;
  Score?: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface Stock {
  cik_str: string;
  Symbol: string;
  title: string;
  LogoURL?: string;
  marketCap?: number;
  dividendYield?: number;
}

export interface StockData {
  symbol: string;
  title: string;
  id?: string;
  company_name?: string;
  logo_url?: string;
  LogoURL?: string;
  price?: number;
  dividend_yield?: number;
  dividendYield?: number;
  marketCap?: string | number;
  currentprice?: number;
  previousclose?: number;
  dividendrate?: number;
  dividendyield?: number;
  payoutratio?: number;
  next_dividend_date?: string;
  ExDividendDate?: string;
  is_favorite?: boolean;
}

export interface Holiday {
  name: string;
  date: string;
  type: string;
}

export interface StockFilterData {
  symbol: string;
  sector?: string;
  exchange?: string;
  revenue?: number;
  earnings_per_share?: number;
  Sector?: string;
  Exchange?: string;
  Revenue?: number;
  Earnings_per_share?: number;
  "Dividend-Yield"?: number;
  "Payout Ratio"?: number;
  "Financial-Health-Score"?: number;
  "Debt Levels"?: number;
}

export interface DividendHistoryData {
  date: string;
  dividends: number;
  symbol: string;
  id: number;
  created_at: string;
}

export interface StockAnalysis {
  id?: string;
  symbol: string;
  analysis_text: string;
  analysis_date: string;
  sentiment: string;
  strength?: string;
  weakness?: string;
  opportunity?: string;
  threat?: string;
  price_target?: number;
  recommendation?: string;
  created_at?: string;
}

export interface NewsItem {
  id: string;
  date: string;
  news_title: string;
  original_link: string;
  sentiment: string;
  sentiment_score: string;
  source: string;
  symbol: string;
  weblink: string;
}

export function mapDatabaseToFilterData(data: any): StockFilterData {
  return {
    symbol: data.Symbol || data.symbol,
    sector: data.Sector || data.sector,
    exchange: data.Exchange || data.exchange,
    revenue: data.Revenue || data.revenue,
    earnings_per_share: data.Earnings_per_share || data.earnings_per_share,
    Sector: data.Sector,
    Exchange: data.Exchange,
    Revenue: data.Revenue,
    Earnings_per_share: data.Earnings_per_share
  };
}

export function filterDividendData(data: DividendHistoryData[], timeRange: string): DividendHistoryData[] {
  const now = new Date();
  const yearsAgo = new Date();
  
  switch (timeRange) {
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
}
