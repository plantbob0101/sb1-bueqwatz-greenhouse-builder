import React, { useState } from 'react';
import { Warehouse as GreenHouse } from 'lucide-react';
import ProjectList from './ProjectList';
import ProjectDetails from './ProjectDetails';
import { useAuth } from './auth/AuthProvider';
import NewProjectModal from './NewProjectModal';

export default function Dashboard() {
  const { user } = useAuth();
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectListKey, setProjectListKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleProjectCreated = () => {
    setProjectListKey(prev => prev + 1);
    setSelectedProjectId(null);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-red-500 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-8">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setSelectedProjectId(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Return to Dashboard"
              >
                <GreenHouse className="w-8 h-8 text-emerald-500" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">Greenhouse Builder</h1>
                <p className="text-sm text-gray-400">Welcome, {user?.email}</p>
              </div>
            </div>
            {!selectedProjectId && (
              <button
                onClick={() => setIsNewProjectModalOpen(true)}
                className="w-full md:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                New Project
              </button>
            )}
          </header>
          {selectedProjectId ? (
            <ProjectDetails
              structureId={selectedProjectId}
              onBack={() => setSelectedProjectId(null)}
              onDelete={() => {
                setSelectedProjectId(null);
                setProjectListKey(prev => prev + 1);
              }}
            />
          ) : (
            <ProjectList
              key={projectListKey}
              onSelectProject={setSelectedProjectId}
            />
          )}
          <NewProjectModal
            isOpen={isNewProjectModalOpen}
            onClose={() => setIsNewProjectModalOpen(false)}
            onSuccess={handleProjectCreated}
          />
        </div>
    </div>
  );
}