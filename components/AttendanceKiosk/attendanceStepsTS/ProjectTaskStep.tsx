import React from "react";
import { Button, ScrollView, Text, TextInput, View } from "react-native";
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
  console.log('[DEBUG][ProjectTaskStep] Props received:', {
    mode: props.mode,
    pendingProject: props.pendingProject,
    pendingTask: props.pendingTask,
    safeSetPendingProject: !!props.safeSetPendingProject,
    safeSetPendingTask: !!props.safeSetPendingTask
  });
  
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
    safeSetPendingProject,
    safeSetPendingTask,
    handleChangeTaskFlow,
    progressInput,
    setProgressInput,
  } = props;

  // En modo changing_task, solo actualizar pendingProject/pendingTask, no selectedProject/selectedTask
  const handleSelectProject = (project: any) => {
    console.log('[DEBUG] ===== handleSelectProject START =====');
    console.log('[DEBUG] handleSelectProject called with:', project, 'mode:', mode);
    console.log('[DEBUG] safeSetPendingProject available?', !!safeSetPendingProject);
    if (mode === "changing_task" && safeSetPendingProject) {
      console.log('[DEBUG] Setting pending project:', project);
      safeSetPendingProject(project);
      console.log('[DEBUG] After setting pending project');
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.__logPendingProject) {
          window.__logPendingProject();
        }
      }, 0);
      return;
    }
    console.log('[DEBUG] Setting selected project (not changing_task mode):', project);
    setSelectedProject && setSelectedProject(project);
    console.log('[DEBUG] ===== handleSelectProject END =====');
  };
  const handleSelectTask = (task: any) => {
    console.log('[DEBUG] ===== handleSelectTask START =====');
    console.log('[DEBUG] handleSelectTask called with:', task, 'mode:', mode);
    console.log('[DEBUG] safeSetPendingTask available?', !!safeSetPendingTask);
    if (mode === "changing_task" && safeSetPendingTask) {
      console.log('[DEBUG] Setting pending task:', task);
      safeSetPendingTask(task);
      console.log('[DEBUG] After setting pending task');
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.__logPendingTask) {
          window.__logPendingTask();
        }
      }, 0);
      return;
    }
    console.log('[DEBUG] Setting selected task (not changing_task mode):', task);
    setSelectedTask && setSelectedTask(task);
    console.log('[DEBUG] ===== handleSelectTask END =====');
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
    console.log('[DEBUG][ProjectTaskStep] handleContinueSafe called, onContinue available?', !!onContinue);
    console.log('[DEBUG][ProjectTaskStep] Current values - pendingProject:', pendingProject, 'pendingTask:', pendingTask);
    if (onContinue) {
      console.log('[DEBUG][ProjectTaskStep] Calling onContinue...');
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
      console.log('[DEBUG][ProjectTaskStep] projectListSelectedProject:', projectListSelectedProject);
      console.log('[DEBUG][ProjectTaskStep] projectListSelectedTask:', projectListSelectedTask);
      const isDisabled = mode === "changing_task" ? (loading || !pendingProject || !pendingTask) : (loading || !selectedProject || !selectedTask);
      console.log('[DEBUG][ProjectTaskStep] Continue button disabled?', isDisabled);
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
          console.log('[DEBUG] ProyectList onSelectProject wrapper called with:', project);
          handleSelectProject(project);
        }}
        onSelectTask={(task) => {
          console.log('[DEBUG] ProyectList onSelectTask wrapper called with:', task);
          handleSelectTask(task);
        }}
        hideTitle={mode === "changing_task"}
      />
      {/* Campo de progreso solo en modo changing_task */}
      {mode === "changing_task" && (
        <View style={{ marginVertical: 10 }}>
          <Text style={styles.message}>Avance:</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 8,
              marginBottom: 12,
              width: "100%",
              fontSize: 16,
            }}
            placeholder="Introduce un valor entre 1 y 100"
            keyboardType="number-pad"
            value={progressInput ?? ""}
            onChangeText={(val: string) => {
              let num = val.replace(/[^0-9]/g, "");
              if (num === "") {
                setProgressInput && setProgressInput("");
                return;
              }
              if (parseInt(num) > 100) num = "100";
              setProgressInput && setProgressInput(num);
            }}
            maxLength={3}
          />
        </View>
      )}
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
