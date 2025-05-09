import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  BarChart,
  Users,
  Trophy,
  CalendarDays,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 p-1.5 rounded text-white font-bold">
              CF
            </div>
            <span className="font-bold text-xl">CF-Connect</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </nav>
          <div className="md:hidden flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-28">
          <div className="container flex flex-col items-center text-center gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight tracking-tighter md:leading-none">
              Elevate Your Competitive Programming
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl px-4 sm:px-0">
              CF-Connect helps you track progress, analyze performance, and
              connect with other competitive programmers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-muted/50">
          <div className="container px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why CF-Connect?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Deep Analytics</h3>
                <p className="text-muted-foreground">
                  Visualize your performance with interactive charts and
                  detailed statistics.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Connect & Compare</h3>
                <p className="text-muted-foreground">
                  Follow friends, compare progress, and stay motivated together.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Competitive Edge</h3>
                <p className="text-muted-foreground">
                  See where you stand on global and friend leaderboards.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CalendarDays className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Contest Tracking</h3>
                <p className="text-muted-foreground">
                  Never miss a contest with reminders and post-contest analysis.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-20">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center px-4 sm:px-6">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
                About CF-Connect
              </h2>
              <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8">
                CF-Connect was created by competitive programmers, for
                competitive programmers. We understand the journey and built
                tools we wished we had when starting out.
              </p>
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Start Your Journey
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-10 bg-card">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-center gap-2">
              <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 p-1.5 rounded text-white font-bold">
                CF
              </div>
              <span className="font-bold">CF-Connect</span>
            </div>
            <p className="text-sm text-muted-foreground order-3 md:order-2">
              © 2025 CF-Connect. All rights reserved.
            </p>
            <div className="flex items-center gap-4 sm:gap-6 order-2 md:order-3">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
