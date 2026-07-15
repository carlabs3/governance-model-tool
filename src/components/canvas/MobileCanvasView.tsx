import { Accordion } from '@/components/ui/accordion';
import { MobileCanvasSection } from './MobileCanvasSection';
import type { CanvasSection as CanvasSectionData } from '@/types/governance';

interface MobileCanvasViewProps {
  strategySections: CanvasSectionData[];
  operationsSections: CanvasSectionData[];
  onSectionClick: (sectionId: string) => void;
}

export const MobileCanvasView = ({
  strategySections,
  operationsSections,
  onSectionClick,
}: MobileCanvasViewProps) => {
  const orderedStrategySections = [
    'lab-objectives',
    'decision-making',
    'leadership',
    'citizen-involvement',
    'finances',
    'legal-status',
  ];

  const orderedOperationsSections = [
    'operations-management',
    'working-groups',
    'stakeholders',
    'internal-communication',
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="bg-gradient-to-r from-brand-primary to-brand-primary/80 text-white rounded-xl px-4 py-2.5 text-center font-semibold text-sm tracking-wide uppercase mb-3 shadow-sm">
          Strategy
        </div>
        <Accordion type="multiple" defaultValue={['lab-objectives']} className="space-y-2">
          {orderedStrategySections.map((sectionId) => {
            const section = strategySections.find(s => s.id === sectionId);
            if (!section) return null;
            return (
              <MobileCanvasSection
                key={section.id}
                {...section}
                onFocusClick={() => onSectionClick(section.id)}
              />
            );
          })}
        </Accordion>
      </div>

      <div>
        <div className="bg-gradient-to-r from-brand-secondary to-brand-secondary/80 text-white rounded-xl px-4 py-2.5 text-center font-semibold text-sm tracking-wide uppercase mb-3 shadow-sm">
          Operations
        </div>
        <Accordion type="multiple" defaultValue={['operations-management']} className="space-y-2">
          {orderedOperationsSections.map((sectionId) => {
            const section = operationsSections.find(s => s.id === sectionId);
            if (!section) return null;
            return (
              <MobileCanvasSection
                key={section.id}
                {...section}
                onFocusClick={() => onSectionClick(section.id)}
              />
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};
