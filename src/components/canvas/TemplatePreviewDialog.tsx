import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Building2, Users, Handshake, Network, ClipboardList, LucideIcon } from 'lucide-react';
import { GOVERNANCE_TEMPLATES, GovernanceTemplate, DEFAULT_CANVAS_SECTIONS } from '@/types/governance';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  'building-2': Building2,
  users: Users,
  handshake: Handshake,
  network: Network,
  'clipboard-list': ClipboardList,
};

interface TemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string | null;
  onConfirm: () => void;
  /** true when user already has content on the canvas */
  isReplacing?: boolean;
}

export const TemplatePreviewDialog = ({
  open,
  onOpenChange,
  templateId,
  onConfirm,
  isReplacing = false,
}: TemplatePreviewDialogProps) => {
  const template = templateId
    ? GOVERNANCE_TEMPLATES.find((t) => t.id === templateId)
    : null;

  if (!template) return null;

  const Icon = iconMap[template.icon] || Building2;

  const strategySections = DEFAULT_CANVAS_SECTIONS.filter(
    (s) => s.category === 'strategy'
  );
  const operationsSections = DEFAULT_CANVAS_SECTIONS.filter(
    (s) => s.category === 'operations'
  );

  const renderPreviewSection = (
    sectionDef: (typeof DEFAULT_CANVAS_SECTIONS)[0]
  ) => {
    const content = template.defaultContent[sectionDef.id] || '';
    const preview = content.length > 80 ? content.slice(0, 80) + '…' : content;
    return (
      <div
        key={sectionDef.id}
        className="rounded-lg border border-border/50 bg-muted/30 p-2.5"
      >
        <p className="text-xs font-semibold text-foreground mb-0.5">
          {sectionDef.title}
        </p>
        {preview ? (
          <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {preview}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground/40 italic">Empty</p>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white flex items-center justify-center shadow-md shadow-brand-primary/20">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight">
                {template.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {template.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Section previews */}
        <div className="px-6 pb-4 space-y-4">
          {/* Strategy */}
          <div>
            <div className="bg-gradient-to-r from-brand-primary to-brand-primary/80 text-white rounded-lg px-3 py-1.5 text-center font-semibold text-xs tracking-wide mb-2">
              Strategy
            </div>
            <div className="grid grid-cols-2 gap-2">
              {strategySections.map(renderPreviewSection)}
            </div>
          </div>

          {/* Operations */}
          <div>
            <div className="bg-gradient-to-r from-brand-secondary to-brand-secondary/80 text-white rounded-lg px-3 py-1.5 text-center font-semibold text-xs tracking-wide mb-2">
              Operations
            </div>
            <div className="grid grid-cols-2 gap-2">
              {operationsSections.map(renderPreviewSection)}
            </div>
          </div>
        </div>

        {/* Confirmation */}
        {isReplacing && (
          <div className="mx-6 mb-4 p-3 rounded-xl bg-destructive/5 border border-destructive/15">
            <p className="text-xs text-destructive font-medium">
              Are you sure you want to replace your current canvas with this
              template?
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              All existing content will be overwritten.
            </p>
          </div>
        )}

        {!isReplacing && (
          <div className="mx-6 mb-4 p-3 rounded-xl bg-brand-primary/5 border border-brand-primary/15">
            <p className="text-xs text-foreground font-medium">
              Do you want to use this template to start your canvas?
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-4 border-t border-border/60 flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs rounded-xl"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="text-xs rounded-xl border-0 shadow-md text-white bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 shadow-brand-primary/20"
          >
            {isReplacing ? 'Replace Template' : 'Use Template'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
