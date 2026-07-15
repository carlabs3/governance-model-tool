import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import logoSrc from '@/assets/NEU-logo_RGB_main-color.png';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address' }).max(255),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).max(72),
});

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const claimProjectId = (location.state as any)?.claimProjectId;
  const returnTo = (location.state as any)?.returnTo || '/dashboard';

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(returnTo, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, returnTo]);

  const validateInput = () => {
    try {
      authSchema.parse({ email, password });
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateInput()) return;
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please check your email and confirm your account before signing in.');
      } else {
        setError(error.message);
      }
    } else {
      toast({ title: 'Welcome back!', description: 'You have successfully signed in.' });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateInput()) return;
    setIsLoading(true);
    const { error } = await signUp(email, password);
    setIsLoading(false);
    if (error) {
      if (error.message.includes('User already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(error.message);
      }
    } else {
      setSignUpSuccess(true);
      toast({ title: 'Account created!', description: 'Please check your email to confirm your account.' });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      {/* Header */}
      <header className="border-b border-border/60 sticky top-0 z-10 bg-background/80 backdrop-blur-xl">
        <div className="container-wide py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img src={logoSrc} alt="NeutralPath 2030" className="h-9 w-auto object-contain" />
          </div>
        </div>
      </header>

      {/* Auth Form */}
      <div className="container-narrow py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-gradient-to-r from-brand-primary/8 to-brand-secondary/8 blur-3xl" />
        </div>

        <Card className="max-w-md mx-auto rounded-2xl border-border/60 shadow-lg shadow-brand-primary/5 relative z-[1]">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
                {claimProjectId ? 'Claim Your Project' : 'Welcome'}
              </span>
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              {claimProjectId
                ? 'Create an account to save this project to your dashboard'
                : 'Sign in to access your projects or create a new account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 rounded-xl">
                <TabsTrigger value="signin" className="rounded-lg">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl border-border/60 focus:border-brand-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl border-border/60 focus:border-brand-primary"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-xl">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-base bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 shadow-lg shadow-brand-primary/20 transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                {signUpSuccess ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary/15 to-brand-secondary/15 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-brand-primary" />
                    </div>
                    <h3 className="font-semibold mb-2 text-foreground">Check your email!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      We've sent a confirmation link to <strong>{email}</strong>.
                      Please click the link to verify your account.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSignUpSuccess(false)}
                      className="rounded-xl border-2 border-brand-primary/40 text-brand-primary hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-200"
                    >
                      Back to Sign Up
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 rounded-xl border-border/60 focus:border-brand-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 rounded-xl border-border/60 focus:border-brand-primary"
                      />
                      <p className="text-xs text-muted-foreground">
                        Must be at least 6 characters
                      </p>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-xl">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 rounded-xl text-base bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 shadow-lg shadow-brand-primary/20 transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t border-border/40 text-center">
              <p className="text-sm text-muted-foreground">
                Don't want to create an account?
              </p>
              <Button
                variant="link"
                className="text-sm text-brand-primary"
                onClick={() => navigate('/')}
              >
                Continue as guest
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
