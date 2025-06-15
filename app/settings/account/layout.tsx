import { AppShell } from '@/components/layout/app-shell';

// app/settings/layout.tsx
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <div className="min-h-screen w-full bg-background">
        {children}
      </div>
    </AppShell>
  );
}
