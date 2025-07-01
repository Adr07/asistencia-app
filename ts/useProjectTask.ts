import { useState } from "react";

export function useProjectTask() {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  function safeSetSelectedProject(val: any) {
    if (val && typeof val === 'object' && val.nativeEvent) return;
    setSelectedProject(val);
  }
  function safeSetSelectedTask(val: any) {
    if (val && typeof val === 'object' && val.nativeEvent) return;
    setSelectedTask(val);
  }
  return {
    selectedProject,
    setSelectedProject: safeSetSelectedProject,
    selectedTask,
    setSelectedTask: safeSetSelectedTask,
  };
}
