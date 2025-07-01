# Documentación del Flujo de Asistencia

## Resumen
Este documento describe el flujo completo de asistencia en la aplicación, desde el check-in hasta el check-out, incluyendo el manejo de cambios de tarea y el cálculo preciso de horas trabajadas.

## Estados de la aplicación

### 1. Estado inicial (WelcomeStep)
- Usuario ingresa su ID de empleado
- Se valida la existencia del empleado en Odoo
- Se verifica si ya tiene una sesión activa

### 2. Check-in (CheckedInStep)
- Se crea un registro de asistencia en `hr.attendance` con `check_in`
- Se almacena `checkInTimestamp` para referencias futuras
- El usuario debe seleccionar proyecto y tarea para comenzar a trabajar

### 3. Trabajo en progreso (ProjectTaskStep)
- Usuario selecciona proyecto y tarea
- Se almacena `currentTaskStartTimestamp` (momento de inicio de la tarea actual)
- Se muestra el tiempo transcurrido desde el inicio de la tarea
- Usuario puede cambiar de tarea en cualquier momento

### 4. Cambio de tarea (ProjectTaskStep → ProjectTaskStep)
- Se calcula el tiempo trabajado en la tarea anterior usando `currentTaskStartTimestamp`
- Se crea una línea analítica (`account.analytic.line`) con las horas de la tarea anterior
- Se actualiza `currentTaskStartTimestamp` al momento del cambio
- Se continúa con la nueva tarea

### 5. Check-out (BeforeCheckoutStep → CheckedOutStep)
- Se calcula el tiempo trabajado en la tarea actual usando `currentTaskStartTimestamp`
- Se crea la línea analítica final para la tarea actual
- Se actualiza el registro de asistencia con `check_out`
- Se resetean todos los estados

## Timestamps y cálculo de horas

### Timestamps utilizados

1. **checkInTimestamp**: Momento del check-in inicial (inicio de la jornada)
2. **currentTaskStartTimestamp**: Momento de inicio de la tarea actual

### Casos de cálculo

#### Caso 1: Sin cambio de tarea
```
Check-in (09:00) → Tarea A → Check-out (17:00)
Horas de Tarea A = 17:00 - 09:00 = 8 horas
```

#### Caso 2: Con cambio de tarea
```
Check-in (09:00) → Tarea A → Cambio (13:00) → Tarea B → Check-out (17:00)
Horas de Tarea A = 13:00 - 09:00 = 4 horas
Horas de Tarea B = 17:00 - 13:00 = 4 horas
```

#### Caso 3: Múltiples cambios
```
Check-in (09:00) → Tarea A → Cambio (11:00) → Tarea B → Cambio (14:00) → Tarea C → Check-out (17:00)
Horas de Tarea A = 11:00 - 09:00 = 2 horas
Horas de Tarea B = 14:00 - 11:00 = 3 horas
Horas de Tarea C = 17:00 - 14:00 = 3 horas
```

### Fórmulas de cálculo

```typescript
// Para tarea actual (cambio o check-out)
const diffMs = Date.now() - currentTaskStartTimestamp;
const diffHours = diffMs / (1000 * 60 * 60);

// Para tiempo total desde check-in (solo visualización)
const totalMs = Date.now() - checkInTimestamp;
const totalHours = totalMs / (1000 * 60 * 60);
```

## Archivos clave del flujo

### 1. Componente principal
- **`components/AttendanceKiosk/index.tsx`**: Renderiza los pasos según el estado actual

### 2. Hooks de lógica de negocio
- **`ts/useAttendanceMain.ts`**: Hook principal que maneja todo el estado
- **`ts/useTimer.ts`**: Maneja los temporizadores y cálculos de tiempo
- **`ts/useProjectTask.ts`**: Gestiona la selección de proyectos y tareas

### 3. Handlers de acciones
- **`ts/handleCheck.ts`**: Maneja check-in y check-out
- **`ts/handleChangeTask.ts`**: Maneja los cambios de tarea

