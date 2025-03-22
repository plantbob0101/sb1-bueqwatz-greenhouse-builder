import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle, Users2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from './auth/AuthProvider';

interface ShareProjectModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface SharedUser {
  email: string;
  permission: 'view' | 'edit';
  share_id: string;
}

export default function ShareProjectModal({ projectId, isOpen, onClose }: ShareProjectModalProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadSharedUsers();
    }
  }, [isOpen, projectId]);

  const loadSharedUsers = async () => {
    try {
      const { data: shares, error: sharesError } = await supabase
        .from('project_shares')
        .select('*, shared_user:profiles!inner(email)')
        .eq('project_id', projectId);

      if (sharesError) throw sharesError;

      if (shares) {
        const sharedUsersData = shares.map(share => ({
          email: share.shared_user?.email || '',
          permission: share.permission as 'view' | 'edit',
          share_id: share.share_id
        })).filter(user => user.email);
        
        setSharedUsers(sharedUsersData);
      }
    } catch (err) {
      console.error('Error loading shared users:', err);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user?.id) {
        throw new Error('You must be logged in to share projects');
      }

      // Get user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (userError) {
        throw new Error('User not found');
      }

      // Check if already shared
      const { data: existingShare } = await supabase
        .from('project_shares')
        .select('share_id')
        .eq('project_id', projectId)
        .eq('shared_with', userData.id)
        .single();

      if (existingShare) {
        throw new Error('Project already shared with this user');
      }

      // Create share
      const { error: shareError } = await supabase
        .from('project_shares')
        .insert({
          user_id: user.id,
          project_id: projectId,
          shared_with: userData.id,
          permission
        });

      if (shareError) throw shareError;

      setSuccess('Project shared successfully');
      setEmail('');
      loadSharedUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share project');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('project_shares')
        .delete()
        .eq('share_id', shareId);

      if (error) throw error;
      loadSharedUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove share');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Share Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="colleague@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Permission Level
            </label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="view">Can View</option>
              <option value="edit">Can Edit</option>
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-emerald-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Sharing...' : 'Share Project'}
          </button>
        </form>

        {sharedUsers.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Users2 className="w-4 h-4" />
              Shared With
            </h3>
            <div className="space-y-2">
              {sharedUsers.map((sharedUser) => (
                <div
                  key={sharedUser.share_id}
                  className="flex items-center justify-between bg-gray-750 p-3 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">{sharedUser.email}</p>
                    <p className="text-xs text-gray-400">
                      {sharedUser.permission === 'edit' ? 'Can Edit' : 'Can View'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveShare(sharedUser.share_id)}
                    className="text-red-500 hover:text-red-400 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}