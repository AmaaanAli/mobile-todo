import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../api/client";

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const doSignup = async () => {
    setLoading(true);
    try {
      await api.post("/auth/signup", { email, password, name });

      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);

      const res = await api.post("/auth/login", params.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const token = res.data?.access_token || res.data?.token || res.data;
      if (!token) throw new Error("No token in response");
      await AsyncStorage.setItem("token", token);
      router.replace("/dashboard");
    } catch (err: any) {
      Alert.alert(
        "Signup failed",
        err?.response?.data?.detail || err.message || "Unknown error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Create Account
        </ThemedText>
        <ThemedText style={styles.subtitle}>Join our todo app</ThemedText>
      </View>

      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#999"
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#999"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#999"
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={doSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.buttonText}>Create Account</ThemedText>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Already have an account?{" "}
        </ThemedText>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <ThemedText style={styles.linkText}>Sign In</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  header: { marginBottom: 40 },
  title: { marginBottom: 8 },
  subtitle: { fontSize: 16, opacity: 0.6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  footerText: { fontSize: 14, opacity: 0.7 },
  linkText: { fontSize: 14, color: "#007AFF", fontWeight: "600" },
});
