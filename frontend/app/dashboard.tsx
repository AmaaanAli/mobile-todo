import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../api/client";

type Todo = {
  id: number | string;
  title: string;
  description?: string;
  completed?: boolean;
};

export default function DashboardScreen() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await api.get("/todos");
      const list = (res.data || []).map((t: any) => ({
        id: t._id ?? t.id,
        title: t.title,
        description: t.description,
        completed: !!t.completed,
      }));
      setTodos(list);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Could not fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await api.post("/todos", {
        title: newTitle,
        description: newDescription,
      });
      const t = res.data;
      const normalized = {
        id: t._id ?? t.id,
        title: t.title,
        description: t.description,
        completed: !!t.completed,
      };
      setTodos((prev) => [normalized, ...prev]);
      setNewTitle("");
      setNewDescription("");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Could not create task");
    }
  };

  const toggleTodo = async (item: Todo) => {
    try {
      // Try updating using query params (backend expects `completed` as a query param)
      const res = await api.put(`/todos/${item.id}`, null, {
        params: { completed: !item.completed },
      });
      const t = res.data;
      const updated = {
        id: t._id ?? t.id,
        title: t.title,
        description: t.description,
        completed: !!t.completed,
      };
      setTodos((prev) => prev.map((t) => (t.id === item.id ? updated : t)));
    } catch (err: any) {
      // If the server returns 404 or doesn't accept params, retry with JSON body as a fallback
      try {
        const res2 = await api.put(`/todos/${item.id}`, {
          completed: !item.completed,
        });
        const t2 = res2.data;
        const updated2 = {
          id: t2._id ?? t2.id,
          title: t2.title,
          description: t2.description,
          completed: !!t2.completed,
        };
        setTodos((prev) => prev.map((t) => (t.id === item.id ? updated2 : t)));
      } catch (err2: any) {
        // Last resort: refetch the whole list to sync state and show error
        await fetchTodos();
        Alert.alert(
          "Error",
          err2?.response?.data?.detail ||
            err2?.message ||
            "Could not update task"
        );
      }
    }
  };

  const deleteTodo = async (item: Todo) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await api.delete(`/todos/${item.id}`);
            setTodos((prev) => prev.filter((t) => t.id !== item.id));
          } catch (err: any) {
            Alert.alert(
              "Error",
              err?.response?.data?.detail ||
                err?.message ||
                "Could not delete task"
            );
          }
        },
        style: "destructive",
      },
    ]);
  };

  const startEdit = (item: Todo) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const updateTodo = async () => {
    if (!editTitle.trim()) return;
    try {
      const res = await api.put(`/todos/${editingId}`, {
        title: editTitle,
        description: editDescription,
      });
      const t = res.data;
      const updated = {
        id: t._id ?? t.id,
        title: t.title,
        description: t.description,
        completed: !!t.completed,
      };
      setTodos((prev) =>
        prev.map((todo) => (todo.id === editingId ? updated : todo))
      );
      cancelEdit();
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.detail || err?.message || "Could not update task"
      );
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            My Tasks
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            style={styles.profileButton}
          >
            <MaterialIcons name="person" size={24} color="#1EA7FF" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputColumn}>
            <TextInput
              placeholder="Title"
              value={newTitle}
              onChangeText={setNewTitle}
              placeholderTextColor="#999"
              style={styles.input}
              cursorColor="#1EA7FF"
            />
            <TextInput
              placeholder="Description (optional)"
              value={newDescription}
              onChangeText={setNewDescription}
              placeholderTextColor="#999"
              style={[styles.input, styles.descriptionInput]}
              cursorColor="#1EA7FF"
            />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={addTodo}>
            <ThemedText style={styles.addButtonText}>Add Task</ThemedText>
          </TouchableOpacity>
        </View>

        {loading && todos.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <FlatList
            data={todos}
            keyExtractor={(item) => String(item.id)}
            refreshing={loading}
            onRefresh={fetchTodos}
            renderItem={({ item }) => (
              <View style={styles.item}>
                {editingId === item.id ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      placeholder="Title"
                      value={editTitle}
                      onChangeText={setEditTitle}
                      placeholderTextColor="#999"
                      style={styles.editInput}
                      cursorColor="#1EA7FF"
                    />
                    <TextInput
                      placeholder="Description (optional)"
                      value={editDescription}
                      onChangeText={setEditDescription}
                      placeholderTextColor="#999"
                      style={[styles.editInput, styles.editDescriptionInput]}
                      cursorColor="#1EA7FF"
                    />
                    <View style={styles.editButtonsRow}>
                      <TouchableOpacity
                        style={[styles.editActionButton, styles.saveButton]}
                        onPress={updateTodo}
                      >
                        <ThemedText style={styles.editActionButtonText}>
                          Save
                        </ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.editActionButton, styles.cancelButton]}
                        onPress={cancelEdit}
                      >
                        <ThemedText style={styles.editActionButtonText}>
                          Cancel
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.todoContent}>
                    <TouchableOpacity
                      onPress={() => toggleTodo(item)}
                      style={[
                        styles.checkbox,
                        item.completed && styles.checkboxChecked,
                      ]}
                    >
                      {item.completed && (
                        <ThemedText style={styles.checkmark}>✓</ThemedText>
                      )}
                    </TouchableOpacity>
                    <View style={styles.todoBody}>
                      <ThemedText
                        style={[
                          styles.todoText,
                          item.completed && styles.completedText,
                        ]}
                      >
                        {item.title}
                      </ThemedText>
                      {item.description ? (
                        <ThemedText style={styles.todoDescription}>
                          {item.description}
                        </ThemedText>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      onPress={() => startEdit(item)}
                      style={styles.editButton}
                    >
                      <MaterialIcons name="edit" size={20} color="#34C759" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteTodo(item)}
                      style={styles.deleteButton}
                    >
                      <MaterialIcons name="delete" size={20} color="#ff3b30" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  No tasks yet. Add one to get started!
                </ThemedText>
              </View>
            }
          />
        )}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </View>
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
  profileButton: { padding: 8, justifyContent: "center", alignItems: "center" },
  profileLink: { fontSize: 14, color: "#1EA7FF", fontWeight: "600" },
  inputSection: { marginVertical: 20, paddingBottom: 16 },
  inputColumn: { width: "100%" },
  input: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#111",
    color: "#fff",
  },
  addButton: {
    backgroundColor: "#1EA7FF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 8,
    flexDirection: "row",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  item: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#111",
  },
  todoContent: { flexDirection: "row", alignItems: "center" },
  todoBody: { flex: 1 },
  editButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  deleteButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  editContainer: {
    padding: 12,
    backgroundColor: "#0a0a0a",
    borderRadius: 12,
    marginVertical: 4,
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#1EA7FF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: "#111",
    color: "#fff",
  },
  editDescriptionInput: { marginBottom: 12 },
  editButtonsRow: { flexDirection: "row", gap: 8 },
  editActionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveButton: { backgroundColor: "#34C759" },
  cancelButton: { backgroundColor: "#555" },
  editActionButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: "#1EA7FF",
    borderRadius: 6,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: { backgroundColor: "#1EA7FF" },
  checkmark: { color: "#000", fontSize: 14, fontWeight: "bold" },
  todoText: { fontSize: 16, flex: 1, color: "#fff" },
  todoDescription: { fontSize: 13, color: "#ccc", marginTop: 4 },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
    color: "#888",
  },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: { fontSize: 16, color: "#999", textAlign: "center" },
  footer: { paddingVertical: 16, borderTopWidth: 1, borderTopColor: "#111" },
  logoutButton: {
    backgroundColor: "#ff3b30",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  descriptionInput: { marginTop: 0 },
});
