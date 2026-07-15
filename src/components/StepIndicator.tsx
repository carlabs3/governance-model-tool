import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  number: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const StepIndicator = ({ steps, currentStep, className }: StepIndicatorProps) => {
  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isCurrent = step.number === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300',
                  isCompleted && 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-md shadow-brand-primary/20',
                  isCurrent && 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white ring-4 ring-brand-primary/15 shadow-lg shadow-brand-primary/25',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.number}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium hidden sm:block transition-colors',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'w-12 h-0.5 mx-1.5 rounded-full transition-all duration-300',
                  isCompleted
                    ? 'bg-gradient-to-r from-brand-primary to-brand-secondary'
                    : 'bg-muted'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
