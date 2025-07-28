// components/otros/utils.ts
import { Platform } from 'react-native';

export function showMessage(title: string, message?: string | object) {
  let text = title;
  if (message) {
    if (typeof message === 'object') {
      // Mostrar mensaje de Odoo si existe, si no, serializar el objeto
      if ((message as any).data && (message as any).data.message) {
        text += `\n\n${(message as any).data.message}`;
      } else if ((message as any).message) {
        text += `\n\n${(message as any).message}`;
      } else {
        text += `\n\n${JSON.stringify(message, null, 2)}`;
      }
    } else {
      text += `\n\n${message}`;
    }
  }
  if (Platform.OS === 'web') {
    // Eliminado alert de entrada registrada
  } else {
    // Eliminado alert de entrada registrada
  }
}
