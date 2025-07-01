import React from "react";
import { View, Text, Button, TextInput } from "react-native";
import styles from "../AttendanceStyles";
import { BeforeCheckoutStepProps } from "../attendanceStepsTS/AttendanceStepTypes";

export function BeforeCheckoutStep({
  workedHours,
  onCheckOut,
  onChangeTask,
  loading,
  timer,
  formatTimer,
  description,
  setDescription,
  // progressInput,
  // setProgressInput,
}: BeforeCheckoutStepProps) {
  return (
    <View>
      <Text style={styles.message}>¿Registrar salida?</Text>
      <View style={styles.centered}>
        <Text style={styles.timerLabel}>Contador:</Text>
        <Text style={styles.timer}>{formatTimer(timer)}</Text>
      </View>
      {/* Campo de avance */}
      {/*
      <View style={{ marginVertical: 5 }}>
        <Text style={styles.message}>Porciento de Avance:</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            padding: 8,
            marginBottom: 12,
            width: "100%",
            fontSize: 16,
          }}
          placeholder="Introduce un valor entre 1 y 100"
          keyboardType="number-pad"
          value={progressInput ?? ""}
          onChangeText={(val) => {
            let num = val.replace(/[^0-9]/g, "");
            if (num === "") {
              setProgressInput && setProgressInput("");
              return;
            }
            if (parseInt(num) > 100) num = "100";
            setProgressInput && setProgressInput(num);
          }}
          maxLength={3}
        />
      </View>
      */}
      {/* Campo de descripción antes de check-out */}
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
      <View style={styles.buttonRow}>
        <View style={[styles.button, { backgroundColor: "#D32F2F" }]}> 
          <Button
            title="Salida"
            color="#b71c1c"
            onPress={onCheckOut} // Usar directamente el handler pasado por props
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
