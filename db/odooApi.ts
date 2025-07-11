// Obtener el progreso de las actividades de un empleado en un proyecto
// API central para interactuar con Odoo adaptada a la nueva lógica de backend
import { DB, RPC_URL } from "../components/AttendanceKiosk/otros/config";
import { rpcCall } from "../components/AttendanceKiosk/otros/rpc";

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
      [DB, uid, pass, "hr.attendance", "get_employee_all_actividad",[[],emp_id, project_id]],
      RPC_URL
    );
    console.log('[getProjectActivities] Respuesta del backend:', result);
    // Si el backend no devuelve value/label, los agregamos aquí
    if (Array.isArray(result) && result.length && !('value' in result[0])) {
      // Devolver actividades sin el progreso
      return result.map((a: any) => ({
        id: a.id,
        value: a.descripcion,
        label: a.descripcion
      }));
    }
    return result;
  } catch (error) {
    console.error('[getProjectActivities] Error al cargar actividades:', error);
    throw error;
  }
}

// Registrar asistencia manual (attendance_manual)
// Registrar asistencia manual (attendance_manual)
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
}) {
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
    console.error('[attendanceManual] No se encontró un registro de hr.employee para el usuario con uid:', uid);
    throw new Error('No se encontró un registro de hr.employee para el usuario con uid: ' + uid);
  }
  const emp_id = empleados[0]; // Asignar correctamente el ID del empleado
  console.log('[attendanceManual] ID de empleado encontrado:', emp_id);

  
  // Odoo espera: [ids], emp_id, long, lat, message, project_id, actividad_id, next_action, observaciones, calidad, checkout, cambio, avance
  // Enviamos el valor de calidad tal cual, para mayor claridad y compatibilidad futura
  const isCheckout = next_action === 'check_out' || next_action === 'checkout' || next_action === 'salida';
  const args = [
    [emp_id], // array de IDs
    emp_id, // El id del empleado
    _long, // long
    _lat, // lat
    message, // message
    project_id, // project_id
    actividad_id, // actividad_id
    next_action, // next_action
    observation, // observaciones
    quality, // calidad (enviar tal cual)
    isCheckout, // checkout
    false, // cambio
    progress ?? 0 // avance
  ];
  
  console.log('[attendanceManual] Atributos y valores:', args);
  try {
    const result = await rpcCall(
      "object",
      "execute_kw",
      [
        DB,
        uid,
        pass,
        "hr.employee",
        "attendance_manual",
        args
      ],
      RPC_URL
    );
    console.log('[attendanceManual] Respuesta del backend:', result);
    return result;
  } catch (error) {
    console.error('[attendanceManual] Error al crear entrada:', {
      error,
      args,
      uid,
      pass
    });
    throw error;
  }
}
