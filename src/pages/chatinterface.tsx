import React, { useState, useEffect, useRef } from 'react';
import { PDFAnalysisApiService, PDFInfo, PDFAnalysis, ChatMessage, ChatResponse } from '../services/pdfAnalysisApiService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Loader2, Send, FileText, MessageSquare, AlertCircle, CheckCircle, RefreshCw, Search, Menu, X } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import PDFApiTest from '../components/PDFApiTest';
import { cn } from '../lib/utils';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatSessions, setChatSessions] = useState<Array<{
    id: string;
    title: string;
    date: Date;
    messages: ChatMessage[];
  }>>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialize with a default chat session if none exists
  useEffect(() => {
    if (chatSessions.length === 0) {
      const newChatId = Date.now().toString();
      setChatSessions([{
        id: newChatId,
        title: 'New Chat',
        date: new Date(),
        messages: []
      }]);
      setCurrentChatId(newChatId);
    }
  }, []);

  // Update chat session when messages change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      setChatSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === currentChatId 
            ? { ...session, messages: [...messages] }
            : session
        )
      );
    }
  }, [messages, currentChatId]);

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

    // If this is a new chat, create a new session
    if (messages.length === 0) {
      const newChatId = Date.now().toString();
      const newChat = {
        id: newChatId,
        title: inputMessage.slice(0, 30) + (inputMessage.length > 30 ? '...' : ''),
        date: new Date(),
        messages: [userMessage]
      };
      setChatSessions(prev => [newChat, ...prev]);
      setCurrentChatId(newChatId);
    } else {
      setMessages(prev => [...prev, userMessage]);
    }
    
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

  // Filter chat sessions based on search query
  const filteredChatSessions = chatSessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r transition-transform duration-300 ease-in-out transform",
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          "lg:translate-x-0 lg:static lg:inset-auto lg:z-auto"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Button 
              onClick={() => {
                setMessages([]);
                setAnalysis(null);
                setSelectedPDF('');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              + New Chat
            </Button>
          </div>
          
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search chats..."
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredChatSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => {
                    setCurrentChatId(session.id);
                    setMessages(session.messages);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-md text-sm truncate",
                    currentChatId === session.id 
                      ? "bg-blue-50 text-blue-700" 
                      : "hover:bg-gray-100"
                  )}
                >
                  <div className="font-medium">{session.title}</div>
                  <div className="text-xs text-gray-500">
                    {session.date.toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* PDF Preview Section */}
          <div className="p-4 border-t">
            <h3 className="text-sm font-medium mb-2 text-gray-700">PDF Preview</h3>
            {selectedPDF ? (
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium truncate">{selectedPDF}</span>
                </div>
                {analysis && (
                  <div className="mt-2 text-xs text-gray-500">
                    <div className="truncate">
                      {analysis.summary?.substring(0, 100)}{analysis.summary?.length > 100 ? '...' : ''}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No PDF selected</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden mr-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">PDF Analysis Chat</h1>
            </div>
            
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search in chat..."
                  className="w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              <PDFApiTest />
              {apiHealth !== null && (
                <div className="ml-2">
                  {apiHealth ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="max-w-5xl mx-auto w-full bg-white rounded-lg shadow-sm border p-6">
            {apiHealth !== null && (
              <Alert className={`mb-6 ${apiHealth ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
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

            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </div>
              </Alert>
            )}

            <div className="space-y-6">
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

        <div className="w-full">
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
              <Card className="min-h-[calc(100vh-200px)] flex flex-col border-0 shadow-none">
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
                            className={`group w-full flex ${
                              message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-3xl rounded-2xl px-4 py-3 ${
                                message.role === 'user'
                                  ? 'bg-blue-600 text-white rounded-tr-none'
                                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
                              }`}
                            >
                              <div className="prose prose-sm max-w-none">
                                {message.content.split('\n').map((paragraph, i) => (
                                  <p key={i} className="mb-2 last:mb-0">
                                    {paragraph || <br />}
                                  </p>
                                ))}
                              </div>
                              <div className={`text-xs mt-1 ${
                                message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                              }`}>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      {isLoading && (
                        <div className="flex justify-start w-full">
                          <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-3xl">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                              <span className="text-sm text-gray-500">AI is thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <div className="sticky bottom-0 bg-white pt-4 pb-2">
                    <div className="flex items-end gap-2 rounded-lg border p-2">
                      <div className="flex-1">
                        <Input
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Message PDF Analysis..."
                          disabled={!selectedPDF || isLoading}
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px]"
                        />
                      </div>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!selectedPDF || !inputMessage.trim() || isLoading}
                        size="icon"
                        className="h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      PDF Analysis may produce inaccurate information about people, places, or facts.
                    </p>
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
    </main>
  </div>
    </div>
  );
};

export default ChatInterface;
