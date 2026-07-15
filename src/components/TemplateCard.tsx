import { Building2, Users, Handshake, FileText, Network, ClipboardList, LucideIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  'building-2': Building2,
  'users': Users,
  'handshake': Handshake,
  'file-text': FileText,
  'network': Network,
  'clipboard-list': ClipboardList,
};

interface TemplateCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const TemplateCard = ({
  id,
  name,
  description,
  icon,
  isSelected,
  onSelect,
}: TemplateCardProps) => {
  const Icon = iconMap[icon] || FileText;

  return (
    <button
      onClick={() => onSelect(id)}
      className={cn(
        'w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group',
        'hover:border-brand-primary/30 hover:bg-brand-primary/3',
        isSelected
          ? 'border-brand-primary/50 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5'
          : 'border-border/60 bg-card'
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
            isSelected
              ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-md shadow-brand-primary/20'
              : 'bg-muted text-muted-foreground group-hover:text-brand-primary'
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground">{name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        </div>
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white flex items-center justify-center shrink-0 shadow-sm">
            <Check className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </button>
  );
};
