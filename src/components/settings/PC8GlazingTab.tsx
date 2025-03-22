import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const PC8GlazingTab = () => {
  console.log('PC8GlazingTab: Starting render');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    console.log('Debug:', info);
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${info}`].slice(-5));
  };

  useEffect(() => {
    console.log('PC8GlazingTab: useEffect running');
    const init = async () => {
      try {
        console.log('PC8GlazingTab: Starting initialization');
        addDebugInfo('Component mounted - Debug panel test');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('PC8GlazingTab: Auth error:', error);
          addDebugInfo(`Auth Error: ${error.message}`);
          setError(`Auth Error: ${error.message}`);
        } else if (session) {
          console.log('PC8GlazingTab: Session found:', session.user.email);
          addDebugInfo(`Logged in as: ${session.user.email}`);
        } else {
          console.log('PC8GlazingTab: No session found');
          addDebugInfo('No active session');
          setError('No active session');
        }
      } catch (err) {
        console.error('PC8GlazingTab: Init error:', err);
        setError(err instanceof Error ? err.message : 'Initialization error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return (
    <div className="p-4">
      {/* Debug Panel */}
      <div className="p-4 bg-red-100 rounded-lg mb-4">
        <h3 className="font-semibold mb-2 text-gray-900">Debug Panel</h3>
        {debugInfo.map((info, i) => (
          <div key={i} className="text-sm font-mono text-gray-700">{info}</div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="text-white">PC8 Glazing Tab - Minimal Version</div>
      )}
    </div>
  );
};

export default PC8GlazingTab;