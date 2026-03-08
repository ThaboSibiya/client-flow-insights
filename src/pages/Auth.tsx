
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Mail, Lock, UserPlus, LogIn, RefreshCw, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import quikleLogo from '@/assets/quikle-logo.png';

// Validation schemas
const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters long');

const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const getAuthErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes('failed to fetch')) {
      return 'Network error: please check your connection and try again.';
    }
    return error.message;
  }

  return fallback;
};

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const navigate = useNavigate();

  // Validate form inputs
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.email = error.errors[0]?.message || 'Invalid email';
      }
    }
    
    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.password = error.errors[0]?.message || 'Invalid password';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Sign up with Supabase - simplified without email confirmation to avoid timeouts
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            email: email.trim(),
          }
        }
      });
      
      if (error) {
        console.error('SignUp error:', error);
        
        // Log failed registration attempt (non-blocking)
        supabase.from('security_events').insert({
          event_type: 'registration_failed',
          resource_type: 'user_account',
          metadata: {
            email: email.trim(),
            error: error.message,
            error_code: error.status,
            timestamp: new Date().toISOString()
          }
        }).then(({ error: logError }) => {
          if (logError) console.error('Failed to log registration error:', logError);
        });
        
        throw error;
      }
      
      // Check if user already exists
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast({
          title: "Account already exists",
          description: "Please log in instead",
          variant: "destructive",
        });
        setActiveTab('login');
        setLoading(false);
        return;
      }
      
      if (data.user) {
        // Log successful registration (non-blocking)
        supabase.from('security_events').insert({
          event_type: 'registration_success',
          resource_type: 'user_account',
          user_id: data.user.id,
          metadata: {
            email: email.trim(),
            confirmed: data.user.email_confirmed_at !== null,
            timestamp: new Date().toISOString()
          }
        }).then(({ error: logError }) => {
          if (logError) console.error('Failed to log registration success:', logError);
        });

        toast({
          title: "Account created successfully! 🎉",
          description: "Welcome to Quikle CRM! You're being redirected to your dashboard.",
          duration: 3000,
        });
        
        // Clear form
        setEmail('');
        setPassword('');
        setValidationErrors({});
        
        // User will be automatically redirected by the auth state listener
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
      console.error('Registration error:', errorMessage);
      
      // Handle specific error cases
      let userMessage = errorMessage;
      let description = "Please try again or contact support if the issue persists.";
      
      if (errorMessage.includes('already registered')) {
        userMessage = "Email already registered";
        description = "Please sign in or use a different email address.";
      } else if (errorMessage.includes('timeout') || errorMessage.includes('504')) {
        userMessage = "Registration is processing";
        description = "Your account is being created. Please check your email in a few moments.";
      } else if (errorMessage.includes('network')) {
        userMessage = "Network error";
        description = "Please check your internet connection and try again.";
      }
      
      toast({
        title: userMessage,
        description: description,
        variant: errorMessage.includes('timeout') ? "default" : "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have been successfully signed in",
      });
    } catch (error: unknown) {
      toast({
        title: "Sign in failed",
        description: getAuthErrorMessage(error, 'Failed to sign in'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sanitizedEmail = email.trim().toLowerCase();
      emailSchema.parse(sanitizedEmail);

      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: "Check your inbox and spam folder for the reset link.",
      });

      setActiveTab('login');
    } catch (error: unknown) {
      toast({
        title: "Reset request failed",
        description: getAuthErrorMessage(error, 'Failed to send reset email'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center flex flex-col items-center gap-3">
          <img src={quikleLogo} alt="Quikle Logo" className="h-16 w-16 object-contain drop-shadow-md" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Quikle CRM</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your customers efficiently</p>
          </div>
        </div>
        
        <Card className="border-border/50 shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="text-center">Welcome</CardTitle>
            <CardDescription className="text-center">Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full overflow-x-auto flex md:grid md:grid-cols-3 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
              <TabsTrigger value="login" className="flex-1 md:flex-initial">Login</TabsTrigger>
              <TabsTrigger value="register" className="flex-1 md:flex-initial">Register</TabsTrigger>
              <TabsTrigger value="forgot">Reset</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (validationErrors.email) {
                            setValidationErrors(prev => ({ ...prev, email: '' }));
                          }
                        }}
                        required
                        className={`pl-10 bg-background text-foreground border-input ${validationErrors.email ? 'border-destructive' : ''}`}
                      />
                      {validationErrors.email && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.email}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (validationErrors.password) {
                            setValidationErrors(prev => ({ ...prev, password: '' }));
                          }
                        }}
                        required
                        className={`pl-10 bg-background text-foreground border-input ${validationErrors.password ? 'border-destructive' : ''}`}
                      />
                      {validationErrors.password && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.password}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => setActiveTab('forgot')}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Forgot your password?
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 bg-background text-foreground border-input"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 bg-background text-foreground border-input"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="forgot">
              <form onSubmit={handleForgotPassword}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 bg-background text-foreground border-input"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter your email address and we'll send you a link to reset your password
                    </p>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {loading ? 'Sending reset link...' : 'Send Reset Link'}
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => setActiveTab('login')}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Back to login
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
