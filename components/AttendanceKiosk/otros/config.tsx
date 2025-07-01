// components/otros/config.ts

import { Platform } from "react-native";

// import { Platform } from 'react-native';


// Nueva clave defeaae95caa0a167efa443175cf062aa3840271

// Usa 10.0.2.2 en emulador Android, localhost en iOS/Web
const LOCAL_IP_ANDROID = '10.0.2.2';  // alias de la máquina para Android Emulator :contentReference[oaicite:1]{index=1}

export const RPC_URL = Platform.OS === 'android'
  ? `http://${LOCAL_IP_ANDROID}:3001/jsonrpc`
  : `http://localhost:3001/jsonrpc`;

//  export const RPC_URL =  'https://registro.sinerkia-dev.com/jsonrpc'

export const DB = 'registro';
