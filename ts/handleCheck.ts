import { showMessage as defaultShowMessage } from "../components/AttendanceKiosk/otros/util";
import { odooCreate, odooRead, odooSearch, odooWrite } from "../db/odooApi";
import {
    buildAnalyticLine,
    calcDiffHours,
    getNowLocalTimeString,
    getNowUTCString,
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
  description,
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
  setDescription,
  setSelectedProject,
  setSelectedTask, 
  progress, 
}: {
  action: "sign_in" | "sign_out";
  uid: number;
  pass: string;
  selectedProject: any;
  selectedTask: any;
  description: string;
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
  setDescription?: (v: string) => void;
  setSelectedProject?: (v: any) => void;
  setSelectedTask?: (v: any) => void;
  progress?: number;
}) {
  setLoading(true);
  try {
    // Obtener ID del empleado actual desde Odoo
    const empleados = (await odooRead({
      model: "hr.employee",
      fields: ["id"],
      domain: [["resource_id.user_id", "=", uid]],
      uid,
      pass,
      limit: 1,
    })) as any[];
    
    if (!empleados.length) throw new Error("Empleado no encontrado");
    const empId = empleados[0].id;
    
    const nowUTC = getNowUTCString();
    
    if (action === "sign_in") {
      // ENTRADA (CHECK-IN): Crear nuevo registro de asistencia
      const vals: any = { 
        employee_id: empId, 
        check_in: nowUTC,
        in_mode: 'systray' // Modo de entrada desde app móvil
      };
      if (geo) {
        vals.in_latitude = Number(geo.latitude);
        vals.in_longitude = Number(geo.longitude);
        // Agregar enlace de Google Maps para ubicación de entrada
        vals.x_in_location_url = `https://www.google.com/maps?q=${geo.latitude},${geo.longitude}`;
      }
      
      await odooCreate({
        model: "hr.attendance",
        vals,
        uid,
        pass,
      });
      
      // Actualizar UI y establecer timestamps
      setCheckInTime?.(getNowLocalTimeString());
      const now = Date.now();
      setCheckInTimestamp?.(now);
      setCurrentTaskStartTimestamp?.(now); // Establecer inicio de tarea actual
      setStep?.("checked_in");
      setDescription?.("");
      setSelectedProject?.(null);
      setSelectedTask?.(null);
      (showMessage || defaultShowMessage)(
        "Entrada registrada",
        "Tu entrada ha sido registrada correctamente."
      );
    } else {
      // SALIDA (CHECK-OUT): Cerrar registro y registrar horas trabajadas
      
      // Buscar el registro de asistencia abierto
      const ids = (await odooSearch({
        model: "hr.attendance",
        domain: [
          ["employee_id", "=", empId],
          ["check_out", "=", false],
        ],
        uid,
        pass,
        limit: 1,
      })) as number[];
      
      if (!ids.length) {
        throw new Error(
          "No se encontró un registro de entrada abierto para hacer check-out."
        );
      }
      
      // Si no hay proyecto o tarea seleccionados, solo cerrar el registro
      if (!selectedProject || !selectedTask) {
        const checkoutVals: any = { 
          check_out: nowUTC,
          out_mode: 'systray' // Modo de salida desde app móvil
        };
        if (geo) {
          checkoutVals.out_latitude = Number(geo.latitude);
          checkoutVals.out_longitude = Number(geo.longitude);
          // Agregar enlace de Google Maps para ubicación de salida
          checkoutVals.x_out_location_url = `https://www.google.com/maps?q=${geo.latitude},${geo.longitude}`;
        }
        
        await odooWrite({
          model: "hr.attendance",
          ids,
          vals: checkoutVals,
          uid,
          pass,
        });
        
        setCheckOutTime?.(getNowLocalTimeString());
        setCurrentTaskStartTimestamp?.(null);
        setStep?.("checked_out");
        setWorkedHours?.("0");
        setFullTime?.("");
        setDescription?.("");
        setSelectedProject?.(null);
        setSelectedTask?.(null);
        (showMessage || defaultShowMessage)(
          "Registro cerrado",
          "No se seleccionó proyecto o tarea. El registro de asistencia fue cerrado sin registrar horas en ninguna tarea."
        );
        return;
      }
      
      // Cerrar el registro de asistencia con check-out
      const vals: any = { 
        check_out: nowUTC,
        out_mode: 'systray' // Modo de salida desde app móvil
      };
      if (geo) {
        vals.out_latitude = Number(geo.latitude);
        vals.out_longitude = Number(geo.longitude);
        // Agregar enlace de Google Maps para ubicación de salida
        vals.x_out_location_url = `https://www.google.com/maps?q=${geo.latitude},${geo.longitude}`;
        // Agregar iframe embed HTML para mostrar mapa directamente
        vals.x_out_location_url = `https://www.google.com/maps?q=${geo.latitude},${geo.longitude}`;
      }
      
      await odooWrite({
        model: "hr.attendance",
        ids,
        vals,
        uid,
        pass,
      });
      
      // Calcular horas trabajadas y actualizar UI
      setCheckOutTime?.(getNowLocalTimeString());
      setCurrentTaskStartTimestamp?.(null);
      setStep?.("checked_out");
      
      // Usar el timestamp correcto según el contexto:
      // - currentTaskStartTimestamp: para tareas después de un cambio de tarea
      // - checkInTimestamp: para la primera tarea desde el check-in inicial
      const timestampToUse = currentTaskStartTimestamp || checkInTimestamp;
      const { diffHours, fullTimeStr } = calcDiffHours(timestampToUse);
      
      setWorkedHours?.(Number(diffHours).toFixed(2));
      setFullTime?.(fullTimeStr);
      setDescription?.("");
      setSelectedProject?.(null);
      setSelectedTask?.(null);
      
      // Crear línea analítica en Odoo para registrar las horas trabajadas
      if (selectedProject && selectedTask) {
        const analyticLine = buildAnalyticLine({
          customDescription: arguments[0]?.customDescription,
          description,
          uid,
          projectId: selectedProject.id,
          taskId: selectedTask.id,
          diffHours,
        });
        
        try {
          await odooCreate({
            model: "account.analytic.line",
            vals: analyticLine,
            uid,
            pass,
          });
          
          // Actualizar progreso de la tarea si fue proporcionado
          if (progress !== undefined && selectedTask) {
            await odooWrite({
              model: "project.task",
              ids: [selectedTask.id],
              vals: { progress },
              uid,
              pass,
            });
          }
          
          (showMessage || defaultShowMessage)(
            "Tarea actualizada",
            "Las horas trabajadas han sido registradas correctamente en la tarea."
          );
        } catch (err: any) {
          (showMessage || defaultShowMessage)(
            "Error al crear línea de tarea",
            err?.message || JSON.stringify(err)
          );
        }
      }
    }
  } catch (e: any) {
    // Muestra error si algo falla en el proceso
    (showMessage || defaultShowMessage)(
      "Error de conexión",
      e?.stack || JSON.stringify(e) || e?.message || String(e)
    );
  } finally {
    setLoading(false); // Finaliza el estado de carga
  }
}
