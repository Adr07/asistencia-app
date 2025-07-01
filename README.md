# App de Asistencia - Expo React Native

Esta es una aplicación de control de asistencia desarrollada con [Expo](https://expo.dev) y React Native, conectada a Odoo para el registro de horas trabajadas por proyecto y tarea.

## Características principales

- **Control de asistencia**: Check-in/Check-out de empleados
- **Gestión de proyectos y tareas**: Selección y cambio de tareas durante la jornada
- **Registro preciso de horas**: Cálculo automático de tiempo trabajado por tarea
- **Integración con Odoo**: Sincronización automática con el sistema ERP
- **Líneas analíticas**: Creación automática de registros de tiempo en Odoo

## Arquitectura del sistema

### Componentes principales

- **AttendanceKiosk**: Componente principal que maneja el flujo de asistencia
- **Pasos de asistencia**: WelcomeStep, CheckedInStep, ProjectTaskStep, etc.
- **Hooks personalizados**: Lógica de negocio separada en hooks reutilizables
- **API de Odoo**: Comunicación con el backend mediante RPC

### Flujo de trabajo

1. **Bienvenida**: Empleado ingresa su ID
2. **Check-in**: Registro de entrada con timestamp
3. **Selección de proyecto/tarea**: Asignación de trabajo
4. **Cambio de tarea** (opcional): Registro de tiempo para tarea anterior y cambio a nueva tarea
5. **Check-out**: Registro de salida y cálculo final de horas

### Cálculo de horas

El sistema utiliza timestamps precisos para calcular el tiempo real trabajado:

- **checkInTimestamp**: Momento del check-in inicial
- **currentTaskStartTimestamp**: Momento de inicio de la tarea actual
- **Cambio de tarea**: Calcula horas de la tarea anterior y reinicia el contador
- **Check-out**: Calcula horas de la tarea actual desde `currentTaskStartTimestamp`

## Instalación y configuración

1. **Instalar dependencias**

   ```bash
   npm install
   ```

2. **Configurar conexión a Odoo**
   
   Edita `components/AttendanceKiosk/otros/config.tsx`:
   ```typescript
   export const RPC_URL = 'http://tu-servidor-odoo:puerto/jsonrpc';
   export const DB = 'nombre-de-tu-base-de-datos';
   ```

3. **Iniciar la aplicación**

   ```bash
   npx expo start
   ```

## Estructura del proyecto

```
components/
├── AttendanceKiosk/
│   ├── index.tsx              # Componente principal
│   ├── attendanceStepsTS/     # Pasos del flujo de asistencia
│   ├── indexTs/               # Lógica de negocio (hooks y handlers)
│   └── otros/                 # Configuración y utilidades
├── ts/                        # Hooks y lógica de estado
├── db/                        # API de Odoo
└── utils/                     # Utilidades generales
```

## Uso en desarrollo

### Plataformas soportadas

- **Android Emulator**: Usa automáticamente `10.0.2.2` para localhost
- **iOS Simulator**: Usa `localhost` directamente
- **Web**: Funciona con `localhost`

### Depuración

El código está libre de logs de debug. Para depurar:

1. Usa las herramientas de desarrollo de React Native
2. Verifica la conexión con Odoo en la consola del navegador
3. Revisa los errores en la aplicación Expo

## Características técnicas

### Integración con Odoo

- **Modelos utilizados**: `hr.attendance`, `account.analytic.line`, `project.project`, `project.task`
- **Operaciones**: Create, Read, Update via JSON-RPC
- **Autenticación**: Usuario y contraseña de Odoo

### Gestión de estado

- **Hooks personalizados**: Separación clara de responsabilidades
- **Estado local**: React state para UI temporal
- **Persistencia**: Datos guardados en Odoo inmediatamente

### Cálculos de tiempo

- **Precisión**: Milisegundos usando `Date.now()`
- **Formato**: Horas decimales para Odoo, legible para UI
- **Zona horaria**: UTC para almacenamiento, local para visualización

## Mejoras implementadas

### v1.1 - Mejoras en el cálculo de horas

- ✅ Eliminación de logs de debug
- ✅ Cálculo preciso de horas por tarea
- ✅ Corrección del flujo de cambio de tarea  
- ✅ Documentación completa del código
- ✅ Manejo correcto de timestamps
- ✅ Validación de datos antes de envío a Odoo

### Archivos clave documentados

- `ts/handleChangeTask.ts`: Lógica de cambio de tarea
- `ts/handleCheck.ts`: Check-in/Check-out
- `ts/useAttendanceMain.ts`: Hook principal de estado
- `db/odooApi.ts`: API de comunicación con Odoo
- `utils/attendanceUtils.ts`: Utilidades de cálculo

## Recursos adicionales

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
