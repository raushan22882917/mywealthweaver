
export interface SimilarCompany {
  symbol: string;
  similar_symbol: string;
  similar_company: string;
  revenue_2024: string;
  logo?: string | null;
  LogoURL?: string | null;
  company_name?: string;
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
