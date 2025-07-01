import React from "react";
import { View, Text, Button } from "react-native";
import styles from "../AttendanceStyles";
import { CheckedOutStepProps } from "../attendanceStepsTS/AttendanceStepTypes";

export function CheckedOutStep({
  checkOutTime,
  workedHours,
  fullTime,
  onRestart,
  onLogout,
}: CheckedOutStepProps) {
  return (
    <View>
      <Text style={styles.timerLabel}>
        Salida registrada a las {checkOutTime}
      </Text>
      <Text style={styles.timerLabel}>Tiempo trabajado:</Text>
      <Text style={styles.timer}>{fullTime}</Text>
      {onLogout ? (
        <View style={styles.buttonRow}>
          <View style={styles.button}>
            <Button title="ADIÓS" onPress={onRestart} />
          </View>
          <View style={styles.button}>
            <Button title="Cerrar sesión" color="#b71c1c" onPress={onLogout} />
          </View>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <View style={styles.button}>
            <Button title="ADIÓS" onPress={onRestart} />
          </View>
        </View>
      )}
    </View>
  );
}
