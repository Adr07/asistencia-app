import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

import { DEFAULT_RPC_URL, resetRpcUrl, RPC_URL, setRpcUrl } from '../../components/AttendanceKiosk/otros/config';


export default function SettingsScreen() {
  const [url, setUrlState] = useState(RPC_URL);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setRpcUrl(url);
    setSaved(true);
    Alert.alert('Configuración', 'URL de Odoo actualizada.');
  };

  const handleReset = () => {
    setUrlState(DEFAULT_RPC_URL);
    resetRpcUrl();
    setSaved(false);
    Alert.alert('Configuración', 'URL restablecida a la original.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajustes de conexión Odoo</Text>
      <Text style={styles.label}>URL de Odoo (RPC_URL):</Text>
      <TextInput
        style={[styles.input, { textAlign: 'left' }]}
        value={url}
        onChangeText={setUrlState}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="https://..."
      />
      <View style={styles.buttonRow}>
        <Button title="Guardar" color="#b71c1c" onPress={handleSave} />
        <View style={{ width: 16 }} />
        <Button title="Restablecer" color="#b71c1c" onPress={handleReset} />
      </View>
      {saved && <Text style={styles.saved}>¡Guardado!</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#b71c1c',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    width: 320,
    fontSize: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  saved: {
    color: 'green',
    marginTop: 8,
    fontWeight: 'bold',
  },
});
