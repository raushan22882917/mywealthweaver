
import { DateRange } from "react-day-picker";

export interface StockSubscription {
  id: string;
  email: string;
  stock_symbol: string;
  created_at: string;
}

export interface DividendDate {
  id: string;
  symbol: string;
  buy_date: string | null;
  payout_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyProfile {
  id: number;
  symbol: string;
  phone: string | null;
  website: string | null;
  industry: string | null;
  sector: string | null;
  long_business_summary: string | null;
  fullTimeEmployees: number | null;
  auditRisk: number | null;
  boardRisk: number | null;
  compensationRisk: number | null;
  shareHolderRightsRisk: number | null;
  overallRisk: number | null;
  dividendRate: number | null;
  dividendYield: number | null;
  exDividendDate: string | null;
  payoutRatio: number | null;
  fiveYearAvgDividendYield: number | null;
  beta: number | null;
  trailingPE: number | null;
  forwardPE: number | null;
  priceToSalesTrailing12Months: number | null;
  fiftyDayAverage: number | null;
  twoHundredDayAverage: number | null;
  trailingAnnualDividendRate: number | null;
  trailingAnnualDividendYield: number | null;
  profitMargins: number | null;
  heldPercentInsiders: number | null;
  heldPercentInstitutions: number | null;
  bookValue: number | null;
  priceToBook: number | null;
  lastFiscalYearEnd: string | null;
  earningsQuarterlyGrowth: number | null;
  netIncomeToCommon: number | null;
  trailingEPS: number | null;
  forwardEPS: number | null;
  enterpriseToRevenue: number | null;
  enterpriseToEBITDA: number | null;
  week52Change: number | null;
  sandP52WeekChange: number | null;
  lastDividendValue: number | null;
  lastDividendDate: string | null;
  exchange: string | null;
  quoteType: string | null;
  shortName: string | null;
  targetHighPrice: number | null;
  targetLowPrice: number | null;
  targetMeanPrice: number | null;
  targetMedianPrice: number | null;
  recommendationMean: number | null;
  recommendationKey: string | null;
  numberOfAnalystOpinions: number | null;
  totalCash: number | null;
  totalCashPerShare: number | null;
  ebitda: number | null;
  totalDebt: number | null;
  quickRatio: number | null;
  currentRatio: number | null;
  totalRevenue: number | null;
  debtToEquity: number | null;
  revenuePerShare: number | null;
  returnOnAssets: number | null;
  returnOnEquity: number | null;
  grossProfits: number | null;
  freeCashflow: number | null;
  operatingCashflow: number | null;
  earningsGrowth: number | null;
  revenueGrowth: number | null;
  grossMargins: number | null;
  ebitdaMargins: number | null;
  operatingMargins: number | null;
  trailingPEGRatio: number | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface DividendHistory {
  id: number;
  symbol: string;
  date: string;
  dividend: number;
  dividends: number;
  created_at: string;
}

export interface CompanyLogo {
  id: number;
  Symbol: string;
  LogoURL: string;
  company_name?: string;
  domain?: string;
  created_at: string;
}

export interface SimilarCompany {
  id: number;
  symbol: string;
  similar_symbol: string;
  company_name: string | null;
  description: string | null;
  revenue_2024?: string | null;
  created_at: string | null;
  logo?: string;
}

export interface Stock {
  cik_str: string;
  Symbol: string;
  title: string;
  LogoURL?: string;
  marketCap?: number;
  dividendYield?: number;
}

export interface StockUpgrade {
  id: string;
  symbol: string;
  firm: string;
  action: string;
  from_grade: string;
  to_grade: string;
  grade_date: string | null;
  created_at: string;
}

export interface SimilarCompanyDisplay {
  symbol: string;
  company: string;
  description: string;
  logoUrl: string;
  revenue?: string;
}
