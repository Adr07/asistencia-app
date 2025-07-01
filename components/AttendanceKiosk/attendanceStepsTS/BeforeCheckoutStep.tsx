import React from "react";
import { View, Text, Button, TextInput } from "react-native";
import styles from "../AttendanceStyles";
import { BeforeCheckoutStepProps } from "./AttendanceStepTypes";

/**
 * Paso antes de hacer check-out.
 * Permite ingresar el porcentaje de avance y una descripción, y muestra botones para salida o cambio de tarea.
 */
export function BeforeCheckoutStep({
  workedHours,
  onCheckOut,
  onChangeTask,
  loading,
  timer,
  formatTimer,
  description,
  setDescription,
}: BeforeCheckoutStepProps) {
  return (
    <View>
      {/* Mensaje y contador */}
      <Text style={styles.message}>¿Registrar salida?</Text>
      <View style={styles.centered}>
        <Text style={styles.timerLabel}>Contador:</Text>
        <Text style={styles.timer}>{formatTimer(timer)}</Text>
      </View>
      {/* Campo de descripción */}
      <View style={{ marginVertical: 5 }}>
        <Text style={styles.message}>Descripción:</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            padding: 8,
            marginBottom: 12,
            width: "100%",
            fontSize: 16,
            minHeight: 80, 
            textAlignVertical: 'top', 
          }}
          placeholder="Describe lo realizado en esta tarea..."
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>
      {/* Botones de acción */}
      <View style={styles.buttonRow}>
        <View style={[styles.button, { backgroundColor: "#D32F2F" }]}> 
          <Button
            title="Salida"
            color="#b71c1c"
            onPress={() => onCheckOut()}
            disabled={loading}
          />
        </View>
        <View style={[styles.button, { backgroundColor: "#f57f17" }]}> 
          <Button
            title="Cambiar tarea"
            color="#f57f17"
            onPress={() => onChangeTask()}
          />
        </View>
      </View>
    </View>
  );
}
