import { Button, Text, View } from "react-native";
import styles from "../AttendanceStyles";
import { CheckedInStepProps } from "./AttendanceStepTypes";

export function CheckedInStep({
  checkInTime,
  onNext,
  timer,
  formatTimer,
  loading,
}: CheckedInStepProps) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center', padding: 16 }}>
        <Text style={[styles.message, { textAlign: 'center', marginBottom: 16 }]}>Entrada registrada a las {checkInTime}</Text>
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
