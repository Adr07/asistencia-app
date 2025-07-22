# Solución de Problemas de CORS para Conexión Directa a Odoo

## Problema
Al ejecutar la aplicación en desarrollo web (localhost), se produce un error de CORS cuando se intenta conectar directamente al servidor Odoo:

```
Access to fetch at 'https://registro.sinerkia-dev.com/jsonrpc' from origin 'http://localhost:8081' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Soluciones Implementadas

### 1. **Código con Lógica Python Directa (Actual)**
- ✅ **Archivo**: `authenticateWithPythonLogicDirect()` en `db/odooApi.ts`
- ✅ **Ventajas**: No requiere servidor intermedio, usa la lógica exacta del archivo Python
- ✅ **Funciona**: En aplicaciones móviles nativas (React Native)
- ⚠️ **Limitación**: Problema de CORS en desarrollo web

### 2. **Métodos de Resolución de CORS**

#### A. **Configurar CORS en el Servidor Odoo (Recomendado para Producción)**
En el servidor Odoo, agregar configuración CORS en el archivo de configuración:

```ini
# En odoo.conf
[options]
...
# Permitir CORS para desarrollo
cors = *
# O específicamente para localhost
cors = http://localhost:8081,http://localhost:3000
```

#### B. **Usar Proxy de Desarrollo (Solución Temporal)**
Crear un proxy en el servidor de desarrollo para redirigir las peticiones:

1. **Para Expo/Metro**: Configurar proxy en `metro.config.js`
2. **Para Webpack**: Configurar proxy en webpack dev server

#### C. **Deshabilitar CORS en el Navegador (Solo Desarrollo)**
⚠️ **SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN**

**Chrome/Edge:**
```bash
# Windows
chrome.exe --user-data-dir="C:\temp\chrome_dev" --disable-web-security --disable-features=VizDisplayCompositor

# macOS
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_session" --disable-web-security

# Linux
google-chrome --user-data-dir="/tmp/chrome_dev_session" --disable-web-security
```

**Firefox:**
1. Ir a `about:config`
2. Buscar `security.fileuri.strict_origin_policy`
3. Cambiar a `false`

#### D. **Usar Extensión de Navegador**
Instalar extensiones como "CORS Unblock" o "Disable CORS" para desarrollo.

### 3. **Configuración Actual del Proyecto**

#### **Archivos Modificados:**

1. **`db/odooApi.ts`**:
   - `authenticateWithPythonLogicDirect()`: Conexión directa con lógica Python
   - Fallback XMLHttpRequest si fetch falla
   - Manejo mejorado de errores CORS

2. **`components/AttendanceKiosk/otros/rpc.tsx`**:
   - `rpcCall()`: Método principal con headers CORS
   - `rpcCallXHR()`: Fallback usando XMLHttpRequest

3. **`components/AttendanceKiosk/otros/config.tsx`**:
   - Configuración por entorno (desarrollo/producción)
   - URLs diferentes para web/móvil

4. **`components/AttendanceKiosk/otros/LoginScreen.tsx`**:
   - Usa `authenticateWithPythonLogicDirect()` para conexión directa

#### **Flujo de Autenticación:**
1. Intenta fetch normal con headers CORS
2. Si falla, usa XMLHttpRequest como fallback
3. Implementa la misma lógica que `OdooPythonApi.py`
4. Manejo detallado de errores con mensajes específicos

### 4. **Recomendaciones de Implementación**

#### **Para Desarrollo:**
1. **Opción 1**: Configurar CORS en el servidor Odoo de desarrollo
2. **Opción 2**: Usar navegador con CORS deshabilitado
3. **Opción 3**: Usar extensión de navegador para CORS

#### **Para Producción:**
1. Configurar CORS apropiadamente en el servidor Odoo
2. Usar dominios específicos en lugar de `*`
3. La aplicación móvil no tendrá problemas de CORS

### 5. **Comandos Útiles**

#### **Iniciar Chrome sin CORS (Desarrollo):**
```bash
# Windows
start chrome --user-data-dir="C:\temp\chrome_dev" --disable-web-security --disable-features=VizDisplayCompositor --args http://localhost:8081

# macOS
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_session" --disable-web-security http://localhost:8081
```

#### **Verificar Configuración:**
```bash
# Verificar que Expo esté corriendo
npx expo start

# Verificar conexión a Odoo
curl -X POST https://registro.sinerkia-dev.com/jsonrpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"call","params":{"service":"common","method":"version","args":[]},"id":1}'
```

### 6. **Logs y Debugging**

La aplicación incluye logging detallado:

```typescript
console.log('[authenticateWithPythonLogicDirect] Iniciando autenticación para:', username);
console.log('[authenticateWithPythonLogicDirect] Autenticación exitosa. UID:', uid);
console.log('[authenticateWithPythonLogicDirect] Es administrador:', isAdmin);
```

Los errores incluyen información específica sobre CORS y red.

### 7. **Estado Actual**

✅ **Funcionando**: Aplicación móvil React Native
⚠️ **Requiere configuración**: Desarrollo web (problema CORS)
✅ **Implementado**: Lógica Python directa sin servidor intermedio
✅ **Implementado**: Fallbacks para diferentes métodos de conexión
✅ **Implementado**: Manejo detallado de errores
