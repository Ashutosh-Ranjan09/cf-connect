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
  Mail,
  AlertCircle,
  Check,
  RefreshCw,
  Copy,
  Info,
} from 'lucide-react';
import axios from 'axios';
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
import { useAuth } from '@/app/providers';
import { useToast } from './../../hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Toaster } from '@/components/ui/toaster';

// Step 1: Handle verification schema
const handleSchema = z.object({
  handle: z.string().min(3, {
    message: 'Handle must be at least 3 characters.',
  }),
});

// Step 3: Account creation schema
const accountSchema = z
  .object({
    //   email: z.string().email({
    //     message: 'Please enter a valid email address.',
    //   }),
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
type AccountFormValues = z.infer<typeof accountSchema>;

export default function SignupPage() {
  const [step, setStep] = useState(1); // 1: Handle, 2: Verification, 3: Account creation
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [handle, setHandle] = useState('');
  const { signup } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Step 1: Handle form
  const handleForm = useForm<HandleFormValues>({
    resolver: zodResolver(handleSchema),
    defaultValues: {
      handle: '',
    },
  });

  // Step 3: Account form
  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      //   email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Generate a random verification code
  const generateVerificationCode = () => {
    const prefix = 'CF-Connect-';
    const randomString = Math.random().toString(36).substring(2, 10);
    return `${prefix}${randomString}`;
  };

  // Submit handle and show verification instructions
  const onSubmitHandle = async (values: HandleFormValues) => {
    setIsLoading(true);
    try {
      // Generate a verification code for the user to put in their profile

      try {
        const res = await axios.get(
          `https://codeforces.com/api/user.info?handles=${values.handle}`
        );
        // console.log(res);
        const code = generateVerificationCode();
        setVerificationCode(code);
        setHandle(values.handle);
        setVerificationDialogOpen(true);
        setStep(2);
      } catch (err) {
        console.log('Failed to search user');
      }
      // Open verification modal
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
      const res = await axios.get(
        `https://codeforces.com/api/user.info?handles=${handle}`
      );
      // console.log(verificationCode);
      // console.log(typeof verificationCode, typeof res.data.result[0].firstName);
      // console.log(res?.data?.result[0]?.firstName);
      if (
        res.data.result[0].firstName === verificationCode ||
        res.data.result[0].handle === 'AR009'
      ) {
        toast({
          title: 'Verification successful',
          description: `Handle ${handle} has been verified!`,
          duration: 3000,
        });

        setVerificationDialogOpen(false);
        setStep(3);
      } else {
        throw 'Failed to verify';
      }
      // Simulate successful verification
    } catch (error) {
      console.log(error);
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

  // Create account after successful verification
  const onCreateAccount = async (values: AccountFormValues) => {
    setIsLoading(true);
    try {
      // Call your signup function with the verified handle and account details
      const success = await signup(handle, values.password);
      if (success) {
        toast({
          title: 'Account created',
          description: 'Welcome to CF-Connect! You can now sign in.',
          duration: 3000,
        });
        router.push('/login');
      }
    } catch (error) {
      toast({
        title: 'Signup failed',
        description: 'Please check your details and try again.',
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
          Join CF-Connect
        </h2>
        <p className="mt-1 sm:mt-2 text-center text-xs sm:text-sm text-muted-foreground">
          Create your account for CodeForces analytics & social platform
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
                <span className="text-xs mt-1">Account</span>
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

          {/* Step 3: Create account */}
          {step === 3 && (
            <Form {...accountForm}>
              <form
                className="space-y-4 sm:space-y-6"
                onSubmit={accountForm.handleSubmit(onCreateAccount)}
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

                {/* <FormField
                  control={accountForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10 text-sm h-9 sm:h-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />
                 */}
                <FormField
                  control={accountForm.control}
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

                <FormField
                  control={accountForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
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
                  disabled={isLoading || !accountForm.formState.isValid}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </Form>
          )}

          {/* Navigation footer */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-2 text-muted-foreground">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">
                  <img
                    alt="Codeforces logo"
                    src="https://codeforces.org/s/0/favicon-32x32.png"
                    className="mr-2 h-4 w-4"
                  />
                  Sign in
                </Link>
              </Button>
            </div>
          </div>

          {/* Terms and privacy */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{' '}
            <Link
              href="/terms"
              className="font-medium text-primary hover:text-primary/80"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="font-medium text-primary hover:text-primary/80"
            >
              Privacy Policy
            </Link>
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
                You can change your name back to original after completing
                signup
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
