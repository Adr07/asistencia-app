// Hook para probar la conexión con Odoo en la aplicación React Native
import { useState } from 'react';
import { quickTest, TEST_CREDENTIALS, testAuthentication } from '../db/testConnection';

export interface ConnectionTestResult {
  isConnected: boolean;
  uid: number | null;
  error: string | null;
  isLoading: boolean;
  lastTested: Date | null;
}

/**
 * Hook para probar la conexión con Odoo
 */
export function useOdooConnectionTest() {
  const [result, setResult] = useState<ConnectionTestResult>({
    isConnected: false,
    uid: null,
    error: null,
    isLoading: false,
    lastTested: null
  });

  /**
   * Ejecutar prueba de conexión
   */
  const runConnectionTest = async (): Promise<void> => {
    setResult(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🔄 Iniciando prueba de conexión...');
      const uid = await testAuthentication();
      
      if (uid) {
        setResult({
          isConnected: true,
          uid,
          error: null,
          isLoading: false,
          lastTested: new Date()
        });
        console.log('✅ Conexión exitosa, UID:', uid);
      } else {
        setResult({
          isConnected: false,
          uid: null,
          error: 'Autenticación falló - verificar credenciales',
          isLoading: false,
          lastTested: new Date()
        });
        console.log('❌ Conexión falló');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setResult({
        isConnected: false,
        uid: null,
        error: errorMessage,
        isLoading: false,
        lastTested: new Date()
      });
      console.error('❌ Error en prueba de conexión:', error);
    }
  };

  /**
   * Ejecutar prueba rápida
   */
  const runQuickTest = async (): Promise<boolean> => {
    setResult(prev => ({ ...prev, isLoading: true }));
    
    try {
      const success = await quickTest();
      setResult(prev => ({
        ...prev,
        isConnected: success,
        isLoading: false,
        lastTested: new Date(),
        error: success ? null : 'Prueba rápida falló'
      }));
      return success;
    } catch (error) {
      setResult(prev => ({
        ...prev,
        isConnected: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error en prueba rápida'
      }));
      return false;
    }
  };

  /**
   * Limpiar resultado
   */
  const clearResult = (): void => {
    setResult({
      isConnected: false,
      uid: null,
      error: null,
      isLoading: false,
      lastTested: null
    });
  };

  return {
    result,
    runConnectionTest,
    runQuickTest,
    clearResult,
    credentials: TEST_CREDENTIALS
  };
}

/**
 * Componente de prueba simple para usar en la app
 */
export const ConnectionTestInfo = {
  server: 'http://localhost:8017/jsonrpc',
  database: 'oodo18-pruebas',
  username: TEST_CREDENTIALS.username,
  expectedUID: 2, // UID conocido para dev3
  
  // Función para mostrar info de conexión
  logConnectionInfo: () => {
    console.log('🔧 INFORMACIÓN DE CONEXIÓN:');
    console.log('🌐 Servidor:', ConnectionTestInfo.server);
    console.log('🗄️ Base de datos:', ConnectionTestInfo.database);
    console.log('👤 Usuario:', ConnectionTestInfo.username);
    console.log('🔢 UID esperado:', ConnectionTestInfo.expectedUID);
  }
};
