
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock, User, Facebook, ArrowRight, Loader } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // User is already logged in, redirect to dashboard
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        toast({
          title: "Login Successful",
          description: "Welcome back! Redirecting to your dashboard...",
        });

        navigate("/");
      } else {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;

        if (data.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([{ id: data.user.id, username }]);
          if (profileError) throw profileError;
        }

        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="h-12 w-12 animate-spin text-purple-500 mb-4" />
          <p className="text-purple-300 font-medium">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[url('/market.webm')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <Navbar />

      <div className="flex-grow flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-5xl bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Left side - Branding and Welcome Message */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm"></div>
              <div className="relative z-10 space-y-8">
                <div className="space-y-2">
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    {isLogin ? "Welcome Back!" : "Join Us Today"}
                  </h1>
                  <p className="text-lg text-gray-300 leading-relaxed max-w-md">
                    {isLogin
                      ? "Access your personalized investment dashboard and portfolio management tools."
                      : "Start your investment journey with powerful analytics and real-time market insights."}
                  </p>
                </div>

                <div className="flex flex-col space-y-4">
                  <h3 className="text-xl font-semibold text-white">Why Choose Us?</h3>
                  <ul className="space-y-3">
                    {[
                      "Real-time market analysis",
                      "AI-powered insights",
                      "Professional portfolio tools",
                      "Expert financial guidance"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <ArrowRight className="h-4 w-4 mr-2 text-blue-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right side - Auth Form */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 bg-white/5">
              <div className="w-full max-w-md mx-auto space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {isLogin ? "Sign In" : "Create Account"}
                  </h2>
                  <p className="text-gray-400">
                    {isLogin
                      ? "Welcome back! Please sign in to continue."
                      : "Create your account to get started."}
                  </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                  {!isLogin && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Enter your full name"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 transition-colors"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      </div>
                    ) : (
                      isLogin ? "Sign In" : "Create Account"
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                  </div>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-gray-400">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-white/20"
                  >
                    <FaGoogle className="h-5 w-5 mr-2" />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-white/20"
                  >
                    <Facebook className="h-5 w-5 mr-2" />
                    Facebook
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
