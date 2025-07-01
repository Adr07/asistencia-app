import React from "react";
import { View, Text, Button, ScrollView } from "react-native";
import ProyectList from "../otros/ProyectList";
import styles from "../AttendanceStyles";
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
    description,
    setDescription,
    onCheckIn,
    onLogout,
    onCancel,
    onContinue,
    mode,
    continueButtonColor,
    pendingProject,
    pendingTask,
    setPendingProject,
    setPendingTask,
    handleChangeTaskFlow,
  } = props;

  // En modo changing_task, solo actualizar pendingProject/pendingTask, no selectedProject/selectedTask
  const handleSelectProject = (project: any) => {
    if (props.mode === "changing_task" && props.setPendingProject) {
      props.setPendingProject(project);
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.__logPendingProject) {
          window.__logPendingProject();
        }
      }, 0);
      return;
    }
    props.setSelectedProject && props.setSelectedProject(project);
  };
  const handleSelectTask = (task: any) => {
    if (props.mode === "changing_task" && props.setPendingTask) {
      props.setPendingTask(task);
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.__logPendingTask) {
          window.__logPendingTask();
        }
      }, 0);
      return;
    }
    props.setSelectedTask && props.setSelectedTask(task);
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
      console.log('[DEBUG][ProjectTaskStep] pendingProject:', pendingProject);
      console.log('[DEBUG][ProjectTaskStep] pendingTask:', pendingTask);
    }
  }, [mode, pendingProject, pendingTask]);

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
        onSelectProject={handleSelectProject}
        onSelectTask={handleSelectTask}
        hideTitle={mode === "changing_task"}
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
