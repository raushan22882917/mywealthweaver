import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, HelpCircle, ChevronRight } from "lucide-react";

interface FAQQuestion {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  questions: FAQQuestion[];
}

interface FAQData {
  categories: FAQCategory[];
}

const HelpSupport = () => {
  const [faqData, setFaqData] = useState<FAQData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch('/faq-data.json')
      .then(response => response.json())
      .then((data: FAQData) => {
        setFaqData(data);
        if (data.categories.length > 0) {
          setActiveCategory(data.categories[0].id);
        }
      })
      .catch(error => console.error('Error loading FAQ data:', error));
  }, []);

  const filteredCategories = faqData?.categories?.map(category => ({
    ...category,
    questions: category.questions.filter(
      question =>
        question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117]">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
              <HelpCircle className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Help Center
              </h1>
              <p className="text-gray-400 text-xl mt-3">Find answers to frequently asked questions</p>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-6 text-lg bg-[#1a1f2e] border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 rounded-xl shadow-lg"
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-[#1a1f2e]/80 backdrop-blur-sm border-gray-700/50 sticky top-4 rounded-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-xl font-semibold">
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {faqData?.categories?.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                      activeCategory === category.id
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{category.title}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {category.questions.length} questions
                      </div>
                    </div>
                    <ChevronRight className={`h-5 w-5 transition-transform duration-200 ${
                      activeCategory === category.id ? 'rotate-90 text-white' : 'text-gray-400 group-hover:text-white'
                    }`} />
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <Card className="bg-[#1a1f2e]/80 backdrop-blur-sm border-gray-700/50 rounded-xl shadow-xl">
              <CardContent className="p-6">
                {filteredCategories.length > 0 ? (
                  <div className="space-y-8">
                    {filteredCategories
                      .filter(category => !activeCategory || category.id === activeCategory)
                      .map((category) => (
                        <div key={category.id} className="animate-fadeIn">
                          <div className="flex items-center gap-3 mb-6">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                              {category.title}
                            </h3>
                            <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full">
                              {category.questions.length} questions
                            </Badge>
                          </div>
                          
                          <Accordion type="single" collapsible className="space-y-4">
                            {category.questions.map((question) => (
                              <AccordionItem 
                                key={question.id} 
                                value={question.id}
                                className="bg-gray-800/30 rounded-xl border border-gray-700/50 px-6 transition-all duration-200 hover:border-blue-500/30"
                              >
                                <AccordionTrigger className="text-white hover:text-blue-400 text-left py-4">
                                  <span className="text-lg font-medium">{question.question}</span>
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-300 pb-6 text-base leading-relaxed">
                                  {question.answer}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Search className="h-16 w-16 text-gray-500 mx-auto mb-6 opacity-50" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-3">No results found</h3>
                    <p className="text-gray-500">Try different keywords or browse categories</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default HelpSupport;
