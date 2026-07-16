import { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Check, Circle, Lightbulb, Pencil, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CanvasSection, SectionStatus } from '@/types/governance';
import { SECTION_METADATA, GOVERNANCE_TEMPLATES } from '@/types/governance';
import { AuthContext } from '@/context/AuthContext';

const SENSITIVE_SECTIONS = ['finances', 'legal-status', 'decision-making'];

const useSafeAuth = () => {
  const context = useContext(AuthContext);
  return { isAuthenticated: context?.isAuthenticated ?? false };
};

interface FocusModeDialogProps {
  section: CanvasSection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (sectionId: string, content: string, status: SectionStatus) => void;
  templateId?: string;
}

// Example responses come from the applied template's defaultContent, falling
// back to the "public-board" template when the canvas is Custom.
const getExampleContent = (sectionId: string, templateId?: string): string => {
  const template =
    GOVERNANCE_TEMPLATES.find((t) => t.id === templateId) ??
    GOVERNANCE_TEMPLATES.find((t) => t.id === 'public-board');
  return template?.defaultContent[sectionId] ?? '';
};

export const FocusModeDialog = ({
  section,
  open,
  onOpenChange,
  onSave,
  templateId,
}: FocusModeDialogProps) => {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<SectionStatus>('empty');
  const [showExample, setShowExample] = useState(false);
  const { isAuthenticated } = useSafeAuth();

  useEffect(() => {
    if (section) {
      setContent(section.content);
      setStatus(section.status);
      // Give the example more presence on empty sections (it helps most there).
      setShowExample(section.content.trim() === '');
    }
  }, [section]);

  if (!section) return null;

  const metadata = SECTION_METADATA[section.id];
  const isSensitive = SENSITIVE_SECTIONS.includes(section.id);
  const example = getExampleContent(section.id, templateId);

  const handleSave = () => {
    let newStatus: SectionStatus;
    if (content.trim() === '') {
      newStatus = 'empty';
    } else {
      newStatus = 'completed';
    }
    onSave(section.id, content, newStatus);
    onOpenChange(false);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white border-0 text-xs shadow-sm">
            <Check className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="secondary" className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-xs">
            <Pencil className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground text-xs">
            <Circle className="w-3 h-3 mr-1" />
            Empty
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              {section.title}
            </DialogTitle>
            {getStatusBadge()}
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Edit the content for this section of your governance canvas.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4 space-y-6">
          {isSensitive && !isAuthenticated && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-brand-primary/5 border border-brand-primary/15">
              <Shield className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                This section may contain sensitive information. We recommend creating an account for better protection and to access your project from any device.
              </p>
            </div>
          )}

          {metadata && (
            <div className="bg-muted/40 rounded-xl p-4 border border-border/60">
              <p className="text-sm text-muted-foreground leading-relaxed">{metadata.explanation}</p>
            </div>
          )}

          {metadata && (
            <div className="space-y-2">
              <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Guiding Questions</h4>
              <ul className="space-y-2">
                {metadata.guidingQuestions.map((question, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed"
                  >
                    <span className="font-semibold text-xs mt-0.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">{index + 1}.</span>
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {example && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowExample((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-medium text-brand-primary hover:opacity-80 transition-opacity"
                aria-expanded={showExample}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                {showExample ? 'Hide example' : 'See example'}
              </button>
              {showExample && (
                <div className="rounded-xl border border-brand-secondary/30 bg-brand-secondary/[0.06] p-4 space-y-1.5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Example response
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                    {example}
                  </p>
                  <p className="text-[11px] text-muted-foreground italic pt-1">
                    For reference only — this is not added to your content.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Your Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your content for this section…"
              className="min-h-[200px] resize-none text-sm leading-relaxed rounded-xl border-border/60 focus:border-brand-primary/40 focus:ring-brand-primary/20"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border/60 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs rounded-xl">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="text-xs rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 shadow-md shadow-brand-primary/20"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
