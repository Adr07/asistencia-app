# Guía de Instalación y Desarrollo - App de Asistencia

Esta guía explica paso a paso cómo configurar el proyecto en un ordenador nuevo para desarrollo y modificaciones.

## 📋 Requisitos Previos

### 1. Software Necesario

#### Node.js y npm
- **Versión requerida**: Node.js 18 o superior
- **Descarga**: https://nodejs.org/
- **Verificar instalación**:
  ```bash
  node --version
  npm --version
  ```

#### Git
- **Descarga**: https://git-scm.com/
- **Verificar instalación**:
  ```bash
  git --version
  ```

#### Editor de Código (Recomendado)
- **Visual Studio Code**: https://code.visualstudio.com/
- **Extensiones recomendadas**:
  - ES7+ React/Redux/React-Native snippets
  - TypeScript Importer
  - Expo Tools
  - React Native Tools

### 2. Herramientas de Desarrollo Móvil

#### Para Android
- **Android Studio**: https://developer.android.com/studio
- **Configurar emulador Android** o **habilitar depuración USB** en dispositivo físico

#### Para iOS (Solo en macOS)
- **Xcode**: Desde Mac App Store
- **iOS Simulator**: Incluido en Xcode

## 🚀 Instalación del Proyecto

### Paso 1: Crear o Clonar el Proyecto

#### Opción A: Clonar proyecto existente
```bash
# Clonar el proyecto
git clone [URL_DEL_REPOSITORIO]
cd asistencia-app
```

#### Opción B: Crear proyecto desde cero
```bash
# Crear nuevo proyecto con Expo
npm create expo@latest asistencia-app
cd asistencia-app

# El comando anterior instala automáticamente las dependencias base:
# - expo, expo-router, expo-constants, expo-status-bar, etc.
# - react, react-native, @react-navigation/native
# - @expo/vector-icons, react-native-gesture-handler, etc.
```

### Paso 2: Instalar Dependencias Adicionales
```bash
# Si clonaste el proyecto, instalar todas las dependencias
npm install

# Si creaste proyecto desde cero, instalar dependencias adicionales específicas:
npm install @react-navigation/bottom-tabs @react-navigation/elements
npm install expo-blur expo-image expo-haptics expo-location expo-web-browser
npm install react-native-webview cors express concurrently
npm install github:nguyenphuquang/react-native-xmlrpc

# O usando yarn si lo prefieres
yarn add [nombre-del-paquete]
```

**Nota**: Las dependencias base de Expo ya vienen incluidas con `npm create expo@latest`. Solo necesitas instalar las adicionales listadas en `requirements.txt`.

### Paso 3: Instalar Expo CLI
```bash
# Instalar Expo CLI globalmente
npm install -g @expo/cli

# Verificar instalación
expo --version
```

### Paso 4: Verificar Configuración
```bash
# Verificar que no hay errores de TypeScript
npx tsc --noEmit

# Verificar configuración de Expo (opcional)
npx expo-doctor
```

### 📦 Dependencias del Proyecto

El archivo `requirements.txt` contiene solo las **dependencias adicionales** necesarias para este proyecto específico:

**Dependencias que YA VIENEN INCLUIDAS** con `npm create expo@latest`:
- Core Expo SDK (expo, expo-router, expo-constants, etc.)
- React y React Native base
- Navegación básica (@react-navigation/native)
- Componentes UI básicos (@expo/vector-icons, expo-symbols)
- Animaciones (react-native-gesture-handler, react-native-reanimated)
- Herramientas de desarrollo (TypeScript, ESLint, Babel)

**Dependencias ADICIONALES específicas del proyecto**:
- **Navigation**: @react-navigation/bottom-tabs, @react-navigation/elements
- **UI Components**: expo-blur, expo-image
- **Device Features**: expo-haptics, expo-location, expo-web-browser
- **Communication**: react-native-webview, react-native-xmlrpc, cors, express

**Comandos principales**:
```bash
# Para proyecto nuevo desde cero
npm create expo@latest asistencia-app

# Para proyecto existente clonado
npm install

# Instalar herramientas globales
npm install -g @expo/cli
npm install -g eas-cli
```

