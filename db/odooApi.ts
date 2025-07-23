// API central para interactuar con Odoo optimizada con lógica de Python
// Este archivo implementa las funciones usando la lógica mejorada del archivo Python
import { DB } from "../components/AttendanceKiosk/otros/config";

// URL del backend local para proxy Odoo, puede ser cambiada dinámicamente
let backendUrl = "http://localhost:3001/odoo/authenticate";
export function setBackendUrl(url: string) {
  backendUrl = url;
}

// Función para login (autenticación)
async function rpcCallBackend(db: string, user: string, password: string) {
  const body = { db, user, password };
  const response = await fetch("http://localhost:3001/odoo/authenticate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error("Error en backend proxy Odoo: " + response.statusText);
  return await response.json();
}

// Función para ejecutar métodos sobre modelos Odoo
async function rpcExecuteKw(db: string, uid: number, password: string, model: string, method: string, args: any[]) {
  // El endpoint /odoo/execute_kw ha sido eliminado. Redirigir llamadas a endpoints dedicados.
  throw new Error("rpcExecuteKw ya no debe usarse directamente. Usa los endpoints dedicados del backend.");
}

// current

// Llama al método get_pedir_avance en el backend para saber si se debe pedir avance
// (Implementación eliminada por duplicidad)

/**
 * Llama al método get_pedir_avance en el backend para saber si se debe pedir avance
 */
export async function getPedirAvance({ uid, pass }: { uid: number; pass: string }): Promise<any> {
  try {
    // Llamar al endpoint dedicado en el backend para get_pedir_avance
    const response = await fetch("http://localhost:3001/odoo/get_pedir_avance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ db: DB, uid, password: pass })
    });
    if (!response.ok) throw new Error("Error en backend get_pedir_avance: " + response.statusText);
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('[getPedirAvance] Error:', error);
    throw error;
  }
}
console.log('🔄 RPC URL actualizada a:', backendUrl);
console.log('🔄 DB actualizada a:', DB);
//Valores de envio 

/**
 * Obtener todos los proyectos asignados al empleado
 */
export async function getEmployeeAllProjects({ uid, pass }: { uid: number; pass: string }): Promise<any[]> {
  try {
    const payload = { db: DB, uid, password: pass, emp_id: uid };
    console.log('[getEmployeeAllProjects] Valores de envío al backend:', payload);
    const response = await fetch("http://localhost:3001/odoo/get_employee_all_project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Error en backend get_employee_all_project: " + response.statusText);
    const data = await response.json();
    const result = data.result;
    if (Array.isArray(result) && result.length > 0 && !('value' in result[0])) {
      return result.map((p: any) => ({
        id: p.id,
        value: p.name || p.value,
        label: p.name || p.label || p.value
      }));
    }
    return result || [];
  } catch (error) {
    console.error('[getEmployeeAllProjects] Error:', error);
    return [];
  }
}

/**
 * Obtener actividades por proyecto usando el método correcto en hr.attendance
 */
export async function getProjectActivities({ uid, pass, project_id }: { uid: number; pass: string; project_id: number }): Promise<any[]> {
  try {
    // Llamar al endpoint dedicado en el backend para actividades por proyecto
    const response = await fetch("http://localhost:3001/odoo/get_project_activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ db: DB, uid, password: pass, project_id })
    });
    if (!response.ok) throw new Error("Error en backend get_project_activities: " + response.statusText);
    const data = await response.json();
    const result = data.result;
    if (Array.isArray(result) && result.length > 0 && !('value' in result[0])) {
      return result.map((a: any) => ({
        id: a.id,
        value: a.descripcion,
        label: a.descripcion
      }));
    }
    return result || [];
  } catch (error) {
    console.error('[getProjectActivities] Error al cargar actividades:', error);
    throw error;
  }
}

/**
 * Registrar asistencia manual usando la lógica mejorada de Python
 */
export async function attendanceManual({
  uid,
  pass,
  project_id,
  actividad_id,
  next_action,
  observation,
  quality,
  progress,
  long,
  lat,
}: {
  uid: number;
  pass: string;
  project_id: number;
  actividad_id: number;
  next_action: string;
  observation: string;
  quality: boolean;
  progress?: number;
  long?: number;
  lat?: number;
}): Promise<any> {
  try {
    // Llamar al endpoint dedicado en el backend para registrar asistencia manual
    const response = await fetch("http://localhost:3001/odoo/attendance_manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        db: DB,
        uid,
        password: pass,
        project_id,
        actividad_id,
        next_action,
        observation,
        quality,
        progress,
        long,
        lat
      })
    });
    if (!response.ok) throw new Error("Error en backend attendance_manual: " + response.statusText);
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('[attendanceManual] Error al crear entrada:', error);
    throw error;
  }
}

// Re-exportar constante para compatibilidad
export { DB };

