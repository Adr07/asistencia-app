import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useRef, useState } from "react";
import { Button, Switch, Text, TextInput, View } from "react-native";
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
  selectedProject,
  selectedTask,
}: BeforeCheckoutStepProps & { selectedProject?: any; selectedTask?: any }) {
  // Ref para mantener el valor más reciente
  const observacionesRef = useRef("");
  // Estado para el switch on/off
  const [avanceSwitch, setAvanceSwitch] = useState(false);
  // Siempre mantener el valor más reciente del input
  React.useEffect(() => {
    observacionesRef.current = observaciones;
  }, [observaciones]);

  React.useEffect(() => {
    return () => {};
  }, []);



  // (Eliminado: Forzar el paso a before_checkout para depuración)
  // Log después de escribir en el campo (onChangeText ya lo tiene, pero lo dejamos explícito)
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16, marginTop: 16 }}>
      <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center' }}>
        
        {/* Bolsa de horas */}
        {workedHours && (
          <Text style={{ textAlign: 'center', marginBottom: 16, color: '#1976d2', fontWeight: 'bold' }}>
            Bolsa de horas: {workedHours}
          </Text>
        )}
        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[styles.message, { textAlign: 'center' }]  }>¿Registrar salida?</Text>
        </View>
        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <View style={[styles.centered, { width: '100%', alignItems: 'center', justifyContent: 'center' }]}> 
            <Text style={styles.timerLabel}>Contador:</Text>
            <Text style={styles.timer}>{formatTimer(timer)}</Text>
          </View>
        </View>

        {/* Mostrar proyecto y actividad actual con estilo similar al cambio de tarea */}
      {selectedProject && selectedTask && (
        <View style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e0e0e0' }}>
          <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 13, marginBottom: 2 }}>Proyecto actual:</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>{selectedProject.label || selectedProject.value || selectedProject.name}</Text>
          <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 13, marginBottom: 2 }}>Actividad actual:</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{selectedTask.label || selectedTask.value || selectedTask.name}</Text>
        </View>
      )}

        {/* Campo de avance antes de check-out */}
        {typeof avanceInput !== 'undefined' && typeof setAvanceInput === 'function' && (
          <View style={{ marginVertical: 5, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
            {/* Labels en la misma fila */}
            <View style={{ flexDirection: 'row', width: '100%', marginBottom: 4, alignItems: 'center' }}>
              <View style={{ flex: 7, justifyContent: 'center' }}>
                <Text style={[styles.message, { textAlign: 'left', marginLeft: 2 }]}>Avance</Text>
              </View>
              <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                <Text style={{ fontSize: 15, color: '#888', fontWeight: 'bold', textAlign: 'center', marginLeft: 2 }}>Calidad</Text>
              </View>
            </View>
            {/* Campos en la misma fila */}
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ flex: 6}}>
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
                  }}
                  placeholder="Porcentaje de avance..."
                  value={avanceInput}
                  onChangeText={setAvanceInput}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
                <Switch
                  value={avanceSwitch}
                  onValueChange={setAvanceSwitch}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={avanceSwitch ? '#f5dd4b' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                />
              </View>
            </View>
          </View>
        )}

        {/* Campo de observaciones antes de check-out */}
        <View style={{ marginVertical: 5, width: '100%', alignItems: 'center'}}>
          <Text style={[styles.message, { textAlign: 'center' }]}>Observaciones:</Text>
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
            }}
            placeholder="Describe lo realizado en esta actividad..."
            value={observaciones}
            onChangeText={(text) => {
              observacionesRef.current = text;
              setObservaciones(text);
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
                onCheckOut(observacionesRef.current, avanceSwitch);
                // El único log de depuración debe estar en attendanceManual
              }}
              disabled={loading}
            />
          </View>
          <View style={[styles.button, { backgroundColor: '#FFA726', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}> 
            <MaterialIcons name="autorenew" color="#fff" size={22} style={{ marginRight: 6 }} />
            <Button
              title="Cambiar actividad"
              color="#FFA726"
              onPress={() => onChangeTask()}
            />
          </View>
        </View>
      
      </View>
    </View>
  );
}
