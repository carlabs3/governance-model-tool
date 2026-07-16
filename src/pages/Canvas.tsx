import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CanvasHeader } from '@/components/canvas/CanvasHeader';
import { DesktopCanvasGrid } from '@/components/canvas/DesktopCanvasGrid';
import { MobileCanvasView } from '@/components/canvas/MobileCanvasView';
import { TemplateChangeDialog } from '@/components/TemplateChangeDialog';
import { FocusModeDialog } from '@/components/canvas/FocusModeDialog';
import { ShareByEmailDialog } from '@/components/canvas/ShareByEmailDialog';
import { SaveConfirmationDialog } from '@/components/canvas/SaveConfirmationDialog';
import { ProjectProgressBar } from '@/components/canvas/ProjectProgressBar';
import { OnboardingDialog, useOnboarding } from '@/components/canvas/OnboardingDialog';
import { useProject } from '@/context/ProjectContext';
import { AppFooter } from '@/components/AppFooter';
import { useToast } from '@/hooks/use-toast';
import { usePdfExport } from '@/hooks/usePdfExport';
import { useIsMobile } from '@/hooks/use-mobile';
import { GOVERNANCE_TEMPLATES, CanvasSection, SectionStatus } from '@/types/governance';

const Canvas = () => {
  const navigate = useNavigate();
  const { currentProject, updateSection, saveProject, clearCurrentProject, applyTemplate, updateProjectStatus } = useProject();
  const { toast } = useToast();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [focusSection, setFocusSection] = useState<CanvasSection | null>(null);
  const [showFocusDialog, setShowFocusDialog] = useState(false);
  const { isExporting, exportToPdf } = usePdfExport();
  const isMobile = useIsMobile();
  const { showOnboarding, dismissOnboarding, restartOnboarding } = useOnboarding();

  useEffect(() => {
    if (!currentProject) {
      navigate('/');
    }
  }, [currentProject, navigate]);

  useEffect(() => {
    if (currentProject) {
      updateProjectStatus();
    }
  }, [currentProject?.sections, updateProjectStatus]);

  const handleSave = async () => {
    await saveProject();
    setLastSaved(new Date());
    setShowSaveConfirmation(true);
  };

  const handleGoHome = () => {
    clearCurrentProject();
    navigate('/');
  };

  const handleExportPdf = async () => {
    if (!currentProject) return;
    try {
      await exportToPdf(currentProject);
      toast({
        title: 'PDF Exported',
        description: 'Your governance canvas has been downloaded as PDF.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your canvas. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleTemplateChange = async (type: 'blank' | 'template' | 'questionnaire', templateId?: string) => {
    if (type === 'questionnaire') {
      navigate('/questionnaire', { 
        state: { 
          projectName: currentProject?.name,
          isChange: true 
        } 
      });
    } else {
      await applyTemplate(templateId);
      toast({
        title: type === 'blank' ? 'Canvas Reset' : 'Template Applied',
        description: type === 'blank' 
          ? 'Your canvas has been reset to a blank state.' 
          : `The "${GOVERNANCE_TEMPLATES.find(t => t.id === templateId)?.name}" template has been applied.`,
      });
    }
  };

  const handleSectionClick = (sectionId: string) => {
    const section = currentProject?.sections.find(s => s.id === sectionId);
    if (section) {
      setFocusSection(section);
      setShowFocusDialog(true);
    }
  };

  const handleFocusSave = (sectionId: string, content: string, status: SectionStatus) => {
    updateSection(sectionId, content, status);
  };

  if (!currentProject) {
    return null;
  }

  const strategySections = currentProject.sections.filter(s => s.category === 'strategy');
  const operationsSections = currentProject.sections.filter(s => s.category === 'operations');

  const currentTemplateName = currentProject.templateId 
    ? GOVERNANCE_TEMPLATES.find(t => t.id === currentProject.templateId)?.name
    : 'Custom';

  return (
    <div className="min-h-screen bg-background page-transition">
      <CanvasHeader
        project={currentProject}
        onSave={handleSave}
        onGoHome={handleGoHome}
        onOpenTemplateDialog={() => setShowTemplateDialog(true)}
        onExportPdf={handleExportPdf}
        onOpenShareEmail={() => setShowShareDialog(true)}
        isExporting={isExporting}
        onRestartTutorial={restartOnboarding}
      />

      {/* Autosave indicator */}
      <div className="border-b border-border/40 py-2">
        <div className="container-wide flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs text-muted-foreground">
          <span>
            Template: <span className="font-medium text-foreground">{currentTemplateName}</span>
          </span>
          <span>
            {lastSaved ? (
              <>Last saved: {lastSaved.toLocaleTimeString()}</>
            ) : (
              <>Autosave enabled</>
            )}
          </span>
        </div>
      </div>

      {/* Canvas Content */}
      <main className="py-8 md:py-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[400px] rounded-full bg-brand-secondary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[400px] rounded-full bg-brand-primary/5 blur-3xl" />
        </div>
        <div className="container-wide px-4 md:px-6 relative z-[1]">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
            <span className="bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
              Governance Model Canvas
            </span>
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Click on any section to add or edit your governance content.
          </p>

          <div className="mb-6">
            <ProjectProgressBar
              sections={currentProject.sections}
              projectStatus={currentProject.status}
              lastUpdated={currentProject.updatedAt}
              accessCode={currentProject.accessCode}
            />
          </div>
          
          <div className="bg-background">
            {isMobile ? (
              <MobileCanvasView
                strategySections={strategySections}
                operationsSections={operationsSections}
                onSectionClick={handleSectionClick}
              />
            ) : (
              <DesktopCanvasGrid
                strategySections={strategySections}
                operationsSections={operationsSections}
                onSectionClick={handleSectionClick}
              />
            )}
          </div>

          <div className="mt-8 text-center text-xs text-muted-foreground/60">
            Governance Model Canvas
          </div>
          </div>
      </main>

      <AppFooter />

      <TemplateChangeDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        onConfirm={handleTemplateChange}
        currentTemplateId={currentProject.templateId}
      />

      <FocusModeDialog
        section={focusSection}
        open={showFocusDialog}
        onOpenChange={setShowFocusDialog}
        onSave={handleFocusSave}
        templateId={currentProject.templateId}
      />

      <ShareByEmailDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        projectName={currentProject.name}
        accessCode={currentProject.accessCode}
      />

      <SaveConfirmationDialog
        open={showSaveConfirmation}
        onOpenChange={setShowSaveConfirmation}
        projectName={currentProject.name}
        accessCode={currentProject.accessCode}
      />

      <OnboardingDialog
        open={showOnboarding}
        onDismiss={dismissOnboarding}
      />
    </div>
  );
};

export default Canvas;
