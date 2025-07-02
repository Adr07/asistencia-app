/**
 * Componente de solicitud de permisos de ubicación
 * 
 * Esta pantalla se muestra al usuario cuando no tiene permisos de ubicación
 * concedidos. Es una pantalla de bloqueo que no permite continuar sin permisos.
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

interface LocationPermissionScreenProps {
  onRequestPermission: () => Promise<void>;
  error?: string | null;
  isLoading?: boolean;
}

export function LocationPermissionScreen({
  onRequestPermission,
  error,
  isLoading = false,
}: LocationPermissionScreenProps) {

  const handleOpenSettings = () => {
    Alert.alert(
      'Permisos de ubicación requeridos',
      'Para habilitar los permisos de ubicación, ve a Configuración > Aplicaciones > Asistencia App > Permisos y activa la ubicación.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir configuración', onPress: () => Linking.openSettings() },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Icono de ubicación */}
        <View style={styles.iconContainer}>
          <Text style={styles.locationIcon}>📍</Text>
        </View>

        {/* Título */}
        <ThemedText style={styles.title}>
          Permisos de ubicación requeridos
        </ThemedText>

        {/* Descripción */}
        <ThemedText style={styles.description}>
          Esta aplicación necesita acceso a tu ubicación para verificar que estés en el lugar de trabajo al registrar tu asistencia.
        </ThemedText>

        <ThemedText style={styles.subDescription}>
          Los permisos de ubicación son obligatorios para garantizar la seguridad y precisión del registro de asistencia.
        </ThemedText>

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        {/* Botones */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={onRequestPermission}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Solicitando permisos...' : 'Conceder permisos'}
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
        </View>

        {/* Información adicional */}
        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoText}>
            ℹ️ La aplicación no puede funcionar sin estos permisos
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 350,
  },
  iconContainer: {
    marginBottom: 24,
  },
  locationIcon: {
    fontSize: 64,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  subDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    fontSize: 14,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  infoText: {
    color: '#1976d2',
    fontSize: 12,
    textAlign: 'center',
  },
});
