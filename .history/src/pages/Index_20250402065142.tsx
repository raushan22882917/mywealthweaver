
import Navbar from "@/components/Navbar";
import StockTicker from "@/components/StockTicker";
import Features from "@/components/Features";
import TopStocks from "@/components/TopStocks";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { LineChart, TrendingUp, BookOpen, DollarSign, Target, Search, BarChart, PieChart, Star, Users, CheckCircle, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("user1");
  
  const testimonials = [
    {
      id: "user1",
      name: "Sarah Johnson",
      role: "Professional Investor",
      content: "IntelligentInvestor+ has transformed my investment strategy completely. The AI-driven insights helped me identify opportunities I would have otherwise missed.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    },
    {
      id: "user2",
      name: "Michael Chen",
      role: "Day Trader",
      content: "The dividend calendar feature alone has paid for itself many times over. I've never missed an opportunity since I started using this platform.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    },
    {
      id: "user3",
      name: "Emily Rodriguez",
      role: "Financial Advisor",
      content: "I recommend IntelligentInvestor+ to all my clients. The educational resources are exceptional, and the market analysis tools are unmatched in the industry.",
      image: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    }
  ];

  const stats = [
    { title: "Active Users", value: "250K+", icon: Users },
    { title: "Market Data Points", value: "1B+", icon: BarChart },
    { title: "Success Rate", value: "94%", icon: CheckCircle },
    { title: "Companies Tracked", value: "5,000+", icon: Target }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <div className="relative h-[500px] overflow-hidden">
          {/* Background Video with Overlay */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute top-0 left-0 w-full h-full object-cover"
          >
            <source src="/video1.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Gradient Overlay */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900/90 via-gray-900/70 to-gray-900/90"></div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 max-w-6xl mx-auto">
            <div className="animate-fade-in">
              <div className="flex items-center justify-center mb-6">
                <TrendingUp className="h-12 w-12 text-green-400 mr-4" />
                <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                  IntelligentInvestor+
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Harness the power of AI-driven analytics and real-time market data to make 
                informed investment decisions that shape your financial future.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 flex items-center gap-2 border-2 border-green-400 shadow-lg shadow-green-500/20"
                >
                  <Search className="h-5 w-5" />
                  Start Investing
                </Button>
                <Link to="/education">
                  <Button 
                    variant="outline"
                    size="lg"
                    className="bg-transparent border-2 border-blue-400 text-blue-400 hover:bg-blue-400/10 px-8 py-6 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    <BookOpen className="h-5 w-5" />
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

       

        {/* Features Section */}
        <div className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-extrabold text-white text-center mb-12">
              Explore Our Features
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {/* Stock Screening */}
              <Link to="/dividend" className="group">
                <div className="flex flex-col items-center p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/15 shadow-lg transition-all hover:scale-105 hover:shadow-2xl hover:border-green-500/50 cursor-pointer">
                  <Search className="h-14 w-14 text-green-400 mb-5" />
                  <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-green-300 transition-colors">
                    Stock Screening
                  </h3>
                  <p className="text-gray-300 text-center">
                    Identify potential investment opportunities with real-time data.
                  </p>
                </div>
              </Link>

              {/* Market Research */}
              <Link to="/market-data" className="group">
                <div className="flex flex-col items-center p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/15 shadow-lg transition-all hover:scale-105 hover:shadow-2xl hover:border-blue-500/50 cursor-pointer">
                  <BarChart className="h-14 w-14 text-blue-400 mb-5" />
                  <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors">
                    Market Research
                  </h3>
                  <p className="text-gray-300 text-center">
                    Gain deep insights into market trends and economic indicators.
                  </p>
                </div>
              </Link>

              {/* Smart Investments */}
              <Link to="/top-stocks" className="group">
                <div className="flex flex-col items-center p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/15 shadow-lg transition-all hover:scale-105 hover:shadow-2xl hover:border-yellow-500/50 cursor-pointer">
                  <DollarSign className="h-14 w-14 text-yellow-400 mb-5" />
                  <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-yellow-300 transition-colors">
                    Smart Investments
                  </h3>
                  <p className="text-gray-300 text-center">
                    Leverage AI-driven strategies for optimal investment decisions.
                  </p>
                </div>
              </Link>

              {/* Portfolio Management */}
              <Link to="/dashboard" className="group">
                <div className="flex flex-col items-center p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/15 shadow-lg transition-all hover:scale-105 hover:shadow-2xl hover:border-purple-500/50 cursor-pointer">
                  <PieChart className="h-14 w-14 text-purple-400 mb-5" />
                  <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">
                    Portfolio Management
                  </h3>
                  <p className="text-gray-300 text-center">
                    Optimize and balance your investment portfolio efficiently.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        {/* <div className="py-20 bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-white mb-4">What Our Users Say</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Join thousands of investors who have transformed their financial future with IntelligentInvestor+
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {testimonials.map((testimonial) => (
                <button
                  key={testimonial.id}
                  onClick={() => setActiveTab(testimonial.id)}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                    activeTab === testimonial.id 
                    ? "bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30" 
                    : "opacity-60 hover:opacity-80"
                  }`}
                >
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className={`w-16 h-16 rounded-full mb-2 object-cover border-2 ${
                      activeTab === testimonial.id ? "border-blue-400" : "border-gray-600"
                    }`}
                  />
                  <h4 className="text-lg font-medium text-white">{testimonial.name}</h4>
                </button>
              ))}
            </div>

            <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className={`transition-opacity duration-300 ${activeTab === testimonial.id ? "block" : "hidden"}`}
                >
                  <div className="flex items-center mb-6">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 mr-4"
                    />
                    <div>
                      <h3 className="text-2xl font-semibold text-white">{testimonial.name}</h3>
                      <p className="text-blue-400">{testimonial.role}</p>
                    </div>
                    <div className="ml-auto flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xl text-gray-300 italic leading-relaxed">"{testimonial.content}"</p>
                </div>
              ))}
            </div>
          </div>
        </div> */}

        {/* Trust Badge Section */}
        {/* <div className="py-16 bg-gradient-to-b from-black to-gray-900">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-semibold text-center text-gray-400 mb-10">Trusted by Leading Companies</h2>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/512px-Microsoft_logo.svg.png" alt="Microsoft" className="h-12 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png" alt="Google" className="h-10 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/488px-Apple_logo_black.svg.png" alt="Apple" className="h-12 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png" alt="Amazon" className="h-10 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2560px-IBM_logo.svg.png" alt="IBM" className="h-10 opacity-70 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div> */}

        {/* Feedback/Contact Section */}
        <div className="py-20 bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-white/10">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-4">Let's Talk!</h2>
                  <p className="text-gray-300 mb-6">
                    Have questions about our platform or need help getting started? Our team is here to help!
                  </p>
                  <div className="bg-white/5 p-6 rounded-xl mb-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-2">Email Support</h3>
                    <p className="text-blue-400">support@intelligentinvestor.com</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <a href="#" className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                    </a>
                    <a href="#" className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.486 2 2 6.486 2 12c0 5.511 4.486 10 10 10s10-4.489 10-10c0-5.514-4.486-10-10-10zm3.293 14.707L12 13.414l-3.293 3.293-1.414-1.414L10.586 12 7.293 8.707l1.414-1.414L12 10.586l3.293-3.293 1.414 1.414L13.414 12l3.293 3.293-1.414 1.414z"></path></svg>
                    </a>
                    <a href="#" className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01z"></path></svg>
                    </a>
                  </div>
                </div>
                <div className="flex-1">
                  <form className="space-y-4">
                    <div>
                      <input 
                        type="text" 
                        placeholder="Your Name" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <input 
                        type="email" 
                        placeholder="Your Email" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <textarea 
                        placeholder="Your Message" 
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      ></textarea>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium py-3 rounded-lg transition-all shadow-lg border border-white/10">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with gradient border */}
      <Footer />
    </div>
  );
};

export default Index;
