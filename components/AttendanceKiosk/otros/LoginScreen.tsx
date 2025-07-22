// components/otros/LoginScreen.tsx
import React, { useEffect, useState } from "react";
import {
  Button,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import useThemeColors from "../../../hooks/useThemeColors";
import { DB, RPC_URL } from "./config";
import { rpcCall } from "./rpc";
import { showMessage } from "./util";

type Props = {
  onLogin: (uid: number, isAdmin: boolean, pass: string) => void;
};

export function LoginScreen({ onLogin }: Props) {
  const colors = useThemeColors({ light: undefined, dark: undefined }, 'background');
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  // Logging de diagnóstico al cargar el componente
  useEffect(() => {
    console.group('🏁 COMPONENTE LOGIN INICIADO');
    console.log('🌐 URL configurada:', RPC_URL);
    console.log('🗄️ Base de datos configurada:', DB);
    console.log('🌍 User Agent:', navigator.userAgent);
    console.log('📱 Plataforma detectada:', Platform.OS);
    console.groupEnd();
  }, []);

  const handleLogin = async () => {
    if (!user || !pass) {
      showMessage("Error", "Completa todos los campos");
      return;
    }
    
    try {
      setLoading(true);
      
      // Logging detallado de datos de conexión
      console.group('🔐 INTENTO DE LOGIN');
      console.log('👤 Usuario:', user);
      console.log('🔒 Contraseña:', '***' + pass.slice(-2)); // Mostrar solo últimos 2 caracteres
      console.log('🌐 URL del servidor:', RPC_URL);
      console.log('🗄️ Base de datos:', DB);
      console.log('📅 Timestamp:', new Date().toISOString());
      console.groupEnd();
      
      console.log('🚀 Iniciando autenticación...');
      
      const uid = await rpcCall<number>(
        "common",
        "authenticate",
        [DB, user, pass, {}],
        RPC_URL
      );
      
      if (!uid) {
        console.log('❌ Autenticación fallida: UID nulo o cero');
        showMessage("Error", "Usuario o contraseña incorrectos");
        return;
      }
      
      console.log('✅ Autenticación exitosa - UID:', uid);
      console.log('✅ Autenticación exitosa - UID:', uid);
      
      console.log('🔍 Verificando permisos de administrador...');
      
      const recs = await rpcCall<any[]>(
        "object",
        "execute_kw",
        [
          DB,
          uid,
          pass,
          "res.users",
          "search_read",
          [[["id", "=", uid]]],
          { fields: ["groups_id"] },
        ],
        RPC_URL
      );
      
      console.log('📋 Grupos del usuario:', recs[0]?.groups_id);
      
      const isAdmin = recs[0].groups_id.map((g: any) => g[0]).includes(1);
      
      console.group('✅ LOGIN COMPLETADO');
      console.log('👤 UID:', uid);
      console.log('🔧 Es administrador:', isAdmin);
      console.log('📋 Grupos:', recs[0]?.groups_id);
      console.groupEnd();

      onLogin(uid, isAdmin, pass);
    } catch (err: any) {
      console.group('❌ ERROR EN LOGIN');
      console.error('🚨 Error capturado:', err);
      console.log('📍 Datos de conexión en el momento del error:');
      console.log('  - URL:', RPC_URL);
      console.log('  - DB:', DB);
      console.log('  - Usuario:', user);
      console.log('🔍 Tipo de error:', err?.constructor?.name);
      console.log('📝 Mensaje de error:', err?.message);
      if (err?.stack) {
        console.log('📊 Stack trace:', err.stack);
      }
      console.groupEnd();
      
      // Mostrar el error completo en consola y también como alerta en la UI
      let errorMsg = err && err.message ? err.message : String(err);
      if (err && err.stack) {
        errorMsg += "\n" + err.stack;
      }
      showMessage("Error de conexión", errorMsg);
      alert("[LoginScreen] Error al crear entrada:\n" + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Image
        source={require("../../../assets/images/0bc530f3-4ccd-4a3f-b8ba-f85b8990b0aa_removalai_preview.png")}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="PROBOTEC logo"
      />
      <Text style={[styles.title, { color: colors.text }]}>Iniciar sesión</Text>
      <TextInput
        placeholder="Usuario"
        placeholderTextColor={colors.text}
        value={user}
        onChangeText={setUser}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.text,
            borderRadius: 10,
          },
        ]}
        autoCapitalize="none"
        editable={!loading}
      />
      <TextInput
        placeholder="Contraseña"
        placeholderTextColor={colors.text}
        secureTextEntry
        value={pass}
        onChangeText={setPass}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.text,
            borderRadius: 10,
          },
        ]}
        editable={!loading}
      />
      <View style={{ borderRadius: 10, overflow: 'hidden', marginTop: 10 }}>
        <Button
          title={loading ? "Cargando..." : "ENTRAR"}
          color="#b71c1c"
          onPress={handleLogin}
          disabled={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  logo: {
    width: 320,
    height: 120,
    alignSelf: "center",
    marginBottom: 30,
  },
  input: {
    height: 40,
    borderWidth: 1,
    marginVertical: 10,
    padding: 8,
    borderRadius: 10,
  },
  title: { fontSize: 30, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
});
