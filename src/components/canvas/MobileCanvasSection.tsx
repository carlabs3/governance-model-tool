import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SectionStatusIndicator } from './SectionStatusIndicator';
import { Maximize2 } from 'lucide-react';
import type { SectionStatus } from '@/types/governance';

interface MobileCanvasSectionProps {
  id: string;
  title: string;
  description: string;
  content: string;
  icon?: string;
  category: 'strategy' | 'operations';
  status: SectionStatus;
  onFocusClick: () => void;
}

export const MobileCanvasSection = ({
  id,
  title,
  description,
  content,
  icon,
  category,
  status,
  onFocusClick,
}: MobileCanvasSectionProps) => {
  const hasContent = content.trim().length > 0;
  const previewContent = content.length > 100 ? content.slice(0, 100) + '...' : content;

  const borderColor = category === 'strategy' 
    ? 'border-l-brand-primary' 
    : 'border-l-brand-secondary';

  return (
    <AccordionItem value={id} className={cn('border rounded-xl mb-2 border-l-4', borderColor)}>
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center gap-2 text-left flex-1">
          <div className="flex-1">
            <span className="font-semibold text-sm">{title}</span>
            <p className="text-[11px] text-muted-foreground font-normal leading-relaxed">{description}</p>
          </div>
          <SectionStatusIndicator status={status} />
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-3">
          <div className="min-h-[60px] text-sm">
            {hasContent ? (
              <p className="text-foreground/75 whitespace-pre-wrap leading-relaxed">{previewContent}</p>
            ) : (
              <p className="text-muted-foreground/50 italic">No content yet…</p>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs rounded-xl border-brand-primary/30 text-brand-primary hover:bg-brand-primary/5"
            onClick={(e) => {
              e.stopPropagation();
              onFocusClick();
            }}
          >
            <Maximize2 className="w-3.5 h-3.5 mr-2" />
            Open Focus Mode
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
