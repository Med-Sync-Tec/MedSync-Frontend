import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = (): void => {
    this.setState({ error: null });
  };

  render(): React.ReactNode {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          role="alert"
          className="min-h-screen flex items-center justify-center p-8 bg-background"
        >
          <div className="max-w-md w-full bg-surface rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-lg text-center space-y-4">
            <span className="material-symbols-outlined text-5xl text-red-500" aria-hidden="true">
              error
            </span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Algo salió mal
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {this.state.error.message || 'Error inesperado en la aplicación.'}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
