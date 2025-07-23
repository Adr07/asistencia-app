/**
 * Configuración de conexión a Odoo
 * 
 * Este archivo centraliza la configuración para conectarse al servidor Odoo.
 * Incluye configuraciones específicas para desarrollo y producción.
 */

import { Platform } from 'react-native';
import { rpcCall } from './rpc';

// Configuración para diferentes entornos
const CONFIG = {
  // Configuración de desarrollo
  development: {
    // Para desarrollo web, usar servidor local
    web: 'http://localhost:8017/jsonrpc',
    // Para desarrollo móvil, usar servidor local también
    mobile: 'http://localhost:8017/jsonrpc'
  },
  // Configuración de producción
  production: {
    web: 'https://registro.sinerkia-dev.com/jsonrpc',
    mobile: 'https://registro.sinerkia-dev.com/jsonrpc'
  }
};

// Detectar entorno
const isDevelopment = __DEV__;
const environment = isDevelopment ? 'development' : 'production';

// Determinar plataforma
const isWeb = Platform.OS === 'web';
const platformKey = isWeb ? 'web' : 'mobile';

// URL del servidor RPC según entorno y plataforma
export const DEFAULT_RPC_URL = CONFIG[environment][platformKey];

// Variable mutable para la URL actual (se puede cambiar en runtime)
export let RPC_URL = DEFAULT_RPC_URL;

// Nombre de la base de datos en Odoo
export const DB = 'registro';

// Logging detallado de configuración
console.group('🔧 CONFIGURACIÓN DE CONEXIÓN ODOO');
console.log('📍 Entorno detectado:', environment);
console.log('📱 Plataforma:', Platform.OS);
console.log('🔧 Configuración usada:', platformKey);
console.log('🌐 URL del servidor RPC:', RPC_URL);
console.log('🗄️ Base de datos:', DB);
console.log('📊 Configuración completa:', CONFIG);
console.log('🔍 Variables de entorno:');
console.log('  - __DEV__:', __DEV__);
console.log('  - isDevelopment:', isDevelopment);
console.groupEnd();

export function setRpcUrl(url: string) {
  RPC_URL = url;
  console.log('🔄 URL RPC actualizada a:', url);
}

export function resetRpcUrl() {
  RPC_URL = DEFAULT_RPC_URL;
  console.log('🔄 URL RPC restablecida a:', RPC_URL);
}

// Credenciales de prueba para testing automático
const TEST_CREDENTIALS = {
  email: 'dev3@sinerkia.com',
  password: 'odoo'
};

/**
 * Prueba de conexión automática al iniciar la aplicación
 * Realiza una autenticación REAL de prueba con credenciales predefinidas
 * Usa la misma función rpcCall que usa el login manual
 */
export async function testConnection(): Promise<boolean> {
  try {
    console.group('🧪 PRUEBA DE LOGIN AUTOMÁTICO AL INICIAR');
    console.log('🎯 OBJETIVO: Hacer login real con dev3@sinerkia.com');
    console.log('👤 Usuario de prueba:', TEST_CREDENTIALS.email);
    console.log('🔒 Contraseña:', TEST_CREDENTIALS.password);
    console.log('🌐 URL:', RPC_URL);
    console.log('🗄️ Base de datos:', DB);
    console.log('🚀 Iniciando login automático usando rpcCall...');
    console.log('📁 Archivo origen: config.tsx - función testConnection()');

    // Usar la misma función rpcCall que usa el login manual
    const userId = await rpcCall<number | false>(
      'common',
      'authenticate',
      [DB, TEST_CREDENTIALS.email, TEST_CREDENTIALS.password, {}],
      RPC_URL
    );

    if (userId !== false && userId) {
      console.log('🎉 ¡LOGIN AUTOMÁTICO EXITOSO!');
      console.log('🆔 User ID obtenido:', userId);
      console.log('✅ La autenticación completa funciona correctamente');
      console.log('🌟 El usuario dev3@sinerkia.com puede acceder al sistema');
      console.groupEnd();
      return true;
    } else {
      console.error('❌ LOGIN AUTOMÁTICO FALLIDO');
      console.log('📊 Resultado recibido:', userId);
      console.log('🔍 Verificar credenciales o permisos del usuario');
      console.groupEnd();
      return false;
    }

  } catch (error) {
    console.error('💥 ERROR EN LOGIN AUTOMÁTICO');
    console.error('🚨 Error capturado:', error);
    
    if (error instanceof Error) {
      console.error('📝 Mensaje de error:', error.message);
      
      if (error.message.includes('CORS')) {
        console.error('🔗 Problema de CORS detectado');
        console.log('💡 Soluciones:');
        console.log('   1. Abrir Chrome con --disable-web-security');
        console.log('   2. Instalar extensión CORS');
        console.log('   3. Configurar módulo CORS en Odoo');
      }
      
      if (error.message.includes('Failed to fetch')) {
        console.error('🔗 Problema de conectividad detectado');
        console.log('💡 Verificar:');
        console.log('   1. Servidor Odoo ejecutándose en puerto 8017');
        console.log('   2. URL correcta: ' + RPC_URL);
        console.log('   3. Base de datos disponible: ' + DB);
      }
    }
    
    console.groupEnd();
    return false;
  }
}

// Ejecutar login automático al cargar el módulo
console.log('🚀 Iniciando login automático con dev3@sinerkia.com...');
testConnection()
  .then(success => {
    if (success) {
      console.log('🎉 ¡LOGIN AUTOMÁTICO EXITOSO! La aplicación está lista para usar.');
      console.log('✅ El usuario dev3@sinerkia.com puede acceder correctamente al sistema Odoo.');
    } else {
      console.warn('⚠️  El login automático falló. Revisa las credenciales o la configuración.');
      console.log('💡 Puedes intentar hacer login manual en la interfaz.');
    }
  })
  .catch(error => {
    console.error('💥 Error inesperado en login automático:', error);
    console.log('🔧 Revisa la configuración de red y CORS.');
  });
