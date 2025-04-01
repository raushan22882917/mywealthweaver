
import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { Mail, Loader2 } from 'lucide-react';

interface EmailSubscriptionProps {
  stockSymbol: string;
}

const EmailSubscription: React.FC<EmailSubscriptionProps> = ({ stockSymbol }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [loading, setLoading] = useState(false);

  // Check if user is already subscribed
  useEffect(() => {
    const checkSubscription = async () => {
      if (!email || !stockSymbol) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('stock_subscriptions')
          .select('*')
          .eq('stock_symbol', stockSymbol)
          .eq('email', email);
        
        if (!error && data && data.length > 0) {
          setIsSubscribed(true);
        } else {
          setIsSubscribed(false);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [email, stockSymbol]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    setIsValidEmail(emailValue === '' || validateEmail(emailValue));
  };

  const handleToggleSubscription = async (checked: boolean) => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setIsValidEmail(false);
      return;
    }

    setIsSubmitting(true);

    try {
      if (checked) {
        // Subscribe
        const { error } = await supabase
          .from('stock_subscriptions')
          .insert([{ email, stock_symbol: stockSymbol }]);

        if (error) throw error;
        toast.success(`Successfully subscribed to ${stockSymbol} updates`);
      } else {
        // Unsubscribe
        const { error } = await supabase
          .from('stock_subscriptions')
          .delete()
          .eq('email', email)
          .eq('stock_symbol', stockSymbol);

        if (error) throw error;
        toast.success(`Successfully unsubscribed from ${stockSymbol} updates`);
      }
      
      setIsSubscribed(checked);
    } catch (error: any) {
      toast.error(error.message || 'Error updating subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-medium text-white">Email Notifications</h3>
        </div>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        ) : null}
      </div>
      
      <div>
        <div className="space-y-2 mb-4">
          <Label htmlFor="email" className="text-sm text-gray-400">Your Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={handleEmailChange}
            className={`bg-gray-800 border-gray-700 focus:border-purple-500 transition-colors ${
              !isValidEmail ? 'border-red-500' : ''
            }`}
          />
          {!isValidEmail && (
            <p className="text-xs text-red-500">Please enter a valid email address</p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="subscription" className="text-sm text-gray-300">
              {isSubscribed ? "Subscribed to updates" : "Subscribe to updates"}
            </Label>
            <p className="text-xs text-gray-400">
              Get notified about dividends and earnings
            </p>
          </div>
          <Switch
            id="subscription"
            checked={isSubscribed}
            onCheckedChange={handleToggleSubscription}
            disabled={isSubmitting || !email || !isValidEmail}
            className="data-[state=checked]:bg-purple-600"
          />
        </div>
      </div>
    </div>
  );
};

export default EmailSubscription;
