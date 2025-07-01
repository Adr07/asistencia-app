import { odooRead, odooCreate, odooWrite, odooSearch } from "../db/odooApi";
import { showMessage as defaultShowMessage } from "../components/AttendanceKiosk/otros/util";
import {
  buildAnalyticLine,
  calcDiffHours,
  getNowUTCString,
  getNowLocalTimeString,
} from "../utils/attendanceUtils";

export async function handleCheck({
  action,
  uid,
  pass,
  selectedProject,
  selectedTask,
  description,
  checkInTimestamp,
  setCheckInTime,
  setCheckInTimestamp,
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
  setCheckInTime?: (v: string) => void;
  setCheckInTimestamp?: (v: number) => void;
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
  setLoading(true); // Inicia el estado de carga
  //Obtener al usuario actual
  try {
    // Busca el empleado en Odoo usando el uid
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
    //Crear objetos de fecha y hora 
    const nowUTC = getNowUTCString();
    if (action === "sign_in") {
      // --- CHECK IN ---
      // Prepara los valores para crear el registro de asistencia
      const vals: any = { employee_id: empId, check_in: nowUTC };
      if (geo) {
        vals.in_latitude = Number(geo.latitude);
        vals.in_longitude = Number(geo.longitude);
      }
      // Crea el registro de asistencia en Odoo
      await odooCreate({
        model: "hr.attendance",
        vals,
        uid,
        pass,
      });
      // Actualiza la UI y limpia campos
      setCheckInTime?.(getNowLocalTimeString());
      setCheckInTimestamp?.(Date.now());
      setStep?.("checked_in");
      setDescription?.("");
      setSelectedProject?.(null);
      setSelectedTask?.(null);
      (showMessage || defaultShowMessage)(
        "Entrada registrada",
        "Tu entrada ha sido registrada correctamente."
      );
    } else {
      // --- CHECK OUT ---
      // Buscar último registro abierto (sin check_out)
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
      if (!ids.length)
        throw new Error(
          "No se encontró un registro de entrada abierto para hacer check-out."
        );
      // Si no hay proyecto o tarea, solo cerrar el registro y limpiar estado
      if (!selectedProject || !selectedTask) {
        // Cierra el registro de asistencia
        await odooWrite({
          model: "hr.attendance",
          ids,
          vals: { check_out: nowUTC },
          uid,
          pass,
        });
        // Actualiza la UI y limpia campos
        setCheckOutTime?.(getNowLocalTimeString());
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
      // Actualizar registro con check_out
      const vals: any = { check_out: nowUTC };
      if (geo) {
        vals.out_latitude = Number(geo.latitude);
        vals.out_longitude = Number(geo.longitude);
      }
      // Cierra el registro de asistencia en Odoo
      await odooWrite({
        model: "hr.attendance",
        ids,
        vals,
        uid,
        pass,
      });
      // Actualiza la UI y calcula horas trabajadas
      setCheckOutTime?.(getNowLocalTimeString());
      setStep?.("checked_out");
      const { diffHours, fullTimeStr } = calcDiffHours(checkInTimestamp);
      setWorkedHours?.(Number(diffHours).toFixed(2));
      setFullTime?.(fullTimeStr);
      setDescription?.("");
      setSelectedProject?.(null);
      setSelectedTask?.(null);
      // Registrar línea de tiempo en la tarea
      if (selectedProject && selectedTask) {
        // Construye la línea analítica para Odoo
        const analyticLine = buildAnalyticLine({
          customDescription: arguments[0]?.customDescription,
          description,
          uid,
          projectId: selectedProject.id,
          taskId: selectedTask.id,
          diffHours,
        });
        try {
          // Crea la línea analítica en Odoo
          await odooCreate({
            model: "account.analytic.line",
            vals: analyticLine,
            uid,
            pass,
          });
          // Si hay progreso, actualiza el campo en la tarea
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
