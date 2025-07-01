/**
 * API central para interactuar con Odoo
 * 
 * Este archivo proporciona funciones wrapper para las operaciones CRUD principales
 * de Odoo (Create, Read, Update, Delete) utilizando llamadas RPC.
 * 
 * Funciones disponibles:
 * - odooRead: Para leer registros (search_read)
 * - odooCreate: Para crear nuevos registros
 * - odooWrite: Para actualizar registros existentes
 * - odooSearch: Para buscar IDs de registros
 */
import { DB, RPC_URL } from "../components/AttendanceKiosk/otros/config";
import { rpcCall } from "../components/AttendanceKiosk/otros/rpc";

/**
 * Función para leer registros de Odoo usando search_read
 * 
 * @param model - Nombre del modelo de Odoo (ej: 'hr.attendance', 'project.project')
 * @param fields - Campos a retornar (por defecto todos)
 * @param domain - Filtros de búsqueda (por defecto sin filtros)
 * @param uid - ID del usuario autenticado
 * @param pass - Contraseña/token del usuario
 * @param limit - Número máximo de registros a retornar
 * @returns Promise con los registros encontrados
 */
export async function odooRead({
  model,
  fields = [],
  domain = [],
  uid,
  pass,
  limit = 80,
}: {
  model: string;
  fields?: string[];
  domain?: any[];
  uid: number;
  pass: string;
  limit?: number;
}) {
  return rpcCall(
    "object",
    "execute_kw",
    [DB, uid, pass, model, "search_read", [domain], { fields, limit }],
    RPC_URL
  );
}

/**
 * Función para crear nuevos registros en Odoo
 * 
 * @param model - Nombre del modelo de Odoo
 * @param vals - Objeto con los valores del nuevo registro
 * @param uid - ID del usuario autenticado
 * @param pass - Contraseña/token del usuario
 * @returns Promise con el ID del registro creado
 */
export async function odooCreate({
  model,
  vals,
  uid,
  pass,
}: {
  model: string;
  vals: any;
  uid: number;
  pass: string;
}) {
  return rpcCall(
    "object",
    "execute_kw",
    [DB, uid, pass, model, "create", [vals]],
    RPC_URL
  );
}

/**
 * Función para actualizar registros existentes en Odoo
 * 
 * @param model - Nombre del modelo de Odoo
 * @param ids - Array con los IDs de los registros a actualizar
 * @param vals - Objeto con los nuevos valores
 * @param uid - ID del usuario autenticado
 * @param pass - Contraseña/token del usuario
 * @returns Promise con resultado de la actualización
 */
export async function odooWrite({
  model,
  ids,
  vals,
  uid,
  pass,
}: {
  model: string;
  ids: number[];
  vals: any;
  uid: number;
  pass: string;
}) {
  return rpcCall(
    "object",
    "execute_kw",
    [DB, uid, pass, model, "write", [ids, vals]],
    RPC_URL
  );
}

/**
 * Función para buscar IDs de registros en Odoo (solo retorna IDs)
 * 
 * @param model - Nombre del modelo de Odoo
 * @param domain - Filtros de búsqueda
 * @param uid - ID del usuario autenticado
 * @param pass - Contraseña/token del usuario
 * @param limit - Número máximo de IDs a retornar
 * @returns Promise con array de IDs encontrados
 */
export async function odooSearch({
  model,
  domain = [],
  uid,
  pass,
  limit = 80,
}: {
  model: string;
  domain?: any[];
  uid: number;
  pass: string;
  limit?: number;
}) {
  return rpcCall(
    "object",
    "execute_kw",
    [DB, uid, pass, model, "search", [domain], { limit }],
    RPC_URL
  );
}
