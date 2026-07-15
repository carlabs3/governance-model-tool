import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, KeyRound, Loader2 } from 'lucide-react';
import logoSrc from '@/assets/NEU-logo_RGB_main-color.png';
import { AppFooter } from '@/components/AppFooter';
import { useProject } from '@/context/ProjectContext';

const AccessProject = () => {
  const navigate = useNavigate();
  const { loadProject, isLoading } = useProject();
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      setError('Please enter an access code');
      return;
    }

    const project = await loadProject(accessCode.trim().toUpperCase());
    
    if (project) {
      navigate('/canvas');
    } else {
      setError('Project not found. Please check your access code.');
    }
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center mx-auto mb-6">
              <KeyRound className="w-8 h-8 text-brand-primary" />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center tracking-tight">
              <span className="bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
                Access Your Project
              </span>
            </h1>
            <p className="text-muted-foreground mb-8 text-center text-base leading-relaxed">
              Enter the unique access code to open your saved governance canvas.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="accessCode" className="text-sm font-medium">Access Code</Label>
                <Input
                  id="accessCode"
                  placeholder="e.g., ABC12345"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  className={`text-center text-lg tracking-wider uppercase h-12 rounded-xl ${error ? 'border-destructive' : 'border-border/60 focus:border-brand-primary'}`}
                  maxLength={8}
                />
                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full gap-2 h-12 rounded-xl text-base bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 shadow-lg shadow-brand-primary/20 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Access Project
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/40 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Don't have an access code?
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/new-project')}
                className="rounded-xl border-2 border-brand-primary/40 text-brand-primary hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-200"
              >
                Create New Project
              </Button>
            </div>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default AccessProject;
