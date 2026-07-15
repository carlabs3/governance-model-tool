import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MousePointerClick, Save, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

const ONBOARDING_KEY = 'governance-canvas-onboarded';

const steps = [
  {
    icon: MousePointerClick,
    title: 'Click to edit',
    description: 'Click on any section to open Focus Mode and start adding your governance content.',
  },
  {
    icon: Save,
    title: 'Save to complete',
    description: "When you save a section with content, it\u2019s automatically marked as completed.",
  },
  {
    icon: Share2,
    title: 'Share your work',
    description: 'Use the Share button to send your canvas to collaborators via email.',
  },
];

export const useOnboarding = () => {
  const [show, setShow] = useState(() => {
    return !localStorage.getItem(ONBOARDING_KEY);
  });

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShow(false);
  };

  const restart = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setShow(true);
  };

  return { showOnboarding: show, dismissOnboarding: dismiss, restartOnboarding: restart };
};

interface OnboardingDialogProps {
  open: boolean;
  onDismiss: () => void;
}

export const OnboardingDialog = ({ open, onDismiss }: OnboardingDialogProps) => {
  const [step, setStep] = useState(0);

  const isLast = step === steps.length - 1;
  const current = steps[step];
  const Icon = current.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onDismiss()}>
      <DialogContent className="max-w-md rounded-2xl p-0 gap-0 overflow-hidden">
        <VisuallyHidden.Root>
          <DialogTitle>Getting Started</DialogTitle>
          <DialogDescription>A quick intro to using the Governance Model Canvas.</DialogDescription>
        </VisuallyHidden.Root>
        {/* Visual */}
        <div className="flex flex-col items-center justify-center pt-10 pb-6 px-6 bg-gradient-to-b from-brand-primary/5 to-transparent">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white flex items-center justify-center shadow-lg shadow-brand-primary/20 mb-5">
            <Icon className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-center mb-1.5">
            {current.title}
          </h2>
          <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-[300px]">
            {current.description}
          </p>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 pb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                i === step
                  ? 'bg-gradient-to-r from-brand-primary to-brand-secondary w-6'
                  : 'bg-muted-foreground/20'
              )}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-xs rounded-xl text-muted-foreground"
          >
            Skip
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (isLast) {
                onDismiss();
              } else {
                setStep(step + 1);
              }
            }}
            className="text-xs rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 shadow-md shadow-brand-primary/20"
          >
            {isLast ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
