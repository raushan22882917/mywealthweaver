
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, HelpCircle, Mail, Phone, MessageSquare, Clock, Users } from "lucide-react";

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
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Help & Support
              </h1>
              <p className="text-gray-400 text-lg mt-2">Find answers to your questions and get the help you need</p>
            </div>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#242938] border-gray-700/50 hover:border-blue-500/30 transition-all">
            <CardHeader className="text-center">
              <Mail className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <CardTitle className="text-white">Email Support</CardTitle>
              <CardDescription className="text-gray-400">Get help via email</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-blue-400 font-medium">support@intelligentinvestor.com</p>
              <p className="text-sm text-gray-400 mt-2">Response within 24 hours</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#242938] border-gray-700/50 hover:border-green-500/30 transition-all">
            <CardHeader className="text-center">
              <MessageSquare className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <CardTitle className="text-white">Live Chat</CardTitle>
              <CardDescription className="text-gray-400">Chat with our team</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Start Chat
              </Button>
              <p className="text-sm text-gray-400 mt-2">Available 9 AM - 6 PM EST</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#242938] border-gray-700/50 hover:border-purple-500/30 transition-all">
            <CardHeader className="text-center">
              <Phone className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <CardTitle className="text-white">Phone Support</CardTitle>
              <CardDescription className="text-gray-400">Call us directly</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-purple-400 font-medium">+1 (555) 123-4567</p>
              <p className="text-sm text-gray-400 mt-2">Monday - Friday, 9 AM - 6 PM EST</p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#242938] border-gray-700/50 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {faqData?.categories?.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      activeCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="font-medium text-sm">{category.title}</div>
                    <div className="text-xs opacity-75">
                      {category.questions.length} questions
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#242938] border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search FAQ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-[#242938] border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {filteredCategories.length > 0 ? (
                  <div className="space-y-6">
                    {filteredCategories
                      .filter(category => !activeCategory || category.id === activeCategory)
                      .map((category) => (
                        <div key={category.id}>
                          <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-xl font-semibold text-white">{category.title}</h3>
                            <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                              {category.questions.length} questions
                            </Badge>
                          </div>
                          
                          <Accordion type="single" collapsible className="space-y-2">
                            {category.questions.map((question) => (
                              <AccordionItem 
                                key={question.id} 
                                value={question.id}
                                className="bg-gray-800/30 rounded-lg border border-gray-700/50 px-4"
                              >
                                <AccordionTrigger className="text-white hover:text-blue-400 text-left">
                                  {question.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-300 pb-4">
                                  {question.answer}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No results found</h3>
                    <p className="text-gray-500">Try adjusting your search terms</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-white/10">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-2xl">Still need help?</CardTitle>
              <CardDescription className="text-gray-300">
                Our support team is here to assist you with any questions or issues
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  <Clock className="h-4 w-4 mr-2" />
                  Check Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default HelpSupport;
