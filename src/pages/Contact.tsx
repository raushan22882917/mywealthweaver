
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  Send, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  MessageSquare, 
  Users, 
  HelpCircle, 
  DollarSign 
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, topic: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSuccess(true);
      
      toast({
        title: "Message sent!",
        description: "We've received your message and will respond shortly.",
      });
      
      // Reset form after a delay
      setTimeout(() => {
        setFormSuccess(false);
        setFormData({
          name: "",
          email: "",
          topic: "",
          message: "",
        });
      }, 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-800 dark:from-blue-900 dark:to-indigo-950">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="absolute h-full w-full bg-gradient-to-b from-blue-600/20 via-transparent to-blue-600/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              We're Here to <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-pink-200 to-yellow-200">Help You</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Our team is just a message away. Reach out with any questions, feedback, or concerns.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button 
                className="bg-white text-blue-700 hover:bg-blue-50 gap-2 px-6 py-5 rounded-xl font-medium" 
                onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <MessageSquare size={18} />
                Send a Message
              </Button>
              <Button 
                variant="outline" 
                className="border-blue-200 text-white hover:bg-white/10 gap-2 px-6 py-5 rounded-xl font-medium" 
                onClick={() => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <HelpCircle size={18} />
                View FAQs
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent"></div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Info Column */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Reach out to our team for any questions about our dividend tracking platform or premium services.
            </p>
            
            <div className="space-y-6 mt-10">
              <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="flex items-start p-6">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-4 flex-shrink-0">
                      <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Our Office</h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">
                        123 Market Street<br />
                        San Francisco, CA 94105<br />
                        United States
                      </p>
                    </div>
                  </div>
                  <div className="h-48 w-full bg-gray-200 dark:bg-gray-800">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.1080023149256!2d-122.39758482348159!3d37.79092841927704!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085806285ddb307%3A0xad0ce57f1ff6844a!2sSan%20Francisco%2C%20CA%2094105!5e0!3m2!1sen!2sus!4v1685926545396!5m2!1sen!2sus"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-4 flex-shrink-0">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Email Us</h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">
                        <a href="mailto:support@dividendtrack.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                          support@dividendtrack.com
                        </a>
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">
                        <a href="mailto:info@dividendtrack.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                          info@dividendtrack.com
                        </a>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-4 flex-shrink-0">
                      <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Call Us</h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">
                        <a href="tel:+15551234567" className="text-blue-600 dark:text-blue-400 hover:underline">
                          +1 (555) 123-4567
                        </a>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Monday to Friday, 9am - 5pm PST
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-4 flex-shrink-0">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Business Hours</h3>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Monday - Friday:</span>
                          <span className="text-gray-900 dark:text-white">9:00 AM - 5:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Saturday:</span>
                          <span className="text-gray-900 dark:text-white">10:00 AM - 2:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Sunday:</span>
                          <span className="text-gray-900 dark:text-white">Closed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Contact Form Column */}
          <div className="lg:col-span-2" id="contact-form">
            <Card className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="p-8 pb-0">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Get in Touch</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>
              
              <CardContent>
                {formSuccess ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 flex items-center">
                    <CheckCircle className="h-10 w-10 text-green-500 mr-4" />
                    <div>
                      <h3 className="text-lg font-medium text-green-800 dark:text-green-300">Message Sent Successfully!</h3>
                      <p className="text-green-600 dark:text-green-400">
                        Thank you for reaching out. We'll respond to your inquiry shortly.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Your Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="topic" className="text-gray-700 dark:text-gray-300">How can we help?</Label>
                      <Select value={formData.topic} onValueChange={handleSelectChange}>
                        <SelectTrigger id="topic" className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                          <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-gray-700 dark:text-gray-300">Your Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Please provide details about your inquiry..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="min-h-[150px] w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-medium"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mt-20" id="faq-section">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
              Find quick answers to common questions about our dividend tracking platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  How do I create an account?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Simply click the "Sign Up" button in the top right corner of our homepage. Fill in your email address and create a password to get started.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Is there a free trial available?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes! We offer a 14-day free trial for all new users to explore our premium features without any commitment.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  How accurate is your dividend data?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our data is sourced from reliable financial providers and updated multiple times daily to ensure you have the most accurate information for your investment decisions.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                  <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  How can I get technical support?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  You can reach our support team via email at support@dividendtrack.com or by using the contact form on this page. We aim to respond within 24 hours.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Is my financial data secure?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Absolutely. We use industry-standard encryption and security measures to protect your data. We never share your personal information with third parties.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                  <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  How do I cancel my subscription?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Didn't find an answer to your question?
            </p>
            <Button
              onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
              variant="link"
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Contact our support team
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;
