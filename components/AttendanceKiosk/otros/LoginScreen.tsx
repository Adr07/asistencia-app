// components/otros/LoginScreen.tsx
import { useState } from "react";
import {
  Button,
  Image,
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

  const handleLogin = async () => {
    if (!user || !pass) {
      showMessage("Error", "Completa todos los campos");
      return;
    }
    try {
      setLoading(true);
      const uid = await rpcCall<number>(
        "common",
        "authenticate",
        [DB, user, pass, {}],
        RPC_URL
      );
      if (!uid) {
        showMessage("Error", "Usuario o contraseña incorrectos");
        return;
      }

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
      const isAdmin = recs[0].groups_id.map((g: any) => g[0]).includes(1);

      onLogin(uid, isAdmin, pass);
    } catch (err: any) {
      console.error('[LoginScreen] Error al crear entrada:', err);
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
