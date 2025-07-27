import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFAnalysisApiService, PDFInfo, PDFAnalysis, ChatMessage, ChatResponse } from '../services/pdfAnalysisApiService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Loader2, Send, FileText, MessageSquare, AlertCircle, CheckCircle, RefreshCw, ArrowLeft, Eye, Maximize2, X } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../components/ui/resizable';
import PDFApiTest from '../components/PDFApiTest';

const ChatInterface: React.FC = () => {
  const navigate = useNavigate();
  const [pdfs, setPdfs] = useState<PDFInfo[]>([]);
  const [selectedPDF, setSelectedPDF] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PDFAnalysis | null>(null);
  const [apiHealth, setApiHealth] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showFullscreenPDF, setShowFullscreenPDF] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header with Website Name and Back Button */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">StockAnalyzer Pro</h1>
                <p className="text-xs text-muted-foreground">PDF Analysis Chat</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {apiHealth !== null && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50">
                {apiHealth ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">API Connected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 text-red-600" />
                    <span className="text-xs text-red-600 font-medium">API Disconnected</span>
                  </>
                )}
              </div>
            )}
            <PDFApiTest />
          </div>
        </div>
      </header>

      {error && (
        <div className="container mx-auto px-4 py-2">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content with Resizable Panels */}
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-4rem)]">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - PDF Selection */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <Card className="h-full mr-3">
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

                <Select value={selectedPDF} onValueChange={(value) => {
                  setSelectedPDF(value);
                  setShowPDFPreview(true);
                }}>
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
                      onClick={() => setShowPDFPreview(!showPDFPreview)}
                      variant="outline"
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showPDFPreview ? 'Hide Preview' : 'Show Preview'}
                    </Button>
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
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Middle Panel - PDF Preview */}
          <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
            <Card className="h-full mx-3">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    PDF Preview
                  </div>
                  {selectedPDF && showPDFPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullscreenPDF(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  {selectedPDF ? `Viewing: ${selectedPDF}` : 'Select a PDF to preview'}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-5rem)]">
                {selectedPDF && showPDFPreview ? (
                  <div className="w-full h-full border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/30 relative">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{selectedPDF}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          PDF preview will be implemented here
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowFullscreenPDF(true)}
                          className="mt-3"
                        >
                          <Maximize2 className="h-4 w-4 mr-2" />
                          View Fullscreen
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a PDF to preview</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Chat Interface */}
          <ResizablePanel defaultSize={40} minSize={30} maxSize={55}>
            <Card className="h-full flex flex-col ml-3">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat Interface
                </CardTitle>
                <CardDescription>
                  {selectedPDF ? `Analyzing: ${selectedPDF}` : 'Select a PDF to start chatting'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1 mb-4 pr-3">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">No messages yet</p>
                        <p className="text-xs mt-1">Start a conversation with your PDF!</p>
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-xl p-3 shadow-sm ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <p className="text-xs opacity-70 mt-2">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-xl p-3 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">AI is analyzing...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="flex gap-2 pt-2 border-t">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={selectedPDF ? "Ask something about this PDF..." : "Select a PDF first"}
                    disabled={!selectedPDF || isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!selectedPDF || !inputMessage.trim() || isLoading}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Analysis Results Panel */}
        {analysis && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                Detailed analysis of {selectedPDF}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fullscreen PDF Dialog */}
      <Dialog open={showFullscreenPDF} onOpenChange={setShowFullscreenPDF}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedPDF}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullscreenPDF(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 p-6 pt-2">
            <div className="w-full h-full border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/30">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl">{selectedPDF}</h3>
                  <p className="text-muted-foreground mt-2">
                    Full PDF viewer will be implemented here
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This will show the complete PDF document in fullscreen mode
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatInterface;
