import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFAnalysisApiService, PDFInfo, PDFAnalysis, ChatMessage, ChatResponse } from '../services/pdfAnalysisApiService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Loader2, Send, FileText, MessageSquare, AlertCircle, RefreshCw, ArrowLeft, Search } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';


const ChatInterface: React.FC = () => {
  const navigate = useNavigate();
  const [pdfs, setPdfs] = useState<PDFInfo[]>([]);
  const [selectedPDF, setSelectedPDF] = useState<PDFInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Filter PDFs based on search term (case-insensitive and removes .pdf extension)
  const filteredPDFs = pdfs.filter(pdf => {
    const pdfName = pdf.name.toLowerCase().replace(/\.pdf$/i, '');
    const search = searchTerm.toLowerCase();
    return pdfName.includes(search);
  });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check API health and load PDFs on component mount
  useEffect(() => {
    loadPDFs();
  }, []);

  const loadPDFs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const pdfList = await PDFAnalysisApiService.listPDFs();
      // Ensure pdfList is an array and has the required URL field
      const validPDFs = Array.isArray(pdfList) 
        ? pdfList.filter(pdf => pdf.url) 
        : [];
      setPdfs(validPDFs);
    } catch (error) {
      console.error('Error loading PDFs:', error);
      setError('Failed to load PDFs');
      setPdfs([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Function to scroll to highlight in PDF


  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedPDF?.name || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Use Gemini-powered chat method
      const response = await PDFAnalysisApiService.chatWithPDFGemini(
        selectedPDF.name, 
        inputMessage, 
        messages
      );
      
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
        content: 'Sorry, I encountered an error while processing your message. Please make sure you have set up your Gemini API key and try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Simple Chat Header */}
      <header className="border-b bg-background flex-shrink-0">
        <div className="px-3 md:px-4 h-12 md:h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 md:gap-2 p-1 md:p-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-3 w-3 text-primary" />
              </div>
              <span className="font-medium text-sm md:text-base">PDF Chat</span>
              {selectedPDF && (
                <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">
                  • {selectedPDF.name.replace(/\.pdf$/i, '')}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground hidden md:inline">Powered by Gemini AI</div>
            {selectedPDF && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(selectedPDF.url, '_blank')}
                className="text-xs h-6 md:h-7 px-2 md:px-3"
              >
                View PDF
              </Button>
            )}
          </div>
        </div>
      </header>

      {error && (
        <div className="px-3 md:px-4 py-2 flex-shrink-0">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Chat Interface - Responsive Height */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar - PDF Selection */}
        <div className="w-64 md:w-80 border-r bg-muted/30 flex flex-col">
          <div className="p-3 md:p-4 border-b">
            <h3 className="font-medium mb-2 md:mb-3 text-sm md:text-base">Select PDF</h3>
            <div className="relative mb-2 md:mb-3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search PDFs..."
                className="pl-8 h-8 md:h-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPDFs}
              disabled={isLoading}
              className="w-full h-8 md:h-9 text-xs md:text-sm"
            >
              <RefreshCw className={`mr-2 h-3 w-3 md:h-4 md:w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center p-6 md:p-8">
                <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPDFs.length === 0 ? (
              <div className="p-3 md:p-4 text-center text-muted-foreground text-xs md:text-sm">
                {searchTerm ? 'No matching PDFs found' : 'No PDFs available'}
              </div>
            ) : (
              <div className="p-1 md:p-2">
                {filteredPDFs.map((pdf) => {
                  const displayName = pdf.name.replace(/\.pdf$/i, '');
                  return (
                    <div
                      key={pdf.name}
                      className={`p-2 md:p-3 rounded-lg cursor-pointer transition-colors mb-1 md:mb-2 ${
                        selectedPDF?.name === pdf.name 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedPDF(pdf)}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-medium truncate">{displayName}</p>
                          {pdf.size && (
                            <p className="text-xs opacity-70">
                              {formatFileSize(pdf.size)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Main Chat Area - Full Height */}
        <div className="flex-1 flex flex-col min-h-0">
          {!selectedPDF ? (
            <>
              {/* Welcome Screen */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Welcome to PDF Chat</p>
                  <p className="text-sm">Select a PDF from the sidebar to start chatting</p>
                </div>
              </div>
              
              {/* Input Area - Always Visible */}
              <div className="flex-shrink-0 border-t bg-background p-3 md:p-4 shadow-sm">
                <div className="max-w-4xl mx-auto w-full">
                  <div className="flex gap-2 md:gap-3">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Select a PDF first to start chatting..."
                        disabled={true}
                        className="pr-10 md:pr-12 py-2 md:py-3 rounded-full border-2 bg-muted/50 h-9 md:h-10"
                      />
                      <Button
                        disabled={true}
                        size="sm"
                        className="absolute right-1 top-1 rounded-full h-7 w-7 md:h-8 md:w-8 p-0 opacity-50"
                      >
                        <Send className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Chat Messages - Scrollable Area */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-3 md:p-4">
                  <div className="max-w-4xl mx-auto space-y-3 md:space-y-4 pb-2 md:pb-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-6 md:py-8">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 md:mb-4">
                          <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        </div>
                        <p className="text-base md:text-lg font-medium mb-2">Start a conversation</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Ask me anything about {selectedPDF.name.replace(/\.pdf$/i, '')}</p>
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-3 md:px-4 py-2 md:py-3 ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground ml-8 md:ml-12'
                                : 'bg-muted mr-8 md:mr-12'
                            }`}
                          >
                            <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-xs mt-1 md:mt-2 ${
                              message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-2xl px-3 md:px-4 py-2 md:py-3 mr-8 md:mr-12">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                            <span className="text-xs md:text-sm">Gemini is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Chat Input - Active State */}
              <div className="flex-shrink-0 border-t bg-background p-3 md:p-4 shadow-sm">
                <div className="max-w-4xl mx-auto w-full">
                  <div className="flex gap-2 md:gap-3">
                    <div className="flex-1 relative">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask something about this PDF..."
                        disabled={isLoading}
                        className="pr-10 md:pr-12 py-2 md:py-3 rounded-full border-2 bg-white dark:bg-gray-800 h-9 md:h-10 focus:border-primary"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        size="sm"
                        className="absolute right-1 top-1 rounded-full h-7 w-7 md:h-8 md:w-8 p-0"
                      >
                        <Send className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </div>
                    {messages.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={clearChat}
                        className="rounded-full h-9 md:h-10 px-3 md:px-4 text-xs md:text-sm"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
