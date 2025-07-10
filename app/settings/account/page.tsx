'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { redirect, useRouter } from 'next/navigation';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Router } from 'next/router';

export default function SettingsPage() {
  const { logout } = useAuth();
  const { toast } = useToast();
  
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
  async function fetchPrivacy() {
    const res = await axios.get('/api/account');
    const user = res.data;
    console.log(user);
    if (user) {
      setIsPrivate(!!user.isPrivate);
    }
  }
  fetchPrivacy();
}, []);

  const handlePrivacyToggle = async () => {
    setLoading(true);
    try {
      await axios.patch('/api/account', { isPrivate: isPrivate });
      setIsPrivate(!isPrivate);
      toast({
        title: 'Privacy Updated',
        description: `Your profile is now ${!isPrivate ? 'private' : 'public'}.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update privacy setting.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {
    try {
      logout();
    router.push('/');
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };
  return (
    <div className="max-w-xl mx-auto py-8">
      <Toaster />
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-medium">Private Profile</span>
            <Switch checked={isPrivate} onCheckedChange={handlePrivacyToggle} disabled={loading} />
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push('/forgot-password')}>Reset Password</Button>
            <Button variant="destructive" onClick={handleLogout}>Log Out</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
