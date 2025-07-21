// Ejecutor de pruebas para probar la conexión con Odoo
// Ejecuta: npx ts-node runTests.ts

import { quickTest, testAuthentication, testOdooConnection } from './db/testConnection';

/**
 * Función principal que ejecuta las pruebas
 */
async function main() {
  console.log('===============================================');
  console.log('🧪 PRUEBAS DE CONEXIÓN CON ODOO');
  console.log('===============================================');
  console.log('📅 Fecha:', new Date().toLocaleString());
  console.log('🌐 Servidor: http://localhost:8017/jsonrpc');
  console.log('🗄️ Base de datos: oodo18-pruebas');
  console.log('===============================================\n');

  const args = process.argv.slice(2);
  const testType = args[0] || 'full';

  switch (testType) {
    case 'quick':
    case 'q':
      console.log('🚀 Ejecutando prueba rápida...\n');
      await quickTest();
      break;
      
    case 'auth':
    case 'a':
      console.log('🔐 Ejecutando prueba de autenticación...\n');
      await testAuthentication();
      break;
      
    case 'full':
    case 'f':
    default:
      console.log('🧪 Ejecutando prueba completa...\n');
      await testOdooConnection();
      break;
  }

  console.log('\n===============================================');
  console.log('✅ Pruebas finalizadas');
  console.log('===============================================');
}

// Manejo de errores globales
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Error no manejado:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

// Ejecutar las pruebas
main().catch((error) => {
  console.error('❌ Error en main:', error);
  process.exit(1);
});
