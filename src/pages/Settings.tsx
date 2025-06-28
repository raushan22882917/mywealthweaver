import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Profile {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  updated_at: string | null;
  created_at: string | null;
}

const Settings: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile>({
    id: '',
    username: '',
    email: '',
    bio: null,
    updated_at: null,
    created_at: null
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          fetchProfile(user.id);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to fetch user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          id: data.id,
          username: data.username || '',
          email: data.email || '',
          bio: data.bio || null,
          updated_at: data.updated_at,
          created_at: data.created_at
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to fetch profile data.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          email: profile.email,
          bio: profile.bio || null
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setMessage('Profile updated successfully!');
      setIsError(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile');
      setIsError(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Settings</CardTitle>
            <CardDescription>Manage your profile settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    type="text"
                    id="username"
                    name="username"
                    value={profile.username}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    name="bio"
                    value={profile.bio || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <Button onClick={handleSaveProfile}>Save Profile</Button>
                {message && (
                  <div className={isError ? "text-red-500" : "text-green-500"}>{message}</div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Settings;
