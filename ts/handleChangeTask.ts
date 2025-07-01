import { showMessage as defaultShowMessage } from "../components/AttendanceKiosk/otros/util";
import { odooCreate, odooRead, odooSearch, odooWrite } from "../db/odooApi";
import { buildAnalyticLine, calcDiffHours } from "../utils/attendanceUtils";

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
  prevProject, // <-- CAMBIO: ahora recibimos prevProject
  prevTask,    // <-- CAMBIO: ahora recibimos prevTask
  description,
  progressInput, // <-- NUEVO: recibir progressInput
  checkInTimestamp,
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
  prevProject?: any; // <-- CAMBIO
  prevTask?: any;    // <-- CAMBIO
  description?: string;
  progressInput?: string; // <-- NUEVO: tipo para progressInput
  checkInTimestamp?: number | null;
}) {
  setLoading(true);
  try {
    // Obtener id de empleado usando odooRead
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
    
    // Buscar último registro abierto (sin check_out)
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
    // --- PRIMERO: CERRAR REGISTRO ANTERIOR (CHECK-OUT) ---
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
    // --- SEGUNDO: CREAR LÍNEA ANALÍTICA DE LA TAREA ANTERIOR ---
    if (prevProject && prevTask) {
      const { diffHours } = calcDiffHours(checkInTimestamp);
      
      // Concatenar progreso a la descripción de la tarea anterior
      let finalDescription = description || "";
      if (progressInput && progressInput.trim()) {
        finalDescription = finalDescription ? 
          `${finalDescription} | Progreso: ${progressInput.trim()}%` : 
          `Progreso: ${progressInput.trim()}%`;
      }
      
      const analyticLine = buildAnalyticLine({
        customDescription: finalDescription, // Usar descripción con progreso concatenado
        description: finalDescription, // Usar descripción con progreso concatenado
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
        console.log('[DEBUG][handleChangeTask] Línea analítica creada para tarea anterior con progreso:', finalDescription);
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


    // --- TERCERO: CREAR NUEVO REGISTRO DE ASISTENCIA (CHECK-IN NUEVA TAREA) ---
    if (newProject && newTask) {
      try {
        const checkInVals = {
          employee_id: empId,
          check_in: nowUTC,
          // project_id y task_id eliminados porque no existen en hr.attendance
        };
        await odooCreate({
          model: "hr.attendance",
          vals: checkInVals,
          uid,
          pass,
        });
        console.log('[DEBUG][handleChangeTask] Nuevo registro de asistencia creado correctamente');
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

    // --- ACTUALIZAR ESTADO UI ---
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
