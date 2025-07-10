import { Button, ScrollView, Text, View } from "react-native";
import styles from "../AttendanceStyles";
import ProjectTaskDropdowns from "../otros/ProjectTaskDropdowns";
import { WelcomeStepProps } from "./AttendanceStepTypes";

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
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center' }}>
        <Text style={[styles.welcome, { textAlign: 'center', marginBottom: 16 }]}>¡Bienvenido!</Text>
        <ProjectTaskDropdowns
          uid={uid}
          pass={pass}
          selectedProject={selectedProject}
          selectedTask={selectedTask}
          onSelectProject={setSelectedProject}
          onSelectTask={setSelectedTask}
        />
        <View style={[styles.buttonRow, { width: '100%', justifyContent: 'center' }]}> 
          <View style={[styles.button, { backgroundColor: '#b71c1c' }]}> 
            <Button
              title="Cancelar"
              color="#b71c1c"
              onPress={onCancel}
              disabled={loading}
            />
          </View>
          <View style={[styles.button, { backgroundColor: '#b71c1c' }]}> 
            <Button
              title="Continuar"
              color="#b71c1c"
              onPress={onContinue}
              disabled={
                loading || !selectedProject || !selectedTask
              }
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
