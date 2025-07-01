import { useEmployeeId } from "./useEmployeeId";
// import { useLocation } from "./useLocation";
// import { useWelcomeStep } from "./useWelcomeStep";
// import { useChangeTaskStep } from "./useChangeTaskStep";
// import { useTimer } from "./useTimer";
// import { useDescription } from "./useDescription";
// import { useProjectTask } from "./useProjectTask";
// import { useWorkedHours } from "./useWorkedHours";
import { handleCheck } from "./handleCheck";
// import { resetFields } from "./resetFields";
// import { useInternalProjectExclusion } from "./useInternalProjectExclusion";
import { useEffect, useState } from "react";
import { showMessage } from "../components/AttendanceKiosk/otros/util";

// Hook principal que orquesta todos los hooks y lógica modularizada
export function useAttendanceMain(props: { uid: number; pass: string; onLogout?: () => void }) {
  // Estados principales y hooks reutilizables
  const [step, setStep] = useState<"welcome" | "checked_in" | "before_checkout" | "checked_out" | "changing_task">("welcome");
  const [loading, setLoading] = useState(false);
  const [checkOutTime, setCheckOutTime] = useState<string>("");
  const [workedHours, setWorkedHours] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [timer, setTimer] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [checkInTimestamp, setCheckInTimestamp] = useState<number | null>(null);
  const [currentTaskStartTimestamp, setCurrentTaskStartTimestamp] = useState<number | null>(null); // <-- NUEVO: timestamp de inicio de tarea actual
  const [checkInTime, setCheckInTime] = useState<string>("");
  const [fullTime, setFullTime] = useState<string>("");
  const [lastCheckOutTimestamp, setLastCheckOutTimestamp] = useState<number | null>(null);
  // const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Obtener función fetchEmployeeId del hook modularizado
  const fetchEmployeeId = useEmployeeId(props.uid, props.pass);

  // Timer efecto (contador)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (step === "checked_in" || step === "before_checkout") {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step]);

  // Función adaptadora para check-in
  const handleCheckIn = async () => {
    await handleCheck({
      action: 'sign_in',
      // fetchEmployeeId, // ELIMINADO: no es parte de los props de handleCheck
      uid: props.uid,
      pass: props.pass,
      selectedProject,
      selectedTask,
      description,
      setCheckInTime,
      setCheckInTimestamp,
      setCurrentTaskStartTimestamp, // <-- NUEVO: pasar setter para timestamp de tarea actual
      setStep: (v: string) => setStep(v as "welcome" | "checked_in" | "before_checkout" | "checked_out" | "changing_task"),
      setLoading,
      showMessage,
      // NO limpiar la descripción después de check-in
      // setDescription: () => setDescription("")
      // NO limpiar selectedProject ni selectedTask aquí
    });
  };

  // Función adaptadora para check-out
  const handleCheckOut = async (customDescription?: string, progress?: number) => {
    // Validación previa: si no hay proyecto/tarea, solo mostrar advertencia pero continuar para cerrar el registro
    if (!selectedProject || !selectedTask) {
      showMessage("No se seleccionó proyecto o tarea. Solo se cerrará el registro de asistencia.", "warning");
      // No return aquí, continuar para que handleCheck cierre el registro abierto
    }
    // Log de depuración antes de llamar a handleCheck
    await handleCheck({
      action: 'sign_out',
      // fetchEmployeeId, // ELIMINADO: no es parte de los props de handleCheck
      uid: props.uid,
      pass: props.pass,
      selectedProject,
      selectedTask,
      description: typeof customDescription === 'string' ? customDescription : description, // Usar SIEMPRE el argumento recibido
      progress, // Nuevo campo para % de avance
      setCheckOutTime,
      setCurrentTaskStartTimestamp, // <-- NUEVO: también pasar setter (se reseteará a null en checkout final)
      setStep: (v: string) => setStep(v as "welcome" | "checked_in" | "before_checkout" | "checked_out" | "changing_task"),
      setWorkedHours,
      setFullTime,
      setLoading,
      checkInTimestamp,
      showMessage,
      // Limpiar descripción, proyecto y tarea después de check-out
      setDescription: () => setDescription("") ,
      setSelectedProject: () => setSelectedProject(null),
      setSelectedTask: () => setSelectedTask(null),
    });
  };

  // Función adaptadora para cambio de tarea
  // const handleChangeTaskAdapted = async () => {
  //   await handleChangeTask({
  //     fetchEmployeeId,
  //     uid: props.uid,
  //     pass: props.pass,
  //     setCheckOutTime,
  //     setLastCheckOutTimestamp,
  //     setStep: (v: string) => setStep(v as "welcome" | "checked_in" | "before_checkout" | "checked_out" | "changing_task"),
  //     setSelectedProject: () => setSelectedProject(null),
  //     setSelectedTask: () => setSelectedTask(null),
  //     setDescription: () => setDescription("") ,
  //     setLoading,
  //     showMessage,
  //     RPC_URL,
  //     newProject: selectedProject,
  //     newTask: selectedTask,
  //   });
  // };

  return {
    step,
    setStep,
    loading,
    setLoading,
    checkInTime,
    setCheckInTime,
    checkOutTime,
    setCheckOutTime,
    workedHours,
    setWorkedHours,
    selectedProject,
    setSelectedProject,
    selectedTask,
    setSelectedTask,
    timer,
    setTimer,
    description,
    setDescription,
    checkInTimestamp,
    setCheckInTimestamp,
    currentTaskStartTimestamp, // <-- NUEVO: timestamp de inicio de tarea actual
    setCurrentTaskStartTimestamp, // <-- NUEVO: setter del timestamp
    fullTime,
    setFullTime,
    lastCheckOutTimestamp,
    setLastCheckOutTimestamp,
    handleCheckIn,
    handleCheckOut,
    fetchEmployeeId,
    showMessage,
    // Añadidos para tipado correcto
    onLogout: props.onLogout,
    formatTimer: (t: number) => {
      // Ejemplo de formateo HH:mm:ss
      const h = Math.floor(t / 3600).toString().padStart(2, '0');
      const m = Math.floor((t % 3600) / 60).toString().padStart(2, '0');
      const s = (t % 60).toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    },
  };
}
