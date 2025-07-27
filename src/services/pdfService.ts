import { supabase } from '@/integrations/supabase/client';

export interface PDFDocument {
  id: string;
  symbol: string;
  company_name: string | null;
  file_path: string;
  file_name: string;
  file_size: number;
  document_type: string;
  upload_date: string;
  created_at: string;
}

export class PDFService {
  private static BUCKET_NAME = 'pdfdocument';

  // Check if the PDF storage bucket exists
  static async initializeBucket() {
    try {
      // First check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated to access storage bucket');
      }

      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        throw new Error(`Failed to list storage buckets: ${listError.message}`);
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);
      
      if (!bucketExists) {
        console.log('PDF storage bucket does not exist');
        throw new Error('PDF storage bucket "C" does not exist. Please create it manually in the Supabase dashboard under Storage > Buckets, or run the setup script provided in the documentation.');
      } else {
        console.log('PDF storage bucket exists and is accessible');
      }
    } catch (error) {
      console.error('Error checking bucket:', error);
      throw error;
    }
  }

  // Upload a PDF file to Supabase storage
  static async uploadPDF(
    file: File,
    symbol: string,
    companyName?: string,
    documentType: string = 'financial_report'
  ): Promise<PDFDocument> {
    try {
      // Ensure bucket exists
      await this.initializeBucket();

      const fileName = `${symbol}_${Date.now()}_${file.name}`;
      const filePath = `${symbol}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }

      // Get public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      // Insert metadata into database
      const { data, error: dbError } = await supabase
        .from('pdf_documents')
        .insert({
          symbol: symbol.toUpperCase(),
          company_name: companyName || null, // Make company_name optional
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          document_type: documentType,
          upload_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) {
        console.error('Error inserting PDF metadata:', dbError);
        throw dbError;
      }

      return data as PDFDocument;
    } catch (error) {
      console.error('Error in uploadPDF:', error);
      throw error;
    }
  }

  // Search for PDFs by symbol with enhanced file existence check
  static async searchPDFsBySymbol(symbol: string): Promise<PDFDocument[]> {
    try {
      // First, get all matching documents from the database
      const { data: documents, error: dbError } = await supabase
        .from('pdf_documents')
        .select('*')
        .ilike('symbol', `%${symbol.toUpperCase()}%`)
        .order('created_at', { ascending: false });

      if (dbError) {
        console.error('Error searching PDFs in database:', dbError);
        throw dbError;
      }

      if (!documents || documents.length === 0) {
        return [];
      }

      // Verify each document exists in storage
      const verifiedDocuments: PDFDocument[] = [];
      
      for (const doc of documents) {
        try {
          // Check if file exists in storage
          const { data: fileExists } = await supabase.storage
            .from(this.BUCKET_NAME)
            .getPublicUrl(doc.file_path);
          
          // If we can get a public URL, the file exists
          if (fileExists && fileExists.publicUrl) {
            verifiedDocuments.push(doc);
          } else {
            console.warn(`PDF file not found in storage: ${doc.file_path}`);
            // Optionally, you could remove the database entry here if the file is missing
            // await this.cleanupMissingDocument(doc.id);
          }
        } catch (storageError) {
          console.error(`Error verifying file ${doc.file_path} in storage:`, storageError);
          // Continue with other documents even if one fails
          continue;
        }
      }

      return verifiedDocuments;
    } catch (error) {
      console.error('Error in searchPDFsBySymbol:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  // Helper method to clean up database entries for missing files
  private static async cleanupMissingDocument(id: string): Promise<void> {
    try {
      await supabase
        .from('pdf_documents')
        .delete()
        .eq('id', id);
      console.log(`Cleaned up missing document with ID: ${id}`);
    } catch (error) {
      console.error(`Error cleaning up document ${id}:`, error);
    }
  }

  // Get PDF by ID
  static async getPDFById(id: string): Promise<PDFDocument | null> {
    try {
      const { data, error } = await supabase
        .from('pdf_documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error getting PDF by ID:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getPDFById:', error);
      throw error;
    }
  }

  // Get PDF download URL
  static async getPDFDownloadURL(filePath: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        console.error('Error getting download URL:', error);
        throw error;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error in getPDFDownloadURL:', error);
      throw error;
    }
  }

  // Get public URL for PDF preview
  static getPDFPublicURL(filePath: string): string {
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return publicUrl;
  }

  // Delete PDF
  static async deletePDF(id: string): Promise<void> {
    try {
      // Get PDF metadata first
      const pdf = await this.getPDFById(id);
      if (!pdf) {
        throw new Error('PDF not found');
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([pdf.file_path]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
        throw storageError;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('pdf_documents')
        .delete()
        .eq('id', id);

      if (dbError) {
        console.error('Error deleting from database:', dbError);
        throw dbError;
      }
    } catch (error) {
      console.error('Error in deletePDF:', error);
      throw error;
    }
  }

  // Get all PDFs
  static async getAllPDFs(): Promise<PDFDocument[]> {
    try {
      const { data, error } = await supabase
        .from('pdf_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting all PDFs:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllPDFs:', error);
      throw error;
    }
  }

  // Test method to check if a specific file exists in the bucket
  static async testFileExists(filename: string): Promise<boolean> {
    try {
      console.log('Testing if file exists:', filename);
      
      // Try to get the public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filename);
      
      console.log('Public URL for file:', publicUrl);
      
      // Try to fetch the file to see if it exists
      const response = await fetch(publicUrl);
      const exists = response.ok;
      
      console.log('File exists:', exists, 'Status:', response.status);
      
      return exists;
    } catch (error) {
      console.error('Error testing file existence:', error);
      return false;
    }
  }

  // List all PDF files from storage bucket for search suggestions
  static async listAllPDFFilesInBucket(): Promise<string[]> {
    try {
      // First check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not authenticated for bucket listing');
        throw new Error('User must be authenticated to access storage bucket');
      }

      console.log('Listing files in bucket:', this.BUCKET_NAME);

      // List all files in the bucket (root directory)
      const { data: files, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', {
          limit: 1000, // Adjust as needed
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error('Error listing files in bucket:', error);
        throw error;
      }

      console.log('Raw files from bucket:', files);

      if (!files || files.length === 0) {
        console.log('No files found in bucket root');
        return [];
      }

      // Extract filenames and filter for PDFs
      const pdfFiles = files
        .filter(file => file.name.toLowerCase().endsWith('.pdf'))
        .map(file => file.name);

      console.log('PDF files found in root:', pdfFiles);

      // Also try to list files with a different approach - check if there are any files
      // that might be stored with a different path structure
      try {
        // Try to get a direct list without any path restrictions
        const { data: allFiles, error: allFilesError } = await supabase.storage
          .from(this.BUCKET_NAME)
          .list('', {
            limit: 1000,
            offset: 0
          });

        if (!allFilesError && allFiles) {
          console.log('All files in bucket (alternative method):', allFiles);
          
          // Check if we found more files this way
          const allPdfFiles = allFiles
            .filter(file => file.name.toLowerCase().endsWith('.pdf'))
            .map(file => file.name);
          
          console.log('All PDF files found (alternative method):', allPdfFiles);
          
          // Combine results and remove duplicates
          const combinedPdfFiles = Array.from(new Set([...pdfFiles, ...allPdfFiles]));
          console.log('Combined PDF files:', combinedPdfFiles);
          
          return combinedPdfFiles;
        }
      } catch (alternativeError) {
        console.log('Alternative listing method failed:', alternativeError);
      }

      return pdfFiles;
    } catch (error) {
      console.error('Error in listAllPDFFilesInBucket:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  // Search PDF filenames for suggestions (fuzzy search)
  static async searchPDFFilenames(query: string): Promise<string[]> {
    try {
      console.log('Searching PDF filenames for query:', query);
      const allFiles = await this.listAllPDFFilesInBucket();
      console.log('All files available for search:', allFiles);
      
      if (!query.trim()) {
        console.log('No query provided, returning first 10 files');
        return allFiles.slice(0, 10); // Return first 10 files if no query
      }

      const lowercaseQuery = query.toLowerCase();
      console.log('Lowercase query:', lowercaseQuery);
      
      // Filter files that contain the query (case-insensitive)
      const matchingFiles = allFiles.filter(filename => 
        filename.toLowerCase().includes(lowercaseQuery)
      );

      console.log('Matching files:', matchingFiles);

      // Sort by relevance (exact matches first, then partial matches)
      const sortedFiles = matchingFiles.sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        
        // Exact match gets highest priority
        if (aLower === lowercaseQuery) return -1;
        if (bLower === lowercaseQuery) return 1;
        
        // Starts with query gets second priority
        if (aLower.startsWith(lowercaseQuery)) return -1;
        if (bLower.startsWith(lowercaseQuery)) return 1;
        
        // Otherwise, sort alphabetically
        return aLower.localeCompare(bLower);
      });

      console.log('Sorted matching files:', sortedFiles);
      return sortedFiles.slice(0, 10); // Limit to 10 suggestions
    } catch (error) {
      console.error('Error in searchPDFFilenames:', error);
      return [];
    }
  }
} 