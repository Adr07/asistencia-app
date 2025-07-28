import React, { useRef } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { useColorScheme } from "../../../hooks/useColorScheme"; // o el path correcto
import styles from "../AttendanceStyles";
import { BeforeCheckoutStepProps } from "./AttendanceStepTypes";

export function BeforeCheckoutStep({
  workedHours,
  onCheckOut,
  onChangeTask,
  loading,
  timer,
  formatTimer,
  observaciones,
  setObservaciones,
  avanceInput,
  setAvanceInput,
  pedirAvanceMsg,
}: BeforeCheckoutStepProps) {
  // Ref para mantener el valor más reciente
  const observacionesRef = useRef("");
  // Siempre mantener el valor más reciente del input
  React.useEffect(() => {
    observacionesRef.current = observaciones;
  }, [observaciones]);

  React.useEffect(() => {
    console.log('[BeforeCheckoutStep] MONTAJE O CAMBIO DE PASO before_check_out');
    return () => {
      console.log('[BeforeCheckoutStep] DESMONTAJE before_check_out');
    };
  }, []);

  // Log para saber si el componente se está renderizando y el valor de observaciones y pedirAvanceMsg
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#222";

  // Mostrar pedirAvanceMsg encima del campo observaciones, siempre, en formato Avance: "valor"
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center' }}>
        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[styles.message, { textAlign: 'center', marginBottom: 16 }]}>¿Registrar salida?</Text>
        </View>
        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <View style={[styles.centered, { width: '100%', alignItems: 'center', justifyContent: 'center' }]}> 
            <Text style={styles.timerLabel}>Contador:</Text>
            <Text style={styles.timer}>{formatTimer(timer)}</Text>
          </View>
        </View>

        {/* Campo de avance antes de check-out */}
        {typeof avanceInput !== 'undefined' && typeof setAvanceInput === 'function' && (
          <View style={{ marginVertical: 5, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={[styles.message, { textAlign: 'center',  color: textColor }]}>Avance:</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 8,
                marginBottom: 12,
                width: "100%",
                fontSize: 16,
                textAlign: 'left',
                 color: textColor
              }}
              placeholder="Porcentaje de avance..."
              value={avanceInput}
              onChangeText={setAvanceInput}
              keyboardType="numeric"
            />
          </View>
        )}

        {/* Mostrar pedirAvanceMsg encima del campo observaciones en rojo, siempre, con formato Avance: "valor" */}
        <View style={{ marginVertical: 5, width: '100%', alignItems: 'center' }}>
          <Text style={{ textAlign: 'center', fontSize: 16, marginBottom: 4 }}>
            <Text style={{ color: '#fff' }}>Avance:</Text>
            <Text style={{ color: '#b71c1c' }}> {typeof pedirAvanceMsg !== 'undefined' && pedirAvanceMsg.trim() !== '' ? pedirAvanceMsg : 'ninguno'}</Text>
          </Text>
        </View>

        {/* Campo de observaciones antes de check-out */}
        <View style={{ marginVertical: 5, width: '100%', alignItems: 'center'}}>
          <Text style={[styles.message, { textAlign: 'center',  color: textColor }]}>Observaciones:</Text>
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
              textAlign: 'left',
               color: textColor
            }}
            placeholder="Describe lo realizado en esta actividad..."
            value={observaciones}
            onChangeText={(text) => {
              console.log('[BeforeCheckoutStep] onChangeText observaciones (input):', text);
              observacionesRef.current = text;
              setObservaciones(text);
              setTimeout(() => {
                console.log('[BeforeCheckoutStep] POST setObservaciones observaciones (valor en estado):', observacionesRef.current);
              }, 0);
            }}
            multiline
          />
        </View>

        <View style={[styles.buttonRow, { justifyContent: 'center', width: '100%', alignItems: 'center' }]}> 
          <View style={[styles.button, { backgroundColor: '#b71c1c' }]}> 
            <Button
              title="Salida"
              color="#b71c1c"
              onPress={() => {
                if (!observacionesRef.current || observacionesRef.current.trim() === "") {
                  alert("Por favor, escribe una observación antes de registrar la salida.");
                  return;
                }
                console.log('[BeforeCheckoutStep] ENVIO FINAL observaciones:', observacionesRef.current);
                onCheckOut(observacionesRef.current);
              }}
              disabled={loading}
            />
          </View>
          <View style={[styles.button, { backgroundColor: '#b71c1c' }]}> 
            <Button
              title="Cambiar tarea"
              color="#b71c1c"
              onPress={() => onChangeTask()}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