## ⚙️ Configuración del Proyecto

### 1. Configurar Conexión con Odoo

Editar el archivo `components/AttendanceKiosk/otros/config.tsx`:

```typescript
// Configuración para desarrollo local
export const RPC_URL = 'http://localhost:8069/jsonrpc';  // Tu servidor Odoo
export const DB = 'nombre-de-tu-base-de-datos';          // Tu base de datos

// Para emulador Android, usar:
// export const RPC_URL = 'http://10.0.2.2:8069/jsonrpc';

// Para dispositivo físico en la misma red:
// export const RPC_URL = 'http://192.168.1.XXX:8069/jsonrpc';
```

### 2. Verificar Permisos de Ubicación

El archivo `app.json` ya está configurado con los permisos necesarios:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Esta aplicación necesita acceso a la ubicación para registrar la asistencia en el lugar de trabajo."
        }
      ]
    ]
  }
}
```

### 3. Variables de Entorno (Opcional)

Crear archivo `.env` en la raíz (si necesitas variables específicas):
```
EXPO_PUBLIC_ODOO_URL=http://localhost:8069
EXPO_PUBLIC_ODOO_DB=tu_base_de_datos
```

## 🏃‍♂️ Ejecutar el Proyecto

### Modo Desarrollo
```bash
# Iniciar el servidor de desarrollo
npx expo start

# O con opciones específicas
npx expo start --clear        # Limpiar caché
npx expo start --tunnel       # Usar túnel para dispositivos externos
npx expo start --localhost    # Solo localhost
```

### Opciones de Ejecución

#### 1. En Navegador Web
- Presiona `w` en la terminal
- O abre http://localhost:8081 en tu navegador

#### 2. En Emulador Android
- Asegúrate de que el emulador esté ejecutándose
- Presiona `a` en la terminal
- O escanea el código QR con la app Expo Go

#### 3. En iOS Simulator (Solo macOS)
- Presiona `i` en la terminal
- O escanea el código QR con la app Expo Go

#### 4. En Dispositivo Físico
- Instala **Expo Go** desde App Store/Google Play
- Escanea el código QR que aparece en la terminal

## 🛠️ Desarrollo y Modificaciones

### Estructura del Proyecto
```
asistencia-app/
├── app/                       # Navegación y pantallas principales
├── components/                # Componentes reutilizables
│   ├── AttendanceKiosk/      # Componente principal de asistencia
│   ├── LocationAlert.tsx     # Alertas de ubicación
│   └── ...
├── hooks/                     # Hooks personalizados
│   ├── useLocation.ts        # Hook de geolocalización
│   ├── useLocationPermission.ts
│   └── ...
├── ts/                       # Lógica de negocio TypeScript
│   ├── useAttendanceMain.ts  # Hook principal de asistencia
│   ├── handleCheck.ts        # Lógica de check-in/out
│   └── ...
├── db/                       # API de comunicación con Odoo
├── utils/                    # Utilidades generales
└── assets/                   # Imágenes y recursos
```

### Archivos Clave para Modificaciones

#### 1. Lógica de Asistencia
- `ts/useAttendanceMain.ts` - Hook principal con toda la lógica
- `ts/handleCheck.ts` - Manejo de check-in y check-out
- `ts/handleChangeTask.ts` - Cambio de tareas

#### 2. Interfaz de Usuario
- `components/AttendanceKiosk/index.tsx` - Componente principal
- `components/AttendanceKiosk/attendanceStepsTS/` - Pasos del flujo
- `components/AttendanceKiosk/AttendanceStyles.ts` - Estilos

#### 3. Comunicación con Odoo
- `db/odooApi.ts` - Funciones de API
- `components/AttendanceKiosk/otros/config.tsx` - Configuración

#### 4. Geolocalización
- `hooks/useLocation.ts` - Hook de ubicación
- `hooks/useLocationPermission.ts` - Permisos de ubicación

### Comandos Útiles para Desarrollo

```bash
# Limpiar caché de Metro
npx expo start --clear

# Verificar tipos TypeScript
npx tsc --noEmit

