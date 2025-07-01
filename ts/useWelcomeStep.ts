import { useState } from "react";

export function useWelcomeStep({ uid, pass }: { uid: number; pass: string }) {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [description, setDescription] = useState<string>("");
  // Aquí puedes agregar lógica específica del paso welcome
  return {
    selectedProject,
    setSelectedProject,
    selectedTask,
    setSelectedTask,
    description,
    setDescription,
  };
}
