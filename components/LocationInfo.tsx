/**
 * Componente para mostrar información de ubicación
 * 
 * Muestra las coordenadas GPS capturadas durante el check-in/check-out
 * de forma legible para el usuario.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LocationData } from '../hooks/useLocation';
import { formatCoordinates } from '../utils/attendanceUtils';
import { ThemedText } from './ThemedText';

interface LocationInfoProps {
  location: LocationData | null;
  label: string;
  showAccuracy?: boolean;
}

export function LocationInfo({ location, label, showAccuracy = true }: LocationInfoProps) {
  if (!location) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>📍 {label}:</ThemedText>
      <ThemedText style={styles.coordinates}>
        {formatCoordinates(location)}
      </ThemedText>
      {showAccuracy && location.accuracy && (
        <ThemedText style={styles.accuracy}>
          Precisión: ±{Math.round(location.accuracy)} metros
        </ThemedText>
      )}
      <ThemedText style={styles.timestamp}>
        {new Date(location.timestamp).toLocaleString('es-ES')}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1f5fe',
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0277bd',
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#424242',
    marginBottom: 2,
  },
  accuracy: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
  },
});
