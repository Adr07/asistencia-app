import { Button, Text, View } from "react-native";
import styles from "../AttendanceStyles";
import { CheckedOutStepProps } from "./AttendanceStepTypes";

export function CheckedOutStep({
  checkOutTime,
  workedHours,
  fullTime,
  onRestart,
  onLogout,
}: CheckedOutStepProps) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center' }}>
        <Text style={[styles.timerLabel, { textAlign: 'center', marginBottom: 16 }]}>Salida registrada a las {checkOutTime}</Text>
        <Text style={[styles.timerLabel, { textAlign: 'center' }]}>Tiempo trabajado:</Text>
        <Text style={[styles.timer, { textAlign: 'center', marginBottom: 16 }]}>{fullTime}</Text>
        {onLogout ? (
          <View style={[styles.buttonRow, { width: '100%', justifyContent: 'center', alignItems: 'center' }]}> 
            <View style={[styles.button, { backgroundColor: '#b71c1c' }]}> 
              <Button title="ADIÓS" color="#b71c1c" onPress={onRestart} />
            </View>
            <View style={[styles.button, { backgroundColor: '#b71c1c' }]}> 
              <Button title="Cerrar sesión" color="#b71c1c" onPress={onLogout} />
            </View>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <View style={[styles.button, { backgroundColor: '#b71c1c' }]}> 
              <Button title="ADIÓS" color="#b71c1c" onPress={onRestart} />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
