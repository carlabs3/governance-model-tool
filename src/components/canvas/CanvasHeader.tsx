import { useState } from "react";
import { Button } from "@/components/ui/button";
import logoSrc from "@/assets/NEU-logo_RGB_main-color.png";
import { Layers, Home, Save, Settings2, Download, Mail, MoreHorizontal, HelpCircle, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import type { GovernanceCanvas } from "@/types/governance";

interface CanvasHeaderProps {
  project: GovernanceCanvas;
  onSave: () => void;
  onGoHome: () => void;
  onOpenTemplateDialog: () => void;
  onExportPdf: () => void;
  onOpenShareEmail: () => void;
  isExporting: boolean;
  onRestartTutorial: () => void;
  onRename: (name: string) => void;
}

export const CanvasHeader = ({
  project,
  onSave,
  onGoHome,
  onOpenTemplateDialog,
  onExportPdf,
  onOpenShareEmail,
  isExporting,
  onRestartTutorial,
  onRename,
}: CanvasHeaderProps) => {
  const isMobile = useIsMobile();
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(project.name);

  const startRename = () => {
    setDraftName(project.name);
    setEditingName(true);
  };
  const commitRename = () => {
    setEditingName(false);
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== project.name) onRename(trimmed);
  };
  const cancelRename = () => {
    setEditingName(false);
    setDraftName(project.name);
  };

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
      <div className="container-wide py-3">
        {/* Single row: Logo + Title | Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-secondary">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              {editingName ? (
                <input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") cancelRename();
                  }}
                  maxLength={120}
                  aria-label="Project name"
                  className="font-semibold text-sm leading-tight text-foreground bg-transparent border-b border-brand-primary/50 outline-none w-52"
                />
              ) : (
                <button
                  type="button"
                  onClick={startRename}
                  title="Rename project"
                  className="group flex items-center gap-1 font-semibold text-sm leading-tight text-foreground hover:text-brand-primary transition-colors"
                >
                  <span className="truncate max-w-[220px]">{project.name}</span>
                  <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                </button>
              )}
              <p className="text-[11px] text-muted-foreground">Governance Model Canvas</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <img src={logoSrc} alt="NeutralPath 2030" className="h-7 w-auto object-contain hidden sm:block mr-2" />

            {!isMobile && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onExportPdf}
                  disabled={isExporting}
                  className="gap-1.5 text-muted-foreground hover:text-foreground text-xs rounded-xl"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isExporting ? "Exporting..." : "Export PDF"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenTemplateDialog}
                  className="gap-1.5 text-muted-foreground hover:text-foreground text-xs rounded-xl"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  Template
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRestartTutorial}
                  className="gap-1.5 text-muted-foreground hover:text-foreground text-xs rounded-xl"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Tutorial
                </Button>
              </>
            )}

            {isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-xl">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-popover border border-border/60 shadow-lg z-50 rounded-xl"
                >
                  <DropdownMenuItem onClick={onExportPdf} disabled={isExporting}>
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? "Exporting..." : "Export PDF"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onOpenTemplateDialog}>
                    <Settings2 className="w-4 h-4 mr-2" />
                    Change Template
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onRestartTutorial}>
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Restart Tutorial
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onOpenShareEmail}
              className="gap-1.5 text-xs rounded-xl border-2 border-brand-primary/40 text-brand-primary hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-200"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onGoHome}
              className="text-muted-foreground hover:text-foreground"
            >
              <Home className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              onClick={onSave}
              className="gap-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 shadow-md shadow-brand-primary/20 transition-all duration-200"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
