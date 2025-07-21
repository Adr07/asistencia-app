// API bridge para usar las funciones Python desde TypeScript
// Este archivo actúa como puente entre la aplicación React Native y el backend Python

import { spawn } from 'child_process';
import path from 'path';

/**
 * Configuración para la API Python
 */
interface PythonApiConfig {
  url: string;
  db: string;
  username: string;
  password: string;
}

/**
 * Resultado de autenticación
 */
interface AuthResult {
  uid: number | null;
  isAdmin: boolean;
  error?: string;
}

/**
 * Ejecutar script Python y obtener resultado
 */
async function executePythonScript(scriptContent: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', ['-c', scriptContent]);
    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed: ${error}`));
      } else {
        try {
          const result = JSON.parse(output.trim());
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${output}`));
        }
      }
    });
  });
}

/**
 * Autenticar usuario usando Python API
 */
export async function authenticateWithPython(config: PythonApiConfig): Promise<AuthResult> {
  const pythonScript = `
import sys
import os
import json

# Agregar el directorio db al path para importar el módulo
sys.path.append(r'${path.resolve(__dirname)}')

try:
    from OdooPythonApi import create_odoo_api
    
    # Crear instancia de la API
    odoo_api = create_odoo_api(
        url='${config.url}',
        db='${config.db}',
        username='${config.username}',
        password='${config.password}'
    )
    
    uid = odoo_api.uid
    
    # Verificar si es administrador
    is_admin = False
    if uid:
        try:
            users = odoo_api.search_read(
                'res.users',
                [['id', '=', uid]],
                fields=['groups_id'],
                limit=1
            )
            
            if users and len(users) > 0:
                groups = users[0].get('groups_id', [])
                # Verificar si tiene el grupo de administrador (ID 1)
                is_admin = 1 in [g[0] if isinstance(g, list) else g for g in groups]
        except Exception as e:
            print(f"Error verificando admin: {e}", file=sys.stderr)
    
    result = {
        "uid": uid,
        "isAdmin": is_admin,
        "success": True
    }
    
    print(json.dumps(result))
    
except Exception as e:
    error_result = {
        "uid": None,
        "isAdmin": False,
        "success": False,
        "error": str(e)
    }
    print(json.dumps(error_result))
`;

  try {
    const result = await executePythonScript(pythonScript);
    
    if (!result.success) {
      return {
        uid: null,
        isAdmin: false,
        error: result.error || 'Error desconocido en autenticación'
      };
    }
    
    return {
      uid: result.uid,
      isAdmin: result.isAdmin
    };
  } catch (error) {
    console.error('Error ejecutando script Python:', error);
    return {
      uid: null,
      isAdmin: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Función alternativa que usa HTTP para comunicarse con un servidor Python
 * Esta es una mejor opción para React Native
 */
export async function authenticateWithPythonHTTP(config: PythonApiConfig): Promise<AuthResult> {
  try {
    // Esta función asumiría que tienes un servidor Python corriendo
    // que expone la API de Odoo vía HTTP
    const response = await fetch('http://localhost:5000/api/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    return {
      uid: result.uid,
      isAdmin: result.isAdmin,
      error: result.error
    };
  } catch (error) {
    console.error('Error en autenticación HTTP:', error);
    return {
      uid: null,
      isAdmin: false,
      error: error instanceof Error ? error.message : 'Error de conexión'
    };
  }
}

/**
 * Función que integra la lógica Python directamente en TypeScript
 * Esta es la opción más práctica para React Native
 */
export async function authenticateWithPythonLogic(config: PythonApiConfig): Promise<AuthResult> {
  try {
    // Usar la misma lógica que en Python pero adaptada para TypeScript/React Native
    const xmlrpc = require('xmlrpc');
    
    // Crear cliente XML-RPC
    const commonClient = xmlrpc.createClient({
      host: new URL(config.url).hostname,
      port: new URL(config.url).port || 8069,
      path: '/xmlrpc/2/common'
    });
    
    const objectClient = xmlrpc.createClient({
      host: new URL(config.url).hostname,
      port: new URL(config.url).port || 8069,
      path: '/xmlrpc/2/object'
    });
    
    // Autenticar
    const uid = await new Promise<number>((resolve, reject) => {
      commonClient.methodCall('authenticate', [
        config.db,
        config.username,
        config.password,
        {}
      ], (error: any, value: number) => {
        if (error) reject(error);
        else resolve(value);
      });
    });
    
    if (!uid) {
      return {
        uid: null,
        isAdmin: false,
        error: 'Usuario o contraseña incorrectos'
      };
    }
    
    // Verificar si es administrador
    const users = await new Promise<any[]>((resolve, reject) => {
      objectClient.methodCall('execute_kw', [
        config.db,
        uid,
        config.password,
        'res.users',
        'search_read',
        [[['id', '=', uid]]],
        { fields: ['groups_id'] }
      ], (error: any, value: any[]) => {
        if (error) reject(error);
        else resolve(value);
      });
    });
    
    const isAdmin = users[0]?.groups_id?.some((g: any) => 
      (Array.isArray(g) ? g[0] : g) === 1
    ) || false;
    
    return {
      uid,
      isAdmin
    };
    
  } catch (error) {
    console.error('Error en autenticación con lógica Python:', error);
    return {
      uid: null,
      isAdmin: false,
      error: error instanceof Error ? error.message : 'Error de autenticación'
    };
  }
}
