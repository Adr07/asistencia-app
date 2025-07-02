/**
 * Hook para manejar permisos de ubicación
 * 
 * Este hook maneja la solicitud y verificación de permisos de ubicación.
 * La app no puede continuar sin estos permisos para garantizar que
 * los empleados estén en el lugar de trabajo al registrar asistencia.
 */

import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export interface LocationPermissionState {
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
}

export function useLocationPermission(): LocationPermissionState {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar permisos al cargar el hook
  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (err) {
      setError('Error al verificar permisos de ubicación');
      console.error('Error checking location permission:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setHasPermission(true);
      } else {
        setError('Los permisos de ubicación son obligatorios para usar esta aplicación');
        setHasPermission(false);
      }
    } catch (err) {
      setError('Error al solicitar permisos de ubicación');
      console.error('Error requesting location permission:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hasPermission,
    isLoading,
    error,
    requestPermission,
  };
}
