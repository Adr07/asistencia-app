const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');

// Mini-backend para manejar CORS y proxy a Odoo
const backendPort = 3001;
const staticPort = 3000;
const odooUrl = process.env.ODOO_URL || 'http://localhost:8069/jsonrpc'; // Cambia según tu config


const server = express();
server.use(cors());
server.use(express.json());

// Servir archivos estáticos de dist
server.use(express.static(path.resolve(process.cwd(), 'dist')));

// Proxy para Odoo
server.post('/odoo', async (req, res) => {
  try {
    const response = await fetch(odooUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

server.listen(staticPort, () => {
  console.log(`Servidor estático escuchando en http://localhost:${staticPort}`);
});

server.listen(backendPort, () => {
  console.log(`Mini-backend CORS proxy escuchando en http://localhost:${backendPort}`);
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // Cargar la app desde el servidor estático Express
  win.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
