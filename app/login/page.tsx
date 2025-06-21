'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock, AlertCircle, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/app/providers';
import { useToast } from './../../hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

// Form schema
const loginSchema = z.object({
  handle: z.string().min(3, {
    message: 'Handle must be at least 3 characters.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Form setup
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      handle: '',
      password: '',
    },
  });

  // Login handler
  const onSubmit = async (values: LoginFormValues) => {
    try {
      const success = await login(values.handle, values.password);
      if (success) {
        toast({
          title: 'Login successful',
          description: 'Welcome to CF-Connect!',
          duration: 3000,
        });
        router.push('/dashboard');
      } else {
        toast({
          title: 'Login failed',
          description: 'Please check your credentials and try again.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  return (
    <div className="mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12 flex min-h-screen flex-col items-center justify-center">
      <Toaster />
      <div className="w-full sm:mx-auto sm:max-w-md px-3 sm:px-0">
        <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 p-1 sm:p-1.5 rounded text-white font-bold text-xs sm:text-sm">
            CF
          </div>
        </div>
        <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold">
          Sign in to CF-Connect
        </h2>
        <p className="mt-1 sm:mt-2 text-center text-xs sm:text-sm text-muted-foreground">
          Your CodeForces analytics & social platform
        </p>
      </div>

      <div className="mt-6 sm:mt-8 w-full sm:mx-auto sm:max-w-md">
        <div className="bg-card px-3 sm:px-4 md:px-6 lg:px-10 py-6 sm:py-8 shadow sm:rounded-lg">
          <Form {...form}>
            <form
              className="space-y-4 sm:space-y-6"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="handle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">CodeForces Handle</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        <Input
                          placeholder="handle"
                          className="pl-10 text-sm h-9 sm:h-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !form.formState.isValid}
              >
                Login
              </Button>
            </form>
          </Form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-2 text-muted-foreground">
                  New user ?
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  router.push('/signup');
                }}
              >
                <img
                  alt="Codeforces logo"
                  src="https://codeforces.org/s/0/favicon-32x32.png"
                  className="mr-2 h-4 w-4"
                />
                Sign up
              </Button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-primary hover:text-primary/80"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
