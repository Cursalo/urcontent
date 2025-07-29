import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId: string;
}

interface DashboardErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
  componentName?: string;
}

export class DashboardErrorBoundary extends React.Component<
  DashboardErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: DashboardErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error(`Dashboard Error Boundary (${this.props.componentName || 'Unknown'}):`, {
      error,
      errorInfo,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    this.setState({
      error,
      errorInfo
    });

    // You could also send this to an error reporting service
    // reportError(error, errorInfo, this.state.errorId);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
      }

      // Default error UI
      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-red-900">
                  Component Error
                </CardTitle>
                <p className="text-sm text-red-700">
                  {this.props.componentName || 'A dashboard component'} encountered an error
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-100 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-900 mb-2">Error Details:</h4>
              <p className="text-sm text-red-800 font-mono">
                {this.state.error?.message || 'Unknown error occurred'}
              </p>
              <p className="text-xs text-red-600 mt-2">
                Error ID: {this.state.errorId}
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
              <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Stack Trace (Development):</h4>
                <pre className="text-xs text-gray-700 overflow-auto max-h-32">
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Button
                onClick={this.handleRetry}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Reload Page
              </Button>
            </div>

            <div className="text-xs text-red-600">
              <p>If this error persists, please:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Clear your browser cache and cookies</li>
                <li>Try refreshing the page</li>
                <li>Contact support with Error ID: {this.state.errorId}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier usage
export const withDashboardErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>
) => {
  const WrappedComponent = (props: P) => (
    <DashboardErrorBoundary componentName={componentName} fallback={fallback}>
      <Component {...props} />
    </DashboardErrorBoundary>
  );

  WrappedComponent.displayName = `withDashboardErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Lightweight error fallback components
export const SimpleErrorFallback: React.FC<{ error?: Error; retry: () => void }> = ({ 
  error, 
  retry 
}) => (
  <div className="flex items-center justify-center p-8 text-center text-gray-500">
    <div>
      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
      <p className="text-sm mb-3">Something went wrong</p>
      <Button onClick={retry} size="sm" variant="outline">
        <RefreshCw className="w-3 h-3 mr-1" />
        Retry
      </Button>
    </div>
  </div>
);

export const CardErrorFallback: React.FC<{ error?: Error; retry: () => void }> = ({ 
  error, 
  retry 
}) => (
  <Card className="border-red-200">
    <CardContent className="flex items-center justify-center p-8 text-center">
      <div className="text-red-600">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm mb-3">Failed to load component</p>
        <Button onClick={retry} size="sm" variant="outline" className="border-red-300 text-red-700">
          <RefreshCw className="w-3 h-3 mr-1" />
          Try Again
        </Button>
      </div>
    </CardContent>
  </Card>
);