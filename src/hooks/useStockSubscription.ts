
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function useStockSubscription(stockSymbol: string, userEmail?: string) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(userEmail || '');
  const [isValidEmail, setIsValidEmail] = useState(true);

  useEffect(() => {
    if (userEmail) {
      setEmail(userEmail);
    }
  }, [userEmail]);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!email || !stockSymbol) return;
      
      setIsLoading(true);
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
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [email, stockSymbol]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    setIsValidEmail(newEmail === '' || validateEmail(newEmail));
  };

  const toggleSubscription = async (checked: boolean) => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setIsValidEmail(false);
      return;
    }

    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  return {
    isSubscribed,
    isLoading,
    email,
    isValidEmail,
    handleEmailChange,
    toggleSubscription
  };
}
