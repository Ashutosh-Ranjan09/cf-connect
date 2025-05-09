'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Trophy,
  CalendarDays,
  User,
  ChevronDown,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/app/providers';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  active?: boolean;
  isSubmenu?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  href,
  icon,
  title,
  active,
  isSubmenu = false,
}) => (
  <Link
    href={href}
    className={cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary',
      active
        ? 'bg-secondary text-primary'
        : 'text-muted-foreground hover:bg-secondary/50',
      isSubmenu && 'pl-9'
    )}
  >
    {icon}
    {title}
  </Link>
);

export const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Close settings submenu when navigating away
  useEffect(() => {
    setIsSettingsOpen(false);
  }, [pathname]);

  return (
    <div className="h-[100dvh] flex flex-col border-r overflow-hidden">
      <div className="p-4 sm:p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 p-1.5 rounded text-white font-bold">
            CF
          </div>
          <span className="font-bold text-lg sm:text-xl">CF-Connect</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-4">
        <nav className="flex flex-col gap-2 py-2">
          <SidebarItem
            href="/dashboard"
            icon={<LayoutDashboard className="h-5 w-5" />}
            title="Dashboard"
            active={pathname === '/dashboard'}
          />

          <SidebarItem
            href={`/profile/${user?.handle || 'guest'}`}
            icon={<User className="h-5 w-5" />}
            title="Profile"
            active={pathname.startsWith('/profile')}
          />

          <SidebarItem
            href="/friends"
            icon={<Users className="h-5 w-5" />}
            title="Friends"
            active={pathname === '/friends'}
          />

          <SidebarItem
            href="/leaderboard"
            icon={<Trophy className="h-5 w-5" />}
            title="Leaderboard"
            active={pathname === '/leaderboard'}
          />

          <SidebarItem
            href="/contests"
            icon={<CalendarDays className="h-5 w-5" />}
            title="Contests"
            active={pathname === '/contests'}
          />

          <div className="py-2">
            <div className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
              Account
            </div>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'w-full justify-between px-3 py-2 text-muted-foreground hover:bg-secondary/50 hover:text-primary',
                isSettingsOpen && 'bg-secondary text-primary'
              )}
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5" />
                Settings
              </div>
              {isSettingsOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            {isSettingsOpen && (
              <div className="mt-1 space-y-1">
                <SidebarItem
                  href="/settings/account"
                  icon={<User className="h-4 w-4" />}
                  title="Account"
                  active={pathname === '/settings/account'}
                  isSubmenu
                />
                {/* Add more settings submenu items here */}
              </div>
            )}
          </div>
        </nav>
      </ScrollArea>

      <div className="mt-auto p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span>© 2025 CF-Connect</span>
          </div>
        </div>
      </div>
    </div>
  );
};
