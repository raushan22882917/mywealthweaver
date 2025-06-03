import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Search, 
  ThumbsUp, 
  ThumbsDown, 
  Bookmark, 
  Share2, 
  Eye, 
  Clock, 
  BookOpen, 
  Download,
  Copy,
  CheckCircle,
  Star,
  Users,
  TrendingUp,
  Menu,
  X
} from "lucide-react";
import educationTopics from '../../public/education/topics.json';

interface SectionInteraction {
  id: string;
  likes: number;
  dislikes: number;
  views: number;
  isLiked: boolean;
  isDisliked: boolean;
  isBookmarked: boolean;
}

const Education = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedTopic, setSelectedTopic] = useState<string>(educationTopics[0]?.title || '');
  const [selectedSection, setSelectedSection] = useState<any>(educationTopics[0]?.sections[0] || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [interactions, setInteractions] = useState<Record<string, SectionInteraction>>({});
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Initialize interactions for sections
  useEffect(() => {
    const initialInteractions: Record<string, SectionInteraction> = {};
    educationTopics.forEach(topic => {
      topic.sections?.forEach(section => {
        initialInteractions[section.title] = {
          id: section.title,
          likes: Math.floor(Math.random() * 50) + 10,
          dislikes: Math.floor(Math.random() * 5) + 1,
          views: Math.floor(Math.random() * 200) + 50,
          isLiked: false,
          isDisliked: false,
          isBookmarked: false
        };
      });
    });
    setInteractions(initialInteractions);
  }, []);

  // Set default selection when component mounts
  useEffect(() => {
    if (educationTopics.length > 0) {
      setSelectedTopic(educationTopics[0].title);
      if (educationTopics[0].sections?.length > 0) {
        setSelectedSection(educationTopics[0].sections[0]);
      }
    }
  }, []);

  const handleLike = (sectionTitle: string) => {
    setInteractions(prev => ({
      ...prev,
      [sectionTitle]: {
        ...prev[sectionTitle],
        isLiked: !prev[sectionTitle].isLiked,
        isDisliked: false,
        likes: prev[sectionTitle].isLiked 
          ? prev[sectionTitle].likes - 1 
          : prev[sectionTitle].likes + 1
      }
    }));
    
    toast({
      title: interactions[sectionTitle]?.isLiked ? "Like removed" : "Liked!",
      description: interactions[sectionTitle]?.isLiked 
        ? "You removed your like from this section" 
        : "Thank you for your feedback!",
    });
  };

  const handleDislike = (sectionTitle: string) => {
    setInteractions(prev => ({
      ...prev,
      [sectionTitle]: {
        ...prev[sectionTitle],
        isDisliked: !prev[sectionTitle].isDisliked,
        isLiked: false,
        dislikes: prev[sectionTitle].isDisliked 
          ? prev[sectionTitle].dislikes - 1 
          : prev[sectionTitle].dislikes + 1
      }
    }));

    toast({
      title: interactions[sectionTitle]?.isDisliked ? "Dislike removed" : "Feedback received",
      description: interactions[sectionTitle]?.isDisliked 
        ? "You removed your dislike from this section" 
        : "We'll work on improving this content",
    });
  };

  const handleBookmark = (sectionTitle: string) => {
    setInteractions(prev => ({
      ...prev,
      [sectionTitle]: {
        ...prev[sectionTitle],
        isBookmarked: !prev[sectionTitle].isBookmarked
      }
    }));

    toast({
      title: interactions[sectionTitle]?.isBookmarked ? "Bookmark removed" : "Bookmarked!",
      description: interactions[sectionTitle]?.isBookmarked 
        ? "Removed from your bookmarks" 
        : "Added to your bookmarks for later reading",
    });
  };

  const handleShare = (sectionTitle: string) => {
    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${sectionTitle}`);
    toast({
      title: "Link copied!",
      description: "Section link has been copied to clipboard",
    });
  };

  const handleDownload = (sectionTitle: string) => {
    toast({
      title: "Download started",
      description: "PDF version of this section is being prepared",
    });
  };

  // Function to render Python code block
  const renderPythonProgram = (pythonData: any) => {
    return (
      <div className="bg-gray-900 rounded-lg p-4 sm:p-6 my-4">
        {/* Libraries and Installation */}
        <div className="mb-4">
          <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">Required Libraries:</h4>
          <div className="bg-gray-800 p-2 rounded overflow-x-auto">
            <code className="text-green-400 text-xs sm:text-sm">
              {pythonData.libraries.join(", ")}
            </code>
          </div>
          <div className="mt-2 bg-gray-800 p-2 rounded overflow-x-auto">
            <code className="text-yellow-400 text-xs sm:text-sm">
              {pythonData.install_command}
            </code>
          </div>
        </div>

        {/* Python Code */}
        <div className="mb-4">
          <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">Code:</h4>
          <pre className="bg-gray-800 p-3 sm:p-4 rounded overflow-x-auto">
            <code className="text-blue-400 whitespace-pre text-xs sm:text-sm">
              {pythonData.code}
            </code>
          </pre>
        </div>

        {/* Explanation */}
        {pythonData.explanation && (
          <div className="text-white">
            <h4 className="font-semibold mb-2 text-sm sm:text-base">Explanation:</h4>
            <ul className="list-disc pl-4 space-y-2">
              {Object.entries(pythonData.explanation).map(([key, value]: [string, any]) => (
                <li key={key} className="text-gray-300 text-xs sm:text-sm">
                  <span className="font-medium text-white">
                    {key.replace(/_/g, ' ').toUpperCase()}: 
                  </span>
                  {typeof value === 'string' ? value : (
                    Array.isArray(value) && (
                      <div className="mt-2 overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr>
                              {Object.keys(value[0]).map(header => (
                                <th key={header} className="text-left p-1 sm:p-2 bg-gray-800">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {value.map((item: any, index: number) => (
                              <tr key={index}>
                                {Object.values(item).map((cell: any, cellIndex: number) => (
                                  <td key={cellIndex} className="p-1 sm:p-2 border-t border-gray-700">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderContent = (content: any) => {
    if (typeof content === 'string') {
      return <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">{content}</p>;
    }
    
    if (Array.isArray(content)) {
      return content.map((item, index) => (
        <div key={index} className="mb-4 sm:mb-6">
          {item.note && <h4 className="font-semibold mb-2 sm:mb-3 text-base sm:text-lg">{item.note}</h4>}
          {item.explanation && <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{item.explanation}</p>}
          {item.metric && (
            <div className="mb-4">
              <h4 className="font-semibold text-base sm:text-lg">{item.metric}</h4>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{item.definition}</p>
              {item.formula && (
                <div className="bg-black p-3 sm:p-4 rounded-lg my-3 font-mono text-white font-bold border-l-4 border-blue-500 text-xs sm:text-sm overflow-x-auto">
                  {item.formula}
                </div>
              )}
              {item.interpretation && (
                <p className="text-gray-600 mt-3 leading-relaxed text-sm sm:text-base">{item.interpretation}</p>
              )}
            </div>
          )}
        </div>
      ));
    }
    
    return null;
  };

  const filteredTopics = educationTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.sections?.some(section =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const currentInteraction = selectedSection ? interactions[selectedSection.title] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117]">
      <Navbar />

      <main className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 sm:p-3 rounded-xl shadow-lg">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Investment Education Hub
              </h1>
              <p className="text-gray-400 text-sm sm:text-lg mt-1 sm:mt-2">Master the fundamentals of smart investing</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-6 sm:mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search topics and lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#1a1f2e] border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Mobile Menu Toggle */}
        {isMobile && (
          <div className="mb-4">
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {sidebarOpen ? <X className="h-4 w-4 mr-2" /> : <Menu className="h-4 w-4 mr-2" />}
              {sidebarOpen ? 'Hide Topics' : 'Show Topics'}
            </Button>
          </div>
        )}

        <div className={`grid gap-4 sm:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}>
          {/* Left Sidebar */}
          <div className={`${isMobile ? (sidebarOpen ? 'block' : 'hidden') : 'col-span-4'}`}>
            <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#242938] border-gray-700/50 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                  Course Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {educationTopics.map((topic) => (
                  <div key={topic.title} className="mb-3 sm:mb-4">
                    <button
                      onClick={() => {
                        setSelectedTopic(topic.title);
                        setSelectedSection(topic.sections?.[0] || null);
                        if (isMobile) setSidebarOpen(false);
                      }}
                      className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
                        selectedTopic === topic.title 
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                          : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{topic.title}</span>
                        <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 ml-2 text-xs">
                          {topic.sections?.length || 0}
                        </Badge>
                      </div>
                    </button>
                    
                    {selectedTopic === topic.title && topic.sections && (
                      <div className="ml-2 sm:ml-4 mt-2 sm:mt-3 space-y-1">
                        {topic.sections.map((section: any) => (
                          <button
                            key={section.title}
                            onClick={() => {
                              setSelectedSection(section);
                              if (isMobile) setSidebarOpen(false);
                            }}
                            className={`w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md transition-all ${
                              selectedSection?.title === section.title 
                                ? "bg-blue-600/20 text-blue-300 border-l-2 border-blue-500" 
                                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3" />
                              <span className="truncate">{section.title}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Content Area */}
          <div className={`${isMobile ? 'col-span-1' : 'col-span-8'}`}>
            <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#242938] border-gray-700/50">
              {selectedSection ? (
                <div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg sm:text-2xl mb-2">{selectedSection.title}</CardTitle>
                        
                        {/* Section Stats */}
                        {currentInteraction && (
                          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-4 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              {currentInteraction.views} views
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                              5 min read
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                              Beginner Level
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      {currentInteraction && (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(selectedSection.title)}
                            className="text-gray-400 hover:text-white p-1 sm:p-2"
                          >
                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(selectedSection.title)}
                            className="text-gray-400 hover:text-white p-1 sm:p-2"
                          >
                            <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="px-4 sm:px-6">
                    {renderContent(selectedSection.content)}
                    
                    {selectedSection.subtopics && (
                      <div className="space-y-6 sm:space-y-8">
                        {selectedSection.subtopics.map((subtopic: any, index: number) => (
                          <div key={index} className="border-b border-gray-700/50 pb-6 sm:pb-8 last:border-0">
                            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">{subtopic.title}</h3>
                            {renderContent(subtopic.content)}
                            
                            {subtopic.formula && (
                              <div className="bg-black p-3 sm:p-4 rounded-lg mb-4 font-mono text-green-400 font-bold border-l-4 border-green-500 text-xs sm:text-sm overflow-x-auto">
                                {subtopic.formula}
                              </div>
                            )}
                            
                            {subtopic.example && (
                              <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 p-3 sm:p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
                                <div className="flex items-center gap-2 mb-2">
                                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                                  <span className="font-medium text-white text-sm sm:text-base">Example:</span>
                                </div>
                                <p className="text-yellow-100 text-xs sm:text-sm">{subtopic.example}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedSection.python_program && renderPythonProgram(selectedSection.python_program)}
                    
                    <Separator className="my-4 sm:my-6 bg-gray-700/50" />
                    
                    {/* Interaction Section */}
                    {currentInteraction && (
                      <div className="bg-gray-800/30 rounded-lg p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-white font-semibold text-sm sm:text-base">Was this helpful?</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBookmark(selectedSection.title)}
                            className={`text-xs sm:text-sm ${
                              currentInteraction.isBookmarked 
                                ? 'text-yellow-400 hover:text-yellow-300' 
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            <Bookmark className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${currentInteraction.isBookmarked ? 'fill-current' : ''}`} />
                            {currentInteraction.isBookmarked ? 'Bookmarked' : 'Bookmark'}
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(selectedSection.title)}
                            className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                              currentInteraction.isLiked 
                                ? 'text-green-400 hover:text-green-300' 
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            <ThumbsUp className={`h-3 w-3 sm:h-4 sm:w-4 ${currentInteraction.isLiked ? 'fill-current' : ''}`} />
                            {currentInteraction.likes}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDislike(selectedSection.title)}
                            className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                              currentInteraction.isDisliked 
                                ? 'text-red-400 hover:text-red-300' 
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            <ThumbsDown className={`h-3 w-3 sm:h-4 sm:w-4 ${currentInteraction.isDisliked ? 'fill-current' : ''}`} />
                            {currentInteraction.dislikes}
                          </Button>
                          
                          <div className="ml-auto text-xs sm:text-sm text-gray-400">
                            {currentInteraction.views} people found this helpful
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>
              ) : (
                <CardContent className="text-center py-8 sm:py-12">
                  <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-400 mb-2">Select a topic to begin learning</h3>
                  <p className="text-gray-500 text-sm sm:text-base">Choose from our comprehensive curriculum designed for all skill levels</p>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Education;
