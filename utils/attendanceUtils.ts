// Utils para lógica de asistencia y helpers

/**
 * Construye el objeto para crear una línea analítica (account.analytic.line) en Odoo.
 * Incluye descripción, usuario, proyecto, tarea, horas trabajadas y fecha.
 */
export function buildAnalyticLine({
  customDescription,
  description,
  uid,
  projectId,
  taskId,
  diffHours
}: {
  customDescription?: string;
  description: string;
  uid: number;
  projectId: number;
  taskId: number;
  diffHours: number;
}) {
  return {
    name:
      typeof customDescription === "string" && customDescription.trim().length > 0
        ? customDescription
        : typeof description === "string" && description.trim().length > 0
        ? description
        : "Registro de horas desde app",
    user_id: uid,
    project_id: projectId,
    task_id: taskId,
    unit_amount: diffHours,
    date: new Date().toISOString().slice(0, 10),
  };
}

/**
 * Calcula la diferencia de horas y un string legible desde un timestamp de entrada.
 * Devuelve las horas decimales y un string tipo "X h Y min".
 */
export function calcDiffHours(checkInTimestamp?: number | null) {
  if (!checkInTimestamp) return { diffHours: 0, fullTimeStr: "" };
  const diffMs = Date.now() - checkInTimestamp;
  const diffHours = diffMs / (1000 * 60 * 60);
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const fullTimeStr = `${hours} h ${minutes} min`;
  return { diffHours, fullTimeStr };
}

/**
 * Devuelve la fecha y hora actual en formato UTC compatible con Odoo (YYYY-MM-DD HH:mm:ss).
 */
export function getNowUTCString() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

/**
 * Devuelve la hora local actual en formato legible para España.
 */
export function getNowLocalTimeString() {
  return new Date().toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid" });
}
