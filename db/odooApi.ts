// API central para interactuar con Odoo optimizada con lógica de Python
// Este archivo implementa las funciones usando la lógica mejorada del archivo Python
import { DB, RPC_URL } from "../components/AttendanceKiosk/otros/config";
import { rpcCall } from "../components/AttendanceKiosk/otros/rpc";

// current

// Llama al método get_pedir_avance en el backend para saber si se debe pedir avance
export async function getPedirAvance({ uid, pass }: { uid: number; pass: string }) {
  // Buscar el id de empleado usando el uid
  const empleados = await rpcCall(
    "object",
    "execute_kw",
    [DB, uid, pass, "hr.employee", "search_read", [[['user_id', '=', uid]]], { fields: ['id'], limit: 1 }],
    RPC_URL
  );
  if (!empleados || !Array.isArray(empleados) || empleados.length === 0) {
    throw new Error('Empleado no encontrado para uid: ' + uid);
  }
  const emp_id = empleados[0].id;

  // Llamar al backend para obtener si se debe pedir avance
  const result = await rpcCall(
    "object",
    "execute_kw",
    [
      DB,
      uid,
      pass,
      "hr.attendance",
      "get_pedir_avance",
      [emp_id]
    ],
    RPC_URL
  );
  return result;
}

// Re-exportar para uso en hooks y otros módulos
export { DB, RPC_URL, rpcCall };

// Obtener todos los proyectos asignados al empleado
export async function getEmployeeAllProjects({ uid, pass }: { uid: number; pass: string }) {
  // Buscar el id de empleado usando el uid
  const empleados = await rpcCall(
    "object",
    "execute_kw",
    [DB, uid, pass, "hr.employee", "search_read", [[['user_id', '=', uid]]], { fields: ['id'], limit: 1 }],
    RPC_URL
  );
  if (!empleados || !Array.isArray(empleados) || empleados.length === 0) {
    throw new Error('Empleado no encontrado para uid: ' + uid);
  }
  const emp_id = empleados[0].id;

  // Devuelve proyectos con id, value y label según la función de backend
  const result: any = await rpcCall(
    "object",
    "execute_kw",
    [DB, uid, pass, "hr.attendance", "get_employee_all_project", [emp_id]],
    RPC_URL
  );
  // Si el backend no devuelve value/label, los agregamos aquí
  if (Array.isArray(result) && result.length && !('value' in result[0])) {
    return result.map((p: any) => ({
      id: p.id,
      value: p.name,
      label: p.name
    }));
  }
  return result;
}

// Obtener actividades por proyecto usando el método correcto en hr.attendance
export async function getProjectActivities({ uid, pass, project_id }: { uid: number; pass: string; project_id: number }) {
  // Obtener el id de empleado real antes de pedir actividades
  try {
    // Buscar el id de empleado usando el uid
    const empleados = await rpcCall(
      "object",
      "execute_kw",
      [DB, uid, pass, "hr.employee", "search_read", [[['user_id', '=', uid]]], { fields: ['id'], limit: 1 }],
      RPC_URL
    );
    
    if (!empleados || !Array.isArray(empleados) || empleados.length === 0) {
      throw new Error('Empleado no encontrado para uid: ' + uid);
    }
    
    const emp_id = empleados[0].id;
    
    // Llamar al backend para obtener actividades del proyecto
    console.log('[getProjectActivities] Llamando backend con:', { emp_id, project_id });
    const result: any = await rpcCall(
      "object",
      "execute_kw",
      [DB, uid, pass, "hr.attendance", "get_employee_all_actividad", [[], emp_id, project_id]],
      RPC_URL
    );
    
    console.log('[getProjectActivities] Respuesta del backend:', result);
    
    // Formatear respuesta para consistencia
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
    const _long = typeof long === 'number' ? long : 0;
    const _lat = typeof lat === 'number' ? lat : 0;
    const message = "";

    // Buscar el registro de hr.employee correspondiente al usuario
    console.log('[attendanceManual] Buscando registro de hr.employee para uid:', uid);
    
    const empleados: number[] = await rpcCall(
      "object",
      "execute_kw",
      [DB, uid, pass, "hr.employee", "search", [[['user_id', '=', uid]]]],
      RPC_URL
    );
    
    console.log('[attendanceManual] Resultado de la búsqueda de hr.employee:', empleados);

    if (!empleados || empleados.length === 0) {
      const errorMsg = `No se encontró un registro de hr.employee para el usuario con uid: ${uid}`;
      console.error('[attendanceManual]', errorMsg);
      throw new Error(errorMsg);
    }

    const emp_id = empleados[0];
    console.log('[attendanceManual] ID de empleado encontrado:', emp_id);

    // Determinar si es un check-out
    const isCheckout = ['check_out', 'checkout', 'salida'].includes(next_action);

    // Preparar argumentos en el orden correcto según la implementación Python
    const args = [
      [emp_id],           // array de IDs
      emp_id,             // El id del empleado
      _long,              // long
      _lat,               // lat
      message,            // message
      project_id,         // project_id
      actividad_id,       // actividad_id
      next_action,        // next_action
      observation,        // observaciones
      !quality,           // no_calidad
      isCheckout,         // checkout
      false,              // cambio
      progress || 0       // avance
    ];

    console.log('[attendanceManual] Atributos y valores:', args);

    const result = await rpcCall(
      "object",
      "execute_kw",
      [DB, uid, pass, "hr.employee", "attendance_manual", args],
      RPC_URL
    );

    console.log('[attendanceManual] Respuesta del backend:', result);
    return result;
  } catch (error) {
    console.error('[attendanceManual] Error al crear entrada:', error);
    throw error;
  }
}

// Re-exportar constantes para compatibilidad
export { DB, RPC_URL };

