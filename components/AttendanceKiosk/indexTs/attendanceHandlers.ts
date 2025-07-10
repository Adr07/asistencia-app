import { useCallback } from "react";
import { handleCheck } from "../../../ts/handleCheck";

/**
 * Handler para check-out con descripción actual y progreso opcional.
 * Concatena el progreso a la descripción si está disponible.
 */
export function useCheckOutWithProgress({
  observaciones,
  avanceInput,
  selectedProject,
  selectedTask,
  handleCheckOut,
}: {
  observaciones: string;
  avanceInput?: string;
  selectedProject: any;
  selectedTask: any;
  handleCheckOut: (obs: string, avance?: number) => void;
}) {
  return useCallback(() => {
    let finalObservaciones = observaciones;
    let avanceValue: number | undefined = undefined;

    // Si hay avance, concatenarlo a las observaciones
    if (avanceInput && avanceInput.trim() !== "") {
      finalObservaciones = `${observaciones} | Progreso: ${avanceInput}%`;
      avanceValue = Number(avanceInput);
    }

    handleCheckOut(finalObservaciones, avanceValue);
  }, [observaciones, avanceInput, handleCheckOut]);
}

/**
 * Handler para iniciar el flujo de cambio de tarea.
 * Guarda la descripción actual y cambia el estado de la UI.
 */
export function useStartChangingTask({
  observaciones,
  avanceInput,
  setLastProject,
  setLastTask,
  selectedProject,
  selectedTask,
  setShowChangingTask,
  setStep,
}: {
  observaciones: string;
  avanceInput: string;
  setLastProject: (v: any) => void;
  setLastTask: (v: any) => void;
  selectedProject: any;
  selectedTask: any;
  setShowChangingTask: (v: boolean) => void;
  setStep: (v: "welcome" | "checked_in" | "before_checkout" | "checked_out" | "changing_task") => void;
}) {
  return useCallback(() => {
    setLastProject(selectedProject);
    setLastTask(selectedTask);
    setShowChangingTask(true);
    setStep("changing_task");
  }, [selectedProject, selectedTask, setLastProject, setLastTask, setShowChangingTask, setStep]);
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
  lastObservaciones,
  lastAvance,
  observaciones,
  avanceInput,
  setCheckOutTime,
  setStep,
  setWorkedHours,
  setFullTime,
  setLoading,
  showMessage,
  setObservaciones,
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
          setObservaciones,
          setLoading,
          showMessage,
          newProject: pendingProject,
          newTask: pendingTask,
        });
        setShowChangingTask(false);
        return;
      }
      // Guarda la tarea/proyecto/obs/avance ANTERIORES antes de limpiar
      // Cierra el registro actual con los datos actuales del input
      // LOG para depuración de observaciones y avance antes de handleCheck
      console.log('[handleChangeTaskFlow][sign_out] observaciones:', observaciones);
      console.log('[handleChangeTaskFlow][sign_out] avanceInput:', avanceInput);
      console.log('[handleChangeTaskFlow][sign_out] typeof observaciones:', typeof observaciones, 'valor:', observaciones);
      console.log('[handleChangeTaskFlow][sign_out] typeof avanceInput:', typeof avanceInput, 'valor:', avanceInput);
      const obsSignOut = avanceInput && avanceInput.trim() !== ""
        ? `${observaciones} | Progreso: ${avanceInput}%`
        : observaciones;
      console.log('[handleChangeTaskFlow][sign_out] observaciones que se envía:', obsSignOut);
      await handleCheck({
        action: "sign_out",
        uid,
        pass,
        selectedProject,
        selectedTask,
        observaciones: obsSignOut,
        progress: avanceInput ? Number(avanceInput) : undefined,
        setCheckOutTime,
        setStep: (v: string) => setStep(v),
        setWorkedHours,
        setFullTime,
        setLoading,
        checkInTimestamp: null,
        showMessage,
        ...(typeof setObservaciones === 'function' ? { setObservaciones: () => setObservaciones("") } : {}),
        setSelectedProject: () => setSelectedProject(null),
        setSelectedTask: () => setSelectedTask(null),
      });
      // Ahora sí, cambia a la nueva tarea (check-in)
      // LOG para depuración de observaciones y avance antes de handleCheck (sign_in)
      console.log('[handleChangeTaskFlow][sign_in] observaciones:', observaciones);
      console.log('[handleChangeTaskFlow][sign_in] avanceInput:', avanceInput);
      console.log('[handleChangeTaskFlow][sign_in] typeof observaciones:', typeof observaciones, 'valor:', observaciones);
      console.log('[handleChangeTaskFlow][sign_in] typeof avanceInput:', typeof avanceInput, 'valor:', avanceInput);
      const obsSignIn = avanceInput && avanceInput.trim() !== ""
        ? `${observaciones} | Progreso: ${avanceInput}%`
        : observaciones;
      console.log('[handleChangeTaskFlow][sign_in] observaciones que se envía:', obsSignIn);
      await handleCheck({
        action: "sign_in",
        uid,
        pass,
        selectedProject: pendingProject,
        selectedTask: pendingTask,
        observaciones: obsSignIn,
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
        ...(typeof setObservaciones === 'function' ? { setObservaciones: () => setObservaciones("") } : {}),
        setSelectedProject: () => setSelectedProject(pendingProject),
        setSelectedTask: () => setSelectedTask(pendingTask),
      });
    }
  }, [pendingProject, pendingTask, selectedProject, selectedTask, observaciones, avanceInput, setCheckOutTime, setStep, setWorkedHours, setFullTime, setLoading, showMessage, setObservaciones, setSelectedProject, setSelectedTask, setCheckInTime, setCheckInTimestamp, setShowChangingTask, uid, pass, handleChangeTask]);
}
