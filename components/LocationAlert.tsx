/**
 * Componente de alerta para problemas de ubicación
 * 
 * Muestra mensajes específicos cuando no se puede obtener la ubicación
 * y proporciona acciones para que el usuario pueda solucionarlo.
 */

import React from 'react';
import {
    Alert,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface LocationAlertProps {
  visible: boolean;
  message: string;
  onRetry: () => void;
  onCancel?: () => void;
}

export function LocationAlert({ visible, message, onRetry, onCancel }: LocationAlertProps) {
  if (!visible) return null;

  const handleOpenSettings = () => {
    Alert.alert(
      'Abrir configuración',
      'Para activar la ubicación, ve a Configuración > Aplicaciones > Asistencia App > Permisos y activa la ubicación. También asegúrate de que el GPS esté activado en los ajustes del dispositivo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir configuración', onPress: () => Linking.openSettings() },
      ]
    );
  };

  return (
    <ThemedView style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Icono de alerta */}
          <View style={styles.iconContainer}>
            <Text style={styles.alertIcon}>⚠️</Text>
          </View>

          {/* Título */}
          <ThemedText style={styles.title}>
            Ubicación requerida
          </ThemedText>

          {/* Mensaje específico */}
          <ThemedText style={styles.message}>
            {message}
          </ThemedText>

          <ThemedText style={styles.subMessage}>
            La ubicación es obligatoria para registrar la asistencia y verificar que estés en el lugar de trabajo.
          </ThemedText>

          {/* Botones de acción */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onRetry}
            >
              <Text style={styles.primaryButtonText}>
                Intentar nuevamente
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleOpenSettings}
            >
              <Text style={styles.secondaryButtonText}>
                Abrir configuración
              </Text>
            </TouchableOpacity>

            {onCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Información adicional */}
          <View style={styles.infoContainer}>
            <ThemedText style={styles.infoText}>
              💡 Asegúrate de que el GPS esté activado y que tengas buena señal
            </ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    maxWidth: 350,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  alertIcon: {
    fontSize: 48,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#d32f2f',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  subMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#1976d2',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  secondaryButtonText: {
    color: '#1976d2',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  infoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcc02',
  },
  infoText: {
    color: '#f57c00',
    fontSize: 12,
    textAlign: 'center',
  },
});
