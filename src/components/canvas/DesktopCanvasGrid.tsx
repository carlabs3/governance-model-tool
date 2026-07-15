import { CanvasSection } from '@/components/CanvasSection';
import type { CanvasSection as CanvasSectionData } from '@/types/governance';

interface DesktopCanvasGridProps {
  strategySections: CanvasSectionData[];
  operationsSections: CanvasSectionData[];
  onSectionClick: (sectionId: string) => void;
}

export const DesktopCanvasGrid = ({
  strategySections,
  operationsSections,
  onSectionClick,
}: DesktopCanvasGridProps) => {
  const renderSection = (sections: CanvasSectionData[], id: string, className?: string) => {
    const section = sections.find(s => s.id === id);
    if (!section) return null;
    return (
      <CanvasSection
        {...section}
        onFocusClick={() => onSectionClick(id)}
        className={className}
      />
    );
  };

  return (
    <>
      {/* Section Headers */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gradient-to-r from-brand-primary to-brand-primary/80 text-white rounded-xl px-6 py-3 text-center font-semibold text-sm tracking-wide shadow-sm">
          Strategy
        </div>
        <div className="bg-gradient-to-r from-brand-secondary to-brand-secondary/80 text-white rounded-xl px-6 py-3 text-center font-semibold text-sm tracking-wide shadow-sm">
          Operations
        </div>
      </div>

      {/* Main Canvas Grid */}
      <div className="grid grid-cols-4 gap-3">
        {/* Row 1 */}
        <div className="col-span-2">
          {renderSection(strategySections, 'lab-objectives', 'h-full min-h-[140px]')}
        </div>
        <div className="col-span-2">
          {renderSection(operationsSections, 'operations-management', 'h-full min-h-[140px]')}
        </div>

        {/* Row 2 */}
        <div className="col-span-1">
          {renderSection(strategySections, 'decision-making', 'h-full min-h-[120px]')}
        </div>
        <div className="col-span-1">
          {renderSection(strategySections, 'leadership', 'h-full min-h-[120px]')}
        </div>
        <div className="col-span-1 row-span-2">
          {renderSection(operationsSections, 'working-groups', 'h-full min-h-[260px]')}
        </div>
        <div className="col-span-1 row-span-2">
          {renderSection(operationsSections, 'stakeholders', 'h-full min-h-[260px]')}
        </div>

        {/* Row 3 */}
        <div className="col-span-2">
          {renderSection(strategySections, 'citizen-involvement', 'h-full min-h-[120px]')}
        </div>

        {/* Row 4 */}
        <div className="col-span-1">
          {renderSection(strategySections, 'finances', 'h-full min-h-[120px]')}
        </div>
        <div className="col-span-1">
          {renderSection(strategySections, 'legal-status', 'h-full min-h-[120px]')}
        </div>
        <div className="col-span-2">
          {renderSection(operationsSections, 'internal-communication', 'h-full min-h-[120px]')}
        </div>
      </div>
    </>
  );
};
