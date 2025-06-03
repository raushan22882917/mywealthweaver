import { supabase } from '../lib/supabase/client';
import fs from 'fs';
import path from 'path';

async function createHolidayTable() {
  try {
    // Read holiday data from JSON file
    const holidayDataPath = path.join(process.cwd(), 'public', 'calender', 'holiday.json');
    const holidayData = JSON.parse(fs.readFileSync(holidayDataPath, 'utf8'));

    // Insert holiday data
    const { error: insertError } = await supabase
      .from('holidays')
      .upsert(
        holidayData.holidays.map((holiday: any) => ({
          date: holiday.date,
          name: holiday.name,
          description: holiday.description,
          type: 'federal'
        })),
        { onConflict: 'date,name' }
      );

    if (insertError) {
      if (insertError.code === '42P01') {
        // Table doesn't exist, we need to create it first
        console.log('Holidays table does not exist. Please create it in the Supabase dashboard with the following SQL:');
        console.log(`
          CREATE TABLE IF NOT EXISTS holidays (
            id SERIAL PRIMARY KEY,
            date DATE NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            type TEXT DEFAULT 'federal',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
            UNIQUE(date, name)
          );
          
          CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(date);
        `);
      } else {
        console.error('Error inserting holiday data:', insertError);
        throw insertError;
      }
    } else {
      console.log('Holidays table populated successfully!');
    }
  } catch (error) {
    console.error('Error in createHolidayTable:', error);
  }
}

// Run the function
createHolidayTable(); 