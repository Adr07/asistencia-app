/**
 * Configuración de conexión a Odoo
 * 
 * Este archivo centraliza la configuración para conectarse al servidor Odoo.
 * Maneja diferentes URLs según la plataforma (Android emulator vs iOS/Web).
 * 
 * Variables de entorno:
 * - RPC_URL: URL del endpoint JSON-RPC de Odoo
 * - DB: Nombre de la base de datos en Odoo
 */

// import { Platform } from "react-native";

// Configuración de IP para desarrollo local
// En Android Emulator, localhost no funciona, se debe usar 10.0.2.2
// const LOCAL_IP_ANDROID = '10.0.2.2';

// URL del servidor RPC según la plataforma
// Android Emulator: usa 10.0.2.2 (alias de localhost)
// iOS/Web: usa localhost directamente
// export const RPC_URL = Platform.OS === 'android'
//   ? `http://${LOCAL_IP_ANDROID}:3001/jsonrpc`
//   : `http://localhost:3001/jsonrpc`;

// URL de producción (comentada para desarrollo)
export const RPC_URL = 'https://registro.sinerkia-dev.com/jsonrpc'

// Nombre de la base de datos en Odoo
export const DB = 'registro';
