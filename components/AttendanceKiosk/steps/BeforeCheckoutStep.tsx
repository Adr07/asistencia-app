import React, { useRef } from "react";
import { Button, Switch, Text, TextInput, View } from "react-native";
import { useColorScheme } from "../../../hooks/useColorScheme"; // o el path correcto
import { LoginErrorModal } from '../../LoginErrorModal';
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
  // Estado para el switch de calidad
  const [calidad, setCalidad] = React.useState(true);
  // Estado para el modal de error
  const [errorModalVisible, setErrorModalVisible] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  // Siempre mantener el valor más reciente del input
  React.useEffect(() => {
    observacionesRef.current = observaciones;
  }, [observaciones]);

  React.useEffect(() => {
    // ...existing code...
    return () => {
      // ...existing code...
    };
  }, []);

  // Log para saber si el componente se está renderizando y el valor de observaciones y pedirAvanceMsg
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#222";

  // Mostrar pedirAvanceMsg encima del campo observaciones, siempre, en formato Avance: "valor"
  return (
    <>
      <LoginErrorModal
        visible={errorModalVisible}
        message={errorMessage}
        onClose={() => setErrorModalVisible(false)}
      />
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center' }}>
        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[styles.message, { textAlign: 'center', marginBottom: 16, color: textColor }]}>¿Registrar salida?</Text>
        </View>
        {/* El contador va primero */}
         <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <View style={[styles.centered, { width: '100%', alignItems: 'center', justifyContent: 'center' }]}> 
            <Text style={styles.timerLabel}>Contador:</Text>
            <Text style={styles.timer}>{formatTimer(timer)}</Text>
          </View>
        </View>
        {/* ...el contador ya está arriba, este bloque duplicado se elimina... */}
        {/* Ahora el bloque de avance y switch de calidad debajo del contador */}
        <View style={{ flexDirection: 'row', width: '100%', marginBottom: 16 }}>
          {/* Campo de avance (50%) */}
          <View style={{ width: '50%', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, color: textColor, marginBottom: 4 }}>Avance</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 8,
                width: "80%",
                fontSize: 16,
                textAlign: 'center',
                color: textColor
              }}
              value={avanceInput}
              onChangeText={setAvanceInput}
              keyboardType="numeric"
            />
          </View>
          {/* Switch de calidad (50%) */}
          <View style={{ width: '50%', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, color: textColor, marginBottom: 4 }}>¿Calidad?</Text>
            <Switch
              value={calidad}
              onValueChange={setCalidad}
              trackColor={{ false: '#ccc', true: '#d32f2f' }}
              thumbColor={calidad ? '#b71c1c' : '#f4f3f4'}
              ios_backgroundColor="#ccc"
              style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
            />
          </View>
        </View>
       

        {/* Mostrar pedirAvanceMsg solo si no es 'no' */}
        {typeof pedirAvanceMsg !== 'undefined' && pedirAvanceMsg.trim().toLowerCase() !== 'no' && (
          <View style={{ marginVertical: 5, width: '100%', alignItems: 'center' }}>
            <Text style={{ textAlign: 'center', fontSize: 16, marginBottom: 4 }}>
              <Text style={{ color: '#fff' }}>Avance:</Text>
              <Text style={{ color: '#b71c1c' }}> {pedirAvanceMsg.trim() !== '' ? pedirAvanceMsg : 'ninguno'}</Text>
            </Text>
          </View>
        )}

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
              observacionesRef.current = text;
              setObservaciones(text);
              setTimeout(() => {
                // ...existing code...
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
                  setErrorMessage("Por favor, escribe una observación antes de registrar la salida.");
                  setErrorModalVisible(true);
                  return;
                }
                // Enviar calidad y avance como argumentos si onCheckOut lo soporta
                const avanceNum = avanceInput && avanceInput.trim() !== '' ? Number(avanceInput) : undefined;
                if (onCheckOut.length >= 3) {
                  onCheckOut(observacionesRef.current, calidad, avanceNum);
                } else if (onCheckOut.length === 2) {
                  onCheckOut(observacionesRef.current, calidad);
                } else {
                  onCheckOut(observacionesRef.current);
                }
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
    </>
  );
}
