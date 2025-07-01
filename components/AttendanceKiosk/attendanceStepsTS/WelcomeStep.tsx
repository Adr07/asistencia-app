// WelcomeStep.tsx
// Paso de bienvenida en el flujo de asistencia. Permite seleccionar proyecto y tarea, y avanzar al siguiente paso.
// Props principales:
// - loading: indica si hay una operación en curso
// - onCheckIn: handler para hacer check-in (no se usa directamente aquí)
// - onLogout: handler para cerrar sesión (no se usa directamente aquí)
// - selectedProject, selectedTask: proyecto y tarea seleccionados
// - setSelectedProject, setSelectedTask: setters para actualizar selección
// - uid, pass: credenciales del usuario (para ProyectList)
// - description, setDescription: descripción de la actividad (no se usa aquí, pero puede ser útil en otros pasos)
// - onCancel: handler para cancelar el proceso
// - onContinue: handler para continuar al siguiente paso
// - progressInput, setProgressInput: input y setter para progreso (puede ser requerido para habilitar el botón)

import React from "react";
import { Button, ScrollView, Text, View } from "react-native";
import styles from "../AttendanceStyles";
import ProyectList from "../otros/ProyectList";
import { WelcomeStepProps } from "./AttendanceStepTypes";

/**
 * Componente de paso de bienvenida.
 * Permite seleccionar proyecto y tarea, y muestra botones para continuar o cancelar.
 * Incluye campo de progreso si es necesario.
 */
export function WelcomeStep(props: WelcomeStepProps) {
  const {
    loading,
    onCheckIn,
    selectedProject,
    selectedTask,
    setSelectedProject,
    setSelectedTask,
    uid,
    pass,
    onCancel,
  } = props;

      // Utilidad para saber si la tarea seleccionada está completada
  const isSelectedTaskDone = selectedTask && selectedTask.stage_id && selectedTask.stage_id[1] &&
    (selectedTask.stage_id[1].toLowerCase().includes('completado') || selectedTask.stage_id[1].toLowerCase().includes('closed'));

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Título de bienvenida */}
      <Text style={styles.welcome}>¡Bienvenido!</Text>
      {/* Selector de proyecto y tarea */}
      <ProyectList
        uid={uid}
        pass={pass}
        selectedProject={selectedProject}
        selectedTask={selectedTask}
        onSelectProject={setSelectedProject}
        onSelectTask={setSelectedTask}
      />
      {/* Botones de acción */}
      <View style={styles.buttonRow}>
        <View style={[styles.button, { backgroundColor: "#bdbdbd" }]}> 
          <Button
            title="Cancelar"
            color="#333"
            onPress={onCancel}
            disabled={loading}
          />
        </View>
        <View style={[styles.button, { backgroundColor: "#1976d2" }]}> 
          <Button
            title="Entrada"
            color="#fff"
            onPress={onCheckIn}
            disabled={
              loading || !selectedProject || !selectedTask || isSelectedTaskDone
            }
          />
        </View>
      </View>
    </ScrollView>
  );
}
