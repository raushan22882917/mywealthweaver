import pandas as pd

# Load CSV
df = pd.read_csv('D:/mywealthweaver/public/dividends.csv')

# Type mapping from your schema
column_types = {
    'symbol': 'character varying',
    'shortname': 'character varying',
    'dividendrate': 'real',
    'previousclose': 'double precision',
    'currentprice': 'double precision',
    'dividendyield': 'double precision',
    'payoutratio': 'double precision',
    'quotetype': 'character varying',
    'dividend': 'double precision',
    'message': 'text',
    'exdividenddate': 'date',
    'earningsdate': 'date',
    'payoutdate': 'date',
    'buy_date': 'date',
    'hist': 'text',
    'insight': 'text'
}

# Clean based on type
for col, col_type in column_types.items():
    if col_type in ['character varying', 'text']:
        df[col] = df[col].fillna('N/A')
    elif col_type in ['real', 'double precision']:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0.0).astype(float)
    elif col_type == 'date':
        df[col] = pd.to_datetime(df[col], errors='coerce')
        df[col] = df[col].fillna(pd.to_datetime('1998-01-01'))
        df[col] = df[col].dt.strftime('%Y-%m-%d')

# Format all float columns to 1 decimal place (using .map to avoid FutureWarning)
float_cols = [col for col, col_type in column_types.items() if col_type in ['real', 'double precision']]
for col in float_cols:
    df[col] = df[col].map(lambda x: f"{x:.1f}")

# Save cleaned CSV
df.to_csv('cleaned_file.csv', index=False)

print("✅ Warning-free and future-ready. Cleaned file saved as 'cleaned_file.csv'")
