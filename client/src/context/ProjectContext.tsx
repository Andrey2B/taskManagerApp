import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProjectContextType {
  projectId: string | null;
  setProjectId: (id: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projectId, setProjectId] = useState<string | null>(null);

  return (
    <ProjectContext.Provider value={{ projectId, setProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
};
