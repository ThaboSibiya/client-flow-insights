import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface OnboardingErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface OnboardingErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
}

class OnboardingErrorBoundary extends React.Component<
  OnboardingErrorBoundaryProps,
  OnboardingErrorBoundaryState
> {
  constructor(props: OnboardingErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): OnboardingErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Onboarding Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 quikle-gradient-bg">
          <Card className="w-full max-w-md glass-effect shadow-luxury">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-red-500/10 rounded-full w-fit">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-quikle-charcoal">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-quikle-slate mb-6">
                We encountered an error during the onboarding process. Please try again.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full quikle-button-primary"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full"
                >
                  Skip to Dashboard
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-sm text-quikle-slate cursor-pointer">
                    Error Details
                  </summary>
                  <pre className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default OnboardingErrorBoundary;