import { showMessage as defaultShowMessage } from "../components/AttendanceKiosk/otros/util";
import { attendanceManual } from "../db/odooApi";
import { calcDiffHours } from "../utils/attendanceUtils";

/**
 * Maneja el cambio de tarea completo: cierra la tarea actual, registra sus horas trabajadas,
 * y abre un nuevo registro para la nueva tarea.
 * 
 * Flujo:
 * 1. Cierra el registro de asistencia actual (check-out)
 * 2. Crea línea analítica con las horas trabajadas en la tarea anterior
 * 3. Abre nuevo registro de asistencia para la nueva tarea (check-in)
 */
export async function handleChangeTask({
  fetchEmployeeId,
  uid,
  pass,
  setCheckOutTime,
  setLastCheckOutTimestamp,
  setStep,
  setSelectedProject,
  setSelectedTask,
  setObservaciones,
  setLoading,
  showMessage,
  newProject,
  newTask,
  prevProject,
  prevTask,
  observaciones,
  avanceInput,
  checkInTimestamp,
  currentTaskStartTimestamp,
  setCurrentTaskStartTimestamp,
  geo,
  setWorkedHours,
  setFullTime,
}: {
  fetchEmployeeId?: () => Promise<number>;
  uid: number;
  pass: string;
  setCheckOutTime: (v: string) => void;
  setLastCheckOutTimestamp: (v: number) => void;
  setStep: (v: string) => void;
  setSelectedProject?: (v: any) => void;
  setSelectedTask?: (v: any) => void;
  setObservaciones?: (v: string) => void;
  setLoading: (v: boolean) => void;
  showMessage?: (title: string, msg: string) => void;
  RPC_URL: string;
  newProject?: any;
  newTask?: any;
  prevProject?: any;
  prevTask?: any;
  observaciones?: string;
  avanceInput?: string;
  checkInTimestamp?: number | null;
  currentTaskStartTimestamp?: number | null;
  setCurrentTaskStartTimestamp?: (v: number | null) => void;
  geo?: { latitude: number; longitude: number } | null;
  setWorkedHours?: (v: string) => void;
  setFullTime?: (v: string) => void;
}) {
  setLoading(true);
  try {
    // Obtener ID del empleado actual
    // El id de empleado ya no se busca aquí, lo maneja el backend en attendanceManual
    
    const now = new Date();
    // const nowUTC = now.toISOString().replace("T", " ").slice(0, 19); // Eliminado: no se usa
    
    // El cierre de asistencia también lo maneja attendanceManual en el backend
    
    // PASO 1: Cerrar el registro de asistencia actual (check-out) usando attendanceManual
    await attendanceManual({
      uid,
      pass,
      project_id: prevProject?.id,
      actividad_id: prevTask?.id,
      next_action: "check_out",
      observation: observaciones || "",
      quality: true, // O ajusta según lógica de calidad
      progress: avanceInput ? Number(avanceInput) : undefined,
    });
    // Calcular tiempo trabajado antes de resetear (para mostrar en UI)
    let fullTimeStr = "";
    let diffHours = 0;
    if (typeof currentTaskStartTimestamp === 'number' && currentTaskStartTimestamp > 0) {
      const result = calcDiffHours(currentTaskStartTimestamp);
      fullTimeStr = result.fullTimeStr;
      diffHours = result.diffHours;
    }
    if (typeof setWorkedHours === 'function') setWorkedHours(diffHours ? diffHours.toFixed(2) : "");
    if (typeof setFullTime === 'function') setFullTime(fullTimeStr);
    setCheckOutTime(
      now.toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid" })
    );
    setLastCheckOutTimestamp(now.getTime());
    setStep("checked_out");

    // PASO 2: (opcional) Si necesitas lógica adicional para líneas analíticas, agrégala aquí

    // PASO 3: Crear nuevo registro de asistencia para la nueva tarea (check-in) con coordenadas GPS
    if (newProject && newTask) {
      try {
        await attendanceManual({
          uid,
          pass,
          project_id: newProject?.id,
          actividad_id: newTask?.id,
          next_action: "check_in",
          observation: observaciones || "",
          quality: true, // O ajusta según lógica de calidad
          progress: avanceInput ? Number(avanceInput) : undefined,
        });
        // Actualizar timestamp para que la nueva tarea calcule sus horas desde este momento
        setCurrentTaskStartTimestamp?.(now.getTime());
      } catch (err: any) {
        console.error('[ERROR][handleChangeTask] Error al crear nuevo registro de asistencia:', err);
        (showMessage || defaultShowMessage)(
          "Error al crear nuevo registro de asistencia",
          err?.message || JSON.stringify(err)
        );
        setLoading(false);
        return false;
      }
    } else {
      console.warn('[WARN][handleChangeTask] newProject o newTask no definidos, no se crea nuevo registro de asistencia');
    }

    // Actualizar estado de la interfaz
    setStep("checked_in");
    setSelectedProject?.(newProject);
    setSelectedTask?.(newTask);
    setCheckOutTime("");
    setObservaciones?.("");
    if (showMessage) {
      showMessage("Cambio de tarea", "La tarea fue cambiada y el registro se creó correctamente.");
    }
    setLoading(false);
    return true;
  } catch (e: any) {
    console.error('[ERROR][handleChangeTask] Error Odoo:', e);
    (showMessage || defaultShowMessage)(
      "Error al cambiar tarea",
      e?.stack || JSON.stringify(e) || e?.message || String(e)
    );
    setLoading(false);
    return false;
  }
}
