import pandas as pd

def remove_duplicate_columns(file_path, output_file):
    # Read the CSV file
    df = pd.read_csv(file_path)
    
    # Identify duplicate columns
    duplicate_columns = df.columns[df.columns.duplicated()]
    
    # Drop duplicate columns
    df = df.drop(columns=duplicate_columns)
    
    # Drop 'Symbol' and 'Symbol.1' columns if they exist
    columns_to_remove = ['Symbol']
    df = df.drop(columns=[col for col in columns_to_remove if col in df.columns], errors='ignore')
    
    # Save the cleaned CSV
    df.to_csv(output_file, index=False)
    print(f"Duplicate and specified columns removed along with their values. Cleaned file saved as: {output_file}")

# Example usage
input_file = "output33.csv"  # Change to your input file path
output_file = "output33.csv"  # Change to your desired output file path
remove_duplicate_columns(input_file, output_file)
