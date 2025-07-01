// server-proxy.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors()); // Permite CORS para todos los orígenes
app.use(express.json());

app.post('/jsonrpc', async (req, res) => {
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Proxy corriendo en http://localhost:${PORT}`);
});
