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
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LocationPermissionScreenStyles from './LocationPermissionScreenStyles';
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
    <ThemedView style={LocationPermissionScreenStyles.container}>
      <View style={LocationPermissionScreenStyles.content}>
        {/* Icono de ubicación */}
        <View style={LocationPermissionScreenStyles.iconContainer}>
          <Text style={LocationPermissionScreenStyles.locationIcon}>📍</Text>
        </View>

        {/* Título */}
        <ThemedText style={LocationPermissionScreenStyles.title}>
          Permisos de ubicación requeridos
        </ThemedText>

        {/* Descripción */}
        <ThemedText style={LocationPermissionScreenStyles.description}>
          Esta aplicación necesita acceso a tu ubicación para verificar que estés en el lugar de trabajo al registrar tu asistencia.
        </ThemedText>

        <ThemedText style={LocationPermissionScreenStyles.subDescription}>
          Los permisos de ubicación son obligatorios para garantizar la seguridad y precisión del registro de asistencia.
        </ThemedText>

        {/* Error message */}
        {error && (
          <View style={LocationPermissionScreenStyles.errorContainer}>
            <ThemedText style={LocationPermissionScreenStyles.errorText}>{error}</ThemedText>
          </View>
        )}

        {/* Botones */}
        <View style={LocationPermissionScreenStyles.buttonContainer}>
          <TouchableOpacity
            style={[LocationPermissionScreenStyles.button, LocationPermissionScreenStyles.primaryButton]}
            onPress={onRequestPermission}
            disabled={isLoading}
          >
            <Text style={LocationPermissionScreenStyles.primaryButtonText}>
              {isLoading ? 'Solicitando permisos...' : 'Conceder permisos'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[LocationPermissionScreenStyles.button, LocationPermissionScreenStyles.secondaryButton]}
            onPress={handleOpenSettings}
          >
            <Text style={LocationPermissionScreenStyles.secondaryButtonText}>
              Abrir configuración
            </Text>
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View style={LocationPermissionScreenStyles.infoContainer}>
          <ThemedText style={LocationPermissionScreenStyles.infoText}>
            ℹ️ La aplicación no puede funcionar sin estos permisos
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

