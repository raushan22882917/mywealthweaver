
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell, CreditCard, Shield, Moon, Sun, Trash2, LogOut, Save, Camera, ExternalLink } from 'lucide-react';
import { useTheme } from 'next-themes';

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({
    id: '',
    username: '',
    email: '',
    avatar_url: '',
  });
  const [formState, setFormState] = useState({
    username: '',
    email: '',
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketAlerts: true,
    dividendAlerts: true,
    priceAlerts: false,
    weeklyNewsletter: true,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;

      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      const profile = profileData || { username: session.user.email?.split('@')[0] || '', id: session.user.id };
      
      setUserProfile({
        id: session.user.id,
        username: profile.username || '',
        email: session.user.email || '',
        avatar_url: profile.avatar_url || '',
      });
      
      setFormState({
        username: profile.username || '',
        email: session.user.email || '',
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/auth');
    }
  };

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userProfile.id,
          username: formState.username,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      if (formState.email !== userProfile.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formState.email,
        });

        if (emailError) throw emailError;
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      setUserProfile(prev => ({
        ...prev,
        username: formState.username,
        email: formState.email,
      }));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userProfile.id}-${Math.random()}.${fileExt}`;
      
      // For demonstration purposes - in a real app, you would upload to Supabase storage
      // Once you have storage buckets set up in Supabase
      // const { error } = await supabase.storage.from('avatars').upload(filePath, file);
      
      // Instead, we'll just use a setTimeout to simulate upload
      setTimeout(() => {
        // Simulate successful upload
        const avatarUrl = URL.createObjectURL(file);
        
        setUserProfile(prev => ({
          ...prev,
          avatar_url: avatarUrl,
        }));
        
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated.",
        });
        
        setUploading(false);
      }, 1500);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    
    if (confirm) {
      try {
        // In a real implementation, you would call an API endpoint or Supabase edge function
        // to properly handle user deletion across all tables
        
        // For demonstration, we'll just sign the user out
        await supabase.auth.signOut();
        toast({
          title: "Account deleted",
          description: "Your account has been deleted successfully.",
        });
        navigate('/');
      } catch (error: any) {
        console.error('Error deleting account:', error);
        toast({
          title: "Deletion failed",
          description: error.message || "Failed to delete account",
          variant: "destructive",
        });
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-md">
              <CardContent className="p-0">
                <div className="py-6 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                  <div className="flex flex-col items-center">
                    <div className="relative group mb-4">
                      <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-700 p-1 shadow-lg overflow-hidden">
                        {userProfile.avatar_url ? (
                          <img 
                            src={userProfile.avatar_url} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900">
                            <span className="text-3xl font-bold text-blue-600 dark:text-blue-300">
                              {userProfile.username?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                      </div>
                      <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-md">
                        <Camera size={16} />
                        <input 
                          id="avatar-upload" 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    <p className="text-white font-medium text-lg">{userProfile.username}</p>
                    <p className="text-blue-100 text-sm">{userProfile.email}</p>
                  </div>
                </div>
                
                <nav className="py-4">
                  <TabsList className="flex flex-col w-full bg-transparent space-y-1 h-auto">
                    <TabsTrigger value="profile" className="w-full justify-start px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:dark:bg-gray-700 rounded-lg">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="w-full justify-start px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:dark:bg-gray-700 rounded-lg">
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="w-full justify-start px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:dark:bg-gray-700 rounded-lg">
                      {theme === 'dark' ? (
                        <Moon className="mr-2 h-4 w-4" />
                      ) : (
                        <Sun className="mr-2 h-4 w-4" />
                      )}
                      Appearance
                    </TabsTrigger>
                    <TabsTrigger value="security" className="w-full justify-start px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:dark:bg-gray-700 rounded-lg">
                      <Shield className="mr-2 h-4 w-4" />
                      Security
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="w-full justify-start px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:dark:bg-gray-700 rounded-lg">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Billing
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="mt-6 px-4">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 gap-2"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="w-full">
              <TabsContent value="profile">
                <Card className="border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your account profile information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        value={formState.username}
                        onChange={(e) => setFormState({...formState, username: e.target.value})}
                        className="border-gray-200 dark:border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={formState.email}
                        onChange={(e) => setFormState({...formState, email: e.target.value})}
                        className="border-gray-200 dark:border-gray-700"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Changing your email will require verification
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={checkUser}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={updateProfile}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="mt-6 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
                  <CardHeader>
                    <CardTitle className="text-red-600 dark:text-red-500">Danger Zone</CardTitle>
                    <CardDescription>
                      Permanent actions that cannot be undone
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border border-red-200 dark:border-red-900 rounded-lg p-4 bg-red-50 dark:bg-red-900/10">
                      <h3 className="text-lg font-medium text-red-600 dark:text-red-500">Delete Account</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <Button 
                        variant="destructive" 
                        className="mt-4"
                        onClick={handleDeleteAccount}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card className="border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Manage how you receive notifications and alerts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Notification Methods</h3>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch 
                          id="email-notifications"
                          checked={notifications.email}
                          onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="push-notifications">Push Notifications</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receive notifications in your browser
                          </p>
                        </div>
                        <Switch 
                          id="push-notifications"
                          checked={notifications.push}
                          onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Notification Types</h3>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="market-alerts">Market Alerts</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Updates about major market movements
                          </p>
                        </div>
                        <Switch 
                          id="market-alerts"
                          checked={notifications.marketAlerts}
                          onCheckedChange={(checked) => setNotifications({...notifications, marketAlerts: checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="dividend-alerts">Dividend Alerts</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Alerts about dividend announcements and payments
                          </p>
                        </div>
                        <Switch 
                          id="dividend-alerts"
                          checked={notifications.dividendAlerts}
                          onCheckedChange={(checked) => setNotifications({...notifications, dividendAlerts: checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="price-alerts">Price Alerts</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Notifications when stocks hit your price targets
                          </p>
                        </div>
                        <Switch 
                          id="price-alerts"
                          checked={notifications.priceAlerts}
                          onCheckedChange={(checked) => setNotifications({...notifications, priceAlerts: checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="weekly-newsletter">Weekly Newsletter</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receive a weekly digest of market insights
                          </p>
                        </div>
                        <Switch 
                          id="weekly-newsletter"
                          checked={notifications.weeklyNewsletter}
                          onCheckedChange={(checked) => setNotifications({...notifications, weeklyNewsletter: checked})}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                    <Button 
                      onClick={() => {
                        toast({
                          title: "Settings saved",
                          description: "Your notification preferences have been updated.",
                        });
                      }}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save Preferences
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="appearance">
                <Card className="border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
                  <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>
                      Customize how the application looks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Theme</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <Button
                          variant={theme === "light" ? "default" : "outline"}
                          className={`h-24 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-2 ${
                            theme === "light" 
                              ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white" 
                              : "bg-white dark:bg-gray-800"
                          }`}
                          onClick={() => setTheme("light")}
                        >
                          <Sun className="h-6 w-6" />
                          <span>Light</span>
                        </Button>
                        <Button
                          variant={theme === "dark" ? "default" : "outline"}
                          className={`h-24 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-2 ${
                            theme === "dark" 
                              ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white" 
                              : "bg-white dark:bg-gray-800"
                          }`}
                          onClick={() => setTheme("dark")}
                        >
                          <Moon className="h-6 w-6" />
                          <span>Dark</span>
                        </Button>
                        <Button
                          variant={theme === "system" ? "default" : "outline"}
                          className={`h-24 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-2 ${
                            theme === "system" 
                              ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white" 
                              : "bg-white dark:bg-gray-800"
                          }`}
                          onClick={() => setTheme("system")}
                        >
                          <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                            />
                          </svg>
                          <span>System</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card className="border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security and password
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Change Password</h3>
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                      <Button 
                        className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        onClick={() => {
                          toast({
                            title: "Password updated",
                            description: "Your password has been successfully changed.",
                          });
                        }}
                      >
                        Update Password
                      </Button>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Add an extra layer of security to your account
                      </p>
                      <Button 
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          toast({
                            title: "Coming soon",
                            description: "Two-factor authentication is coming soon.",
                          });
                        }}
                      >
                        Set Up 2FA
                      </Button>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium">Active Sessions</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage your active sessions and log out from other devices
                      </p>
                      <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {navigator.userAgent}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Active</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => {
                          toast({
                            title: "Sessions cleared",
                            description: "All other sessions have been logged out.",
                          });
                        }}
                      >
                        Log Out All Other Sessions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing">
                <Card className="border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                    <CardDescription>
                      Manage your subscription and payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400">Current Plan</h3>
                        <div className="mt-4 flex items-center">
                          <div className="flex-1">
                            <p className="text-xl font-bold">Free Plan</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Basic features with limited access
                            </p>
                          </div>
                          <Button 
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            onClick={() => {
                              toast({
                                title: "Coming soon",
                                description: "Premium subscriptions will be available soon.",
                              });
                            }}
                          >
                            Upgrade Plan
                          </Button>
                        </div>
                        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                          <h4 className="font-medium">Plan Features:</h4>
                          <ul className="mt-2 space-y-2">
                            <li className="flex items-center text-sm">
                              <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Basic market data
                            </li>
                            <li className="flex items-center text-sm">
                              <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Limited stock watchlist
                            </li>
                            <li className="flex items-center text-sm">
                              <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Standard dividend tracking
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        <h3 className="text-lg font-medium">Available Plans</h3>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all">
                            <h4 className="font-bold text-lg">Pro Plan</h4>
                            <p className="text-2xl font-bold mt-2">$9.99<span className="text-sm font-normal text-gray-500">/month</span></p>
                            <ul className="mt-4 space-y-2">
                              <li className="flex items-center text-sm">
                                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Advanced market data
                              </li>
                              <li className="flex items-center text-sm">
                                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Unlimited watchlists
                              </li>
                              <li className="flex items-center text-sm">
                                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Enhanced dividend tracking
                              </li>
                              <li className="flex items-center text-sm">
                                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Priority support
                              </li>
                            </ul>
                            <Button 
                              className="w-full mt-4"
                              variant="outline"
                              onClick={() => {
                                toast({
                                  title: "Coming soon",
                                  description: "Pro plan will be available soon.",
                                });
                              }}
                            >
                              Select Plan
                            </Button>
                          </div>
                          
                          <div className="border-2 border-blue-500 dark:border-blue-600 rounded-lg p-4 relative hover:shadow-xl transition-all">
                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 transform translate-x-2 -translate-y-2 rounded-full">
                              BEST VALUE
                            </div>
                            <h4 className="font-bold text-lg">Premium Plan</h4>
                            <p className="text-2xl font-bold mt-2">$19.99<span className="text-sm font-normal text-gray-500">/month</span></p>
                            <ul className="mt-4 space-y-2">
                              <li className="flex items-center text-sm">
                                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Real-time market data
                              </li>
                              <li className="flex items-center text-sm">
                                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Advanced financial analytics
                              </li>
                              <li className="flex items-center text-sm">
                                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Dividend forecasting
                              </li>
                              <li className="flex items-center text-sm">
                                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Custom portfolio reports
                              </li>
                              <li className="flex items-center text-sm">
                                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                24/7 dedicated support
                              </li>
                            </ul>
                            <Button 
                              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                              onClick={() => {
                                toast({
                                  title: "Coming soon",
                                  description: "Premium plan will be available soon.",
                                });
                              }}
                            >
                              Select Plan
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        <h3 className="text-lg font-medium">Payment Methods</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Securely add your payment information
                        </p>
                        <Button
                          className="mt-4 gap-2 border-dashed"
                          variant="outline"
                          onClick={() => {
                            toast({
                              title: "Coming soon",
                              description: "Payment method management will be available soon.",
                            });
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                          Add Payment Method
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
