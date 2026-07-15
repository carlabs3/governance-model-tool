import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileText, Layers, Sparkles } from 'lucide-react';
import { TemplateCard } from './TemplateCard';
import { GOVERNANCE_TEMPLATES } from '@/types/governance';
import { TemplatePreviewDialog } from '@/components/canvas/TemplatePreviewDialog';
import { useState } from 'react';

type ChangeType = 'blank' | 'template' | 'questionnaire';
type Step = 'choose-method' | 'pick-template' | 'confirm-non-template';

interface TemplateChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (type: ChangeType, templateId?: string) => void;
  currentTemplateId?: string;
}

export const TemplateChangeDialog = ({
  open,
  onOpenChange,
  onConfirm,
  currentTemplateId,
}: TemplateChangeDialogProps) => {
  const [step, setStep] = useState<Step>('choose-method');
  const [changeType, setChangeType] = useState<ChangeType | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleTypeSelect = (type: ChangeType) => {
    setChangeType(type);
    if (type === 'template') {
      setStep('pick-template');
    } else {
      // blank or questionnaire → show confirmation
      setStep('confirm-non-template');
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setPreviewOpen(true);
  };

  /** Called when user confirms inside the TemplatePreviewDialog */
  const handlePreviewConfirm = () => {
    if (selectedTemplate) {
      onConfirm('template', selectedTemplate);
    }
    resetAndClose();
  };

  /** Called for blank / questionnaire confirmation */
  const handleNonTemplateConfirm = () => {
    if (changeType) {
      onConfirm(changeType);
    }
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep('choose-method');
    setChangeType(null);
    setSelectedTemplate(null);
    setPreviewOpen(false);
    onOpenChange(false);
  };

  const handleBack = () => {
    if (step === 'confirm-non-template') {
      setStep('choose-method');
      setChangeType(null);
    } else if (step === 'pick-template') {
      setStep('choose-method');
      setChangeType(null);
      setSelectedTemplate(null);
    }
  };

  // Hide the main dialog when the preview dialog is showing
  const mainDialogOpen = open && !previewOpen;

  return (
    <>
      <Dialog open={mainDialogOpen} onOpenChange={(v) => { if (!v) resetAndClose(); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl p-0 gap-0">
          {step === 'confirm-non-template' ? (
            <>
              <DialogHeader className="px-6 pt-6 pb-4">
                <DialogTitle className="flex items-center gap-2 text-destructive text-lg font-semibold tracking-tight">
                  <AlertTriangle className="w-5 h-5" />
                  Confirm Canvas Reset
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Are you sure you want to replace your current canvas? All existing content will be lost.
                </DialogDescription>
              </DialogHeader>
              <div className="px-6 pb-4">
                <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/15">
                  <p className="text-sm font-medium text-destructive">Warning:</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {changeType === 'blank' && 'Your canvas will be reset to a blank state.'}
                    {changeType === 'questionnaire' && 'You will be redirected to the questionnaire to get a new recommendation. Your current canvas will be replaced.'}
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border/60 flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-xl text-xs">
                  Go Back
                </Button>
                <Button variant="destructive" size="sm" onClick={handleNonTemplateConfirm} className="rounded-xl text-xs shadow-md">
                  Yes, Replace Canvas
                </Button>
              </div>
            </>
          ) : step === 'pick-template' ? (
            <>
              <DialogHeader className="px-6 pt-6 pb-4">
                <DialogTitle className="text-lg font-semibold tracking-tight">Select a Template</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Choose a governance template to preview and apply to your canvas.
                </DialogDescription>
              </DialogHeader>
              <div className="px-6 pb-4 space-y-2 max-h-[50vh] overflow-y-auto">
                {GOVERNANCE_TEMPLATES.map((template) => (
                  <TemplateCard
                    key={template.id}
                    {...template}
                    isSelected={selectedTemplate === template.id}
                    onSelect={handleTemplateSelect}
                  />
                ))}
              </div>
              <div className="px-6 py-4 border-t border-border/60 flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-xl text-xs">
                  Back
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader className="px-6 pt-6 pb-4">
                <DialogTitle className="text-lg font-semibold tracking-tight">Change Start Method</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Select a different approach to build your governance canvas.
                </DialogDescription>
              </DialogHeader>
              <div className="px-6 pb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleTypeSelect('blank')}
                  className="rounded-2xl border-2 border-border/60 bg-card p-6 text-center transition-all duration-200 hover:border-brand-primary/30 hover:shadow-md hover:shadow-brand-primary/5"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1 text-sm">Blank Canvas</h3>
                  <p className="text-xs text-muted-foreground">Start fresh with an empty template</p>
                </button>

                <button
                  onClick={() => handleTypeSelect('template')}
                  className="rounded-2xl border-2 border-border/60 bg-card p-6 text-center transition-all duration-200 hover:border-brand-primary/30 hover:shadow-md hover:shadow-brand-primary/5"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <Layers className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1 text-sm">Choose Template</h3>
                  <p className="text-xs text-muted-foreground">Select from predefined models</p>
                </button>

                <button
                  onClick={() => handleTypeSelect('questionnaire')}
                  className="rounded-2xl border-2 border-border/60 bg-card p-6 text-center transition-all duration-200 hover:border-brand-primary/30 hover:shadow-md hover:shadow-brand-primary/5"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1 text-sm">Get Recommendation</h3>
                  <p className="text-xs text-muted-foreground">Answer questions for best fit</p>
                </button>
              </div>
              <div className="px-6 py-4 border-t border-border/60 flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={resetAndClose} className="rounded-xl text-xs">
                  Cancel
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <TemplatePreviewDialog
        open={previewOpen}
        onOpenChange={(v) => {
          if (!v) {
            // User dismissed preview → go back to template list
            setPreviewOpen(false);
            setSelectedTemplate(null);
          }
        }}
        templateId={selectedTemplate}
        onConfirm={handlePreviewConfirm}
        isReplacing={true}
      />
    </>
  );
};
