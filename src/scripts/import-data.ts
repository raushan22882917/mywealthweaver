
import { supabase } from '../lib/supabase';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

async function importData() {
  try {
    // Import company profiles
    const profilesCSV = fs.readFileSync(path.join(__dirname, '../../public/profile/company_profile.csv'), 'utf-8');
    const profiles = Papa.parse(profilesCSV, { header: true, delimiter: '|' }).data;
    
    for (const profile of profiles as any[]) {
      const { error } = await supabase
        .from('company_profiles')
        .upsert({
          symbol: profile.symbol,
          website: profile.website,
          industry: profile.industry,
          sector: profile.sector,
          long_business_summary: profile.longBusinessSummary,
          full_time_employees: parseInt(profile.fullTimeEmployees) || null,
          dividend_rate: parseFloat(profile.dividendRate) || null,
          dividend_yield: parseFloat(profile.dividendYield) || null,
          ex_dividend_date: profile.exDividendDate,
          payout_ratio: parseFloat(profile.payoutRatio) || null,
          previous_close: parseFloat(profile.previousClose) || null,
          open_price: parseFloat(profile.open) || null,
          day_low: parseFloat(profile.dayLow) || null,
          day_high: parseFloat(profile.dayHigh) || null,
          volume: parseInt(profile.volume) || null,
          market_cap: parseInt(profile.marketCap) || null,
          trailing_pe: parseFloat(profile.trailingPE) || null,
          forward_pe: parseFloat(profile.forwardPE) || null,
          beta: parseFloat(profile.beta) || null,
          address: profile.address
        });
      if (error) console.error('Error importing profile:', error);
    }

    // Import annual dividends
    const annualDivCSV = fs.readFileSync(path.join(__dirname, '../../public/Annual_dividend/annual_dividend.csv'), 'utf-8');
    const annualDivs = Papa.parse(annualDivCSV, { header: true, delimiter: '|' }).data;
    
    for (const div of annualDivs as any[]) {
      const { error } = await supabase
        .from('annual_dividends')
        .upsert({
          symbol: div.symbol,
          date: div.date,
          dividends: parseFloat(div.dividends) || 0
        });
      if (error) console.error('Error importing annual dividend:', error);
    }

    // Import quarterly dividends
    const quarterlyDivCSV = fs.readFileSync(path.join(__dirname, '../../public/quatarly_dividend/quater_dividend.csv'), 'utf-8');
    const quarterlyDivs = Papa.parse(quarterlyDivCSV, { header: true, delimiter: '|' }).data;
    
    for (const div of quarterlyDivs as any[]) {
      const { error } = await supabase
        .from('quarterly_dividends')
        .upsert({
          symbol: div.symbol,
          date: div.date,
          dividends: parseFloat(div.dividends) || 0
        });
      if (error) console.error('Error importing quarterly dividend:', error);
    }

    // Import stock rankings
    const rankingsCSV = fs.readFileSync(path.join(__dirname, '../../public/ranking/ranking.csv'), 'utf-8');
    const rankings = Papa.parse(rankingsCSV, { header: true, delimiter: '|' }).data;
    
    for (const rank of rankings as any[]) {
      const { error } = await supabase
        .from('stock_rankings')
        .upsert({
          symbol: rank.Symbol,
          rank: parseInt(rank.Rank) || 0,
          score: parseFloat(rank.Score) || 0,
          sector: rank.sector,
          industry: rank.industry
        });
      if (error) console.error('Error importing ranking:', error);
    }

    // Import similar companies
    const similarCSV = fs.readFileSync(path.join(__dirname, '../../public/profile/similarcompany.csv'), 'utf-8');
    const similar = Papa.parse(similarCSV, { header: true, delimiter: '|' }).data;
    
    for (const comp of similar as any[]) {
      const similarSymbols = comp.similarcompanies.split(',');
      for (const symbol of similarSymbols) {
        const { error } = await supabase
          .from('similar_companies')
          .upsert({
            symbol: comp.symbol,
            similar_symbol: symbol.trim(),
            company_name: '', // You'll need to get this from another source
            description: '' // You'll need to get this from another source
          });
        if (error) console.error('Error importing similar company:', error);
      }
    }

    // Import company logos
    const logosCSV = fs.readFileSync(path.join(__dirname, '../../public/sp500_company_logos.csv'), 'utf-8');
    const logos = Papa.parse(logosCSV, { header: true, delimiter: ',' }).data;
    
    for (const logo of logos as any[]) {
      const { error } = await supabase
        .from('company_logos')
        .upsert({
          Symbol: logo.Symbol,
          LogoURL: logo.LogoURL
        });
      if (error) console.error('Error importing logo:', error);
    }

    console.log('All data imported successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
  }
}

importData();
