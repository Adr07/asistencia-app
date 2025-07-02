/**
 * Wrapper de permisos de ubicación
 * 
 * Este componente envuelve toda la aplicación y garantiza que
 * los permisos de ubicación estén concedidos antes de mostrar
 * el contenido principal de la app.
 */

import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useLocationPermission } from '../hooks/useLocationPermission';
import { LocationPermissionScreen } from './LocationPermissionScreen';
import { ThemedView } from './ThemedView';

interface LocationPermissionWrapperProps {
  children: React.ReactNode;
}

export function LocationPermissionWrapper({ children }: LocationPermissionWrapperProps) {
  const { hasPermission, isLoading, error, requestPermission } = useLocationPermission();

  // Mostrar loading mientras se verifican los permisos
  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </ThemedView>
    );
  }

  // Si no hay permisos, mostrar la pantalla de solicitud
  if (!hasPermission) {
    return (
      <LocationPermissionScreen
        onRequestPermission={requestPermission}
        error={error}
        isLoading={isLoading}
      />
    );
  }

  // Si hay permisos, mostrar la app normal
  return <>{children}</>;
}
