// components/otros/LoginScreen.tsx
import React, { useEffect, useState } from "react";
import {
    Button,
    Image,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import useThemeColors from "../../../hooks/useThemeColors";
import { LoginErrorModal } from '../../LoginErrorModal';
import { DB, RPC_URL } from "./config";
import { rpcCall } from "./rpc";

type Props = {
  onLogin: (uid: number, isAdmin: boolean, pass: string) => void;
};

export function LoginScreen({ onLogin }: Props) {
  const colors = useThemeColors({ light: undefined, dark: undefined }, 'background');
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Logging de diagnóstico al cargar el componente
  useEffect(() => {
    console.group('🏁 COMPONENTE LOGIN INICIADO');
    // ...existing code...
    // ...existing code...
    // ...existing code...
    // ...existing code...
    console.groupEnd();
  }, []);

  const handleLogin = async () => {
    if (!user || !pass) {
      setErrorMessage("Completa todos los campos");
      setErrorModalVisible(true);
      return;
    }
    
    try {
      setLoading(true);
      
      // Logging detallado de datos de conexión
      console.group('🔐 INTENTO DE LOGIN');
      // ...existing code...
      // ...existing code...
      // ...existing code...
      // ...existing code...
      // ...existing code...
      console.groupEnd();
      
      // ...existing code...
      
      const uid = await rpcCall<number>(
        "common",
        "authenticate",
        [DB, user, pass, {}],
        RPC_URL
      );
      
      if (!uid || typeof uid !== 'number' || uid <= 0) {
        setErrorMessage("Usuario o contraseña incorrectos");
        setErrorModalVisible(true);
        return;
      }
      
      // ...existing code...
      // ...existing code...
      
      // ...existing code...
      
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
      
      // ...existing code...
      
      const isAdmin = recs[0].groups_id.map((g: any) => g[0]).includes(1);
      
      console.group('✅ LOGIN COMPLETADO');
      // ...existing code...
      // ...existing code...
      // ...existing code...
      console.groupEnd();

      onLogin(uid, isAdmin, pass);
    } catch (err: any) {
      console.group('❌ ERROR EN LOGIN');
      console.error('🚨 Error capturado:', err);
      // ...existing code...
      // ...existing code...
      // ...existing code...
      // ...existing code...
      // ...existing code...
      // ...existing code...
      if (err?.stack) {
        // ...existing code...
      }
      console.groupEnd();
      
      // Mostrar el error completo en consola y también como alerta en la UI
      let errorMsg = err && err.message ? err.message : String(err);
      if (err && err.stack) {
        errorMsg += "\n" + err.stack;
      }
      setErrorMessage(errorMsg);
      setErrorModalVisible(true);
      // Eliminado alert de entrada registrada
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoginErrorModal
        visible={errorModalVisible}
        message={errorMessage}
        onClose={() => setErrorModalVisible(false)}
      />
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
    </>
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