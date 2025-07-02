import React from "react";
import { Button, ScrollView, Text, View } from "react-native";
import styles from "../AttendanceStyles";
import ProyectList from "../otros/ProyectList";
import { ProjectTaskStepProps } from "./AttendanceStepTypes";

declare global {
  interface Window {
    __logPendingProject?: () => void;
    __logPendingTask?: () => void;
  }
}

export function ProjectTaskStep(props: ProjectTaskStepProps) {  
  const {
    loading,
    uid,
    pass,
    selectedProject,
    selectedTask,
    setSelectedProject,
    setSelectedTask,
    onCheckIn,
    onLogout,
    onCancel,
    onContinue,
    mode,
    continueButtonColor,
    pendingProject,
    pendingTask,
    safeSetPendingProject,
    safeSetPendingTask,
    currentProject, // <-- NUEVA PROP: proyecto actual (anterior)
    currentTask,    // <-- NUEVA PROP: tarea actual (anterior)
  } = props;

  // En modo changing_task, solo actualizar pendingProject/pendingTask, no selectedProject/selectedTask
  const handleSelectProject = (project: any) => {
    if (mode === "changing_task" && safeSetPendingProject) {
      safeSetPendingProject(project);
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.__logPendingProject) {
          window.__logPendingProject();
        }
      }, 0);
      return;
    }
    setSelectedProject && setSelectedProject(project);
  };
  const handleSelectTask = (task: any) => {
    if (mode === "changing_task" && safeSetPendingTask) {
      safeSetPendingTask(task);
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.__logPendingTask) {
          window.__logPendingTask();
        }
      }, 0);
      return;
    }
    setSelectedTask && setSelectedTask(task);
  };

  // Usar pendingProject/pendingTask para el botón y para la selección visual en modo changing_task
  const isContinueDisabled = () => {
    if (mode === "changing_task") {
      return loading || !pendingProject || !pendingTask;
    }
    return loading || !selectedProject || !selectedTask;
  };

  // Pasar la selección temporal a ProyectList en modo changing_task
  const projectListSelectedProject = mode === "changing_task" ? pendingProject : selectedProject;
  const projectListSelectedTask = mode === "changing_task" ? pendingTask : selectedTask;

  // Wrapper para el botón Continuar: en modo changing_task ejecuta directamente el handler del padre con los valores seleccionados actuales
  const handleContinueSafe = () => {
    if (onContinue) {
      onContinue(); // Ya no recibe argumentos
    }
  };

  // Efecto: si ambos pendingProject y pendingTask están presentes en modo changing_task, NO ejecutar onContinue aquí
  // El handler debe ejecutarse solo en el padre
  React.useEffect(() => {
    // Solo ejecuta cuando cambian los valores relevantes
  }, [mode, pendingProject, pendingTask]);

  // Debug para ver qué proyecto/tarea se selecciona en modo changing_task
  React.useEffect(() => {
    if (mode === "changing_task") {
      const isDisabled = mode === "changing_task" ? (loading || !pendingProject || !pendingTask) : (loading || !selectedProject || !selectedTask);
    }
  }, [mode, pendingProject, pendingTask, loading, selectedProject, selectedTask, projectListSelectedProject, projectListSelectedTask]);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.welcome}>
        {mode === "welcome" ? "¡Bienvenido!" : "Selecciona nueva tarea"}
      </Text>
      <ProyectList
        uid={uid}
        pass={pass}
        selectedProject={projectListSelectedProject}
        selectedTask={projectListSelectedTask}
        onSelectProject={(project) => {
          handleSelectProject(project);
        }}
        onSelectTask={(task) => {
          handleSelectTask(task);
        }}
        hideTitle={mode === "changing_task"}
        currentProject={mode === "changing_task" ? currentProject : undefined}
        currentTask={mode === "changing_task" ? currentTask : undefined}
      />
      <View
        style={
          mode === "welcome"
            ? styles.buttonRow
            : [styles.buttonRow, { marginBottom: 24 }]
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
                onPress={onCheckIn}
                disabled={loading || !selectedProject || !selectedTask}
              />
            </View>
          </>
        ) : (
          <>
            <View style={[styles.button, { backgroundColor: "#bdbdbd" }]}> 
              <Button
                title="Cancelar"
                color="#333"
                onPress={onCancel}
                disabled={loading}
              />
            </View>
            <View
              style={[
                styles.button,
                { backgroundColor: continueButtonColor || "#388e3c" },
              ]}
            >
              <Button
                title="Continuar"
                onPress={handleContinueSafe}
                disabled={isContinueDisabled()}
              />
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
