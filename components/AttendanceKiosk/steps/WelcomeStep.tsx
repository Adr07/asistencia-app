import React from "react";
import { ScrollView, Text, View, Button } from "react-native";
import ProyectList from "../otros/ProyectList";
import styles from "../AttendanceStyles";
import { WelcomeStepProps } from "../attendanceStepsTS/AttendanceStepTypes";

export function WelcomeStep({
  loading,
  onCheckIn,
  onLogout,
  selectedProject,
  selectedTask,
  setSelectedProject,
  setSelectedTask,
  uid,
  pass,
  description,
  setDescription,
  onCancel,
  onContinue,
  // progressInput,
  // setProgressInput,
}: WelcomeStepProps) {
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.welcome}>¡Bienvenido!</Text>
      <ProyectList
        uid={uid}
        pass={pass}
        selectedProject={selectedProject}
        selectedTask={selectedTask}
        onSelectProject={setSelectedProject}
        onSelectTask={setSelectedTask}
      />
      <View style={styles.buttonRow}>
        <View style={[styles.button, { backgroundColor: "#bdbdbd" }]}> 
          <Button
            title="Cancelar"
            color="#333"
            onPress={onCancel}
            disabled={loading}
          />
        </View>
        <View style={[styles.button, { backgroundColor: "#388e3c" }]}> 
          <Button
            title="Continuar"
            color="#fff"
            onPress={onContinue}
            disabled={
              loading || !selectedProject || !selectedTask
            }
          />
        </View>
      </View>
    </ScrollView>
  );
}
