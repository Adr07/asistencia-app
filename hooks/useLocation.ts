/**
 * Hook para capturar la ubicación actual del usuario
 * 
 * Este hook obtiene las coordenadas GPS del dispositivo para incluirlas
 * en los registros de asistencia y verificar que el empleado esté en
 * el lugar de trabajo correcto.
 */

import * as Location from 'expo-location';
import { useState } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  timestamp: number;
}

export interface UseLocationResult {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<LocationData | null>;
  clearLocation: () => void;
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Verificar que tenemos permisos
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permisos de ubicación no concedidos');
      }

      // Obtener ubicación actual con alta precisión
      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 1,
      });

      const locationData: LocationData = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
        accuracy: locationResult.coords.accuracy ?? undefined,
        altitude: locationResult.coords.altitude ?? undefined,
        timestamp: locationResult.timestamp,
      };

      setLocation(locationData);
      return locationData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener ubicación';
      setError(errorMessage);
      console.error('Error getting current location:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setError(null);
  };

  return {
    location,
    isLoading,
    error,
    getCurrentLocation,
    clearLocation,
  };
}
