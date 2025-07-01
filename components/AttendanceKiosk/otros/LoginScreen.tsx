// components/otros/LoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from "react-native";
import useThemeColors from "../../../hooks/useThemeColors";
import { rpcCall } from "./rpc";
import { RPC_URL, DB } from "./config";
import { showMessage } from "./util";

type Props = {
  onLogin: (uid: number, isAdmin: boolean, pass: string) => void;
};

export function LoginScreen({ onLogin }: Props) {
  const colors = useThemeColors();
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
      if (typeof window !== 'undefined' && window.console) {
        // Mostrar error en consola del navegador
        console.error('Odoo login error:', err);
      }
      showMessage("Error de conexión", err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
      <Button
        title={loading ? "Cargando..." : "ENTRAR"}
        color={colors.buttonBg}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  input: {
    height: 40,
    borderWidth: 1,
    marginVertical: 10,
    padding: 8,
    borderRadius: 10,
  },
  title: { fontSize: 30, fontWeight: "bold", textAlign: "center", marginBottom: 20 },

});
