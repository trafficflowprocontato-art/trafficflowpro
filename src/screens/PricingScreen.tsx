import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { PLANS, TRIAL_DAYS } from "../config/plans";
import { useAuthStore } from "../state/authStore";
import { createCheckoutSession, redirectToCheckout } from "../services/stripe";
import WebContainer from "../components/WebContainer";

export default function PricingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      if (Platform.OS === "web") {
        window.alert("Você precisa estar logado");
      } else {
        Alert.alert("Erro", "Você precisa estar logado");
      }
      return;
    }

    const plan = PLANS[planId];
    if (!plan) return;

    // Verificar se o Price ID foi configurado
    if (plan.priceId.includes("SUBSTITUA")) {
      if (Platform.OS === "web") {
        window.alert("Os produtos ainda não foram configurados no Stripe. Por favor, configure os Price IDs primeiro.");
      } else {
        Alert.alert(
          "Configuração Pendente",
          "Os produtos ainda não foram configurados no Stripe. Por favor, configure os Price IDs primeiro."
        );
      }
      return;
    }

    setLoading(planId);

    try {
      const { url, error } = await createCheckoutSession(
        plan.priceId,
        user.id,
        user.email
      );

      if (error || !url) {
        throw new Error(error || "Erro ao criar sessão de pagamento");
      }

      // Redirecionar para Stripe Checkout
      redirectToCheckout(url);
    } catch (error: any) {
      console.error("Erro ao iniciar pagamento:", error);
      if (Platform.OS === "web") {
        window.alert(error.message || "Não foi possível iniciar o pagamento");
      } else {
        Alert.alert("Erro", error.message || "Não foi possível iniciar o pagamento");
      }
    } finally {
      setLoading(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <WebContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Escolha seu Plano</Text>
            <Text style={styles.subtitle}>
              {TRIAL_DAYS} dias grátis em todos os planos!
            </Text>
          </View>

          {/* Plans Grid */}
          <View style={styles.plansContainer}>
            {Object.values(PLANS).map((plan) => (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  plan.popular && styles.planCardPopular,
                ]}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>POPULAR</Text>
                  </View>
                )}

                {/* Plan Header */}
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{formatPrice(plan.price)}</Text>
                    <Text style={styles.priceUnit}>/mês</Text>
                  </View>
                  <Text style={styles.trialText}>
                    🎉 {TRIAL_DAYS} dias grátis
                  </Text>
                </View>

                {/* Features */}
                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <View style={styles.checkmarkContainer}>
                        <Ionicons name="checkmark" size={16} color="#22c55e" />
                      </View>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {/* Button */}
                <Pressable
                  onPress={() => handleSelectPlan(plan.id)}
                  disabled={loading !== null}
                  style={({ pressed }) => [
                    styles.button,
                    loading === plan.id && styles.buttonLoading,
                    !loading && plan.popular && styles.buttonPopular,
                    !loading && !plan.popular && styles.buttonDefault,
                    pressed && !loading && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.buttonText}>
                    {loading === plan.id
                      ? "Carregando..."
                      : `Começar Trial de ${TRIAL_DAYS} Dias`}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              💳 Cartão só será cobrado após o término do trial
            </Text>
            <Text style={styles.footerSubtext}>
              Cancele a qualquer momento, sem compromisso
            </Text>
          </View>

          {/* Back Button */}
          {navigation.canGoBack() && (
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>Voltar</Text>
            </Pressable>
          )}
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
  container: {
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  plansContainer: {
    gap: 16,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  planCardPopular: {
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  popularBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  popularBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  planHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#111827",
  },
  priceUnit: {
    color: "#6b7280",
    marginLeft: 4,
  },
  trialText: {
    color: "#16a34a",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    backgroundColor: "#dcfce7",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureText: {
    color: "#374151",
    flex: 1,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonLoading: {
    backgroundColor: "#d1d5db",
  },
  buttonPopular: {
    backgroundColor: "#3b82f6",
  },
  buttonDefault: {
    backgroundColor: "#111827",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  footerText: {
    color: "#1e3a8a",
    fontSize: 14,
    textAlign: "center",
  },
  footerSubtext: {
    color: "#1d4ed8",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  backButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  backButtonText: {
    color: "#4b5563",
    fontWeight: "500",
  },
});
