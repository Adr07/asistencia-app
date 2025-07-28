/**
 * Configuración de conexión a Odoo
 * 
 * Este archivo centraliza la configuración para conectarse al servidor Odoo.
 * Incluye configuraciones específicas para desarrollo y producción.
 */
// Variable mutable para la URL actual (se puede cambiar en runtime)
export let RPC_URL = 'http://localhost:3001/jsonrpc';

// Nombre de la base de datos en Odoo
export const DB = 'registro';

export function setRpcUrl(url: string) {
  RPC_URL = url;
  console.log('🔄 URL RPC actualizada a:', url);
}


