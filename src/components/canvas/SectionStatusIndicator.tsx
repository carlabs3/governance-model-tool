import { Check, Circle, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SectionStatus } from '@/types/governance';

interface SectionStatusIndicatorProps {
  status: SectionStatus;
  size?: 'sm' | 'md';
}

export const SectionStatusIndicator = ({
  status,
  size = 'sm',
}: SectionStatusIndicatorProps) => {
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const containerSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  switch (status) {
    case 'completed':
      return (
        <div
          className={cn(
            containerSize,
            'rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-sm'
          )}
          title="Completed"
        >
          <Check className={cn(iconSize, 'text-white')} />
        </div>
      );
    case 'in_progress':
      return (
        <div
          className={cn(
            containerSize,
            'rounded-full bg-brand-primary/15 flex items-center justify-center'
          )}
          title="In Progress"
        >
          <Pencil className={cn(iconSize, 'text-brand-primary')} />
        </div>
      );
    default:
      return (
        <div
          className={cn(
            containerSize,
            'rounded-full border-2 border-muted-foreground/20 flex items-center justify-center'
          )}
          title="Empty"
        >
          <Circle className={cn(iconSize, 'text-muted-foreground/20')} />
        </div>
      );
  }
};
