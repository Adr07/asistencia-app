import React from "react";
import { View, Text, Button } from "react-native";
import styles from "../AttendanceStyles";
import { CheckedInStepProps } from "./AttendanceStepTypes";

/**
 * Paso después de hacer check-in.
 * Muestra la hora de entrada, un contador y un botón para continuar.
 */
export function CheckedInStep({
  checkInTime,
  onNext,
  timer,
  formatTimer,
}: CheckedInStepProps) {
  return (
    <View>
      {/* Mensaje de entrada registrada */}
      <Text style={styles.message}>Entrada registrada a las {checkInTime}</Text>
      {/* Contador de tiempo */}
      <View style={styles.centered}>
        <Text style={styles.timerLabel}>Contador:</Text>
        <Text style={styles.timer}>{formatTimer(timer)}</Text>
      </View>
      {/* Botón para continuar */}
      <View style={styles.buttonRow}>
        <View style={styles.buttonContainer}>
          <View style={styles.button}>
            <Button title="OK" onPress={onNext} />
          </View>
        </View>
      </View>
    </View>
  );
}
