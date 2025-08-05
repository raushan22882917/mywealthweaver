# Similar Companies Service

This service provides functionality to fetch similar companies data from the Supabase database and company logos from the CSV file.

## Features

- Fetch similar companies for a given stock symbol
- Fetch company logos and names from the logos.csv file
- Combine database data with logo information
- Error handling and fallback mechanisms

## Database Schema

The service uses the `similar_companies` table with the following structure:

```sql
create table public.similar_companies (
  id serial not null,
  symbol text null,
  revenue_2025 text null,
  similar_symbol text null,
  dividend_yield text null,
  risks text null,
  as_of_date text null,
  constraint similar_companies_pkey primary key (id)
);
```

## Usage Examples

### Fetch Similar Companies for a Symbol

```typescript
import { fetchSimilarCompanies } from '@/services/similarCompaniesService';

const similarCompanies = await fetchSimilarCompanies('AAPL');
console.log(similarCompanies);
```

### Get Company Logo and Name

```typescript
import { getCompanyInfo } from '@/services/similarCompaniesService';

const companyInfo = await getCompanyInfo('AAPL');
console.log(companyInfo);
// Output: {
//   symbol: 'AAPL',
//   logo: 'https://logo.clearbit.com/www.apple.com',
//   name: 'Apple Inc.',
//   hasLogo: true,
//   hasName: true
// }
```

### Use in React Component

```typescript
import React, { useEffect, useState } from 'react';
import { fetchSimilarCompanies, SimilarCompanyWithLogo } from '@/services/similarCompaniesService';

const MyComponent = ({ symbol }: { symbol: string }) => {
  const [similarCompanies, setSimilarCompanies] = useState<SimilarCompanyWithLogo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSimilarCompanies = async () => {
      setLoading(true);
      try {
        const data = await fetchSimilarCompanies(symbol);
        setSimilarCompanies(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSimilarCompanies();
  }, [symbol]);

  return (
    <div>
      {loading ? (
        <div>Loading similar companies...</div>
      ) : (
        <div>
          {similarCompanies.map(company => (
            <div key={company.similar_symbol}>
              <img src={company.LogoURL} alt={company.similar_company} />
              <span>{company.similar_symbol}</span>
              <span>{company.dividend_yield}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## API Functions

### `fetchSimilarCompanies(symbol: string)`
Fetches similar companies for a given stock symbol from the database and combines with logo data.

**Parameters:**
- `symbol`: Stock symbol (e.g., 'AAPL')

**Returns:** `Promise<SimilarCompanyWithLogo[]>`

### `fetchAllSimilarCompanies()`
Fetches all similar companies from the database (useful for admin or overview purposes).

**Returns:** `Promise<SimilarCompanyWithLogo[]>`

### `fetchCompanyLogo(symbol: string)`
Fetches the logo URL for a given stock symbol from the logos.csv file.

**Parameters:**
- `symbol`: Stock symbol (e.g., 'AAPL')

**Returns:** `Promise<string | undefined>`

### `fetchCompanyName(symbol: string)`
Fetches the company name for a given stock symbol from the logos.csv file.

**Parameters:**
- `symbol`: Stock symbol (e.g., 'AAPL')

**Returns:** `Promise<string | undefined>`

### `getCompanyInfo(symbol: string)`
Fetches both logo and company name for a given stock symbol.

**Parameters:**
- `symbol`: Stock symbol (e.g., 'AAPL')

**Returns:** `Promise<{ symbol: string, logo?: string, name?: string, hasLogo: boolean, hasName: boolean }>`

## Data Types

### `SimilarCompany`
```typescript
interface SimilarCompany {
  id: number;
  symbol: string;
  revenue_2025: string;
  similar_symbol: string;
  dividend_yield: string;
  risks: string;
}
```

### `SimilarCompanyWithLogo`
```typescript
interface SimilarCompanyWithLogo extends SimilarCompany {
  LogoURL?: string;
  similar_company?: string;
}
```

### `CompanyLogo`
```typescript
interface CompanyLogo {
  id: string;
  Symbol: string;
  company_name: string;
  domain: string;
  LogoURL: string;
}
```

## Error Handling

The service includes comprehensive error handling:
- Database connection errors are logged and return empty arrays
- CSV parsing errors are caught and logged
- Missing data is handled gracefully with fallback values
- All functions return safe default values on error

## Dependencies

- Supabase client for database operations
- Fetch API for CSV file loading
- React hooks for component integration 