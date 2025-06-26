
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, User, Building } from 'lucide-react';

const EmployeeSetup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast({
        title: "Invalid Link",
        description: "This invitation link is invalid or missing.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    validateInvitation();
  }, [token]);

  const validateInvitation = async () => {
    try {
      const { data, error } = await supabase.rpc('validate_invitation_token', {
        p_token: token
      });

      if (error) throw error;

      if (!data || data.length === 0 || !data[0].is_valid) {
        toast({
          title: "Invalid Invitation",
          description: "This invitation link is invalid or has expired.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      setInvitationData(data[0]);
    } catch (error: any) {
      console.error('Error validating invitation:', error);
      toast({
        title: "Error",
        description: "Failed to validate invitation. Please try again.",
        variant: "destructive"
      });
      navigate('/auth');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitationData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      // Complete employee registration
      const { data: registrationData, error: registrationError } = await supabase.rpc(
        'complete_employee_registration',
        {
          p_token: token,
          p_user_id: authData.user.id
        }
      );

      if (registrationError) throw registrationError;

      if (!registrationData) {
        throw new Error("Failed to complete registration");
      }

      toast({
        title: "Registration Complete",
        description: "Your account has been set up successfully. You can now log in.",
      });

      // Sign in the user immediately
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: invitationData.email,
        password: formData.password
      });

      if (signInError) {
        // If auto sign-in fails, redirect to login
        navigate('/auth');
      } else {
        // Success - user will be redirected by auth state change
        navigate('/dashboard');
      }

    } catch (error: any) {
      console.error('Error completing registration:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to complete registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-quikle-platinum">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-quikle-primary mx-auto mb-4"></div>
          <p className="text-quikle-slate">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (!invitationData) {
    return null;
  }

  const employeeInfo = invitationData.employee_data;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-quikle-platinum">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-quikle-charcoal">Complete Your Registration</h1>
          <p className="mt-2 text-quikle-slate">Set up your Quikle CRM account</p>
        </div>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <User className="h-5 w-5 text-quikle-primary" />
              Welcome, {employeeInfo.first_name}!
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Employee Information Display */}
            <div className="bg-quikle-crystal p-4 rounded-lg border border-quikle-silver/30">
              <h3 className="font-medium text-quikle-charcoal mb-3 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Employee Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-quikle-slate">Name:</span>
                  <span className="text-quikle-charcoal font-medium">
                    {employeeInfo.first_name} {employeeInfo.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-quikle-slate">Employee ID:</span>
                  <span className="text-quikle-charcoal font-medium">{employeeInfo.employee_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-quikle-slate">Title:</span>
                  <span className="text-quikle-charcoal font-medium">{employeeInfo.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-quikle-slate">Department:</span>
                  <span className="text-quikle-charcoal font-medium">{employeeInfo.department || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-quikle-slate">Role:</span>
                  <span className="text-quikle-charcoal font-medium capitalize">{employeeInfo.role}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={invitationData.email}
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-quikle-primary hover:bg-quikle-secondary"
                disabled={loading}
              >
                {loading ? 'Setting up account...' : 'Complete Registration'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeSetup;
