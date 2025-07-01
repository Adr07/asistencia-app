# Corrección del Bug: Valores Vacíos en Cambio de Tarea

## Problema Identificado
En el paso de selección de nueva tarea, cuando se seleccionaban un nuevo proyecto y tarea, estos valores llegaban vacíos a `handleChangeTask`, causando que la tarea no se cambiara y no se abriera el registro de asistencia.

## Causa del Error
1. **Función `getOnContinue` mal implementada**: Devolvía directamente la referencia a `handleChangeTaskFlow` sin pasar los argumentos necesarios (`pendingProject`, `pendingTask`).
2. **Llamada incorrecta en StepRenderer**: Se intentaba pasar los argumentos en el `StepRenderer` pero la función `onContinue` no los recibía.
3. **Uso de setters no protegidos**: Se usaban `setPendingProject` y `setPendingTask` en lugar de los setters protegidos `safeSetPendingProject` y `safeSetPendingTask`.

## Cambios Realizados

### 1. Corrección en `AttendanceKiosk/index.tsx`
- **Línea ~169**: Modificada `getOnContinue()` para crear una función wrapper que capture los valores actuales:
  ```typescript
  const getOnContinue = () => {
    if (step === "changing_task" || showChangingTask) {
      return () => {
        console.log('[DEBUG] getOnContinue: About to call handleChangeTaskFlow with:', { pendingProject, pendingTask });
        handleChangeTaskFlow(pendingProject, pendingTask);
      };
    }
    return handleContinueFromProjectTask;
  };
  ```

- **Línea ~104**: Agregada validación y logging en `handleChangeTaskFlow`:
  ```typescript
  const handleChangeTaskFlow = async (pendingProject: any, pendingTask: any) => {
    console.log('[DEBUG] handleChangeTaskFlow called with:', { pendingProject, pendingTask });
    
    if (!pendingProject || !pendingTask) {
      console.error('[DEBUG] pendingProject or pendingTask is null/undefined');
      showMessage && showMessage('Error', 'Por favor selecciona un proyecto y una tarea antes de continuar.');
      return;
    }
    // ... resto del código
  };
  ```

### 2. Corrección en `StepRenderer.tsx`
- **Línea ~81**: Simplificada la llamada a `onContinue`:
  ```typescript
  onContinue={props.onContinue}
  ```
  (Removida la llamada directa a `props.handleChangeTaskFlow`)

### 3. Corrección en `ProjectTaskStep.tsx`
- **Líneas ~39-63**: Modificados los handlers para usar setters protegidos:
  ```typescript
  if (props.mode === "changing_task" && props.safeSetPendingProject) {
    props.safeSetPendingProject(project);
  }
  ```

### 4. Actualización de tipos en `AttendanceStepTypes.ts`
- **Líneas ~77-78**: Agregadas las propiedades de setters protegidos:
  ```typescript
  safeSetPendingProject?: (project: Project | null) => void;
  safeSetPendingTask?: (task: Task | null) => void;
  ```

## Logging Agregado para Debugging
- Log cuando se llama `handleSelectProject` y `handleSelectTask`
- Log cuando cambian los valores de `pendingProject` y `pendingTask`
- Log antes de llamar `handleChangeTaskFlow`
- Log dentro de `handleChangeTaskFlow` con los valores recibidos

## Flujo Correcto Después de los Cambios
1. Usuario selecciona "Cambiar tarea" en `BeforeCheckoutStep`
2. Se activa `startChangingTask` que cambia el estado a `changing_task`
3. Se renderiza `ProjectTaskStep` en modo `changing_task`
4. Usuario selecciona proyecto → `safeSetPendingProject` actualiza el estado
5. Usuario selecciona tarea → `safeSetPendingTask` actualiza el estado
6. Se habilita el botón "Continuar"
7. Al hacer clic en "Continuar", se ejecuta la función wrapper que llama `handleChangeTaskFlow(pendingProject, pendingTask)` con los valores correctos
8. `handleChangeTask` recibe los valores correctos y ejecuta el cambio de tarea

## Verificación
Para verificar que la corrección funciona:
1. Hacer login
2. Seleccionar proyecto y tarea iniciales
3. Hacer check-in
4. Ir a "Antes de salir" y seleccionar "Cambiar tarea"
5. Seleccionar nuevo proyecto y nueva tarea
6. Verificar en la consola que los logs muestran los valores correctos
7. Hacer clic en "Continuar" y verificar que el cambio de tarea se ejecuta correctamente
