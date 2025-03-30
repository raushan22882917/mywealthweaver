import pandas as pd
import os

# Path to the original large CSV file
input_file = "C:/Users/raush/Desktop/mywealthweaver/public/ud/upgrades_downgrades_info.csv"
output_folder = os.path.dirname(input_file)  # Save in the same folder

# Define the starting row (after row 21,269)
start_row = 1  # 0-based index means we start reading from row 21,269

def split_csv_into_4_parts(input_file, start_row, output_folder):
    # Read the CSV file starting from the specified row
    df = pd.read_csv(input_file, skiprows=range(1, start_row))
    total_rows = len(df)
    
    if total_rows < 4:
        print("Not enough rows to split into 4 files.")
        return
    
    chunk_size = total_rows // 4  # Divide data into 4 equal parts
    remainder = total_rows % 4
    
    start_idx = 0
    for i in range(4):
        end_idx = start_idx + chunk_size + (1 if i < remainder else 0)  # Distribute remainder evenly
        part_df = df.iloc[start_idx:end_idx]
        output_file = os.path.join(output_folder, f"part{i+1}.csv")
        part_df.to_csv(output_file, index=False)
        print(f"Saved {output_file} with {len(part_df)} rows.")
        start_idx = end_idx  # Move to next chunk

# Run the function
split_csv_into_4_parts(input_file, start_row, output_folder)
