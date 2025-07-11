 import { showMessage as defaultShowMessage } from "../components/AttendanceKiosk/otros/util";
import { attendanceManual } from "../db/odooApi";
import {
    calcDiffHours,
    getNowLocalTimeString
} from "../utils/attendanceUtils";

/**
 * Maneja los registros de entrada (check-in) y salida (check-out) de asistencia.
 * Para check-out, también registra las horas trabajadas en la tarea como línea analítica.
 * 
 * @param action - "sign_in" para entrada, "sign_out" para salida
 */
export async function handleCheck({
  action,
  uid,
  pass,
  selectedProject,
  selectedTask,
  observaciones,
  checkInTimestamp,
  currentTaskStartTimestamp,
  setCheckInTime,
  setCheckInTimestamp,
  setCurrentTaskStartTimestamp,
  setStep,
  setWorkedHours,
  setFullTime,
  setCheckOutTime,
  showMessage,
  geo,
  setLoading,
  setObservaciones,
  setSelectedProject,
  setSelectedTask, 
  progress,
  quality,
}: {
  action: "sign_in" | "sign_out";
  uid: number;
  pass: string;
  selectedProject: any;
  selectedTask: any;
  observaciones: string;
  checkInTimestamp?: number | null;
  currentTaskStartTimestamp?: number | null;
  setCheckInTime?: (v: string) => void;
  setCheckInTimestamp?: (v: number) => void;
  setCurrentTaskStartTimestamp?: (v: number | null) => void;
  setStep?: (v: string) => void;
  setWorkedHours?: (v: string) => void;
  setFullTime?: (v: string) => void;
  setCheckOutTime?: (v: string) => void;
  showMessage?: (title: string, msg: string) => void;
  geo?: { latitude: number; longitude: number } | null;
  setLoading: (v: boolean) => void;
  setObservaciones?: (v: string) => void;
  setSelectedProject?: (v: any) => void;
  setSelectedTask?: (v: any) => void;
  progress?: number;
  quality?: boolean;
}) {
  setLoading(true);
  console.log('[handleCheck] INICIO', { action, observaciones, progress, setObservacionesType: typeof setObservaciones });
  try {
    // El id de empleado y el control de check-in/check-out lo maneja attendanceManual en el backend
    if (action === "sign_in") {
      console.log('[handleCheck] Acción: sign_in');
      console.log('[handleCheck] ANTES DE ENVIAR AL BACKEND (sign_in) observaciones:', observaciones);
      await attendanceManual({
        uid,
        pass,
        project_id: selectedProject?.id,
        actividad_id: selectedTask?.id,
        next_action: "check_in",
        observation: observaciones || "",
        quality: true, // O ajusta según lógica de calidad
        progress,
        long: geo?.longitude ?? 0,
        lat: geo?.latitude ?? 0,
      });
      // Actualizar UI y establecer timestamps
      setCheckInTime?.(getNowLocalTimeString());
      const now = Date.now();
      setCheckInTimestamp?.(now);
      setCurrentTaskStartTimestamp?.(now); // Establecer inicio de tarea actual
      setStep?.("checked_in");
      console.log('[handleCheck] setObservaciones (sign_in):', setObservaciones, typeof setObservaciones, 'valor observaciones:', observaciones);
      if (typeof setObservaciones === 'function') {
        // setObservaciones(""); // Ya no se limpia aquí
        console.log('[handleCheck] setObservaciones llamada correctamente (sign_in), valor actual:', observaciones);
      } else {
        console.log('[handleCheck] setObservaciones NO es función (sign_in)');
      }
      setSelectedProject?.(null);
      setSelectedTask?.(null);
      (showMessage || defaultShowMessage)(
        "Entrada registrada",
        "Tu entrada ha sido registrada correctamente."
      );
    } else {
      console.log('[handleCheck] Acción: sign_out');
      console.log('[handleCheck] ANTES DE ENVIAR AL BACKEND (sign_out) observaciones:', observaciones);
      await attendanceManual({
        uid,
        pass,
        project_id: selectedProject?.id,
        actividad_id: selectedTask?.id,
        next_action: "check_out",
        observation: observaciones || "",
        quality: typeof quality === 'boolean' ? quality : true,
        progress,
        long: geo?.longitude ?? 0,
        lat: geo?.latitude ?? 0,
      });
      // Calcular tiempo trabajado antes de resetear
      let fullTimeStr = "";
      let diffHours = 0;
      if (typeof currentTaskStartTimestamp === 'number' && currentTaskStartTimestamp > 0) {
        const result = calcDiffHours(currentTaskStartTimestamp);
        fullTimeStr = result.fullTimeStr;
        diffHours = result.diffHours;
      }
      setCheckOutTime?.(getNowLocalTimeString());
      setCurrentTaskStartTimestamp?.(null);
      setStep?.("checked_out");
      setWorkedHours?.(diffHours.toFixed(2));
      setFullTime?.(fullTimeStr);
      console.log('[handleCheck] setObservaciones (sign_out):', setObservaciones, typeof setObservaciones, 'valor observaciones:', observaciones);
      if (typeof setObservaciones === 'function') {
        // setObservaciones(""); // Ya no se limpia aquí
        console.log('[handleCheck] setObservaciones llamada correctamente (sign_out), valor actual:', observaciones);
      } else {
        console.log('[handleCheck] setObservaciones NO es función (sign_out)');
      }
      setSelectedProject?.(null);
      setSelectedTask?.(null);
      (showMessage || defaultShowMessage)(
        "Registro cerrado",
        "El registro de asistencia fue cerrado."
      );
    }
  } catch (e: any) {
    // Muestra error si algo falla en el proceso
    console.log('[handleCheck] ERROR', e);
    (showMessage || defaultShowMessage)(
      "Error de conexión",
      e?.stack || JSON.stringify(e) || e?.message || String(e)
    );
  } finally {
    setLoading(false); // Finaliza el estado de carga
    console.log('[handleCheck] FIN', { action });
  }
}
