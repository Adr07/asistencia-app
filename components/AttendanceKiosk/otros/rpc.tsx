/**
 * Cliente RPC para comunicación con Odoo
 * 
 * Esta función maneja las llamadas RPC (Remote Procedure Call) hacia Odoo
 * usando el protocolo JSON-RPC 2.0. Proporciona una interfaz uniforme
 * para todas las operaciones con la base de datos de Odoo.
 * 
 * @param service - Tipo de servicio ('common' para autenticación, 'object' para operaciones CRUD)
 * @param method - Método a ejecutar (ej: 'execute_kw', 'authenticate')
 * @param args - Argumentos para el método
 * @param rpcUrl - URL del endpoint RPC de Odoo
 * @returns Promise con el resultado de la operación
 * @throws Error si ocurre algún problema en la comunicación o en Odoo
 */
export async function rpcCall<T>(
  service: 'common' | 'object',
  method: string,
  args: any[],
  rpcUrl: string
): Promise<T> {
  try {
    // Obtener información del stack trace para identificar quién llamó esta función
    const stack = new Error().stack;
    const callerInfo = stack?.split('\n')[2]?.trim() || 'Desconocido';
    
    console.group('🚀 [rpcCall] NUEVA LLAMADA RPC');
    // ...existing code...
    // ...existing code...
    // ...existing code...
    // ...existing code...
    // ...existing code...
    // ...existing code...
    // ...existing code...
    
    const requestBody = JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service,
        method,
        args,
      },
      id: Math.floor(Math.random() * 100000),
    });

    // ...existing code...

    // Real request to backend
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    if (!response.ok) {
      throw new Error(`Error en la solicitud RPC: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // ...existing code...
    console.groupEnd();

    if (data.error) {
      throw new Error(`Odoo RPC error: ${data.error.message || JSON.stringify(data.error)}`);
    }
    return data.result as T;
  } catch (error) {
    console.error('� Error completo:', error);
    console.groupEnd();
    // Mejorar mensajes de error para CORS y conexión
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error('No se puede conectar al servidor Odoo. Verifica:\n' +
                       '1. La URL del servidor: ' + rpcUrl + '\n' +
                       '2. Que el servidor esté funcionando\n' +
                       '3. Configuración de CORS en el servidor');
      }
    }
    throw error;
  }
}
