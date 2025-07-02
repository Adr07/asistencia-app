// Utils para lógica de asistencia y helpers

import { LocationData } from '../hooks/useLocation';

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

/**
 * Construye el objeto para crear un registro de asistencia (hr.attendance) en Odoo.
 * Incluye información de ubicación si está disponible.
 */
export function buildAttendanceRecord({
  employeeId,
  checkIn,
  checkOut,
  location
}: {
  employeeId: number;
  checkIn?: string;
  checkOut?: string;
  location?: LocationData | null;
}) {
  const record: any = {
    employee_id: employeeId,
  };

  if (checkIn) {
    record.check_in = checkIn;
  }

  if (checkOut) {
    record.check_out = checkOut;
  }

  // Agregar coordenadas de ubicación si están disponibles
  if (location) {
    record.latitude = location.latitude;
    record.longitude = location.longitude;
    record.location_accuracy = location.accuracy;
    record.location_timestamp = new Date(location.timestamp).toISOString().replace("T", " ").slice(0, 19);
  }

  return record;
}

/**
 * Valida si una ubicación está dentro del rango permitido del lugar de trabajo.
 * Retorna true si está dentro del rango o si no hay validación configurada.
 */
export function isLocationValid(
  currentLocation: LocationData,
  workplaceLocation?: { latitude: number; longitude: number; radius?: number }
): boolean {
  // Si no hay ubicación del lugar de trabajo configurada, permitir cualquier ubicación
  if (!workplaceLocation) {
    return true;
  }

  const radius = workplaceLocation.radius || 100; // Radio por defecto de 100 metros
  const distance = calculateDistance(
    currentLocation.latitude,
    currentLocation.longitude,
    workplaceLocation.latitude,
    workplaceLocation.longitude
  );

  return distance <= radius;
}

/**
 * Calcula la distancia entre dos puntos GPS en metros usando la fórmula de Haversine.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ en radianes
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // en metros
  return distance;
}

/**
 * Formatea las coordenadas para mostrarlas en la UI de forma legible.
 */
export function formatCoordinates(location: LocationData): string {
  const lat = location.latitude.toFixed(6);
  const lon = location.longitude.toFixed(6);
  const accuracy = location.accuracy ? ` (±${Math.round(location.accuracy)}m)` : '';
  return `${lat}, ${lon}${accuracy}`;
}
