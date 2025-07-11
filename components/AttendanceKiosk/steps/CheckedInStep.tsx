import { Button, Text, View } from "react-native";
import styles from "../AttendanceStyles";
import { CheckedInStepProps } from "./AttendanceStepTypes";

export function CheckedInStep({
  checkInTime,
  onNext,
  timer,
  formatTimer,
  loading,
  selectedProject,
  selectedTask,
}: CheckedInStepProps & { selectedProject?: any; selectedTask?: any }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center', padding: 16 }}>
        <Text style={[styles.message, { textAlign: 'center', marginBottom: 16 }]}>Entrada registrada a las {checkInTime}</Text>
        {/* Mostrar proyecto y actividad actual con estilo similar al cambio de tarea */}
        {selectedProject && selectedTask && (
          <View style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e0e0e0' }}>
            <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 13, marginBottom: 2 }}>Proyecto actual:</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>{selectedProject.label || selectedProject.value || selectedProject.name}</Text>
            <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 13, marginBottom: 2 }}>Actividad actual:</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{selectedTask.label || selectedTask.value || selectedTask.name}</Text>
          </View>
        )}
        <View style={[styles.centered, { marginBottom: 16, width: '100%', alignItems: 'center', justifyContent: 'center' }]}> 
          <Text style={styles.timerLabel}>Contador:</Text>
          <Text style={styles.timer}>{formatTimer(timer)}</Text>
        </View>
        <View style={[styles.buttonRow, { width: '100%', justifyContent: 'center', alignItems: 'center' }]}> 
          <View style={styles.buttonContainer}>
            <View style={[styles.button, { backgroundColor: '#b71c1c' }]}> 
              <Button title="OK" color="#b71c1c" onPress={() => { if (onNext) onNext(); }} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
