
// This component handles reporting functionality
import React from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://imrrxaziqfppoiubayrs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltcnJ4YXppcWZwcG9pdWJheXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NzEzNTQsImV4cCI6MjA1ODQ0NzM1NH0.hgpp54SWTMNSdMDC5_DE1Sl_tmxE_BAfcYxkIHrp3lg";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const Reporting = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Reporting Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        This page will display reporting data and analytics for dividend stocks.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Dividend Growth</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track and analyze dividend growth over time.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Yield Analysis</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Compare yields across different sectors and industries.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Dividend Safety</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Evaluate the safety ratings of dividend stocks in your portfolio.
          </p>
        </div>
      </div>
      
      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3">Coming Soon</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Advanced reporting features are being developed and will be available soon.
        </p>
        <ul className="list-disc list-inside mt-3 text-gray-600 dark:text-gray-400">
          <li>Portfolio income projections</li>
          <li>Tax efficiency analysis</li>
          <li>Dividend reinvestment calculator</li>
          <li>Sector allocation recommendations</li>
        </ul>
      </div>
    </div>
  );
};

export default Reporting;
