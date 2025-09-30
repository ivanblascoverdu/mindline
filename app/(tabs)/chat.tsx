/*
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import {
  Send,
  Heart,
  Shield,
  MessageCircle,
  CheckCircle,
} from "lucide-react-native";
import { z } from "zod";
//import { createRorkTool, useRorkAgent } from "@rork/toolkit-sdk";
import { useTasks } from "@/contexts/TaskContext";
import Colors from "@/constants/colors";

export default function ChatScreen() {
  const [input, setInput] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTaskTitle, setCreatedTaskTitle] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const { addTask } = useTasks();

  const { messages, error, sendMessage } = useRorkAgent({
    tools: {
      createWellnessTask: createRorkTool({
        description:
          "Crear una tarea personalizada de bienestar basada en la conversación para ayudar al usuario",
        zodSchema: z.object({
          title: z
            .string()
            .describe("Título corto y motivador de la tarea de bienestar"),
          description: z
            .string()
            .describe(
              "Descripción detallada de cómo esta tarea ayudará con el problema específico"
            ),
          category: z
            .enum([
              "Mindfulness",
              "Ejercicio",
              "Social",
              "Autocuidado",
              "Productividad",
              "Creatividad",
            ])
            .describe("Categoría que mejor se adapte al tipo de bienestar"),
          points: z
            .number()
            .min(5)
            .max(50)
            .describe("Puntos a otorgar (5-50 basado en dificultad y impacto)"),
        }),
        execute(input) {
          addTask({
            title: input.title,
            description: input.description,
            category: input.category,
            priority:
              input.points > 40 ? "high" : input.points > 25 ? "medium" : "low",
          });

          setCreatedTaskTitle(input.title);
          setShowSuccessModal(true);

          return `Tarea "${input.title}" creada exitosamente con ${input.points} puntos.`;
        },
      }),
    },
  });

  const handleSend = async () => {
    if (!input.trim()) return;

    const message = input.trim();
    setInput("");

    try {
      await sendMessage(message);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const renderMessage = (message: any, index: number) => {
    const isUser = message.role === "user";

    return (
      <View
        key={message.id || index}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          {message.parts?.map((part: any, partIndex: number) => {
            if (part.type === "text") {
              return (
                <Text
                  key={partIndex}
                  style={[
                    styles.messageText,
                    isUser ? styles.userText : styles.assistantText,
                  ]}
                >
                  {part.text}
                </Text>
              );
            } else if (part.type === "tool") {
              switch (part.state) {
                case "input-streaming":
                case "input-available":
                  return (
                    <View key={partIndex} style={styles.toolContainer}>
                      <Text style={styles.toolText}>
                        ✨ Creando una tarea personalizada para ti...
                      </Text>
                    </View>
                  );
                case "output-available":
                  return (
                    <View key={partIndex} style={styles.toolContainer}>
                      <Text style={styles.toolText}>
                        ✅ ¡Tarea creada exitosamente!
                      </Text>
                    </View>
                  );
                case "output-error":
                  return (
                    <View key={partIndex} style={styles.toolContainer}>
                      <Text style={styles.toolErrorText}>
                        ❌ Error al crear la tarea: {part.errorText}
                      </Text>
                    </View>
                  );
              }
            }
            return null;
          }) || (
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userText : styles.assistantText,
              ]}
            >
              {message.content}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Heart color={Colors.light.tint} size={24} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Apoyo Mental</Text>
            <Text style={styles.headerSubtitle}>
              Conversación anónima y segura
            </Text>
          </View>
          <Shield color={Colors.light.tabIconDefault} size={20} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.filter((m) => m.role !== "system").length === 0 && (
            <View style={styles.welcomeContainer}>
              <MessageCircle color={Colors.light.tint} size={48} />
              <Text style={styles.welcomeTitle}>¡Hola! Estoy aquí para ti</Text>
              <Text style={styles.welcomeText}>
                Este es un espacio seguro y anónimo donde puedes hablar sobre
                tus problemas, inseguridades o cualquier cosa que te preocupe.
                Estoy aquí para escucharte y ayudarte a encontrar formas de
                sentirte mejor.
              </Text>
              <Text style={styles.welcomeSubtext}>
                💡 También puedo sugerirte tareas personalizadas que te ayuden a
                crear hábitos saludables y mejorar tu bienestar.
              </Text>
            </View>
          )}

          {messages.filter((m) => m.role !== "system").map(renderMessage)}

          {false && (
            <View style={[styles.messageContainer, styles.assistantMessage]}>
              <View style={[styles.messageBubble, styles.assistantBubble]}>
                <Text style={[styles.messageText, styles.assistantText]}>
                  Escribiendo...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Escribe aquí tus pensamientos..."
            placeholderTextColor={Colors.light.tabIconDefault}
            multiline
            maxLength={1000}
            editable={true}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !input.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Send
              color={!input.trim() ? Colors.light.tabIconDefault : "#fff"}
              size={20}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error: {error.message || "Algo salió mal. Inténtalo de nuevo."}
          </Text>
        </View>
      )}

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CheckCircle color={Colors.light.tint} size={48} />
            <Text style={styles.modalTitle}>¡Tarea Creada!</Text>
            <Text style={styles.modalText}>
              He creado una tarea personalizada para ti: &quot;
              {createdTaskTitle}&quot;. ¡Puedes encontrarla en la sección de
              Tareas!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalButtonText}>Genial</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === "ios" ? 44 : 24,
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.light.tint}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  welcomeContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: Colors.light.tint,
    textAlign: "center",
    lineHeight: 20,
    fontStyle: "italic",
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  assistantMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: Colors.light.tint,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "#fff",
  },
  assistantText: {
    color: Colors.light.text,
  },
  toolContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: `${Colors.light.tint}10`,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.tint,
  },
  toolText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: "600",
  },
  toolErrorText: {
    fontSize: 14,
    color: "#ff4444",
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
    maxHeight: 120,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: Colors.light.border,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#ffcdd2",
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    maxWidth: 320,
    width: "100%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
*/
