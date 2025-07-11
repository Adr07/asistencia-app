import { Button, ScrollView, Text, TextInput, View } from "react-native";
import styles from "../AttendanceStyles";
import { ProjectTaskStepProps } from "./AttendanceStepTypes";

import ProjectTaskDropdowns from "../otros/ProjectTaskDropdowns";

import React from "react";

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
  // Eliminado: log de observaciones innecesario y campo opcional

  // En modo changing_task, usar los pending y los setters safe
  const projectListSelectedProject = mode === "changing_task" ? pendingProject : selectedProject;
  const projectListSelectedTask = mode === "changing_task" ? pendingTask : selectedTask;
  const projectListSetProject = mode === "changing_task" && safeSetPendingProject ? safeSetPendingProject : setSelectedProject;
  const projectListSetTask = mode === "changing_task" && safeSetPendingTask ? safeSetPendingTask : setSelectedTask;



  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ width: '100%', maxWidth: 500, alignSelf: 'center' }}>
        <Text style={[styles.welcome, { textAlign: 'center', marginBottom: 16 }]}> 
          {mode === "welcome" ? "¡Bienvenido!" : "Selecciona nueva tarea"}
        </Text>
        <ProjectTaskDropdowns
          uid={uid}
          pass={pass}
          selectedProject={projectListSelectedProject}
          selectedTask={projectListSelectedTask}
          onSelectProject={projectListSetProject}
          onSelectTask={projectListSetTask}
          hideTitle={mode === "changing_task"}
          pedirAvanceMsg={pedirAvanceMsg}
          currentProject={currentProject}
          currentTask={currentTask}
        />

        {/* Mostrar campo de avance solo si pedirAvanceMsg es un mensaje (no "no") */}
        {pedirAvanceMsg && pedirAvanceMsg !== "no" ? (
          <View style={{ marginVertical: 16, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <TextInput
              placeholder="Ingresa el avance"
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
                width: '50%',
                textAlign: 'left',
                alignSelf: 'center',
              }}
            />
          </View>
        ) : null}

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
                    if (onCheckIn) onCheckIn(observaciones || "");
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
                  onPress={onContinue}
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
