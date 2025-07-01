import React from "react";
import { ScrollView, Text, View, Button } from "react-native";
import ProyectList from "../otros/ProyectList";
import styles from "../AttendanceStyles";
import { ProjectTaskStepProps } from "../attendanceStepsTS/AttendanceStepTypes";

export function ProjectTaskStep({
  loading,
  uid,
  pass,
  selectedProject,
  selectedTask,
  setSelectedProject,
  setSelectedTask,
  description,
  setDescription,
  // progressInput,
  // setProgressInput,
  onCheckIn,
  onLogout,
  onCancel,
  onContinue,
  mode,
  continueButtonColor,
}: ProjectTaskStepProps) {
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
        selectedProject={selectedProject}
        selectedTask={selectedTask}
        onSelectProject={setSelectedProject}
        onSelectTask={setSelectedTask}
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
                onPress={() => {
                  if (onCheckIn) onCheckIn();
                }}
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
                onPress={onContinue}
                disabled={loading || !selectedProject || !selectedTask}
              />
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
