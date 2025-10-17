import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuthStore } from "../state/authStore";
import WebContainer from "../components/WebContainer";

export default function SubscriptionSuccessScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const checkSubscription = useAuthStore((s) => s.checkSubscription);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    async function processSubscription() {
      try {
        // Pegar session_id da URL
        let sessionId = null;
        
        if (Platform.OS === 'web') {
          const urlParams = new URLSearchParams(window.location.search);
          sessionId = urlParams.get('session_id');
        }

        if (sessionId && user) {
          console.log('Processing subscription for session:', sessionId);
          
          // Buscar detalhes da sessão via API
          const response = await fetch(`${Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : 'https://trafficflowpro.com'}/api/get-subscription`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, userId: user.id }),
          });

          if (response.ok) {
            console.log('Subscription processed successfully');
          }
        }

        // Aguardar e verificar
        await new Promise(resolve => setTimeout(resolve, 3000));
        await checkSubscription();
        setLoading(false);
      } catch (err) {
        console.error('Error processing subscription:', err);
        setError(true);
        setLoading(false);
      }
    }

    processSubscription();
  }, [user]);

  const handleGoToDashboard = () => {
    // @ts-ignore
    navigation.navigate("Main", { screen: "Dashboard" });
  };

  return (
    <WebContainer>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
        ]}
      >
        {loading ? (
          <>
            <ActivityIndicator size="large" color="#10b981" style={styles.loader} />
            <Text style={styles.loadingText}>Confirmando sua assinatura...</Text>
          </>
        ) : (
          <>
            {/* Success Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#10b981" />
            </View>

            {/* Title */}
            <Text style={styles.title}>Assinatura Ativada!</Text>

            {/* Message */}
            <Text style={styles.message}>
              Parabéns! Sua assinatura foi ativada com sucesso. Você tem 7 dias de teste grátis
              para explorar todos os recursos do TrafficFlow Pro.
            </Text>

            {/* Features Box */}
            <View style={styles.featuresBox}>
              <Text style={styles.featuresTitle}>Agora você tem acesso a:</Text>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.featureText}>Dashboard completo</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.featureText}>Gestão de clientes</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.featureText}>Controle de vendedores</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.featureText}>Gestão de despesas</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.featureText}>Relatórios financeiros</Text>
              </View>
            </View>

            {/* CTA Button */}
            <Pressable
              onPress={handleGoToDashboard}
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            >
              <Text style={styles.buttonText}>Ir para Dashboard</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </Pressable>

            {/* Info Text */}
            <Text style={styles.infoText}>
              Você não será cobrado nos próximos 7 dias. Cancele a qualquer momento.
            </Text>
          </>
        )}
      </View>
    </WebContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
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
    maxWidth: 500,
  },
  featuresBox: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: "#374151",
    marginLeft: 12,
    flex: 1,
  },
  button: {
    backgroundColor: "#10b981",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  infoText: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    maxWidth: 400,
  },
});
