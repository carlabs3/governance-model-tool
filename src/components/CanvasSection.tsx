import { cn } from '@/lib/utils';
import { SectionStatusIndicator } from '@/components/canvas/SectionStatusIndicator';
import type { SectionStatus } from '@/types/governance';

interface CanvasSectionProps {
  id: string;
  title: string;
  description: string;
  content: string;
  icon?: string;
  status: SectionStatus;
  onFocusClick: () => void;
  className?: string;
}

export const CanvasSection = ({
  id,
  title,
  description,
  content,
  icon,
  status,
  onFocusClick,
  className,
}: CanvasSectionProps) => {
  const hasContent = content.trim().length > 0;
  const previewContent = content.length > 150 ? content.slice(0, 150) + '...' : content;

  return (
    <div
      className={cn(
        'canvas-section group cursor-pointer flex flex-col h-full',
        status === 'empty' && 'border-dashed border-border/50 opacity-75 hover:opacity-100',
        status === 'in_progress' && 'border-brand-primary/25 bg-brand-primary/[0.02]',
        status === 'completed' && 'border-brand-primary/30 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5',
        className
      )}
      onClick={onFocusClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onFocusClick();
        }
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-semibold text-sm text-foreground">
          {title}
        </h3>
        <SectionStatusIndicator status={status} />
      </div>
      <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">{description}</p>
      <div className="flex-1 min-h-[60px]">
        {hasContent ? (
          <p className="text-sm text-foreground/75 whitespace-pre-wrap leading-relaxed">{previewContent}</p>
        ) : (
          <p className="text-sm text-muted-foreground/50 italic">Click to add content…</p>
        )}
      </div>
    </div>
  );
};
