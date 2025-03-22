import React from 'react';
import { AuthProvider } from './components/auth/AuthProvider';
import { useAuth } from './components/auth/AuthProvider';
import LoginForm from './components/auth/LoginForm';
import AppLayout from './components/AppLayout';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-emerald-500 text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <AppLayout />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
