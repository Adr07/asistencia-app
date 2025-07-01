import { useEffect, useState } from "react";
import { showMessage } from "../components/AttendanceKiosk/otros/util";
import { handleCheck } from "./handleCheck";
import { useEmployeeId } from "./useEmployeeId";

/**
 * Hook principal que orquesta el estado y la lógica de asistencia.
 * Maneja todos los estados necesarios para el flujo de check-in/check-out
 * y proporciona funciones adaptadoras para interactuar con Odoo.
 */
export function useAttendanceMain(props: { uid: number; pass: string; onLogout?: () => void }) {
  // Estados principales del flujo de asistencia
  const [step, setStep] = useState<"welcome" | "checked_in" | "before_checkout" | "checked_out" | "changing_task">("welcome");
  const [loading, setLoading] = useState(false);
  const [checkOutTime, setCheckOutTime] = useState<string>("");
  const [workedHours, setWorkedHours] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [timer, setTimer] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  
  // Timestamps para calcular horas trabajadas correctamente
  const [checkInTimestamp, setCheckInTimestamp] = useState<number | null>(null); // Timestamp del check-in inicial
  const [currentTaskStartTimestamp, setCurrentTaskStartTimestamp] = useState<number | null>(null); // Timestamp de inicio de tarea actual
  
  const [checkInTime, setCheckInTime] = useState<string>("");
  const [fullTime, setFullTime] = useState<string>("");
  const [lastCheckOutTimestamp, setLastCheckOutTimestamp] = useState<number | null>(null);
  // const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Obtener función para consultar ID del empleado
  const fetchEmployeeId = useEmployeeId(props.uid, props.pass);

  // Efecto para el timer que cuenta el tiempo transcurrido
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

  // Función adaptadora para manejar check-in (entrada)
  const handleCheckIn = async () => {
    await handleCheck({
      action: 'sign_in',
      uid: props.uid,
      pass: props.pass,
      selectedProject,
      selectedTask,
      description,
      checkInTimestamp,
      currentTaskStartTimestamp,
      setCheckInTime,
      setCheckInTimestamp,
      setCurrentTaskStartTimestamp,
      setStep: (v: string) => setStep(v as "welcome" | "checked_in" | "before_checkout" | "checked_out" | "changing_task"),
      setLoading,
      showMessage,
    });
  };

  // Función adaptadora para manejar check-out (salida)
  const handleCheckOut = async (customDescription?: string, progress?: number) => {
    // Mostrar advertencia si no hay proyecto/tarea, pero continuar para cerrar el registro
    if (!selectedProject || !selectedTask) {
      showMessage("No se seleccionó proyecto o tarea. Solo se cerrará el registro de asistencia.", "warning");
    }
    
    await handleCheck({
      action: 'sign_out',
      uid: props.uid,
      pass: props.pass,
      selectedProject,
      selectedTask,
      description: typeof customDescription === 'string' ? customDescription : description,
      progress,
      checkInTimestamp,
      currentTaskStartTimestamp,
      setCheckOutTime,
      setCurrentTaskStartTimestamp,
      setStep: (v: string) => setStep(v as "welcome" | "checked_in" | "before_checkout" | "checked_out" | "changing_task"),
      setWorkedHours,
      setFullTime,
      setLoading,
      showMessage,
      // Limpiar estado después del check-out
      setDescription: () => setDescription(""),
      setSelectedProject: () => setSelectedProject(null),
      setSelectedTask: () => setSelectedTask(null),
    });
  };

  // Retornar todos los estados y funciones necesarios para el componente
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
    currentTaskStartTimestamp, // Timestamp de inicio de tarea actual
    setCurrentTaskStartTimestamp, // Setter del timestamp de tarea actual
    fullTime,
    setFullTime,
    lastCheckOutTimestamp,
    setLastCheckOutTimestamp,
    handleCheckIn,
    handleCheckOut,
    fetchEmployeeId,
    showMessage,
    onLogout: props.onLogout,
    formatTimer: (t: number) => {
      // Formateo de tiempo HH:mm:ss
      const h = Math.floor(t / 3600).toString().padStart(2, '0');
      const m = Math.floor((t % 3600) / 60).toString().padStart(2, '0');
      const s = (t % 60).toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    },
  };
}
