import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, KeyRound } from 'lucide-react';
import logoSrc from '@/assets/NEU-logo_RGB_main-color.png';
import { AppFooter } from '@/components/AppFooter';
import { useProject } from '@/context/ProjectContext';

const NewProject = () => {
  const navigate = useNavigate();
  const { createProject } = useProject();
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      setError('Please enter a project name');
      return;
    }

    navigate('/setup', { state: { projectName: projectName.trim() } });
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      {/* Header */}
      <header className="border-b border-border/60 sticky top-0 z-10 bg-background/80 backdrop-blur-xl">
        <div className="container-wide py-4">
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt="NeutralPath 2030" className="h-9 w-auto object-contain" />
          </div>
        </div>
      </header>

      <main className="py-16 md:py-24 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-gradient-to-r from-brand-primary/8 to-brand-secondary/8 blur-3xl" />
        </div>

        <div className="container-narrow relative z-[1]">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-8 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>

          <div className="max-w-md mx-auto rounded-2xl border border-border/60 bg-card p-8 md:p-10 shadow-lg shadow-brand-primary/5 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
              <span className="bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
                Create New Project
              </span>
            </h1>
            <p className="text-muted-foreground mb-8 text-base leading-relaxed">
              Give your governance model canvas a name to get started.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="projectName" className="text-sm font-medium">Project Name *</Label>
                <Input
                  id="projectName"
                  placeholder="e.g., City Center Living Lab"
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);
                    setError('');
                  }}
                  className={`h-12 rounded-xl text-base ${error ? 'border-destructive' : 'border-border/60 focus:border-brand-primary'}`}
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-brand-primary/5 border border-brand-primary/15">
                <KeyRound className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A unique <span className="font-semibold text-foreground">access code</span> will be generated for your project. Save it — you'll need it to return to your canvas later or share it with collaborators.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full gap-2 h-12 rounded-xl text-base bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 shadow-lg shadow-brand-primary/20 transition-all duration-200"
              >
                Continue to Setup
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default NewProject;
