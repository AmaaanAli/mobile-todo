import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../api/client";

type Profile = { id?: number; name: string; email: string };

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get("/users/me");
        setProfile(res.data);
      } catch (err: any) {
        Alert.alert("Error", err?.message || "Could not fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const logout = async () => {
    Alert.alert("Confirm", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Profile
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.push("/dashboard")}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#1EA7FF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#1EA7FF" />
          </View>
        ) : profile ? (
          <View style={styles.content}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>
                  {profile.name?.charAt(0).toUpperCase() || "A"}
                </ThemedText>
              </View>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoSection}>
              <View style={styles.infoBox}>
                <ThemedText style={styles.infoLabel}>Email Address</ThemedText>
                <ThemedText
                  style={styles.infoValue}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {profile.email}
                </ThemedText>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <ThemedText style={styles.logoutText}>Logout</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.centerContainer}>
            <ThemedText style={styles.errorText}>
              Could not load profile
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#000" },
  container: { flex: 1, backgroundColor: "#000", paddingHorizontal: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#111",
  },
  title: { marginBottom: 0, color: "#fff" },
  backButton: { padding: 8, justifyContent: "center", alignItems: "center" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { flex: 1, paddingVertical: 24 },
  avatarContainer: { marginBottom: 24, alignItems: "center" },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1EA7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#000", fontSize: 40, fontWeight: "bold" },
  name: {
    marginBottom: 8,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  email: { fontSize: 14, color: "#999", marginBottom: 24, textAlign: "center" },
  divider: {
    height: 1,
    backgroundColor: "#111",
    marginVertical: 24,
  },
  infoSection: { marginBottom: 32 },
  infoBox: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#111",
  },
  infoLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: { fontSize: 16, color: "#fff", fontWeight: "500", lineHeight: 22 },
  buttonContainer: { marginTop: "auto" },
  logoutButton: {
    backgroundColor: "#ff3b30",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  errorText: { fontSize: 16, color: "#999", textAlign: "center" },
});
