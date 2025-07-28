import React from "react";
import { Button, ScrollView, Text, TextInput, View } from "react-native";
import styles from "../AttendanceStyles";
import { ProjectTaskStepProps } from "./AttendanceStepTypes";

import { getLocationWeb } from '../../../utils/getLocationWeb';
import ProjectTaskDropdowns from "../otros/ProjectTaskDropdowns";

export function ProjectTaskStep({
  loading,
  uid,
  pass,
  selectedProject,
  selectedTask,
  setSelectedProject,
  setSelectedTask,
  observaciones,
  setObservaciones,
  avanceInput,
  setAvanceInput,
  onCheckIn,
  onLogout,
  onCancel,
  onContinue,
  mode,
  continueButtonColor,
  pedirAvanceMsg,
  pendingProject,
  pendingTask,
  safeSetPendingProject,
  safeSetPendingTask,
  currentProject,
  currentTask,
}: ProjectTaskStepProps) {
  // Estado para la geolocalización
  const [location, setLocation] = React.useState<{ latitude?: number; longitude?: number } | null>(null);
  // Obtener localización web/electron y mostrar en log al principio del flujo
  React.useEffect(() => {
    getLocationWeb().then((loc) => {
      if (loc) {
        setLocation(loc);
        console.log('[ProjectTaskStep] Localización obtenida:', loc);
      } else {
        setLocation(null);
        console.log('[ProjectTaskStep] No se pudo obtener la localización');
      }
    });
  }, []);
  // Obtener localización web/electron y mostrar en log al principio del flujo
  React.useEffect(() => {
    getLocationWeb().then((location) => {
      if (location) {
        console.log('[ProjectTaskStep] Localización obtenida:', location);
      } else {
        console.log('[ProjectTaskStep] No se pudo obtener la localización');
      }
    });
  }, []);
  // Eliminado: log de observaciones innecesario y campo opcional

  // En modo changing_task, usar los pending y los setters safe
  const projectListSelectedProject = mode === "changing_task" ? pendingProject : selectedProject;
  const projectListSelectedTask = mode === "changing_task" ? pendingTask : selectedTask;
  const projectListSetProject = mode === "changing_task" && safeSetPendingProject ? safeSetPendingProject : setSelectedProject;
  const projectListSetTask = mode === "changing_task" && safeSetPendingTask ? safeSetPendingTask : setSelectedTask;

  // Log para depuración de props
  React.useEffect(() => {
  }, [projectListSelectedProject, projectListSelectedTask, currentProject, currentTask]);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ width: '100%', maxWidth: 500, alignSelf: 'center' }}>
        <Text
          style={
            mode === "welcome"
              ? { ...styles.welcome, textAlign: 'center', marginBottom: 16, color: '#fff' }
              : { ...styles.welcome, textAlign: 'center', marginBottom: 16, color: '#333' }
          }
        >
          {mode === "welcome" ? "¡Bienvenido!" : "Selecciona nueva tarea"}
        </Text>
        {/* Geolocalización eliminada de la pantalla */}
        <ProjectTaskDropdowns
          uid={uid}
          pass={pass}
          selectedProject={projectListSelectedProject}
          selectedTask={projectListSelectedTask}
          onSelectProject={projectListSetProject}
          onSelectTask={projectListSetTask}
          hideTitle={mode === "changing_task"}
          pedirAvanceMsg={pedirAvanceMsg}
          currentProject={mode === "changing_task" ? pendingProject : currentProject}
          currentTask={mode === "changing_task" ? pendingTask : currentTask}
        />

        {/* Mostrar campo de avance solo si pedirAvanceMsg es válido y distinto de 'no' */}
        {pedirAvanceMsg && pedirAvanceMsg !== "no" && (
          <View style={{ marginVertical: 16, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <TextInput
              placeholder="Ingresa el avance (%)"
              keyboardType="numeric"
              value={typeof avanceInput === 'string' ? avanceInput : ''}
              onChangeText={setAvanceInput ? setAvanceInput : () => {}}
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 6,
                padding: 8,
                fontSize: 16,
                backgroundColor: '#fff',
                width: '100%',
                textAlign: 'left',
              }}
            />
          </View>
        )}

        <View
          style={
            mode === "welcome"
              ? [styles.buttonRow, { width: '100%', justifyContent: 'center', alignItems: 'center' }]
              : [styles.buttonRow, { marginBottom: 24, width: '100%', justifyContent: 'center', alignItems: 'center' }]
          }
        >
          {mode === "welcome" ? (
            <>
              {onLogout && (
                <View style={styles.button}> 
                  <Button
                    title="Cerrar sesión"
                    color="#b71c1c"
                    onPress={onLogout}
                  />
                </View>
              )}
              <View style={styles.button}> 
                <Button
                  title="Entrada"
                  color="#b71c1c"
                  onPress={() => {
                    if (onCheckIn) onCheckIn(observaciones || "", location);
                  }}
                  disabled={loading || !selectedProject || !selectedTask}
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.button}> 
                <Button
                  title="Cancelar"
                  color="#b71c1c"
                  onPress={onCancel}
                  disabled={loading}
                />
              </View>
              <View style={styles.button}> 
                <Button
                  title="Continuar"
                  color="#b71c1c"
                  onPress={() => {
                    if (onContinue) onContinue(location);
                  }}
                  disabled={loading || !selectedProject || !selectedTask}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
