import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Layers, ArrowRight, Plus, Clock, FileEdit, Check, 
  LogOut, Trash2, RefreshCw, Copy 
} from 'lucide-react';
import logoSrc from '@/assets/NEU-logo_RGB_main-color.png';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/context/ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ProjectStatus } from '@/types/governance';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DashboardProject {
  id: string;
  name: string;
  status: ProjectStatus;
  access_code: string;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, isAuthenticated, isLoading: authLoading } = useAuth();
  const { loadProject } = useProject();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProjects();
    }
  }, [isAuthenticated]);

  const fetchUserProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('governance_projects')
        .select('id, name, status, access_code, created_at, updated_at')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your projects.',
          variant: 'destructive',
        });
      } else {
        setProjects((data as DashboardProject[]) || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenProject = async (accessCode: string) => {
    const project = await loadProject(accessCode);
    if (project) {
      navigate('/canvas');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setDeletingId(projectId);
    try {
      const { error: sectionsError } = await supabase
        .from('canvas_sections')
        .delete()
        .eq('project_id', projectId);

      if (sectionsError) throw sectionsError;

      const { error: projectError } = await supabase
        .from('governance_projects')
        .delete()
        .eq('id', projectId);

      if (projectError) throw projectError;

      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast({
        title: 'Project deleted',
        description: 'The project has been permanently deleted.',
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the project.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleRegenerateAccessCode = async (projectId: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    let newCode = '';
    for (let i = 0; i < 8; i++) {
      newCode += chars.charAt(array[i] % chars.length);
    }

    try {
      const { error } = await supabase
        .from('governance_projects')
        .update({ access_code: newCode })
        .eq('id', projectId);

      if (error) throw error;

      setProjects(prev => 
        prev.map(p => p.id === projectId ? { ...p, access_code: newCode } : p)
      );
      
      toast({
        title: 'Access code regenerated',
        description: 'The new access code has been set.',
      });
    } catch (error) {
      console.error('Error regenerating access code:', error);
      toast({
        title: 'Error',
        description: 'Failed to regenerate access code.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied!',
      description: 'Access code copied to clipboard.',
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-brand-secondary/20 text-brand-secondary border-brand-secondary/30 text-xs hover:bg-brand-secondary/30">
            <Check className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="secondary" className="bg-brand-primary/10 text-brand-primary border-brand-primary/20 text-xs">
            <FileEdit className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      <header className="border-b border-border/60 sticky top-0 z-10 bg-background/80 backdrop-blur-xl">
        <div className="container-wide py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoSrc} alt="NeutralPath 2030" className="h-9 w-auto object-contain" />
              <div>
                <span className="font-semibold text-lg text-foreground tracking-tight">My Projects</span>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-xs rounded-xl">
                Home
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-xs text-muted-foreground rounded-xl">
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-wide py-8 md:py-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[300px] rounded-full bg-brand-secondary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[300px] rounded-full bg-brand-primary/5 blur-3xl" />
        </div>

        <div className="relative z-[1]">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
                Your Projects
              </span>
            </h1>
            <Button
              onClick={() => navigate('/new-project')}
              className="gap-2 text-sm rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 shadow-lg shadow-brand-primary/20 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse rounded-2xl border-border/60">
                  <CardHeader>
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card className="text-center py-16 rounded-2xl border-border/60">
              <CardContent>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-8 h-8 text-brand-primary" />
                </div>
                <h3 className="font-semibold text-base mb-2 text-foreground">No projects yet</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Create your first governance model canvas to get started.
                </p>
                <Button
                  onClick={() => navigate('/new-project')}
                  className="rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 shadow-lg shadow-brand-primary/20 transition-all duration-200"
                >
                  Create Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(project => (
                <Card key={project.id} className="rounded-2xl border-border/60 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5 transition-all duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{project.name}</CardTitle>
                      {getStatusBadge(project.status)}
                    </div>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <Clock className="w-3 h-3" />
                      Updated {formatDate(project.updated_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between bg-muted/40 rounded-xl p-2.5">
                      <span className="text-[11px] text-muted-foreground">Access Code</span>
                      <div className="flex items-center gap-1">
                        <code className="text-xs font-mono font-medium">{project.access_code}</code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 hover:text-brand-primary"
                          onClick={() => handleCopyAccessCode(project.access_code)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <Button
                        className="flex-1 gap-2 text-xs rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 transition-all duration-200"
                        size="sm"
                        onClick={() => handleOpenProject(project.access_code)}
                      >
                        Open
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl hover:text-brand-primary"
                        onClick={() => handleRegenerateAccessCode(project.id)}
                        title="Regenerate access code"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive"
                            title="Delete project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-base">Delete Project?</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm">
                              This will permanently delete "{project.name}" and all its content.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="text-xs rounded-xl">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProject(project.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs rounded-xl"
                            >
                              {deletingId === project.id ? 'Deleting…' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
