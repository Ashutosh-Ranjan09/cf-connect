'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function SettingsPage() {
  const { logout } = useAuth();
  
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
    } catch (err) {
      // handle error (toast, etc.)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
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
            <Button variant="destructive" onClick={logout}>Log Out</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
