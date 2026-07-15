import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, Clock, Copy, FileEdit, KeyRound } from 'lucide-react';
import type { ProjectStatus, CanvasSection } from '@/types/governance';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ProjectProgressBarProps {
  sections: CanvasSection[];
  projectStatus: ProjectStatus;
  lastUpdated: Date;
  accessCode: string;
}

export const ProjectProgressBar = ({
  sections,
  projectStatus,
  lastUpdated,
  accessCode,
}: ProjectProgressBarProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const completedCount = sections.filter((s) => s.status === 'completed').length;
  const totalCount = sections.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const statusConfig = {
    completed: {
      label: 'Completed',
      icon: Check,
      pillClass: 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md shadow-brand-primary/20',
    },
    in_progress: {
      label: 'In Progress',
      icon: FileEdit,
      pillClass: 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md shadow-brand-primary/20',
    },
    draft: {
      label: 'Draft',
      icon: Clock,
      pillClass: 'bg-muted text-muted-foreground',
    },
  };

  const config = statusConfig[projectStatus];
  const StatusIcon = config.icon;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Access Code Copied',
      description: 'Share this code to let others access your project.',
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div
      className="relative rounded-2xl border border-brand-primary/15 p-5 overflow-hidden transition-all duration-300 hover:border-brand-primary/25 hover:shadow-lg hover:shadow-brand-primary/5"
      role="status"
      aria-label={`Project status: ${config.label}. ${completedCount} of ${totalCount} sections completed. Access code: ${accessCode}.`}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/8 to-brand-secondary/8 pointer-events-none" />

      <div className="relative z-[1] space-y-3">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Status pill + timestamp */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide',
                config.pillClass
              )}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {config.label}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{formatDate(lastUpdated)}</span>
            </div>
          </div>

          {/* Right: Sections count + Access code */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sections</span>
              <span className="text-sm md:text-base font-bold bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
                {completedCount} / {totalCount}
              </span>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-5 bg-border/60" />

            {/* Access code */}
            <button
              onClick={handleCopyCode}
              className="group flex items-center gap-2 rounded-xl px-3 py-1.5 border border-brand-primary/20 bg-background/60 hover:bg-brand-primary/10 hover:border-brand-primary/40 transition-all duration-200"
              aria-label={`Access code: ${accessCode}. Click to copy.`}
            >
              <KeyRound className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" />
              <code className="font-mono font-bold text-sm text-foreground tracking-widest">
                {accessCode}
              </code>
              <span className="text-muted-foreground group-hover:text-brand-primary transition-colors">
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-brand-primary" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-brand">
          <Progress value={progressPercentage} className="h-2.5 bg-muted/40 rounded-full" />
        </div>
      </div>
    </div>
  );
};
