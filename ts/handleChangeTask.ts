import { showMessage as defaultShowMessage } from "../components/AttendanceKiosk/otros/util";
import { odooCreate, odooRead, odooSearch, odooWrite } from "../db/odooApi";
import { buildAnalyticLine, calcDiffHours } from "../utils/attendanceUtils";

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
  setDescription,
  setLoading,
  showMessage,
  newProject,
  newTask,
  prevProject,
  prevTask,
  description,
  progressInput,
  checkInTimestamp,
  currentTaskStartTimestamp,
  setCurrentTaskStartTimestamp,
}: {
  fetchEmployeeId?: () => Promise<number>;
  uid: number;
  pass: string;
  setCheckOutTime: (v: string) => void;
  setLastCheckOutTimestamp: (v: number) => void;
  setStep: (v: string) => void;
  setSelectedProject?: (v: any) => void;
  setSelectedTask?: (v: any) => void;
  setDescription?: (v: string) => void;
  setLoading: (v: boolean) => void;
  showMessage?: (title: string, msg: string) => void;
  RPC_URL: string;
  newProject?: any;
  newTask?: any;
  prevProject?: any;
  prevTask?: any;
  description?: string;
  progressInput?: string;
  checkInTimestamp?: number | null;
  currentTaskStartTimestamp?: number | null;
  setCurrentTaskStartTimestamp?: (v: number | null) => void;
}) {
  setLoading(true);
  try {
    // Obtener ID del empleado actual
    let empId: number;
    if (fetchEmployeeId) {
      empId = await fetchEmployeeId();
    } else {
      const empleados = await odooRead({
        model: "hr.employee",
        fields: ["id"],
        domain: [["resource_id.user_id", "=", uid]],
        uid,
        pass,
        limit: 1,
      }) as any[];
      if (!empleados.length) throw new Error("Empleado no encontrado");
      empId = empleados[0].id;
    }
    
    const now = new Date();
    const nowUTC = now.toISOString().replace("T", " ").slice(0, 19);
    
    // Verificar que existe un registro de asistencia abierto
    const ids = await odooSearch({
      model: "hr.attendance",
      domain: [["employee_id", "=", empId], ["check_out", "=", false]],
      uid,
      pass,
      limit: 1,
    }) as number[];
    
    if (!ids.length) {
      (showMessage || defaultShowMessage)(
        "No hay registro abierto",
        "No se encontró un registro de entrada abierto para cambiar de tarea. Por favor, realiza check-in antes de intentar cambiar de tarea."
      );
      setStep("welcome");
      setSelectedProject?.(null);
      setSelectedTask?.(null);
      setDescription?.("");
      setLoading(false);
      return false;
    }
    
    // PASO 1: Cerrar el registro de asistencia actual (check-out)
    await odooWrite({
      model: "hr.attendance",
      ids,
      vals: { check_out: nowUTC },
      uid,
      pass,
    });
    setCheckOutTime(
      now.toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid" })
    );
    setLastCheckOutTimestamp(now.getTime());
    setStep("checked_out");
    
    // PASO 2: Registrar las horas trabajadas en la tarea anterior
    if (prevProject && prevTask) {
      // Calcular tiempo trabajado desde el inicio de la tarea hasta ahora
      let taskStartTime = checkInTimestamp; // Para la primera tarea, usar timestamp del check-in inicial
      
      if (currentTaskStartTimestamp) {
        taskStartTime = currentTaskStartTimestamp; // Para tareas subsiguientes, usar su timestamp específico
      }
      
      const { diffHours } = calcDiffHours(taskStartTime);
      
      // Agregar progreso a la descripción si fue proporcionado
      let finalDescription = description || "";
      if (progressInput && progressInput.trim()) {
        finalDescription = finalDescription ? 
          `${finalDescription} | Progreso: ${progressInput.trim()}%` : 
          `Progreso: ${progressInput.trim()}%`;
      }
      
      // Crear línea analítica en Odoo para registrar las horas trabajadas
      const analyticLine = buildAnalyticLine({
        customDescription: finalDescription,
        description: finalDescription,
        uid,
        projectId: prevProject.id,
        taskId: prevTask.id,
        diffHours,
      });
      
      try {
        await odooCreate({
          model: "account.analytic.line",
          vals: analyticLine,
          uid,
          pass,
        });
      } catch (err: any) {
        console.error('[ERROR][handleChangeTask] Error al crear línea analítica:', err, err?.data || '');
        (showMessage || defaultShowMessage)(
          "Error al crear línea analítica",
          (err?.message || JSON.stringify(err) || err?.data || 'Error desconocido')
        );
        setLoading(false);
        return false;
      }
    }


    // PASO 3: Crear nuevo registro de asistencia para la nueva tarea (check-in)
    if (newProject && newTask) {
      try {
        const checkInVals = {
          employee_id: empId,
          check_in: nowUTC,
        };
        await odooCreate({
          model: "hr.attendance",
          vals: checkInVals,
          uid,
          pass,
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
    setDescription?.("");
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