# Verificar configuración
npx expo-doctor

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Ver logs en tiempo real
npx expo start --dev-client
```

## 🐛 Debugging y Resolución de Problemas

### Problemas Comunes

#### 1. Error de Conexión con Odoo
```bash
# Verificar que Odoo esté ejecutándose
curl http://localhost:8069

# Verificar configuración en config.tsx
# Para Android emulator usar: 10.0.2.2 en lugar de localhost
```

#### 2. Problemas de Permisos de Ubicación
- Verificar que los permisos estén habilitados en el dispositivo
- En emulador: habilitar ubicación en configuración
- Revisar logs en `hooks/useLocation.ts`

#### 3. Errores de Compilación TypeScript
```bash
# Verificar errores
npx tsc --noEmit

# Limpiar y reinstalar
npx expo start --clear
```

#### 4. Problemas con Metro Bundler
```bash
# Limpiar caché completamente
npx expo start --clear
npx react-native start --reset-cache

# O reiniciar Metro
r # En la terminal de Expo
```

#### 5. Problemas con Dependencias
```bash
# Reinstalar todas las dependencias
rm -rf node_modules package-lock.json
npm install

# Si creaste proyecto desde cero, instalar dependencias adicionales
npm install @react-navigation/bottom-tabs @react-navigation/elements
npm install expo-blur expo-image expo-haptics expo-location expo-web-browser
npm install react-native-webview cors express concurrently
npm install github:nguyenphuquang/react-native-xmlrpc

# Verificar dependencias con Expo
npx expo install --check

# Para problemas específicos con react-native-xmlrpc
npm uninstall react-native-xmlrpc
npm install github:nguyenphuquang/react-native-xmlrpc
```

### Debugging con React Native Debugger

1. **Instalar React Native Debugger**:
   - Descargar desde: https://github.com/jhen0409/react-native-debugger

2. **Habilitar debugging**:
   - En el dispositivo/emulador: Agitar para abrir menú de desarrollo
   - Seleccionar "Debug with Chrome" o "Debug with React Native Debugger"

3. **Ver logs**:
   - Usar `console.log()` en el código
   - Los logs aparecerán en React Native Debugger

### Herramientas de Desarrollo

#### 1. React DevTools
```bash
# Instalar React DevTools
npm install -g react-devtools

# Ejecutar
react-devtools
```

#### 2. Flipper (Opcional)
- Descargar desde: https://fbflipper.com/
- Útil para debugging avanzado de React Native

## 🚀 Build y Distribución

### Desarrollo (EAS Updates)
```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login en Expo
eas login

# Crear update de desarrollo
eas update --branch development
```

### Producción
```bash
# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios

# Build para ambas plataformas
eas build --platform all
```

## 📚 Recursos Adicionales

### Documentación
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

### Debugging
- [Expo Debugging Guide](https://docs.expo.dev/debugging/runtime-issues/)
- [React Native Debugging](https://reactnative.dev/docs/debugging)

### APIs Utilizadas
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)

## ✅ Lista de Verificación

Antes de empezar a desarrollar, asegúrate de que:

- [ ] Node.js 18+ está instalado
- [ ] Expo CLI está instalado globalmente (`npm install -g @expo/cli`)
- [ ] EAS CLI está instalado globalmente (`npm install -g eas-cli`)
- [ ] El proyecto se clonó correctamente
- [ ] `npm install` se ejecutó sin errores
- [ ] Todas las dependencias de `requirements.txt` están instaladas
- [ ] La configuración en `config.tsx` es correcta
- [ ] El servidor de Odoo está ejecutándose
- [ ] El emulador/dispositivo está configurado
- [ ] `npx expo start` funciona correctamente
- [ ] La app se carga en el dispositivo/emulador
- [ ] Los permisos de ubicación funcionan
- [ ] No hay errores de TypeScript (`npx tsc --noEmit`)

## 🆘 Contacto y Soporte

Para problemas específicos del proyecto:
1. Revisar los logs en la consola de Expo
2. Verificar la configuración de Odoo
3. Comprobar que todos los permisos estén habilitados
4. Consultar la documentación de Expo/React Native

---

**¡Listo para desarrollar!** 🎉

Sigue esta guía paso a paso y tendrás el proyecto funcionando en tu ordenador nuevo para hacer modificaciones.
