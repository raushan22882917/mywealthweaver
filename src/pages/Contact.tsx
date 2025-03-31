
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Phone, MapPin, User, Send, ExternalLink, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sayHi, setSayHi] = useState(false);
  const [getQuote, setGetQuote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('stock_subscriptions')
        .insert({
          email: email,
          stock_symbol: `CONTACT_${sayHi ? 'HI' : ''}${getQuote ? '_QUOTE' : ''}`,
        });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });

      setName("");
      setEmail("");
      setMessage("");
      setSayHi(false);
      setGetQuote(false);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Get in Touch</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Have questions about our platform? Want to learn more about our services? 
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div>
            <div className="bg-[url('/airplane-bg.jpg')] bg-cover bg-center rounded-2xl h-[200px] mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-blue-900/80 rounded-2xl"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-3xl font-bold text-white">Contact Us</h2>
              </div>
            </div>

            <div className="grid gap-6">
              <Card className="p-6 bg-gray-900/60 backdrop-blur-sm border border-purple-900/20 hover:shadow-lg transition-shadow flex items-start gap-4">
                <div className="p-3 rounded-full bg-purple-900/50 text-purple-400">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-white">Email</h3>
                  <p className="text-gray-400 mb-2">Our friendly team is here to help.</p>
                  <a href="mailto:support@intelligentinvestor.com" className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium">
                    support@intelligentinvestor.com
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </Card>

              <Card className="p-6 bg-gray-900/60 backdrop-blur-sm border border-purple-900/20 hover:shadow-lg transition-shadow flex items-start gap-4">
                <div className="p-3 rounded-full bg-blue-900/50 text-blue-400">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-white">Phone</h3>
                  <p className="text-gray-400 mb-2">Mon-Fri from 8am to 5pm.</p>
                  <a href="tel:+15551234567" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium">
                    +1 (555) 123-4567
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </Card>

              <Card className="p-6 bg-gray-900/60 backdrop-blur-sm border border-purple-900/20 hover:shadow-lg transition-shadow flex items-start gap-4">
                <div className="p-3 rounded-full bg-pink-900/50 text-pink-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-white">Office</h3>
                  <p className="text-gray-400 mb-2">Come say hello at our office.</p>
                  <p className="text-pink-400 font-medium">
                    123 Market Street, San Francisco, CA 94105
                  </p>
                </div>
              </Card>
            </div>

            <div className="mt-12">
              <Card className="p-6 bg-gradient-to-br from-gray-900 to-purple-900/40 border border-purple-900/20">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck className="h-5 w-5 text-green-400" />
                  <h3 className="font-semibold text-white">Your data is safe with us</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  We're committed to protecting your personal information. 
                  Your contact details will never be shared with third parties without your permission.
                </p>
              </Card>
            </div>
          </div>

          <div>
            <Card className="p-8 bg-gray-900/60 backdrop-blur-sm border border-purple-900/20 shadow-2xl rounded-xl">
              <h3 className="text-2xl font-bold mb-6 text-white">Send us a message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      Your Name
                    </label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="John Doe"
                      className="bg-gray-800/60 border-gray-700 focus:border-purple-500 focus:ring-purple-500 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      Your Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="john@example.com"
                      className="bg-gray-800/60 border-gray-700 focus:border-purple-500 focus:ring-purple-500 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-300">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="How can we help you?"
                    className="min-h-[150px] bg-gray-800/60 border-gray-700 focus:border-purple-500 focus:ring-purple-500 text-white resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sayHi"
                      checked={sayHi}
                      onCheckedChange={(checked) => setSayHi(checked as boolean)}
                      className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    <label
                      htmlFor="sayHi"
                      className="text-sm font-medium text-gray-300 leading-none cursor-pointer"
                    >
                      Just saying hi
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="getQuote"
                      checked={getQuote}
                      onCheckedChange={(checked) => setGetQuote(checked as boolean)}
                      className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    <label
                      htmlFor="getQuote"
                      className="text-sm font-medium text-gray-300 leading-none cursor-pointer"
                    >
                      I'd like to get a quote
                    </label>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      <span>Send Message</span>
                    </div>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>

        <div className="mt-20 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-white">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                question: "What services does Intelligent Investor offer?",
                answer: "Intelligent Investor offers comprehensive stock analysis, dividend tracking, market data visualization, and personalized investment recommendations."
              },
              {
                question: "How accurate is your dividend data?",
                answer: "Our dividend data is updated multiple times daily from reliable financial sources to ensure accuracy. We track historical patterns and provide forward-looking projections."
              },
              {
                question: "Do you offer a free trial?",
                answer: "Yes, we offer a 14-day free trial that gives you access to all our premium features. No credit card required to sign up."
              },
              {
                question: "How can I get support if I have a problem?",
                answer: "You can reach our support team via email or phone. We also offer live chat support during business hours and maintain an extensive knowledge base."
              }
            ].map((faq, index) => (
              <Card key={index} className="p-6 bg-gray-900/60 backdrop-blur-sm border border-purple-900/20 hover:shadow-xl transition-shadow">
                <h3 className="font-bold text-lg mb-3 text-white">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
