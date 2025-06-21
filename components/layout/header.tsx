'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, Bell, User, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/app/providers';
import { Sidebar } from './sidebar';
import { getRatingColor } from '@/lib/utils';
import axios from 'axios';
import { get } from 'lodash';

export const Header = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // const [avatar, setAvatar] = useState('/default-avatar.png');
  // Handle hydration mismatch with theme
  useEffect(() => {
    setMounted(true);
  }, []);
  // useEffect(() => {
  //   async function getAvatar() {
  //     const res = await axios.get('/api/account');
  //     const data=res.data;
  //     if (data && data.avatar) {
  //       console.log('Avatar URL:', data.avatar);
  //       setAvatar(data.avatar);
  //     }
  //   }
  //    getAvatar();
  // },[])
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getPageTitle = () => {
    if (pathname === '/') return 'Home';
    if (pathname === '/login') return 'Login';
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/profile')) return 'Profile';
    if (pathname.startsWith('/friends')) return 'Friends';
    if (pathname.startsWith('/leaderboard')) return 'Leaderboard';
    if (pathname.startsWith('/contests')) return 'Contests';
    if (pathname.startsWith('/recommendations')) return 'Recommendations';
    return 'CF-Connect';
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors duration-200 ${scrolled ? 'bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60' : 'bg-transparent'}`}
    >
      <div className="container flex h-16 items-center justify-between py-2 sm:py-4 px-2 sm:px-4 md:px-6 overflow-hidden">
        <div className="flex items-center gap-1 sm:gap-3 md:gap-4 lg:gap-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[80%] sm:w-[300px]">
              <Sidebar />
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex items-center gap-1 sm:gap-2">
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 p-1 sm:p-1.5 rounded text-white font-bold text-xs sm:text-sm">
              CF
            </div>
            <span className="hidden font-bold text-base sm:text-lg sm:inline-block">
              CF-Connect
            </span>
          </Link>

          <h1 className="text-sm sm:text-base md:text-lg font-semibold truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          )}

          {user?.isAuthenticated ? (
            <>
              {/* <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                <span className="sr-only">Notifications</span>
              </Button> */}

              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={avatar} alt={user.handle} />
                      <AvatarFallback>
                        {user.handle.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.handle}</p>
                      <p className={`text-sm ${getRatingColor(user.rating)}`}>
                        {user.rank}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/profile/${user.handle}`}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> */}
            </>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
