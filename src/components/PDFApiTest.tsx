import React, { useState, useEffect } from 'react';
import { PDFAnalysisApiService } from '../services/pdfAnalysisApiService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const PDFApiTest: React.FC = () => {
  const [apiHealth, setApiHealth] = useState<boolean | null>(null);
  const [apiInfo, setApiInfo] = useState<any>(null);
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApiConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Test API health
      const health = await PDFAnalysisApiService.checkApiHealth();
      setApiHealth(health);
      
      if (health) {
        // Get API info
        try {
          const info = await PDFAnalysisApiService.getApiInfo();
          setApiInfo(info);
        } catch (infoErr) {
          console.warn('Could not get API info:', infoErr);
        }
        
        // Test listing PDFs
        const pdfList = await PDFAnalysisApiService.listPDFs();
        setPdfs(Array.isArray(pdfList) ? pdfList : []);
      }
    } catch (err) {
      console.error('API test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setApiHealth(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testApiConnection();
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          PDF API Test
        </CardTitle>
        <CardDescription>
          Test connection to PDF Analysis API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testApiConnection} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {isLoading ? 'Testing...' : 'Test Connection'}
        </Button>

        {apiHealth !== null && (
          <Alert className={apiHealth ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center gap-2">
              {apiHealth ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                {apiHealth ? 'API is connected' : 'API connection failed'}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {apiInfo && (
          <div className="text-sm space-y-1">
            <div className="font-medium">{apiInfo.message}</div>
            <div className="text-gray-600">Version: {apiInfo.version}</div>
          </div>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

                 {apiHealth && Array.isArray(pdfs) && pdfs.length > 0 && (
           <div>
             <h4 className="font-medium mb-2">Available PDFs ({pdfs.length})</h4>
             <div className="space-y-2">
               {pdfs.slice(0, 3).map((pdf, index) => (
                 <div key={index} className="text-sm p-2 bg-gray-100 rounded">
                   <div className="font-medium">{pdf.name}</div>
                   <div className="text-gray-600">
                     Size: {Math.round(pdf.size / 1024)}KB
                   </div>
                   {pdf.url && (
                     <div className="text-xs text-blue-600 truncate">
                       <a href={pdf.url} target="_blank" rel="noopener noreferrer">
                         View PDF
                       </a>
                     </div>
                   )}
                 </div>
               ))}
               {pdfs.length > 3 && (
                 <div className="text-sm text-gray-500">
                   ... and {pdfs.length - 3} more
                 </div>
               )}
             </div>
           </div>
         )}
      </CardContent>
    </Card>
  );
};

export default PDFApiTest; 