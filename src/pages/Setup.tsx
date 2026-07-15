import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Layers, FileText, Sparkles, Loader2, Settings2 } from 'lucide-react';
import logoSrc from '@/assets/NEU-logo_RGB_main-color.png';
import { AppFooter } from '@/components/AppFooter';
import { GOVERNANCE_TEMPLATES } from '@/types/governance';
import { TemplateSelectionDialog } from '@/components/TemplateSelectionDialog';
import { TemplatePreviewDialog } from '@/components/canvas/TemplatePreviewDialog';
import { useProject } from '@/context/ProjectContext';
import { Building2, Users, Handshake, Network, ClipboardList, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  'building-2': Building2,
  'users': Users,
  'handshake': Handshake,
  'network': Network,
  'clipboard-list': ClipboardList,
};

const Setup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createProject, isLoading } = useProject();
  const projectName = (location.state as { projectName?: string })?.projectName || 'Untitled Project';

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [setupType, setSetupType] = useState<'blank' | 'template' | 'questionnaire' | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  const selectedTemplateMeta = selectedTemplate
    ? GOVERNANCE_TEMPLATES.find((t) => t.id === selectedTemplate)
    : null;

  const handleTemplateConfirm = (templateId: string) => {
    // Show preview instead of immediately applying
    setPreviewTemplateId(templateId);
  };

  const handlePreviewConfirm = () => {
    if (previewTemplateId) {
      setSelectedTemplate(previewTemplateId);
      setSetupType('template');
      setPreviewTemplateId(null);
    }
  };

  const handleContinue = async () => {
    if (setupType === 'questionnaire') {
      navigate('/questionnaire', { state: { projectName } });
    } else {
      const templateId = setupType === 'template' && selectedTemplate ? selectedTemplate : undefined;
      await createProject(projectName, templateId);
      navigate('/canvas');
    }
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <header className="border-b border-border/60 sticky top-0 z-10 bg-background/80 backdrop-blur-xl">
        <div className="container-wide py-4">
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt="NeutralPath 2030" className="h-9 w-auto object-contain" />
          </div>
        </div>
      </header>

      <main className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-gradient-to-r from-brand-primary/8 to-brand-secondary/8 blur-3xl" />
        </div>

        <div className="container-narrow relative z-[1]">
          <Button
            variant="ghost"
            onClick={() => navigate('/new-project')}
            className="mb-8 gap-2 text-muted-foreground hover:text-foreground text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
              <span className="bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
                Setup Your Canvas
              </span>
            </h1>
            <p className="text-base text-muted-foreground">
              Project: <span className="font-medium text-foreground">{projectName}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <button
              onClick={() => {
                setSetupType('blank');
                setSelectedTemplate(null);
              }}
              className={cn(
                'rounded-2xl border border-border/60 bg-card p-6 text-center transition-all duration-300 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5',
                setupType === 'blank' ? 'ring-2 ring-brand-primary/40 border-brand-primary/30' : ''
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-5 h-5 text-brand-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1 text-foreground">Blank Canvas</h3>
              <p className="text-xs text-muted-foreground">Start fresh with an empty canvas</p>
            </button>

            <button
              onClick={() => setTemplateDialogOpen(true)}
              className={cn(
                'rounded-2xl border border-border/60 bg-card p-6 text-center transition-all duration-300 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5',
                setupType === 'template' ? 'ring-2 ring-brand-primary/40 border-brand-primary/30' : ''
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Layers className="w-5 h-5 text-brand-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1 text-foreground">Review Existing Models</h3>
              <p className="text-xs text-muted-foreground">Choose from predefined governance models</p>
            </button>

            <button
              onClick={() => {
                setSetupType('questionnaire');
                setSelectedTemplate(null);
              }}
              className={cn(
                'rounded-2xl border border-border/60 bg-card p-6 text-center transition-all duration-300 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5',
                setupType === 'questionnaire' ? 'ring-2 ring-brand-primary/40 border-brand-primary/30' : ''
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-5 h-5 text-brand-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1 text-foreground">Get Recommendation</h3>
              <p className="text-xs text-muted-foreground">Answer questions for best fit</p>
            </button>
          </div>

          {setupType === 'template' && selectedTemplateMeta && (
            <div className="mb-10 animate-fade-in">
              <div className="flex items-center justify-between p-4 rounded-xl border border-brand-primary/20 bg-brand-primary/5">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = iconMap[selectedTemplateMeta.icon] || Layers;
                    return (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 text-brand-primary flex items-center justify-center">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Selected model</p>
                    <p className="font-semibold text-sm text-foreground">{selectedTemplateMeta.name}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTemplateDialogOpen(true)}
                  className="gap-1.5 text-xs text-muted-foreground rounded-xl"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  Change
                </Button>
              </div>
            </div>
          )}

          {setupType && (setupType !== 'template' || selectedTemplate) && (
            <div className="flex justify-center animate-fade-in">
              <Button
                size="lg"
                onClick={handleContinue}
                className="gap-2 h-12 rounded-xl text-base bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 shadow-lg shadow-brand-primary/20 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    {setupType === 'questionnaire' ? 'Start Questionnaire' : 'Create Canvas'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </main>

      <AppFooter />

      <TemplateSelectionDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        onConfirm={handleTemplateConfirm}
        currentTemplateId={selectedTemplate}
      />

      <TemplatePreviewDialog
        open={!!previewTemplateId}
        onOpenChange={(v) => !v && setPreviewTemplateId(null)}
        templateId={previewTemplateId}
        onConfirm={handlePreviewConfirm}
        isReplacing={false}
      />
    </div>
  );
};

export default Setup;
