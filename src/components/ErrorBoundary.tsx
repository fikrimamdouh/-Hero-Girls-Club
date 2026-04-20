import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-4 text-center" dir="rtl">
          <h1 className="text-2xl font-bold text-red-600 mb-4">عذراً، حدث خطأ ما</h1>
          <p className="text-gray-600 mb-6">لقد واجهنا مشكلة غير متوقعة. يرجى المحاولة مرة أخرى لاحقاً.</p>
          <button
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            إعادة تحميل الصفحة
          </button>
          {this.state.error && (
            <pre className="mt-8 p-4 bg-gray-100 rounded text-left text-xs overflow-auto max-w-full dir-ltr">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
