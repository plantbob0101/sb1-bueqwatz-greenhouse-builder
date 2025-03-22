import React from 'react';
import { Calendar, Loader2, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { useAuth } from './auth/AuthProvider';

interface ProjectListProps {
  onSelectProject: (id: string) => void;
}

type Project = Database['public']['Tables']['structure_user_entries']['Row'] & {
  structure: Database['public']['Tables']['structures']['Row'] | null;
};

const ProjectList = ({ onSelectProject }: ProjectListProps) => {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { user } = useAuth();

  React.useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('structure_user_entries')
          .select(`
            entry_id,
            project_name,
            description,
            width_ft,
            length_ft,
            zones,
           eave_height,
            status,
            created_at,
            structure:structures (
              model,
              width,
              spacing,
              eave_height
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading projects:', error);
          throw error;
        }
        
        setProjects(data || []);
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error loading projects: {error}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-800 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">No Projects Available</h3>
        <p className="text-gray-400">
          {user?.email === 'bobstarnes@mac.com' ? (
            <>
              You don't have access to any projects yet. Projects need to be shared with
              <span className="font-medium"> {user.email}</span> to appear here.
            </>
          ) : (
            'Create your first greenhouse project to get started.'
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
        {projects.map((project) => {
          if (!project) return null;
          return (
            <article key={project.entry_id} className="w-full">
              <div
                className="bg-gray-800 p-6 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer group"
                onClick={() => onSelectProject(project.entry_id)}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
                  <h3 className="text-lg font-semibold group-hover:text-white transition-colors break-words">
                    {project.project_name || 'Untitled Project'}
                  </h3>
                </div>
                
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {project.description || 'No description provided'}
                </p>
                
                <div className="space-y-2 text-sm text-gray-400 mb-4">
                  <div className="flex items-center justify-between">
                    <span>Model:</span>
                    <span className="font-medium text-gray-300">{project.structure?.model || 'Custom'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dimensions:</span>
                    <span className="font-medium text-gray-300">{project.width_ft}' × {project.length_ft}'</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Eave Height:</span>
                    <span className="font-medium text-gray-300">{project.eave_height}'</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Zones:</span>
                    <span className="font-medium text-gray-300">{project.zones}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={project.created_at}>
                      {new Date(project.created_at).toLocaleDateString()}
                    </time>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'Draft' ? 'bg-gray-700 text-gray-300' :
                    project.status === 'In Progress' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {project.status || 'Draft'}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectList;