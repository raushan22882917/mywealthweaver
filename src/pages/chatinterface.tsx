import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Download, FileText, History, MessageSquare, User, Bot, Trash2, Upload, X, Search, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PDFService, PDFDocument } from '@/services/pdfService';
import { ChatHistoryService, ChatMessage, ChatHistoryRecord } from '@/services/chatHistoryService';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. How can I help you today? You can search for stock symbols to find related PDF documents, or upload your own PDFs for analysis.',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryRecord[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [pdfSearchTerm, setPdfSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<PDFDocument[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPDF, setCurrentPDF] = useState<PDFDocument | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize authentication and data on component mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
        
        // Initialize PDF bucket
        await PDFService.initializeBucket();
        
        // Load chat history if authenticated
        if (user) {
          const history = await ChatHistoryService.getUserChatHistory();
          setChatHistory(history);
        }
      } catch (error) {
        console.error('Failed to initialize:', error);
      }
    };
    initialize();
  }, []);

  // Save chat messages to database when they change
  useEffect(() => {
    const saveChatToDatabase = async () => {
      if (!isAuthenticated || messages.length <= 1) return; // Skip initial message
      
      try {
        const symbol = extractSymbolFromMessages(messages);
        const chatTitle = generateChatTitle(messages);
        
        if (currentChatId) {
          // Update existing chat
          await ChatHistoryService.updateChatHistory(currentChatId, messages, chatTitle);
        } else {
          // Create new chat
          const savedChat = await ChatHistoryService.saveChatHistory(
            chatTitle,
            messages,
            symbol,
            currentPDF?.id
          );
          setCurrentChatId(savedChat.id);
          
          // Refresh history list
          const history = await ChatHistoryService.getUserChatHistory();
          setChatHistory(history);
        }
      } catch (error) {
        console.error('Error saving chat:', error);
      }
    };
    
    saveChatToDatabase();
  }, [messages, isAuthenticated, currentChatId, currentPDF?.id]);

  // Helper functions
  const extractSymbolFromMessages = (msgs: Message[]): string | undefined => {
    for (const msg of msgs) {
      if (msg.role === 'user') {
        const symbolMatch = msg.content.match(/\b[A-Z]{1,5}\b/g);
        if (symbolMatch && symbolMatch.length > 0) {
          return symbolMatch[0];
        }
      }
    }
    return undefined;
  };

  const generateChatTitle = (msgs: Message[]): string => {
    const userMessages = msgs.filter(m => m.role === 'user');
    if (userMessages.length > 0) {
      const firstMessage = userMessages[0].content;
      return firstMessage.length > 50 
        ? firstMessage.substring(0, 50) + '...' 
        : firstMessage;
    }
    return 'New Chat';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedFile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Check if the message contains a stock symbol pattern
      const symbolMatch = currentInput.match(/\b[A-Z]{1,5}\b/g);
      if (symbolMatch && symbolMatch.length > 0) {
        // Search for PDFs related to the symbol
        const symbol = symbolMatch[0];
        const pdfs = await PDFService.searchPDFsBySymbol(symbol);
        
        if (pdfs.length > 0) {
          // Set the PDF for preview
          setSearchResults(pdfs);
          setCurrentPDF(pdfs[0]);
          setPdfPreview(PDFService.getPDFPublicURL(pdfs[0].file_path));
          
          // Analyze PDF with backend
          await analyzePDFWithBackend(pdfs[0], currentInput);
        } else {
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: `I couldn't find any PDF documents for ${symbol} in our database. You can upload a PDF document related to this symbol if you'd like me to analyze it.`,
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiResponse]);
        }
      } else if (currentPDF) {
        // If there's a current PDF and no symbol search, analyze the current PDF
        await analyzePDFWithBackend(currentPDF, currentInput);
      } else {
        // Regular AI response without PDF analysis
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: generateAIResponse(currentInput),
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I encountered an error while processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzePDFWithBackend = async (pdf: PDFDocument, userQuery: string) => {
    try {
      // First show that we found the PDF
      const foundPDFMessage: Message = {
        id: Date.now().toString(),
        content: `Found PDF: ${pdf.file_name} for ${pdf.symbol}. Analyzing the document...`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, foundPDFMessage]);

      // Get the PDF download URL
      const downloadUrl = await PDFService.getPDFDownloadURL(pdf.file_path);
      
      // Send PDF to backend for analysis
      const response = await fetch('http://127.0.0.1:8000/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdf_url: downloadUrl,
          query: userQuery,
          symbol: pdf.symbol,
          company_name: pdf.company_name
        })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const analysisResult = await response.json();
      
      // Display the analysis result
      const analysisMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: analysisResult.analysis || analysisResult.response || 'Analysis completed successfully.',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, analysisMessage]);

    } catch (error) {
      console.error('Error analyzing PDF:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I encountered an error while analyzing the PDF document. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please ensure the backend service is running at http://127.0.0.1:8000/pdf`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      "I understand your question about that. Let me provide you with a comprehensive analysis...",
      "That's an interesting point. Based on current market data, I would suggest...",
      "Great question! Here's what the latest financial indicators are showing...",
      "I can help you with that. Let me break down the key factors to consider...",
      "Based on my analysis of the market trends, here's what I recommend..."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPdfPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPdfPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const createNewChat = () => {
    setMessages([{
      id: '1',
      content: 'Hello! I\'m your AI assistant. How can I help you today? You can search for stock symbols to find related PDF documents, or upload your own PDFs for analysis.',
      role: 'assistant',
      timestamp: new Date()
    }]);
    setInputValue('');
    setSelectedFile(null);
    setPdfPreview(null);
    setSearchResults([]);
    setCurrentPDF(null);
    setCurrentChatId(null);
  };

  const loadChat = async (chatId: string) => {
    try {
      const chat = await ChatHistoryService.getChatById(chatId);
      if (chat) {
        setMessages(chat.messages);
        setCurrentChatId(chat.id);
        
        // If chat has associated PDF, load it
        if (chat.pdf_document_id) {
          const pdf = await PDFService.getPDFById(chat.pdf_document_id);
          if (pdf) {
            setCurrentPDF(pdf);
            setPdfPreview(PDFService.getPDFPublicURL(pdf.file_path));
          }
        }
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      await ChatHistoryService.deleteChatHistory(chatId);
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
      
      // If this was the current chat, create a new one
      if (currentChatId === chatId) {
        createNewChat();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const handlePDFSearch = async () => {
    if (!pdfSearchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await PDFService.searchPDFsBySymbol(pdfSearchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching PDFs:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePDFSelect = async (pdf: PDFDocument) => {
    setCurrentPDF(pdf);
    setPdfPreview(PDFService.getPDFPublicURL(pdf.file_path));
    
    // Add a message about the selected PDF
    const selectMessage: Message = {
      id: Date.now().toString(),
      content: `Selected PDF: ${pdf.file_name} (${pdf.symbol}). You can now ask questions about this document.`,
      role: 'assistant',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, selectMessage]);
  };

  const handlePDFUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Extract symbol from filename or prompt user
      const symbol = prompt('Please enter the stock symbol for this PDF:')?.toUpperCase();
      if (!symbol) {
        alert('Please provide a stock symbol');
        return;
      }
      
      const companyName = prompt('Please enter the company name:') || 'Unknown Company';
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      const uploadedPDF = await PDFService.uploadPDF(selectedFile, symbol, companyName);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Add success message
      const successMessage: Message = {
        id: Date.now().toString(),
        content: `Successfully uploaded PDF for ${symbol} (${companyName}). The document is now available for analysis.`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMessage]);
      
      // Clear the file
      removeFile();
      
      // Update search results
      const updatedResults = await PDFService.searchPDFsBySymbol(symbol);
      setSearchResults(updatedResults);
      
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Failed to upload PDF. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
     
      <div className="flex h-[calc(100vh-4rem-200px)]">
        {/* Left Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* New Chat Button */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Button 
              onClick={createNewChat}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="history" className="flex-1 flex flex-col">
            <div className="px-4 pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="pdf" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  PDF Preview
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="history" className="flex-1 p-4">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {chatHistory.map((chat) => (
                    <Card 
                      key={chat.id} 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => loadChat(chat.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                              {chat.chat_title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                              {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content.substring(0, 50) + '...' : 'No messages'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-400">
                                {formatDate(new Date(chat.updated_at))}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {chat.messages.length} messages
                              </Badge>
                              {chat.symbol && (
                                <Badge variant="outline" className="text-xs">
                                  {chat.symbol}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(chat.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="pdf" className="flex-1 overflow-hidden flex flex-col">
              <div className="p-4 space-y-4">
                {/* PDF Search */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search PDFs by symbol (e.g., AAPL)"
                      value={pdfSearchTerm}
                      onChange={(e) => setPdfSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handlePDFSearch()}
                    />
                    <Button onClick={handlePDFSearch} disabled={isSearching}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Found PDFs:</h4>
                    {searchResults.map((pdf) => (
                      <Card 
                        key={pdf.id} 
                        className={`cursor-pointer transition-colors ${
                          currentPDF?.id === pdf.id ? 'bg-blue-50 dark:bg-blue-900 border-blue-200' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => handlePDFSelect(pdf)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-medium truncate">{pdf.file_name}</h5>
                              <p className="text-xs text-gray-500">{pdf.symbol} - {pdf.company_name}</p>
                              <p className="text-xs text-gray-400">{formatFileSize(pdf.file_size)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Current PDF Preview */}
                {pdfPreview ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Current PDF: {currentPDF?.file_name}
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (currentPDF) {
                            window.open(pdfPreview, '_blank');
                          }
                        }}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="border rounded-lg overflow-hidden bg-white">
                      <iframe
                        src={pdfPreview}
                        className="w-full h-64"
                        title="PDF Preview"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Search for a symbol to find related PDFs</p>
                    <p className="text-xs mt-1">or upload a new PDF to get started</p>
                  </div>
                )}
              </div>
              
              {/* PDF Preview Section */}
              <div className="flex-1 overflow-auto p-4 pt-0">

                {/* PDF Preview */}
                {pdfPreview && (
                  <Card className="h-full flex flex-col">
                    <CardHeader className="p-4 border-b">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span className="truncate">
                          {currentPDF?.file_name || 'PDF Preview'}
                        </span>
                        {currentPDF && (
                          <div className="flex items-center gap-2 ml-2">
                            <Badge variant="outline" className="text-xs">
                              {currentPDF.symbol}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setPdfPreview(null);
                                setCurrentPDF(null);
                              }}
                              className="text-gray-400 hover:text-red-500 h-6 w-6 p-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0">
                      <div className="h-full flex flex-col">
                        <div className="flex-1 overflow-auto">
                          <iframe
                            src={pdfPreview}
                            className="w-full h-full min-h-[500px]"
                            title="PDF Preview"
                          />
                        </div>
                        {currentPDF && (
                          <div className="p-3 border-t flex items-center justify-between text-xs text-gray-500 bg-gray-50 dark:bg-gray-800">
                            <span className="truncate max-w-[60%]" title={currentPDF.file_name}>
                              {currentPDF.file_name}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-400">{formatFileSize(currentPDF.file_size)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                                onClick={() => window.open(PDFService.getPDFPublicURL(currentPDF.file_path), '_blank')}
                                title="Open in new tab"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
          {/* Chat Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    AI Assistant
                  </h1>
                  <Badge variant="secondary" className="text-xs">
                    Online
                  </Badge>
                </div>
                
                {/* PDF Search and Upload Buttons */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Input
                      placeholder="Search PDFs..."
                      value={pdfSearchTerm}
                      onChange={(e) => setPdfSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePDFSearch()}
                      className="w-48 h-8 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={handlePDFSearch}
                      disabled={!pdfSearchTerm.trim() || isSearching}
                    >
                      {isSearching ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Search className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="h-8 text-xs"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Upload PDF
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/10 p-2 rounded-md">
                  <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 mb-1">
                    <span>Found {searchResults.length} document{searchResults.length !== 1 ? 's' : ''}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchResults([])}
                      className="h-5 w-5 p-0 text-blue-500 hover:text-blue-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {searchResults.slice(0, 3).map((pdf) => (
                      <Badge
                        key={pdf.id}
                        variant={currentPDF?.id === pdf.id ? 'default' : 'outline'}
                        className="text-xs cursor-pointer flex items-center gap-1"
                        onClick={() => handlePDFSelect(pdf)}
                      >
                        {pdf.symbol}
                        <Badge variant="secondary" className="text-[10px] h-4 px-1">
                          {pdf.document_type}
                        </Badge>
                      </Badge>
                    ))}
                    {searchResults.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{searchResults.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/logo.png" />
                      <AvatarFallback className="bg-blue-600 text-white">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gray-600 text-white">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/logo.png" />
                    <AvatarFallback className="bg-blue-600 text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="max-w-4xl mx-auto">
              {/* File Upload Preview */}
              {selectedFile && (
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {selectedFile.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message here..."
                    className="min-h-[44px] max-h-32 resize-none pr-12"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={(!inputValue.trim() && !selectedFile) || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ChatInterface;
