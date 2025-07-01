import { useState } from "react";

export function useChangeTaskStep() {
  const [pendingProject, setPendingProject] = useState<any>(null);
  const [pendingTask, setPendingTask] = useState<any>(null);
  // Setters protegidos para evitar SyntheticEvent
  function safeSetPendingProject(val: any) {
    if (val && typeof val === 'object' && val.nativeEvent) return;
    setPendingProject(val);
  }
  function safeSetPendingTask(val: any) {
    if (val && typeof val === 'object' && val.nativeEvent) return;
    setPendingTask(val);
  }
  return {
    pendingProject,
    safeSetPendingProject,
    pendingTask,
    safeSetPendingTask,
  };
}
