import { useCallback } from "react";
import { handleCheck } from "../../../ts/handleCheck";

/**
 * Handler para check-out con descripción actual y progreso opcional.
 * Concatena el progreso a la descripción si está disponible.
 */
export function useCheckOutWithProgress({
  description,
  progressInput,
  selectedProject,
  selectedTask,
  handleCheckOut,
}: {
  description: string;
  progressInput?: string;
  selectedProject: any;
  selectedTask: any;
  handleCheckOut: (desc: string, progress?: number) => void;
}) {
  return useCallback(() => {
    let finalDescription = description;
    let progressValue: number | undefined = undefined;

    // Si hay progreso, concatenarlo a la descripción
    if (progressInput && progressInput.trim() !== "") {
      finalDescription = `${description} | Progreso: ${progressInput}%`;
      progressValue = Number(progressInput);
    }

    handleCheckOut(finalDescription, progressValue);
  }, [description, progressInput, handleCheckOut]);
}

/**
 * Handler para iniciar el flujo de cambio de tarea.
 * Guarda la descripción actual y cambia el estado de la UI.
 */
export function useStartChangingTask({
  description,
  progressInput, // <-- NUEVO: recibir el progreso actual
  setLastDescription,
  setLastProgress,
  setLastProject, // <-- NUEVO
  setLastTask,    // <-- NUEVO
  selectedProject, // <-- NUEVO
  selectedTask,    // <-- NUEVO
  setShowChangingTask,
  setStep,
}: {
  description: string;
  progressInput: string; // <-- NUEVO: tipo para el progreso actual
  setLastDescription: (v: string) => void;
  setLastProgress: (v: string) => void;
  setLastProject: (v: any) => void; // <-- NUEVO
  setLastTask: (v: any) => void;    // <-- NUEVO
  selectedProject: any; // <-- NUEVO
  selectedTask: any;    // <-- NUEVO
  setShowChangingTask: (v: boolean) => void;
  setStep: (v: "welcome" | "checked_in" | "before_checkout" | "checked_out" | "changing_task") => void;
}) {
  return useCallback(() => {
    setLastDescription(description);
    setLastProgress(progressInput || ""); // <-- GUARDAR EL PROGRESO ACTUAL
    setLastProject(selectedProject); // <-- GUARDAR PROYECTO ANTERIOR
    setLastTask(selectedTask);       // <-- GUARDAR TAREA ANTERIOR
    setShowChangingTask(true);
    setStep("changing_task");
  }, [description, progressInput, setLastDescription, setLastProgress, setLastProject, setLastTask, selectedProject, selectedTask, setShowChangingTask, setStep]);
}

/**
 * Handler robusto para cambio de tarea (flujo completo de sign_out y sign_in).
 * Cierra la tarea anterior y abre la nueva, actualizando todos los estados necesarios.
 */
export function useHandleChangeTaskFlow({
  pendingProject,
  pendingTask,
  selectedProject,
  selectedTask,
  lastDescription,
  lastProgress,
  description,
  progressInput,
  setCheckOutTime,
  setStep,
  setWorkedHours,
  setFullTime,
  setLoading,
  showMessage,
  setDescription,
  setSelectedProject,
  setSelectedTask,
  setCheckInTime,
  setCheckInTimestamp,
  setShowChangingTask, // <-- Aseguramos que se reciba como prop
  uid,
  pass,
  handleChangeTask, // <-- Nuevo: permite inyectar el handler clásico
} : any) {
  return useCallback(async () => {
    if (pendingProject && pendingTask) {
      // Si se provee handleChangeTask, úsalo para el flujo clásico
      if (handleChangeTask) {
        await handleChangeTask({
          uid,
          pass,
          setCheckOutTime,
          setLastCheckOutTimestamp: () => {},
          setStep,
          setSelectedProject,
          setSelectedTask,
          setDescription,
          setLoading,
          showMessage,
          newProject: pendingProject,
          newTask: pendingTask,
        });
        setShowChangingTask(false);
        return;
      }
      // Guarda la tarea/proyecto/desc/progreso ANTERIORES antes de limpiar
      const prevProject = selectedProject;
      const prevTask = selectedTask;
      const prevDescription = lastDescription;
      const prevProgress = lastProgress;
      // Cierra el registro actual con los datos anteriores
      await handleCheck({
        action: "sign_out",
        uid,
        pass,
        selectedProject: prevProject,
        selectedTask: prevTask,
        description:
          prevProgress && prevProgress.trim() !== ""
            ? `${prevDescription} | Progreso: ${prevProgress}%`
            : prevDescription,
        progress: prevProgress ? Number(prevProgress) : undefined,
        setCheckOutTime,
        setStep: (v: string) => setStep(v),
        setWorkedHours,
        setFullTime,
        setLoading,
        checkInTimestamp: null,
        showMessage,
        setDescription: () => setDescription(""),
        setSelectedProject: () => setSelectedProject(null),
        setSelectedTask: () => setSelectedTask(null),
      });
      // Ahora sí, cambia a la nueva tarea (check-in)
      let newTaskDescription = description;
      if (progressInput && progressInput.trim() !== "") {
        newTaskDescription = `${description} | Progreso: ${progressInput}%`;
      }
      await handleCheck({
        action: "sign_in",
        uid,
        pass,
        selectedProject: pendingProject,
        selectedTask: pendingTask,
        description: newTaskDescription,
        setCheckInTime,
        setCheckInTimestamp,
        setStep: (v: string) => {
          setStep(v);
          if (v === "checked_in" && typeof setShowChangingTask === "function") {
            setShowChangingTask(false);
          }
        },
        setLoading,
        showMessage,
        setDescription: () => setDescription(""),
        setSelectedProject: () => setSelectedProject(pendingProject),
        setSelectedTask: () => setSelectedTask(pendingTask),
      });
    }
  }, [pendingProject, pendingTask, selectedProject, selectedTask, lastDescription, lastProgress, description, progressInput, setCheckOutTime, setStep, setWorkedHours, setFullTime, setLoading, showMessage, setDescription, setSelectedProject, setSelectedTask, setCheckInTime, setCheckInTimestamp, setShowChangingTask, uid, pass, handleChangeTask]);
}
