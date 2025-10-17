import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../state/authStore";
import { createPortalSession, redirectToPortal } from "../services/stripe";
import WebContainer from "../components/WebContainer";

export default function SubscriptionBlockedScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = () => {
    // @ts-ignore - navigation types
    navigation.navigate("BlockedPricing");
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { url, error } = await createPortalSession(user.id);

      if (error || !url) {
        throw new Error(error || "Erro ao acessar portal de assinaturas");
      }

      redirectToPortal(url);
    } catch (error: any) {
      console.error("Erro ao acessar portal:", error);
      if (Platform.OS === "web") {
        window.alert(error.message || "Não foi possível acessar o portal");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <WebContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
        ]}
      >
        <View style={styles.container}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={64} color="#ef4444" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Assinatura Expirada</Text>

          {/* Message */}
          <Text style={styles.message}>
            Sua assinatura expirou ou o pagamento não foi processado. Para continuar usando o TrafficFlow Pro, por favor escolha um plano ou atualize sua forma de pagamento.
          </Text>

          {/* Features Lost */}
          <View style={styles.featuresBox}>
            <Text style={styles.featuresTitle}>Sem acesso ativo você perde:</Text>
            <View style={styles.featureRow}>
              <Ionicons name="close-circle" size={20} color="#ef4444" />
              <Text style={styles.featureText}>Gestão de clientes e vendedores</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="close-circle" size={20} color="#ef4444" />
              <Text style={styles.featureText}>Controle financeiro completo</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="close-circle" size={20} color="#ef4444" />
              <Text style={styles.featureText}>Relatórios e dashboard</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="close-circle" size={20} color="#ef4444" />
              <Text style={styles.featureText}>Sincronização de dados</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            {/* Primary Button - Choose Plan */}
            <Pressable
              onPress={handleUpgrade}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Escolher Plano</Text>
            </Pressable>

            {/* Secondary Button - Manage Subscription */}
            <Pressable
              onPress={handleManageSubscription}
              disabled={loading}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>
                {loading ? "Carregando..." : "Gerenciar Assinatura"}
              </Text>
            </Pressable>

            {/* Logout Button */}
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.logoutButtonText}>Sair da Conta</Text>
            </Pressable>
          </View>

          {/* Help Text */}
          <Text style={styles.helpText}>
            Problemas com pagamento? Entre em contato com nosso suporte.
          </Text>
        </View>
      </ScrollView>
    </WebContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 12,
    flex: 1,
  },
  actionsContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
  },
  buttonPressed: {
    opacity: 0.7,
  },
  helpText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 24,
  },
});
