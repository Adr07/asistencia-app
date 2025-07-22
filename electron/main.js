

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


// Nuevo endpoint para autenticación Odoo simplificada
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
        res.json({ uid });
      }
    });
  } catch (err) {
    console.error('❌ Error en endpoint /odoo/authenticate:', err);
    res.status(500).json({ error: err.message });
  }
});
// Proxy para Odoo
server.post('/odoo/execute_kw', async (req, res) => {
  try {
    const xmlrpc = require('xmlrpc');
    const { url, db, uid, password, model, method, args } = req.body;
    if (!url || !db || !uid || !password || !model || !method || !args) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }
    const odooXmlrpcUrl = url;
    const object_config = odooXmlrpcUrl.startsWith('https://')
      ? xmlrpc.createSecureClient({ url: odooXmlrpcUrl })
      : xmlrpc.createClient({ url: odooXmlrpcUrl });
    object_config.methodCall('execute_kw', [db, uid, password, model, method, ...args], function (error, value) {
      if (error) {
        console.error('❌ Error en execute_kw:', error);
        if (error.res && error.res.body) {
          console.error('🔎 Respuesta cruda Odoo:', error.res.body);
        }
        res.status(500).json({ error: error.message, raw: error.res && error.res.body ? error.res.body : undefined });
      } else {
        res.json(value);
      }
    });
  } catch (err) {
    console.error('❌ Error en endpoint execute_kw:', err);
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
