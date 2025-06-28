import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/lib/supabase";
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Bell,
  Shield,
  Moon,
  Sun,
  Palette,
  LogOut,
  Save,
  Upload,
  Trash2,
  Mail,
  Lock
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface UserProfile {
  id: string;
  username: string;
}

// First, let's update the SQL schema to match our needs with a migration
const runProfilesMigration = async () => {
  try {
    // Check if columns already exist to avoid errors
    const { data: columns, error: columnsError } = await supabase
      .from('profiles')
      .select('username')
      .limit(1);
    
    if (columnsError) {
      console.error('Error checking profiles table:', columnsError);
      return;
    }
    
    // These are the migrations to run, wrapped in error handling
    const migrations = [
      supabase.rpc('add_column_if_not_exists', { 
        table_name: 'profiles', 
        column_name: 'email', 
        column_type: 'text' 
      }),
      supabase.rpc('add_column_if_not_exists', { 
        table_name: 'profiles', 
        column_name: 'bio', 
        column_type: 'text' 
      }),
      supabase.rpc('add_column_if_not_exists', { 
        table_name: 'profiles', 
        column_name: 'avatar_url', 
        column_type: 'text' 
      }),
      supabase.rpc('add_column_if_not_exists', { 
        table_name: 'profiles', 
        column_name: 'notifications_enabled', 
        column_type: 'boolean' 
      }),
      supabase.rpc('add_column_if_not_exists', { 
        table_name: 'profiles', 
        column_name: 'email_notifications_enabled', 
        column_type: 'boolean' 
      }),
      supabase.rpc('add_column_if_not_exists', { 
        table_name: 'profiles', 
        column_name: 'email_frequency', 
        column_type: 'text' 
      })
    ];
    
    // Execute all migrations and handle any errors
    for (const migrationPromise of migrations) {
      try {
        const { error } = await migrationPromise;
        if (error) console.error('Migration error:', error);
      } catch (e) {
        console.error('Migration execution error:', e);
      }
    }
    
    console.log('Migrations completed');
  } catch (error) {
    console.error('Error in runProfilesMigration:', error);
  }
};

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isStorageBucketCreated, setIsStorageBucketCreated] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [emailFrequency, setEmailFrequency] = useState('weekly');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accentColor, setAccentColor] = useState('purple');

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        setIsLoading(true);
        
        // Run the migrations to ensure the profile table has all needed columns
        await runProfilesMigration();
        
        // Set up storage bucket for avatars if it doesn't exist
        if (!isStorageBucketCreated) {
          const { data: buckets, error: bucketsError } = await supabase
            .storage
            .listBuckets();
            
          const bucketExists = buckets?.some(bucket => bucket.name === 'user-avatars');
          
          if (!bucketExists && !bucketsError) {
            try {
              const { error: createBucketError } = await supabase
                .storage
                .createBucket('user-avatars', { public: true });
                
              if (createBucketError) {
                console.error('Error creating storage bucket:', createBucketError);
              } else {
                setIsStorageBucketCreated(true);
              }
            } catch (e) {
              console.error('Error creating bucket:', e);
            }
          } else {
            setIsStorageBucketCreated(true);
          }
        }
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/auth');
          return;
        }

        // Get profile info
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          if (error.code === 'PGRST116') {
            // Profile doesn't exist, create one
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([{ 
                id: user.id, 
                username: user.email?.split('@')[0] || '',
                email: user.email || ''
              }]);
            
            if (insertError) {
              throw insertError;
            }
            
            setProfile({
              id: user.id,
              username: user.email?.split('@')[0] || ''
            });
            
            setUsername(user.email?.split('@')[0] || '');
            setEmail(user.email || '');
            setNotificationsEnabled(false);
            setEmailFrequency('weekly');
          } else {
            throw error;
          }
        } else {
          setProfile(profileData);
          setUsername(profileData.username || '');
          
          // These fields might not exist in older profiles
          setEmail(profileData.email || user.email || '');
          setBio(profileData.bio || '');
          setAvatarUrl(profileData.avatar_url || '');
          setNotificationsEnabled(profileData.notifications_enabled || false);
          setEmailNotificationsEnabled(profileData.email_notifications_enabled || false);
          setEmailFrequency(profileData.email_frequency || 'weekly');
        }
      } catch (error) {
        console.error('Error getting profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeProfile();
  }, [navigate, toast, isStorageBucketCreated]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;

    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Convert the file to base64 URL
      const reader = new FileReader();
      reader.readAsDataURL(avatarFile);
      
      reader.onload = async () => {
        try {
          const base64Url = reader.result as string;

          // Update the user's profile with the base64 URL
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: base64Url })
            .eq('id', user.id);

          if (updateError) throw updateError;

          setAvatarUrl(base64Url);
          toast({
            title: "Success",
            description: "Avatar updated successfully",
          });
        } catch (error: any) {
          console.error('Error updating profile:', error);
          toast({
            title: "Error",
            description: error.message || "Failed to update avatar",
            variant: "destructive",
          });
        }
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        toast({
          title: "Error",
          description: "Failed to read image file",
          variant: "destructive",
        });
      };

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const removeAvatar = async () => {
    if (!profile) return;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', profile.id);
      
      if (error) throw error;
      
      setAvatarUrl('');
      setAvatarFile(null);
      setAvatarPreview(null);
      
      toast({
        title: 'Avatar Removed',
        description: 'Your profile picture has been removed',
      });
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove avatar',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profile.username,
          bio: profile.bio,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Profile update error:', error);
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill all password fields',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully changed',
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update password: ' + (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Side navigation */}
          <Card className="md:w-64 w-full bg-gray-900/60 backdrop-blur-sm border border-purple-900/20 shadow-xl p-0">
            <div className="text-center p-6 border-b border-gray-800">
              <Avatar className="w-20 h-20 mx-auto mb-4 border-2 border-purple-500">
                <AvatarImage src={avatarPreview || avatarUrl} />
                <AvatarFallback className="bg-purple-900 text-2xl">
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-white">{username}</h2>
              <p className="text-sm text-gray-400">{email}</p>
            </div>
            <div className="p-4">
              <Button
                variant="destructive"
                className="w-full bg-red-900 hover:bg-red-800 text-white"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </Card>

          {/* Main content */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-6 text-white">Settings</h1>
            
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid grid-cols-3 mb-8 bg-gray-900/60 backdrop-blur-sm border border-purple-900/20">
                <TabsTrigger value="profile" className="data-[state=active]:bg-purple-900/40">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-purple-900/40">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="appearance" className="data-[state=active]:bg-purple-900/40">
                  <Palette className="mr-2 h-4 w-4" />
                  Appearance
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card className="p-6 bg-gray-900/60 backdrop-blur-sm border border-purple-900/20 shadow-xl mb-6">
                  <h2 className="text-xl font-bold mb-4 text-white">Profile Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username" className="text-gray-300">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-gray-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="mt-1 bg-gray-800 border-gray-700 text-white resize-none h-24"
                        placeholder="Tell us about yourself"
                      />
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 bg-gray-900/60 backdrop-blur-sm border border-purple-900/20 shadow-xl mb-6">
                  <h2 className="text-xl font-bold mb-4 text-white">Profile Picture</h2>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="w-24 h-24 border-2 border-purple-500">
                      <AvatarImage src={avatarPreview || avatarUrl} />
                      <AvatarFallback className="bg-purple-900 text-4xl">
                        {username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="avatar" className="cursor-pointer">
                        <div className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-md flex items-center gap-2 max-w-max">
                          <Upload className="h-4 w-4" />
                          <span>Upload Image</span>
                        </div>
                        <input
                          id="avatar"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </Label>
                      
                      {(avatarUrl || avatarPreview) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="max-w-max bg-red-900 hover:bg-red-800"
                          onClick={removeAvatar}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400">
                    Supported formats: JPG, PNG, GIF. Maximum file size: 5MB.
                  </p>
                </Card>
                
                <Card className="p-6 bg-gray-900/60 backdrop-blur-sm border border-purple-900/20 shadow-xl mb-6">
                  <h2 className="text-xl font-bold mb-4 text-white">Security</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-password" className="text-gray-300">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="mt-1 bg-gray-800 border-gray-700 text-white"
                        placeholder="Enter your current password"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="new-password" className="text-gray-300">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 bg-gray-800 border-gray-700 text-white"
                        placeholder="Enter your new password"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirm-password" className="text-gray-300">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 bg-gray-800 border-gray-700 text-white"
                        placeholder="Confirm your new password"
                      />
                    </div>
                    
                    <Button
                      onClick={handlePasswordChange}
                      className="bg-blue-700 hover:bg-blue-600 text-white"
                      disabled={isSaving}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      {isSaving ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </Card>
                
                <div className="flex justify-end">
                  <Button
                    onClick={handleProfileUpdate}
                    className="bg-purple-700 hover:bg-purple-600 text-white"
                    disabled={isSaving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="notifications">
                <Card className="p-6 bg-gray-900/60 backdrop-blur-sm border border-purple-900/20 shadow-xl mb-6">
                  <h2 className="text-xl font-bold mb-4 text-white">Notification Preferences</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">Push Notifications</h3>
                        <p className="text-sm text-gray-400">Receive push notifications in your browser</p>
                      </div>
                      <Switch
                        checked={notificationsEnabled}
                        onCheckedChange={setNotificationsEnabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">Email Notifications</h3>
                        <p className="text-sm text-gray-400">Receive updates and alerts via email</p>
                      </div>
                      <Switch
                        checked={emailNotificationsEnabled}
                        onCheckedChange={setEmailNotificationsEnabled}
                      />
                    </div>
                    
                    {emailNotificationsEnabled && (
                      <div>
                        <Label htmlFor="email-frequency" className="text-gray-300">Email Frequency</Label>
                        <Select
                          value={emailFrequency}
                          onValueChange={setEmailFrequency}
                        >
                          <SelectTrigger id="email-frequency" className="mt-1 bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="daily" className="text-white">Daily Digest</SelectItem>
                            <SelectItem value="weekly" className="text-white">Weekly Summary</SelectItem>
                            <SelectItem value="important" className="text-white">Important Updates Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </Card>
                
                <Card className="p-6 bg-gray-900/60 backdrop-blur-sm border border-purple-900/20 shadow-xl mb-6">
                  <h2 className="text-xl font-bold mb-4 text-white">Stock Alerts</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">Price Alerts</h3>
                        <p className="text-sm text-gray-400">Get notified when stock prices change significantly</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">Dividend Announcements</h3>
                        <p className="text-sm text-gray-400">Receive alerts for upcoming dividend payments</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">Earnings Reports</h3>
                        <p className="text-sm text-gray-400">Get notified when companies release earnings reports</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </Card>
                
                <div className="flex justify-end">
                  <Button
                    onClick={handleProfileUpdate}
                    className="bg-purple-700 hover:bg-purple-600 text-white"
                    disabled={isSaving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="appearance">
                <Card className="p-6 bg-gray-900/60 backdrop-blur-sm border border-purple-900/20 shadow-xl mb-6">
                  <h2 className="text-xl font-bold mb-4 text-white">Theme</h2>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div
                      className={`p-4 rounded-lg cursor-pointer border-2 ${
                        theme === 'dark' ? 'border-purple-500 bg-gray-800' : 'border-gray-700 bg-gray-800/50'
                      }`}
                      onClick={() => setTheme('dark')}
                    >
                      <div className="flex items-center justify-center h-24 mb-2 bg-gray-900 rounded-md">
                        <Moon className="h-12 w-12 text-blue-400" />
                      </div>
                      <p className="text-center font-medium">Dark</p>
                    </div>
                    
                    <div
                      className={`p-4 rounded-lg cursor-pointer border-2 ${
                        theme === 'light' ? 'border-purple-500 bg-gray-800' : 'border-gray-700 bg-gray-800/50'
                      }`}
                      onClick={() => setTheme('light')}
                    >
                      <div className="flex items-center justify-center h-24 mb-2 bg-gray-300 rounded-md">
                        <Sun className="h-12 w-12 text-yellow-500" />
                      </div>
                      <p className="text-center font-medium">Light</p>
                    </div>
                    
                    <div
                      className={`p-4 rounded-lg cursor-pointer border-2 ${
                        theme === 'system' ? 'border-purple-500 bg-gray-800' : 'border-gray-700 bg-gray-800/50'
                      }`}
                      onClick={() => setTheme('system')}
                    >
                      <div className="flex items-center justify-center h-24 mb-2 bg-gradient-to-r from-gray-300 to-gray-900 rounded-md">
                        <div className="flex space-x-2">
                          <Sun className="h-10 w-10 text-yellow-500" />
                          <Moon className="h-10 w-10 text-blue-400" />
                        </div>
                      </div>
                      <p className="text-center font-medium">System</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 bg-gray-900/60 backdrop-blur-sm border border-purple-900/20 shadow-xl mb-6">
                  <h2 className="text-xl font-bold mb-4 text-white">Accent Color</h2>
                  
                  <div className="grid grid-cols-4 gap-4">
                    {['purple', 'blue', 'green', 'pink'].map((color) => (
                      <div
                        key={color}
                        className={`p-2 cursor-pointer rounded-lg border-2 ${
                          accentColor === color ? 'border-white' : 'border-transparent'
                        }`}
                        onClick={() => setAccentColor(color)}
                      >
                        <div 
                          className={`h-12 rounded-md flex items-center justify-center`}
                          style={{ 
                            backgroundColor: 
                              color === 'purple' ? '#8B5CF6' : 
                              color === 'blue' ? '#3B82F6' : 
                              color === 'green' ? '#10B981' : 
                              '#EC4899'
                          }}
                        >
                          <span className="text-white font-medium capitalize">{color}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
                
                <div className="flex justify-end">
                  <Button
                    onClick={handleProfileUpdate}
                    className="bg-purple-700 hover:bg-purple-600 text-white"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Settings;
