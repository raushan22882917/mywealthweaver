import { supabase } from '@/lib/supabase/client';

export interface PDFDocument {
  id: string;
  symbol: string;
  company_name: string;
  file_path: string;
  file_name: string;
  file_size: number;
  document_type: string;
  upload_date: string;
  created_at: string;
}

export class PDFService {
  private static BUCKET_NAME = 'pdf-documents';

  // Initialize the bucket if it doesn't exist
  static async initializeBucket() {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: false,
          allowedMimeTypes: ['application/pdf'],
          fileSizeLimit: 52428800 // 50MB limit
        });
        
        if (error) {
          console.error('Error creating bucket:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error initializing bucket:', error);
      throw error;
    }
  }

  // Upload a PDF file to Supabase storage
  static async uploadPDF(
    file: File,
    symbol: string,
    companyName: string,
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
          company_name: companyName,
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
} 