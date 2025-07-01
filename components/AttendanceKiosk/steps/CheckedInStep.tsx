import React from "react";
import { View, Text, Button } from "react-native";
import styles from "../AttendanceStyles";
import { CheckedInStepProps } from "../attendanceStepsTS/AttendanceStepTypes";

export function CheckedInStep({
  checkInTime,
  onNext,
  timer,
  formatTimer,
  loading,
}: CheckedInStepProps) {
  return (
    <View>
      <Text style={styles.message}>Entrada registrada a las {checkInTime}</Text>
      <View style={styles.centered}>
        <Text style={styles.timerLabel}>Contador:</Text>
        <Text style={styles.timer}>{formatTimer(timer)}</Text>
      </View>
      <View style={styles.buttonRow}>
        <View style={styles.buttonContainer}>
          <View style={styles.button}>
            <Button title="OK" onPress={() => { if (onNext) onNext(); }} />
          </View>
        </View>
      </View>
    </View>
  );
}
