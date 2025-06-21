'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Lock,
  RefreshCw,
  Copy,
  Info,
  ArrowLeft,
  Check,
} from 'lucide-react';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/app/providers';
import { useToast } from '../../hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

// Step 1: Handle verification schema
const handleSchema = z.object({
  handle: z.string().min(3, {
    message: 'Handle must be at least 3 characters.',
  }),
});

// Step 3: New password schema
const passwordSchema = z
  .object({
    password: z.string().min(6, {
      message: 'Password must be at least 6 characters.',
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type HandleFormValues = z.infer<typeof handleSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Handle, 2: Verification, 3: New Password
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [handle, setHandle] = useState('');
  const { resetPassword } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Step 1: Handle form
  const handleForm = useForm<HandleFormValues>({
    resolver: zodResolver(handleSchema),
    defaultValues: {
      handle: '',
    },
  });

  // Step 3: Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Generate a random verification code
  const generateVerificationCode = () => {
    const prefix = 'CF-Reset-';
    const randomString = Math.random().toString(36).substring(2, 10);
    return `${prefix}${randomString}`;
  };

  // Submit handle and show verification instructions
  const onSubmitHandle = async (values: HandleFormValues) => {
    setIsLoading(true);
    try {
      // Check if handle exists in your system
      // This would be an API call in a real implementation
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API call

      // Generate a verification code for the user to put in their profile
      const code = generateVerificationCode();
      setVerificationCode(code);
      setHandle(values.handle);

      // Open verification modal
      setVerificationDialogOpen(true);
      setStep(2);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Copy verification code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(verificationCode);
    toast({
      title: 'Copied',
      description: 'Verification code copied to clipboard',
      duration: 2000,
    });
  };

  // Verify that the user has changed their profile name
  const verifyHandle = async () => {
    setIsVerifying(true);
    try {
      // In a real implementation, this would make an API call to check if the profile name was updated
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulating API call

      // Simulate successful verification
      toast({
        title: 'Verification successful',
        description: `Handle ${handle} has been verified!`,
        duration: 3000,
      });

      setVerificationDialogOpen(false);
      setStep(3);
    } catch (error) {
      toast({
        title: 'Verification failed',
        description:
          'We could not verify your Codeforces profile change. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Reset password after successful verification
  const onResetPassword = async (values: PasswordFormValues) => {
    setIsLoading(true);
    try {
      // Call your password reset function with the verified handle and new password
      const success = await resetPassword(handle, values.password);

      if (success) {
        toast({
          title: 'Password reset successful',
          description:
            'Your password has been reset. You can now sign in with your new password.',
          duration: 3000,
        });
        router.push('/login');
      }
    } catch (error) {
      toast({
        title: 'Password reset failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
          Reset your password
        </h2>
        <p className="mt-1 sm:mt-2 text-center text-xs sm:text-sm text-muted-foreground">
          Verify your Codeforces handle to reset your password
        </p>
      </div>

      <div className="mt-6 sm:mt-8 w-full sm:mx-auto sm:max-w-md">
        <div className="bg-card px-3 sm:px-4 md:px-6 lg:px-10 py-6 sm:py-8 shadow sm:rounded-lg">
          {/* Step indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  1
                </div>
                <span className="text-xs mt-1">Handle</span>
              </div>
              <div
                className={`flex-1 h-0.5 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}
              ></div>
              <div className="flex flex-col items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  2
                </div>
                <span className="text-xs mt-1">Verify</span>
              </div>
              <div
                className={`flex-1 h-0.5 mx-2 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}
              ></div>
              <div className="flex flex-col items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  3
                </div>
                <span className="text-xs mt-1">Password</span>
              </div>
            </div>
          </div>

          {/* Step 1: Enter Codeforces handle */}
          {step === 1 && (
            <Form {...handleForm}>
              <form
                className="space-y-4 sm:space-y-6"
                onSubmit={handleForm.handleSubmit(onSubmitHandle)}
              >
                <FormField
                  control={handleForm.control}
                  name="handle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        CodeForces Handle
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          <Input
                            placeholder="Your Codeforces handle"
                            className="pl-10 text-sm h-9 sm:h-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !handleForm.formState.isValid}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                      Processing...
                    </span>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </form>
            </Form>
          )}

          {/* Step 3: Create new password */}
          {step === 3 && (
            <Form {...passwordForm}>
              <form
                className="space-y-4 sm:space-y-6"
                onSubmit={passwordForm.handleSubmit(onResetPassword)}
              >
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md flex items-start gap-3 mb-4">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Handle verified successfully
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      {handle} has been verified
                    </p>
                  </div>
                </div>

                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
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

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
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

                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-xs text-blue-700 dark:text-blue-300">
                    You can now change your Codeforces profile name back to your
                    original name.
                  </AlertDescription>
                </Alert>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !passwordForm.formState.isValid}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                      Resetting password...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            </Form>
          )}

          {/* Back to login link */}
          <div className="mt-6">
            <Button variant="link" asChild className="p-0 h-auto text-sm">
              <Link href="/login" className="flex items-center text-primary">
                <ArrowLeft className="h-3 w-3 mr-1" />
                Back to login
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Verification Dialog */}
      <Dialog
        open={verificationDialogOpen}
        onOpenChange={setVerificationDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify your Codeforces handle</DialogTitle>
            <DialogDescription>
              To verify ownership of this handle, please change your first name
              on Codeforces to the code below:
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-muted/50 rounded-md flex items-center justify-between">
            <code className="text-sm font-mono">{verificationCode}</code>
            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <ol className="list-decimal list-inside text-sm space-y-2">
              <li>
                Go to{' '}
                <a
                  href="https://codeforces.com/settings/social"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Codeforces settings
                </a>
              </li>
              <li>
                Update your "First name/given name" field with the code above
              </li>
              <li>Click "Save" on Codeforces</li>
              <li>Return here and click "Verify" below</li>
            </ol>

            <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <Info className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                You can change your name back to original after resetting your
                password
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setVerificationDialogOpen(false);
                setStep(1);
              }}
            >
              Back
            </Button>
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2">
              {/* <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  toast({
                    title: "Have you changed your name?",
                    description: "Please confirm that you've changed your name on Codeforces before verifying",
                    duration: 3000,
                  });
                }}
              >
                I've changed my name
              </Button> */}
              <Button
                onClick={verifyHandle}
                disabled={isVerifying}
                className="flex items-center"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  'Verify Handle'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
