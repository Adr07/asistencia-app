

// Endpoint para ejecutar métodos sobre modelos Odoo

// Desactivar y limitar la caché de disco de Electron/Chromium
// const { app, BrowserWindow } = require('electron'); // Eliminada declaración duplicada
const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
app.commandLine.appendSwitch('disk-cache-size', '1');
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');

// Mini-backend para manejar CORS y proxy a Odoo
const backendPort = 3001;
const odooUrl = process.env.ODOO_URL || 'http://localhost:8069/web/jsonrpc'; // Cambia según tu config


const server = express();
server.use(cors());
server.use(express.json());

server.post('/odoo/attendance_manual', async (req, res) => {
  try {
    const odooRes = await fetch('https://registro.sinerkia-dev.com/jsonrpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await odooRes.text();
    res.status(odooRes.status).send(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para obtener el nombre e inicial del usuario
server.post('/odoo/get_user_name', async (req, res) => {
  try {
    const xmlrpc = require('xmlrpc');
    const { db, uid, password } = req.body;
    if (!db || !uid || !password) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos: db, uid, password' });
    }
    const odooXmlrpcUrl = 'https://registro.sinerkia-dev.com/xmlrpc/2/object';
    const client = xmlrpc.createSecureClient({ url: odooXmlrpcUrl });
    client.methodCall('execute_kw', [db, uid, password, 'res.users', 'read', [uid], { fields: ['name'] }], function (error, recs) {
      if (error) {
        console.error('❌ Error en get_user_name:', error);
        if (error.res && error.res.body) {
          console.error('🔎 Respuesta cruda Odoo:', error.res.body);
        }
        res.status(500).json({ error: error.message, raw: error.res && error.res.body ? error.res.body : undefined });
      } else {
        let name = 'Usuario';
        let initial = 'U';
        if (recs && recs[0] && recs[0].name) {
          name = recs[0].name;
          initial = recs[0].name.charAt(0).toUpperCase();
        }
        res.json({ userName: name, userInitial: initial });
      }
    });
  } catch (err) {
    console.error('❌ Error en endpoint get_user_name:', err);
    res.status(500).json({ error: err.message });
  }
});
// Endpoint para obtener la versión del servidor Odoo
server.post('/odoo/version', async (req, res) => {
  try {
    const xmlrpc = require('xmlrpc');
    const odooXmlrpcUrl = 'https://registro.sinerkia-dev.com/xmlrpc/2/common';
    const client = xmlrpc.createSecureClient({ url: odooXmlrpcUrl });
    client.methodCall('version', [], function (error, value) {
      if (error) {
        console.error('❌ Error obteniendo versión Odoo:', error);
        res.status(500).json({ error: error.message });
      } else {
        res.json(value);
      }
    });
  } catch (err) {
    console.error('❌ Error en endpoint /odoo/version:', err);
    res.status(500).json({ error: err.message });
  }
});

// Guardar uid en memoria por sesión simple (por IP)
const userSessions = {};
server.post('/odoo/authenticate', async (req, res) => {
  try {
    const xmlrpc = require('xmlrpc');
    const { db, user, password } = req.body;
    if (!db || !user || !password) {
      return res.status(400).json({ error: 'Faltan parámetros: db, user, password' });
    }
    const odooXmlrpcUrl = 'https://registro.sinerkia-dev.com/xmlrpc/2/common';
    const client = xmlrpc.createSecureClient({ url: odooXmlrpcUrl });
    client.methodCall('authenticate', [db, user, password, {}], function (error, uid) {
      if (error) {
        console.error('❌ Error autenticando vía XML-RPC:', error);
        if (error.res && error.res.body) {
          console.error('🔎 Respuesta cruda Odoo:', error.res.body);
        }
        res.status(500).json({ error: error.message, raw: error.res && error.res.body ? error.res.body : undefined });
      } else {
        // Guardar uid en memoria por IP
        const ip = req.ip;
        userSessions[ip] = { db, user, password, uid };
        res.json({ uid });
      }
    });
  } catch (err) {
    console.error('❌ Error en endpoint /odoo/authenticate:', err);
    res.status(500).json({ error: err.message });
  }
});
// Proxy para Odoo

// Endpoint dedicado para obtener proyectos asignados al empleado
// Endpoint dedicado para obtener info de empleado (bolsa_horas_numero, remaining_leaves)
// Endpoint dedicado para obtener actividades por proyecto
server.post('/odoo/get_project_activities', async (req, res) => {
  try {
    const xmlrpc = require('xmlrpc');
    const { db, uid, password, project_id } = req.body;
    if (!db || !uid || !password || !project_id) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos: db, uid, password, project_id' });
    }
    const odooXmlrpcUrl = 'https://registro.sinerkia-dev.com/xmlrpc/2/object';
    const client = xmlrpc.createSecureClient({ url: odooXmlrpcUrl });
    // Lógica: obtener emp_id por user_id
    client.methodCall('execute_kw', [db, uid, password, 'hr.employee', 'search_read', [[['user_id', '=', uid]]], { fields: ['id'], limit: 1 }], function (error, empleados) {
      if (error || !empleados || !Array.isArray(empleados) || empleados.length === 0) {
        console.error('❌ Error buscando empleado para actividades:', error);
        return res.status(500).json({ error: 'Empleado no encontrado para uid: ' + uid });
      }
      const emp_id = empleados[0].id;
      // Llamar a get_employee_all_actividad
      client.methodCall('execute_kw', [db, uid, password, 'hr.attendance', 'get_employee_all_actividad', [[], emp_id, project_id]], function (error2, actividades) {
        if (error2) {
          console.error('❌ Error en get_project_activities:', error2);
          if (error2.res && error2.res.body) {
            console.error('🔎 Respuesta cruda Odoo:', error2.res.body);
          }
          res.status(500).json({ error: error2.message, raw: error2.res && error2.res.body ? error2.res.body : undefined });
        } else {
          // Filtrar proyecto interno y actividad general
          let filtradas = Array.isArray(actividades) ? actividades.filter(a => {
            // Excluir si id es 1 (proyecto interno) o si value/label son 'Interno' o 'General'
            const v = (a.value || '').toLowerCase();
            const l = (a.label || '').toLowerCase();
            return a.id !== 1 && v !== 'interno' && v !== 'general' && l !== 'interno' && l !== 'general';
          }) : actividades;
          console.log('✅ [get_project_activities] Respuesta Odoo filtrada:', filtradas);
          res.json({ result: filtradas });
        }
      });
    });
  } catch (err) {
    console.error('❌ Error en endpoint get_project_activities:', err);
    res.status(500).json({ error: err.message });
  }
});
server.post('/odoo/get_employee_info', async (req, res) => {
  try {
    const xmlrpc = require('xmlrpc');
    const { db, uid, password } = req.body;
    if (!db || !uid || !password) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos: db, uid, password' });
    }
    const odooXmlrpcUrl = 'https://registro.sinerkia-dev.com/xmlrpc/2/object';
    const client = xmlrpc.createSecureClient({ url: odooXmlrpcUrl });
    client.methodCall('execute_kw', [db, uid, password, 'hr.employee', 'search_read', [[['user_id', '=', uid]]], { fields: ['bolsa_horas_numero', 'remaining_leaves'], limit: 1 }], function (error, value) {
      if (error) {
        console.error('❌ Error en get_employee_info:', error);
        if (error.res && error.res.body) {
          console.error('🔎 Respuesta cruda Odoo:', error.res.body);
        }
        res.status(500).json({ error: error.message, raw: error.res && error.res.body ? error.res.body : undefined });
      } else {
        console.log('✅ [get_employee_info] Respuesta Odoo:', value);
        res.json({ result: value });
      }
    });
  } catch (err) {
    console.error('❌ Error en endpoint get_employee_info:', err);
    res.status(500).json({ error: err.message });
  }
});
server.post('/odoo/get_employee_all_project', async (req, res) => {
  try {
    const xmlrpc = require('xmlrpc');
    const { db, uid, password, emp_id } = req.body;
    if (!db || !uid || !password || !emp_id) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos: db, uid, password, emp_id' });
    }
    const odooXmlrpcUrl = 'https://registro.sinerkia-dev.com/xmlrpc/2/object';
    const client = xmlrpc.createSecureClient({ url: odooXmlrpcUrl });
    client.methodCall('execute_kw', [db, uid, password, 'hr.attendance', 'get_employee_all_project', [[emp_id]]], function (error, value) {
      if (error) {
        console.error('❌ Error en get_employee_all_project:', error);
        if (error.res && error.res.body) {
          console.error('🔎 Respuesta cruda Odoo:', error.res.body);
        }
        res.status(500).json({ error: error.message, raw: error.res && error.res.body ? error.res.body : undefined });
      } else {
        // Filtrar proyecto interno (id=1, value/label 'Interno')
        let filtrados = Array.isArray(value) ? value.filter(p => {
          const v = (p.value || '').toLowerCase();
          const l = (p.label || '').toLowerCase();
          return p.id !== 1 && v !== 'interno' && l !== 'interno';
        }) : value;
        console.log('✅ [get_employee_all_project] Respuesta Odoo filtrada:', filtrados);
        res.json({ result: filtrados });
      }
    });
  } catch (err) {
    console.error('❌ Error en endpoint get_employee_all_project:', err);
    res.status(500).json({ error: err.message });
  }
});


server.use(express.static(path.resolve(process.cwd(), 'dist')));

server.listen(backendPort, () => {
  console.log(`Servidor Express escuchando en http://localhost:${backendPort}`);
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  // Cargar la app desde el servidor estático Express
  win.loadURL('http://localhost:3001');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