### 4. Componentes de pasos
- **`attendanceStepsTS/WelcomeStep.tsx`**: Pantalla de bienvenida
- **`attendanceStepsTS/CheckedInStep.tsx`**: Pantalla después del check-in
- **`attendanceStepsTS/ProjectTaskStep.tsx`**: Selección y trabajo en tareas
- **`attendanceStepsTS/BeforeCheckoutStep.tsx`**: Confirmación de check-out
- **`attendanceStepsTS/CheckedOutStep.tsx`**: Pantalla final

### 5. API y utilidades
- **`db/odooApi.ts`**: Funciones para comunicarse con Odoo
- **`utils/attendanceUtils.ts`**: Utilidades de cálculo y formateo

## Modelos de Odoo utilizados

### 1. hr.attendance
```python
{
    'employee_id': int,      # ID del empleado
    'check_in': datetime,    # Momento del check-in
    'check_out': datetime,   # Momento del check-out (nullable)
}
```

### 2. account.analytic.line
```python
{
    'name': str,            # Descripción del trabajo
    'user_id': int,         # ID del usuario
    'project_id': int,      # ID del proyecto
    'task_id': int,         # ID de la tarea
    'unit_amount': float,   # Horas trabajadas (decimal)
    'date': date,          # Fecha del trabajo
}
```

### 3. project.project
```python
{
    'name': str,           # Nombre del proyecto
    'active': bool,        # Si está activo
}
```

### 4. project.task
```python
{
    'name': str,           # Nombre de la tarea
    'project_id': int,     # ID del proyecto padre
    'active': bool,        # Si está activa
}
```

## Flujo de datos

### 1. Check-in
```
Usuario ingresa ID → Validar empleado → Crear hr.attendance → Actualizar estado local
```

### 2. Selección de tarea
```
Usuario selecciona proyecto/tarea → Almacenar en estado → Iniciar currentTaskStartTimestamp
```

### 3. Cambio de tarea
```
Usuario selecciona nueva tarea → Calcular horas tarea anterior → Crear analytic.line → 
Actualizar currentTaskStartTimestamp → Cambiar tarea en estado
```

### 4. Check-out
```
Usuario confirma check-out → Calcular horas tarea actual → Crear analytic.line → 
Actualizar hr.attendance con check_out → Resetear estado
```

## Manejo de errores

### Errores de conexión
- Se muestran mensajes de error específicos
- Se mantiene el estado local para retry
- Se valida la respuesta de Odoo antes de continuar

### Errores de validación
- Se verifican los datos antes de enviar a Odoo
- Se validan los timestamps y cálculos
- Se confirman las operaciones críticas

### Estados inconsistentes
- Se verifica la existencia de registros antes de operar
- Se valida que los timestamps sean coherentes
- Se previenen operaciones duplicadas

## Mejores prácticas implementadas

### 1. Separación de responsabilidades
- Lógica de UI separada de lógica de negocio
- Hooks específicos para cada funcionalidad
- Handlers dedicados para acciones complejas

### 2. Cálculos precisos
- Uso de `Date.now()` para máxima precisión
- Validación de timestamps antes de cálculos
- Formato decimal para compatibilidad con Odoo

### 3. Documentación
- Comments explicativos en el código
- Documentación de funciones y parámetros
- Ejemplos de uso donde es necesario

### 4. Manejo de estado
- Estado mínimo y consistente
- Actualizaciones atómicas
- Rollback en caso de error

## Consideraciones futuras

### 1. Mejoras potenciales
- Sincronización offline
- Validación de ubicación (GPS)
- Reportes locales
- Notificaciones push

### 2. Optimizaciones
- Cache de proyectos y tareas
- Reducción de llamadas RPC
- Optimización de renders

### 3. Seguridad
- Autenticación mejorada
- Validación de sesiones
- Logs de auditoría
