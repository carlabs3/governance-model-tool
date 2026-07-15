import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GOVERNANCE_TEMPLATES } from "@/types/governance";
import { Building2, Users, Handshake, Network, ClipboardList, Check, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  "building-2": Building2,
  users: Users,
  handshake: Handshake,
  network: Network,
  "clipboard-list": ClipboardList,
};

interface TemplateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (templateId: string) => void;
  currentTemplateId?: string | null;
}

export const TemplateSelectionDialog = ({
  open,
  onOpenChange,
  onConfirm,
  currentTemplateId,
}: TemplateSelectionDialogProps) => {
  const [selected, setSelected] = useState<string | null>(currentTemplateId ?? null);

  const handleConfirm = () => {
    if (selected) {
      onConfirm(selected);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-semibold tracking-tight">Choose a Governance Model</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Select the model that best fits your project's governance needs.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-2 space-y-2 max-h-[60vh] overflow-y-auto">
          {GOVERNANCE_TEMPLATES.map((template) => {
            const Icon = iconMap[template.icon] || Building2;
            const isSelected = selected === template.id;
            const isCurrent = currentTemplateId === template.id;

            return (
              <button
                key={template.id}
                onClick={() => setSelected(template.id)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 relative group",
                  "hover:border-brand-primary/30 hover:bg-brand-primary/3",
                  isSelected
                    ? "border-brand-primary/50 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5"
                    : "border-border/60 bg-card",
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                      isSelected
                        ? "bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-md shadow-brand-primary/20"
                        : "bg-muted text-muted-foreground group-hover:text-brand-primary",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-foreground">{template.name}</h3>
                      {isCurrent && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{template.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-border/60 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs rounded-xl">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={!selected}
            className="text-xs rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 shadow-md shadow-brand-primary/20"
          >
            Preview this model
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
