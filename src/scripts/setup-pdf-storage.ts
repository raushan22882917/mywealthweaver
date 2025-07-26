import { supabase } from '@/lib/supabase/client';
import { PDFService } from '@/services/pdfService';

async function setupPDFStorage() {
  console.log('Setting up PDF storage system...');

  try {
    // Initialize the bucket
    console.log('Initializing Supabase bucket...');
    await PDFService.initializeBucket();
    console.log('✅ Bucket initialized successfully');

    // Note: The SQL table creation should be done manually in the Supabase dashboard
    // or using the Supabase CLI. The SQL script is provided in create-pdf-table.sql
    console.log('📝 Please run the SQL script from create-pdf-table.sql in your Supabase dashboard');
    console.log('   or use the Supabase CLI to create the pdf_documents table');

    console.log('✅ PDF storage setup completed!');
  } catch (error) {
    console.error('❌ Error setting up PDF storage:', error);
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupPDFStorage();
}

export { setupPDFStorage }; 