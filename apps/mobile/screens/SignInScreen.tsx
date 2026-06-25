import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useAuth } from "../auth/AuthContext";
import { colors } from "../theme";

export default function SignInScreen() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (mode: "in" | "up") => {
    setBusy(true);
    setError(null);
    setMessage(null);
    const result =
      mode === "in"
        ? await signIn(email, password)
        : await signUp(email, password);
    setBusy(false);
    if (result.error) setError(result.error);
    else if (result.message) setMessage(result.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Volt<Text style={{ color: colors.electricGreen }}>PH</Text>
      </Text>
      <Text style={styles.subtitle}>Sign in to plan EV trips</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        autoComplete="password"
      />

      {error && <Text style={styles.error}>{error}</Text>}
      {message && <Text style={styles.message}>{message}</Text>}

      <Pressable
        style={[styles.button, busy && styles.disabled]}
        onPress={() => submit("in")}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </Pressable>
      <Pressable
        style={[styles.buttonOutline, busy && styles.disabled]}
        onPress={() => submit("up")}
        disabled={busy}
      >
        <Text style={styles.buttonOutlineText}>Create account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cloudWhite,
    padding: 24,
    justifyContent: "center",
    gap: 12,
  },
  title: { fontSize: 40, fontWeight: "800", color: colors.carbonBlack },
  subtitle: { fontSize: 16, color: colors.slate600, marginBottom: 12 },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.carbonBlack,
  },
  error: { color: colors.red },
  message: { color: colors.electricGreen },
  button: {
    backgroundColor: colors.electricGreen,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: "700" },
  buttonOutline: {
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonOutlineText: {
    color: colors.carbonBlack,
    fontSize: 15,
    fontWeight: "600",
  },
  disabled: { opacity: 0.6 },
});
