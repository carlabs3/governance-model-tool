import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { GovernanceCanvas, CanvasSection, DEFAULT_CANVAS_SECTIONS, GOVERNANCE_TEMPLATES, SectionStatus, ProjectStatus } from '@/types/governance';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProjectContextType {
  currentProject: GovernanceCanvas | null;
  projects: GovernanceCanvas[];
  createProject: (name: string, templateId?: string) => Promise<GovernanceCanvas>;
  loadProject: (accessCode: string) => Promise<GovernanceCanvas | null>;
  updateSection: (sectionId: string, content: string, status?: SectionStatus) => void;
  saveProject: () => Promise<void>;
  clearCurrentProject: () => void;
  applyTemplate: (templateId?: string) => Promise<void>;
  updateProjectStatus: () => void;
  renameProject: (name: string) => Promise<void>;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const generateAccessCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(array[i] % chars.length);
  }
  return code;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<GovernanceCanvas[]>([]);
  const [currentProject, setCurrentProject] = useState<GovernanceCanvas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Autosave current project with debounce
  useEffect(() => {
    if (!currentProject) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveProject();
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [currentProject]);

  const createProject = useCallback(async (name: string, templateId?: string): Promise<GovernanceCanvas> => {
    setIsLoading(true);
    
    try {
      const template = templateId 
        ? GOVERNANCE_TEMPLATES.find(t => t.id === templateId) 
        : null;

      const accessCode = generateAccessCode();

      // Build sections data for the RPC
      const sectionsData = DEFAULT_CANVAS_SECTIONS.map(section => {
        const content = template?.defaultContent[section.id] || '';
        return {
          section_id: section.id,
          title: section.title,
          description: section.description,
          content,
          icon: section.icon || null,
          category: section.category,
          grid_span_cols: section.gridSpan?.cols || null,
          grid_span_rows: section.gridSpan?.rows || null,
          status: content ? 'in_progress' : 'empty',
        };
      });

      // Use RPC to create project + sections atomically
      const { data, error: projectError } = await supabase
        .rpc('create_project_with_sections', {
          p_name: name,
          p_access_code: accessCode,
          p_template_id: templateId || null,
          p_sections: sectionsData,
        });

      if (projectError) {
        console.error('Error creating project:', projectError);
        toast.error('Failed to create project');
        throw projectError;
      }

      const projectData = data as any;

      // Build the local project object
      const sections: CanvasSection[] = DEFAULT_CANVAS_SECTIONS.map(section => {
        const content = template?.defaultContent[section.id] || '';
        return {
          ...section,
          content,
          status: (content ? 'in_progress' : 'empty') as SectionStatus,
        };
      });

      const newProject: GovernanceCanvas = {
        id: projectData.id,
        name,
        accessCode,
        templateId,
        sections,
        status: 'draft' as ProjectStatus,
        createdAt: new Date(projectData.created_at),
        updatedAt: new Date(projectData.updated_at),
      };

      setProjects(prev => [...prev, newProject]);
      setCurrentProject(newProject);
      toast.success('Project created successfully!');
      return newProject;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadProject = useCallback(async (accessCode: string): Promise<GovernanceCanvas | null> => {
    setIsLoading(true);
    
    try {
      // Use RPC to get project by access code (server-side validation)
      const { data, error: projectError } = await supabase
        .rpc('get_project_by_access_code', { p_code: accessCode.toUpperCase() });

      const projectData = data as any;

      if (projectError) {
        console.error('Error loading project:', projectError);
        toast.error('Failed to load project');
        return null;
      }

      if (!projectData) {
        toast.error('Project not found. Please check your access code.');
        return null;
      }

      // Map RPC sections to local format
      const dbSections = projectData.sections || [];
      const sections: CanvasSection[] = DEFAULT_CANVAS_SECTIONS.map(defaultSection => {
        const dbSection = dbSections.find((s: any) => s.section_id === defaultSection.id);
        return {
          id: defaultSection.id,
          title: dbSection?.title || defaultSection.title,
          description: dbSection?.description || defaultSection.description,
          content: dbSection?.content || '',
          icon: dbSection?.icon || defaultSection.icon,
          category: (dbSection?.category || defaultSection.category) as 'strategy' | 'operations',
          gridSpan: {
            cols: dbSection?.grid_span_cols || defaultSection.gridSpan?.cols,
            rows: dbSection?.grid_span_rows || defaultSection.gridSpan?.rows,
          },
          status: (dbSection?.status || 'empty') as SectionStatus,
        };
      });

      const project: GovernanceCanvas = {
        id: projectData.id,
        name: projectData.name,
        accessCode: projectData.access_code,
        templateId: projectData.template_id || undefined,
        sections,
        status: (projectData.status || 'draft') as ProjectStatus,
        createdAt: new Date(projectData.created_at),
        updatedAt: new Date(projectData.updated_at),
      };

      setCurrentProject(project);
      setProjects(prev => {
        const existing = prev.find(p => p.id === project.id);
        if (existing) {
          return prev.map(p => p.id === project.id ? project : p);
        }
        return [...prev, project];
      });
      
      return project;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSection = useCallback((sectionId: string, content: string, status?: SectionStatus) => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      sections: currentProject.sections.map(section => {
        if (section.id === sectionId) {
          const newStatus = status ?? (content.trim() ? 'in_progress' : 'empty');
          return { ...section, content, status: newStatus };
        }
        return section;
      }),
      updatedAt: new Date(),
    };

    setCurrentProject(updatedProject);
    setProjects(prev =>
      prev.map(p => (p.id === updatedProject.id ? updatedProject : p))
    );
  }, [currentProject]);

  const updateProjectStatus = useCallback(() => {
    if (!currentProject) return;

    const sections = currentProject.sections;
    const completedCount = sections.filter(s => s.status === 'completed').length;
    const inProgressCount = sections.filter(s => s.status === 'in_progress').length;
    const totalCount = sections.length;

    let newStatus: ProjectStatus = 'draft';
    if (completedCount === totalCount) {
      newStatus = 'completed';
    } else if (completedCount > 0 || inProgressCount > 0) {
      newStatus = 'in_progress';
    }

    if (newStatus !== currentProject.status) {
      const updatedProject = {
        ...currentProject,
        status: newStatus,
        updatedAt: new Date(),
      };

      // Use RPC to update status server-side with access code validation
      supabase
        .rpc('update_project_status_by_access_code', {
          p_code: currentProject.accessCode,
          p_project_id: currentProject.id,
          p_status: newStatus,
        })
        .then(({ error }) => {
          if (error) console.error('Error updating project status:', error);
        });

      setCurrentProject(updatedProject);
      setProjects(prev =>
        prev.map(p => (p.id === updatedProject.id ? updatedProject : p))
      );
    }
  }, [currentProject]);

  const renameProject = useCallback(async (name: string) => {
    if (!currentProject) return;

    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 120) {
      toast.error('Name must be between 1 and 120 characters');
      return;
    }
    if (trimmed === currentProject.name) return;

    // Use RPC to rename server-side with access code validation
    const { data, error } = await supabase.rpc('update_project_name_by_access_code', {
      p_code: currentProject.accessCode,
      p_project_id: currentProject.id,
      p_name: trimmed,
    });

    if (error || data === false) {
      console.error('Error renaming project:', error);
      toast.error('Could not rename the project');
      return;
    }

    const updatedProject = { ...currentProject, name: trimmed, updatedAt: new Date() };
    setCurrentProject(updatedProject);
    setProjects(prev => prev.map(p => (p.id === updatedProject.id ? updatedProject : p)));
    toast.success('Project renamed');
  }, [currentProject]);

  const saveProject = useCallback(async () => {
    if (!currentProject) return;

    try {
      // Use RPC to save each section with access code validation
      for (const section of currentProject.sections) {
        const { error } = await supabase
          .rpc('save_section_by_access_code', {
            p_code: currentProject.accessCode,
            p_project_id: currentProject.id,
            p_section_id: section.id,
            p_content: section.content,
            p_status: section.status,
          });

        if (error) {
          console.error('Error saving section:', error);
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
  }, [currentProject]);

  const clearCurrentProject = useCallback(() => {
    if (currentProject) {
      saveProject();
    }
    setCurrentProject(null);
  }, [currentProject, saveProject]);

  const applyTemplate = useCallback(async (templateId?: string) => {
    if (!currentProject) return;
    setIsLoading(true);

    try {
      const template = templateId 
        ? GOVERNANCE_TEMPLATES.find(t => t.id === templateId) 
        : null;

      const updatedSections = currentProject.sections.map(section => {
        const content = template?.defaultContent[section.id] || '';
        return {
          ...section,
          content,
          status: (content ? 'in_progress' : 'empty') as SectionStatus,
        };
      });

      // Build sections data for RPC
      const sectionsData = updatedSections.map(s => ({
        section_id: s.id,
        content: s.content,
        status: s.status,
      }));

      // Use RPC to apply template with access code validation
      const { error } = await supabase
        .rpc('apply_template_by_access_code', {
          p_code: currentProject.accessCode,
          p_project_id: currentProject.id,
          p_template_id: templateId || null,
          p_sections: sectionsData,
        });

      if (error) {
        console.error('Error updating template:', error);
        toast.error('Failed to apply template');
        return;
      }

      const updatedProject = {
        ...currentProject,
        templateId,
        sections: updatedSections,
        updatedAt: new Date(),
      };

      setCurrentProject(updatedProject);
      setProjects(prev =>
        prev.map(p => (p.id === updatedProject.id ? updatedProject : p))
      );

      toast.success(template ? `Applied "${template.name}" template` : 'Reset to blank canvas');
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        projects,
        createProject,
        loadProject,
        updateSection,
        saveProject,
        clearCurrentProject,
        applyTemplate,
        updateProjectStatus,
        renameProject,
        isLoading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
