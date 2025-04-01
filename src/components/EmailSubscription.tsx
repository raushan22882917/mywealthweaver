
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BellRing } from 'lucide-react';
import { useStockSubscription } from '@/hooks/useStockSubscription';

interface EmailSubscriptionProps {
  stockSymbol: string;
  userEmail?: string;
}

const EmailSubscription: React.FC<EmailSubscriptionProps> = ({ stockSymbol, userEmail }) => {
  const { 
    isSubscribed, 
    isLoading, 
    email, 
    isValidEmail, 
    handleEmailChange, 
    toggleSubscription 
  } = useStockSubscription(stockSymbol, userEmail);

  return (
    <Card className="p-4 bg-gray-800/50 border-gray-700 shadow-xl">
      <div className="flex items-start space-x-4">
        <BellRing className="h-6 w-6 text-blue-400 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-100 mb-2">Get updates for {stockSymbol}</h3>
          <p className="text-sm text-gray-400 mb-3">
            Receive dividend announcements, earnings reports, and price alerts.
          </p>
          
          <div className="space-y-3">
            <div>
              <Label 
                htmlFor="email" 
                className={`block text-sm mb-1 ${!isValidEmail ? 'text-red-400' : 'text-gray-400'}`}
              >
                Email address
              </Label>
              <Input 
                id="email"
                type="email" 
                placeholder="your@email.com" 
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`bg-gray-900 border-gray-700 text-gray-100 ${
                  !isValidEmail ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                disabled={isLoading}
              />
              {!isValidEmail && (
                <p className="text-xs text-red-400 mt-1">
                  Please enter a valid email address
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="subscribe-switch"
                checked={isSubscribed}
                onCheckedChange={toggleSubscription}
                disabled={isLoading || !email}
              />
              <Label htmlFor="subscribe-switch" className="text-gray-300">
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </Label>
              {isLoading && (
                <div className="w-4 h-4 border-t-2 border-blue-500 rounded-full animate-spin ml-2"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmailSubscription;
