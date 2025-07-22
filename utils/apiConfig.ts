/**
 * Configuración simplificada de API
 * =================================
 * 
 * Configuración simple para usar solo TypeScript.
 */

/**
 * Configurar la API para uso directo con TypeScript
 */
export function configureApiMode() {
  console.log('[Config] Usando API TypeScript directa (sin bridge)');
}

/**
 * Verificar estado de la API
 */
export async function logCurrentApiMode() {
  console.log('[Config] API actual: TypeScript (conexión directa)');
}

/**
 * Inicializar la configuración de API al cargar
 */
export function initializeApiConfig() {
  configureApiMode();
  console.log('[Config] API inicializada - modo TypeScript directo');
}

