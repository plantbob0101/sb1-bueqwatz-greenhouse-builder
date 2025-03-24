import React, { Component, ErrorInfo } from 'react';
import { AuthProvider } from './components/auth/AuthProvider';
import { useAuth } from './components/auth/AuthProvider';
import LoginForm from './components/auth/LoginForm';
import AppLayout from './components/AppLayout';

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App error:', error);
    console.error('Error details:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-lg">
            <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
            <p className="mb-2">Error: {this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  console.log('AppContent: Rendering');
  const { user, loading } = useAuth();
  console.log('AppContent: Auth state -', { user: user?.email, loading });

  if (loading) {
    console.log('AppContent: Loading state');
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-emerald-500 text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    console.log('AppContent: No user, showing login form');
    return <LoginForm />;
  }

  console.log('AppContent: User authenticated, showing AppLayout');
  return <AppLayout />;
}

function App() {
  console.log('App: Initial render');
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
