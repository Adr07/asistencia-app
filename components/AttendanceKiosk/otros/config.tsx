/**
 * Configuración de conexión a Odoo
 * 
 * Este archivo centraliza la configuración para conectarse al servidor Odoo.
 * Configurado para producción con servidor remoto.
 */

// import { Platform } from 'react-native';
// url segun plataforma
// export const RPC_URL = Platform.select({
//     android: 'https://registro.sinerkia-dev.com/jsonrpc',
//     web: 'http://localhost:3001/jsonrpc',
// });


// URL del servidor RPC de producción (valor por defecto)
export const DEFAULT_RPC_URL = 'https://registro.sinerkia-dev.com/jsonrpc';

// Variable mutable para la URL actual (se puede cambiar en runtime)
export let RPC_URL = DEFAULT_RPC_URL;

export function setRpcUrl(url: string) {
  RPC_URL = url;
}

export function resetRpcUrl() {
  RPC_URL = DEFAULT_RPC_URL;
}


// Nombre de la base de datos en Odoo
export const DB = 'registro';
