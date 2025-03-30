import pandas as pd

def remove_duplicates(csv_file):
    # Read the CSV file
    df = pd.read_csv(csv_file)
    
    # Count duplicates before removal
    duplicate_count = df.duplicated(subset=['symbol', 'date']).sum()
    
    # Drop duplicate rows based on 'symbol' and 'date' columns, keeping the first occurrence
    df_unique = df.drop_duplicates(subset=['symbol', 'date'], keep='first')
    
    # Save the cleaned data back to the same file
    df_unique.to_csv(csv_file, index=False)
    
    print(f"Removed {duplicate_count} duplicate rows based on 'symbol' and 'date'. Cleaned file saved as: {csv_file}")

# Example usage
remove_duplicates('C:/Users/raush/Desktop/mywealthweaver/public/quatarly_dividend/quater_dividend.csv')
