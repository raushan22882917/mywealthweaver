import React, { useState, useEffect, useRef } from 'react';
import { PDFAnalysisApiService, PDFInfo, PDFAnalysis, ChatMessage, ChatResponse } from '../services/pdfAnalysisApiService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Loader2, Send, FileText, MessageSquare, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import PDFApiTest from '../components/PDFApiTest';

const ChatInterface: React.FC = () => {
  const [pdfs, setPdfs] = useState<PDFInfo[]>([]);
  const [selectedPDF, setSelectedPDF] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PDFAnalysis | null>(null);
  const [apiHealth, setApiHealth] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check API health and load PDFs on component mount
  useEffect(() => {
    checkApiHealth();
    loadPDFs();
  }, []);

  const checkApiHealth = async () => {
    try {
      const isHealthy = await PDFAnalysisApiService.checkApiHealth();
      setApiHealth(isHealthy);
      if (!isHealthy) {
        setError('PDF Analysis API is not available. Please ensure the API server is running.');
      } else {
        setError(null);
      }
    } catch (error) {
      setApiHealth(false);
      setError('Failed to connect to PDF Analysis API');
    }
  };

  const loadPDFs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const pdfList = await PDFAnalysisApiService.listPDFs();
      // Ensure pdfList is an array
      setPdfs(Array.isArray(pdfList) ? pdfList : []);
    } catch (error) {
      console.error('Error loading PDFs:', error);
      setError('Failed to load PDFs');
      setPdfs([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedPDF || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await PDFAnalysisApiService.chatWithPDF(selectedPDF, inputMessage);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response || response.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzePDF = async () => {
    if (!selectedPDF || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const analysisResult = await PDFAnalysisApiService.analyzePDF(selectedPDF);
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      setError('Failed to analyze PDF');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setAnalysis(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">PDF Analysis Chat</h1>
        <p className="text-muted-foreground">
          Chat with your PDF documents and get intelligent analysis
        </p>
      </div>

      {/* API Health Status */}
      <div className="mb-6 flex justify-between items-start">
        <div className="flex-1">
          {apiHealth !== null && (
            <Alert className={`mb-4 ${apiHealth ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center gap-2">
                {apiHealth ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  {apiHealth 
                    ? 'PDF Analysis API is connected and ready' 
                    : 'PDF Analysis API is not available'
                  }
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
        <div className="ml-4">
          <PDFApiTest />
        </div>
      </div>

      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* PDF Selection Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Available PDFs
              </CardTitle>
              <CardDescription>
                Select a PDF to chat with or analyze
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadPDFs}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  disabled={messages.length === 0}
                >
                  Clear Chat
                </Button>
              </div>

              <Select value={selectedPDF} onValueChange={setSelectedPDF}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a PDF" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(pdfs) && pdfs.length > 0 ? (
                    pdfs.map((pdf) => (
                      <SelectItem key={pdf.name} value={pdf.name}>
                        <div className="flex flex-col">
                          <span className="font-medium">{pdf.name}</span>
                                                  <span className="text-xs text-muted-foreground">
                          {formatFileSize(pdf.size)} • {formatDate(pdf.created_at)}
                        </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                      {isLoading ? 'Loading PDFs...' : 'No PDFs available'}
                    </div>
                  )}
                </SelectContent>
              </Select>

              {selectedPDF && (
                <div className="space-y-2">
                  <Button
                    onClick={handleAnalyzePDF}
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    {isAnalyzing ? 'Analyzing...' : 'Analyze PDF'}
                  </Button>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat and Analysis Panel */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-4">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle>
                    {selectedPDF ? `Chat with ${selectedPDF}` : 'Select a PDF to start chatting'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 mb-4">
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No messages yet. Start a conversation!</p>
                        </div>
                      ) : (
                        messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                message.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm">AI is thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={!selectedPDF || isLoading}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!selectedPDF || !inputMessage.trim() || isLoading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>PDF Analysis</CardTitle>
                  <CardDescription>
                    Detailed analysis of the selected PDF
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedPDF ? (
                    <div className="text-center text-muted-foreground py-8">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a PDF to view its analysis</p>
                    </div>
                  ) : !analysis ? (
                    <div className="text-center py-8">
                      <Button onClick={handleAnalyzePDF} disabled={isAnalyzing}>
                        {isAnalyzing ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <FileText className="h-4 w-4 mr-2" />
                        )}
                        {isAnalyzing ? 'Analyzing...' : 'Analyze PDF'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Analysis</h3>
                        <p className="text-muted-foreground">{analysis.analysis}</p>
                      </div>
                      
                      {analysis.summary && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Summary</h3>
                          <p className="text-muted-foreground">{analysis.summary}</p>
                        </div>
                      )}

                      {analysis.key_points && analysis.key_points.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Key Points</h3>
                          <ul className="space-y-1">
                            {analysis.key_points.map((point, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {analysis.financial_metrics && Object.keys(analysis.financial_metrics).length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Financial Metrics</h3>
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(analysis.financial_metrics).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="font-medium">{key}:</span>
                                <span>{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {analysis.risk_factors && analysis.risk_factors.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Risk Factors</h3>
                          <div className="space-y-2">
                            {analysis.risk_factors.map((risk, index) => (
                              <Badge key={index} variant="destructive">
                                {risk}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {analysis.recommendations && analysis.recommendations.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
                          <ul className="space-y-1">
                            {analysis.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-green-600">✓</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Content Length:</span> {analysis.content_length} characters
                          </div>
                          <div>
                            <span className="font-medium">Analyzed:</span> {new Date(analysis.analyzed_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
