
import { supabase } from '@/lib/supabase/client';
import * as fs from 'fs';
import * as path from 'path';

export const importCompanyProfiles = async (filePath: string) => {
  try {
    const data = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
    
    for (const item of data) {
      // Add proper type assertion
      const profileData = item as {
        symbol: string;
        website: string;
        industry: string;
        sector: string;
        longBusinessSummary: string;
        fullTimeEmployees: string;
        dividendRate: number;
        dividendYield: number;
        exDividendDate: string;
        payoutRatio: number;
        previousClose: number;
        open: number;
        dayLow: number;
        dayHigh: number;
        volume: number;
        marketCap: number;
        trailingPE: number;
        forwardPE: number;
        beta: number;
        address: string;
      };
      
      const { error } = await supabase
        .from('company_profiles')
        .insert({
          symbol: profileData.symbol,
          website: profileData.website,
          industry: profileData.industry,
          sector: profileData.sector,
          long_business_summary: profileData.longBusinessSummary,
          full_time_employees: profileData.fullTimeEmployees,
          dividend_rate: profileData.dividendRate,
          dividend_yield: profileData.dividendYield,
          ex_dividend_date: profileData.exDividendDate,
          payout_ratio: profileData.payoutRatio,
          previous_close: profileData.previousClose,
          open: profileData.open,
          day_low: profileData.dayLow,
          day_high: profileData.dayHigh,
          volume: profileData.volume,
          market_cap: profileData.marketCap,
          trailing_pe: profileData.trailingPE,
          forward_pe: profileData.forwardPE,
          beta: profileData.beta,
          address: profileData.address
        });
      
      if (error) console.error('Error inserting company profile:', error);
    }
    
    console.log('Company profiles imported successfully!');
  } catch (error) {
    console.error('Error importing company profiles:', error);
  }
};

export const importDividendData = async (filePath: string) => {
  try {
    const data = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
    
    for (const item of data) {
      // Add proper type assertion
      const dividendData = item as {
        symbol: string;
        date: string;
        dividends: number;
      };
      
      const { error } = await supabase
        .from('quarterly_dividends')
        .insert({
          symbol: dividendData.symbol,
          date: dividendData.date,
          dividends: dividendData.dividends
        });
      
      if (error) console.error('Error inserting dividend data:', error);
    }
    
    console.log('Dividend data imported successfully!');
  } catch (error) {
    console.error('Error importing dividend data:', error);
  }
};

export const importAnnualDividends = async (filePath: string) => {
  try {
    const data = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
    
    for (const item of data) {
      // Add proper type assertion
      const annualData = item as {
        symbol: string;
        date: string;
        dividends: number;
      };
      
      const { error } = await supabase
        .from('annual_dividends')
        .insert({
          symbol: annualData.symbol,
          date: annualData.date,
          dividends: annualData.dividends
        });
      
      if (error) console.error('Error inserting annual dividend data:', error);
    }
    
    console.log('Annual dividend data imported successfully!');
  } catch (error) {
    console.error('Error importing annual dividend data:', error);
  }
};

export const importTopStocks = async (filePath: string) => {
  try {
    const data = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
    
    for (const item of data) {
      // Add proper type assertion
      const stockData = item as {
        Symbol: string;
        Rank: number;
        Score: number;
        sector: string;
        industry: string;
      };
      
      const { error } = await supabase
        .from('top_stocks')
        .insert({
          symbol: stockData.Symbol,
          Rank: stockData.Rank,
          Score: stockData.Score,
          sector: stockData.sector,
          industry: stockData.industry
        });
      
      if (error) console.error('Error inserting top stock data:', error);
    }
    
    console.log('Top stocks imported successfully!');
  } catch (error) {
    console.error('Error importing top stocks:', error);
  }
};

export const importSimilarCompanies = async (filePath: string) => {
  try {
    const data = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
    
    for (const company of data) {
      const companyData = company as {
        similarcompanies: any[];
        symbol: string;
      };
      
      for (const similar of companyData.similarcompanies) {
        const { error } = await supabase
          .from('similar_companies')
          .insert({
            symbol: companyData.symbol,
            similar_symbol: similar.symbol,
            similar_company: similar.company,
            revenue_2024: similar.revenue
          });
        
        if (error) console.error('Error inserting similar company data:', error);
      }
    }
    
    console.log('Similar companies imported successfully!');
  } catch (error) {
    console.error('Error importing similar companies:', error);
  }
};

export const importCompanyLogos = async (filePath: string) => {
  try {
    const data = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
    
    for (const item of data) {
      // Add proper type assertion
      const logoData = item as {
        Symbol: string;
        LogoURL: string;
      };
      
      const { error } = await supabase
        .from('company_logos')
        .insert({
          Symbol: logoData.Symbol,
          LogoURL: logoData.LogoURL
        });
      
      if (error) console.error('Error inserting company logo:', error);
    }
    
    console.log('Company logos imported successfully!');
  } catch (error) {
    console.error('Error importing company logos:', error);
  }
};

// Execute import functions
// importCompanyProfiles('./data/company_profiles.json');
// importDividendData('./data/quarterly_dividends.json');
// importAnnualDividends('./data/annual_dividends.json');
// importTopStocks('./data/top_stocks.json');
// importSimilarCompanies('./data/similar_companies.json');
// importCompanyLogos('./data/logos.json');
