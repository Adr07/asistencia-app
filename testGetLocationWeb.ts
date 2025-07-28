// testGetLocationWeb.ts
// Script de prueba para obtener la localización en web/electron
import { getLocationWeb } from './utils/getLocationWeb';

async function testLocation() {
  const location = await getLocationWeb();
  if (location) {
    // ...existing code...
    alert(`Latitud: ${location.latitude}, Longitud: ${location.longitude}`);
  } else {
    // ...existing code...
    alert('No se pudo obtener la localización');
  }
}

testLocation();
