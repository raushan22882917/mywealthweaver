
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowRight, 
  Mail, 
  MessageSquare, 
  Phone, 
  MapPin, 
  Clock, 
  Check, 
  Globe, 
  ShieldCheck
} from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

const Contact = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      console.log(values);
      
      toast.success("Your message has been sent! We'll get back to you soon.");
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-900/30 dark:to-purple-900/30"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-10"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              <span className="block">Get in Touch</span>
              <span className="block mt-2 text-gradient bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                We'd Love to Hear from You
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
              Have questions about our financial services or need assistance with your investments? Our team is here to help you navigate your financial journey.
            </p>
          </div>
        </div>
      </section>
      
      {/* Contact Form & Info Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Contact Info */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 md:p-12 text-white">
                <h2 className="text-3xl font-bold mb-8">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Office Location</h3>
                      <p className="mt-1 opacity-80">
                        123 Finance Street<br />
                        New York, NY 10001<br />
                        United States
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Phone</h3>
                      <p className="mt-1 opacity-80">+1 (555) 123-4567</p>
                      <p className="opacity-80">Mon-Fri: 9AM - 5PM EST</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Email</h3>
                      <p className="mt-1 opacity-80">support@intelligentinvestor.com</p>
                      <p className="opacity-80">We'll respond within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Business Hours</h3>
                      <p className="mt-1 opacity-80">
                        Monday - Friday: 9AM - 5PM<br />
                        Saturday: 10AM - 2PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12">
                  <h3 className="font-medium text-lg mb-4">Connect With Us</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                      </svg>
                    </a>
                    <a href="#" className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                      </svg>
                    </a>
                    <a href="#" className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                    <a href="#" className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="p-8 md:p-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Send Us a Message</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} className="dark:bg-gray-700" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="john.doe@example.com" {...field} className="dark:bg-gray-700" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="How can we help you?" {...field} className="dark:bg-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please provide details about your inquiry..." 
                              className="min-h-32 dark:bg-gray-700"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          Send Message <ArrowRight className="ml-2 h-5 w-5" />
                        </span>
                      )}
                    </Button>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 mr-1" />
                      Your information is securely encrypted
                    </p>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Visit Our Office</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              We'd love to meet you in person at our New York headquarters
            </p>
          </div>
          
          <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-lg">
            <iframe 
              className="w-full h-[500px] rounded-xl"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.6146485765966!2d-73.9910089!3d40.7410495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a3f81d549f%3A0xb2a39bb5cacc7da0!2s123%20W%2028th%20St%2C%20New%20York%2C%20NY%2010001!5e0!3m2!1sen!2sus!4v1656543800944!5m2!1sen!2sus" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Find answers to common questions about our services
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                What services do you provide?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                We offer comprehensive financial analysis, investment recommendations, dividend tracking, and personalized portfolio management services to help you make informed investment decisions.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                How do I get started with your platform?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Simply create an account on our platform, fill out your investment profile, and you'll gain immediate access to our basic features. For premium services, you can upgrade to one of our subscription plans.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                Are your investment recommendations personalized?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Yes, our recommendations are tailored to your specific financial goals, risk tolerance, and investment horizon. We use advanced algorithms and expert analysis to provide personalized advice.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                Can I schedule a consultation with a financial advisor?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Absolutely! Premium subscribers can schedule one-on-one consultations with our financial advisors. You can book an appointment through your account dashboard or by contacting our support team.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button 
              variant="outline" 
              className="px-6 py-3 text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20"
              onClick={() => navigate("/faq")}
            >
              View All FAQs
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Contact;
