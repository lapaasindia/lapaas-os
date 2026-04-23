import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4">
          <div className="max-w-md w-full">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                    Oops! Something went wrong
                  </h3>
                  <p className="text-red-700 dark:text-red-200 text-sm mb-4">
                    {this.state.error?.message || 'An unexpected error occurred'}
                  </p>
                  <button
                    onClick={this.handleReset}
                    className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Go to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
