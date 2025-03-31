
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { Loader2, Save, LogOut, UserCircle, Bell, Shield, Key, CreditCard, Mail, Settings as SettingsIcon } from "lucide-react";

interface Profile {
  id: string;
  username: string;
  created_at?: string;
  updated_at?: string;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          throw error;
        }
        
        if (user) {
          setUser(user);
          
          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profileError) {
            throw profileError;
          }
          
          setProfile(profileData);
          setUsername(profileData?.username || '');
        } else {
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error loading user:', error);
        toast.error("Failed to load user information");
      } finally {
        setLoading(false);
      }
    };
    
    getUser();
  }, [navigate]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("Failed to sign out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Navbar />
      
      <main className="container py-12 px-4 max-w-6xl mx-auto">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Account Settings
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Manage your profile, preferences, and account settings
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">
            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-3 py-4">
                    <Avatar className="h-24 w-24 border-2 border-primary/20">
                      <AvatarImage src="/default-avatar.png" alt={username} />
                      <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h3 className="text-lg font-medium">{username}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="hidden lg:block">
                <Tabs defaultValue="profile" orientation="vertical" className="w-full">
                  <TabsList className="flex flex-col h-auto items-stretch space-y-1 bg-transparent">
                    <TabsTrigger value="profile" className="justify-start">
                      <UserCircle className="h-4 w-4 mr-2" />
                      Profile
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger value="security" className="justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Security
                    </TabsTrigger>
                    <TabsTrigger value="password" className="justify-start">
                      <Key className="h-4 w-4 mr-2" />
                      Password
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="justify-start">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Billing
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="justify-start">
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      Appearance
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="space-y-6">
              <Tabs defaultValue="profile" className="lg:hidden mb-6">
                <TabsList className="flex flex-wrap w-full">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <TabsContent value="profile" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and how others see you on the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        placeholder="Your username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={user?.email || ""} 
                        disabled 
                        className="bg-gray-100 dark:bg-gray-800"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Your email address is used for login and notifications
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleSignOut} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                    <Button onClick={handleUpdateProfile} disabled={saving} className="bg-gradient-to-r from-blue-600 to-purple-600">
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Customize how and when you get notified
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive notifications about account activity and updates via email
                        </p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Push Notifications</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive notifications on your device when important events happen
                        </p>
                      </div>
                      <Switch
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      Save Preferences
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security and authentication methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch
                        checked={twoFactorAuth}
                        onCheckedChange={setTwoFactorAuth}
                      />
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Recent Devices</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <div>
                            <p className="font-medium">Chrome on Windows</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              New York, USA · Current device
                            </p>
                          </div>
                          <div className="text-green-500 text-sm font-medium">Active</div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <div>
                            <p className="font-medium">Safari on iPhone</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              New York, USA · Last active 2 days ago
                            </p>
                          </div>
                          <Button size="sm" variant="outline" className="h-8">
                            Sign Out
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      Save Security Settings
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="password" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to maintain account security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
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
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800">
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                        Password Requirements:
                      </h4>
                      <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                        <li>Minimum 8 characters long</li>
                        <li>At least one uppercase letter</li>
                        <li>At least one number</li>
                        <li>At least one special character</li>
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      Update Password
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="billing" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Subscription & Billing</CardTitle>
                    <CardDescription>
                      Manage your subscription plan and payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Premium Plan</h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                            Unlimited access to all premium features
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-green-600 dark:text-green-400 text-sm font-medium">
                          Active
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Renews on September 15, 2024
                        </div>
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Payment Methods</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <div className="flex items-center">
                            <div className="h-10 w-14 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <line x1="2" y1="10" x2="22" y2="10" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium">•••• •••• •••• 4242</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Expires 09/25
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Default</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-3">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Add Payment Method
                      </Button>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Billing History</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <div>
                            <p className="font-medium">Premium Plan - Monthly</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              August 15, 2023
                            </p>
                          </div>
                          <div className="text-sm">$19.99</div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <div>
                            <p className="font-medium">Premium Plan - Monthly</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              July 15, 2023
                            </p>
                          </div>
                          <div className="text-sm">$19.99</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="appearance" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                      Customize the look and feel of the application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-4">Theme Preference</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div 
                          className={`border-2 rounded-lg p-4 cursor-pointer ${
                            theme === "light" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700"
                          }`}
                          onClick={() => setTheme("light")}
                        >
                          <div className="h-24 bg-white border border-gray-200 rounded-md mb-3 flex items-center justify-center text-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="5" />
                              <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                            </svg>
                          </div>
                          <p className="text-center font-medium">Light</p>
                        </div>
                        
                        <div 
                          className={`border-2 rounded-lg p-4 cursor-pointer ${
                            theme === "dark" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700"
                          }`}
                          onClick={() => setTheme("dark")}
                        >
                          <div className="h-24 bg-gray-900 border border-gray-700 rounded-md mb-3 flex items-center justify-center text-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                          </div>
                          <p className="text-center font-medium">Dark</p>
                        </div>
                        
                        <div 
                          className={`border-2 rounded-lg p-4 cursor-pointer ${
                            theme === "system" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700"
                          }`}
                          onClick={() => setTheme("system")}
                        >
                          <div className="h-24 bg-gradient-to-r from-white to-gray-900 border border-gray-200 rounded-md mb-3 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                              <line x1="8" y1="21" x2="16" y2="21" />
                              <line x1="12" y1="17" x2="12" y2="21" />
                            </svg>
                          </div>
                          <p className="text-center font-medium">System</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      Save Preferences
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
