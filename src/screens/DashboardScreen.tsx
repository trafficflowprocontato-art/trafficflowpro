import React from "react";
import { View, Text, ScrollView, Pressable, Alert, useWindowDimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFinancialStore } from "../state/financialStore";
import { useAuthStore } from "../state/authStore";
import WebContainer from "../components/WebContainer";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  
  const getFinancialSummary = useFinancialStore((s) => s.getFinancialSummary);
  const clients = useFinancialStore((s) => s.clients);
  const agencyExpenses = useFinancialStore((s) => s.agencyExpenses);
  const sellerCommissions = useFinancialStore((s) => s.sellerCommissions);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const trialInfo = useAuthStore((s) => s.trialInfo);
  const calculateTrialInfo = useAuthStore((s) => s.calculateTrialInfo);
  
  // Calcular trial info ao montar componente
  React.useEffect(() => {
    calculateTrialInfo();
  }, [calculateTrialInfo]);
  
  const summary = getFinancialSummary();
  const paidClients = clients.filter((c) => c.paymentStatus === "paid").length;
  const pendingClients = clients.filter((c) => c.paymentStatus === "pending").length;
  const overdueClients = clients.filter((c) => c.paymentStatus === "overdue").length;

  // Debug: Log para verificar valores
  console.log("Dashboard Debug:", {
    clients: clients.length,
    agencyExpenses: agencyExpenses.length,
    sellerCommissions: sellerCommissions.length,
    paidCommissions: sellerCommissions.filter((c) => c.paymentStatus === "paid").length,
    totalCommissions: summary.totalCommissions,
    totalAgencyExpenses: summary.totalAgencyExpenses,
    totalRevenue: summary.totalRevenue,
    totalExpenses: summary.totalExpenses,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      // No web, usar confirm nativo do navegador
      const confirmed = window.confirm("Deseja realmente sair da sua conta?");
      if (confirmed) {
        logout();
      }
    } else {
      // No mobile, usar Alert.alert
      Alert.alert(
        "Sair",
        "Deseja realmente sair da sua conta?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sair",
            style: "destructive",
            onPress: () => logout(),
          },
        ]
      );
    }
  };

  return (
    <WebContainer>
      <ScrollView 
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
      <View style={{ paddingTop: insets.top + 20 }} className="px-6">
        {/* Trial Banner */}
        {trialInfo && !trialInfo.hasFullAccess && (
          <View className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="time-outline" size={24} color="#f59e0b" />
              <Text className="text-amber-900 text-lg font-bold ml-2">
                Período Gratuito Expirado
              </Text>
            </View>
            <Text className="text-amber-800 text-sm mb-3">
              Seu período de teste de 7 dias terminou. Assine agora para continuar criando e editando seus dados.
            </Text>
            <Text className="text-amber-700 text-xs font-medium">
              💎 Você ainda pode visualizar tudo, mas não pode criar, editar ou excluir até assinar.
            </Text>
          </View>
        )}
        
        {trialInfo && trialInfo.hasFullAccess && trialInfo.daysLeft <= 7 && (
          <View className="bg-blue-50 border-2 border-blue-400 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="gift-outline" size={24} color="#3b82f6" />
              <Text className="text-blue-900 text-lg font-bold ml-2">
                Período Gratuito
              </Text>
            </View>
            <Text className="text-blue-800 text-sm mb-1">
              Você tem <Text className="font-bold">{trialInfo.daysLeft} {trialInfo.daysLeft === 1 ? "dia" : "dias"}</Text> restantes de teste gratuito.
            </Text>
            <Text className="text-blue-700 text-xs font-medium">
              💎 Assine agora e não perca o acesso aos seus dados!
            </Text>
          </View>
        )}
        
        {/* Header with User Info and Logout */}
        <View className="mb-8">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-gray-900 mb-1">
                TrafficFlow Pro
              </Text>
              <Text className="text-base text-gray-500">
                Olá, {user?.name || "Usuário"}!
              </Text>
            </View>
            <Pressable
              onPress={handleLogout}
              className="w-10 h-10 bg-red-100 rounded-full items-center justify-center active:bg-red-200"
            >
              <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            </Pressable>
          </View>
        </View>

        {/* Lucro Líquido Card */}
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-lg border border-gray-200">
          <View className="flex-row items-center mb-2">
            <Ionicons name="trending-up" size={24} color="#3b82f6" />
            <Text className="text-blue-600 text-base ml-2 font-medium">
              Lucro Líquido
            </Text>
          </View>
          <Text className="text-green-500 text-4xl font-bold">
            {formatCurrency(summary.netProfit)}
          </Text>
          <Text className="text-blue-600 text-sm mt-2">
            Receita total: {formatCurrency(summary.totalRevenue)}
          </Text>
        </View>

        {/* Status dos Clientes */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Status de Pagamentos
          </Text>
          <View className={isDesktop ? "flex-row gap-4" : "flex-row gap-3"}>
            <View className="flex-1 bg-green-50 rounded-2xl p-4 border border-green-100">
              <View className="flex-row items-center mb-1">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <Text className="text-green-700 text-xs font-medium">PAGOS</Text>
              </View>
              <Text className="text-green-900 text-2xl font-bold">{paidClients}</Text>
            </View>
            
            <View className="flex-1 bg-yellow-50 rounded-2xl p-4 border border-yellow-100">
              <View className="flex-row items-center mb-1">
                <View className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                <Text className="text-yellow-700 text-xs font-medium">PENDENTES</Text>
              </View>
              <Text className="text-yellow-900 text-2xl font-bold">{pendingClients}</Text>
            </View>
            
            <View className="flex-1 bg-red-50 rounded-2xl p-4 border border-red-100">
              <View className="flex-row items-center mb-1">
                <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                <Text className="text-red-700 text-xs font-medium">ATRASADOS</Text>
              </View>
              <Text className="text-red-900 text-2xl font-bold">{overdueClients}</Text>
            </View>
          </View>
        </View>

        {/* Resumo Financeiro Detalhado */}
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Resumo Financeiro
          </Text>
          
          {/* Debug Info - Remover depois */}
          <View className="bg-gray-100 rounded-xl p-3 mb-3">
            <Text className="text-gray-700 text-xs font-medium mb-1">
              📊 Debug Info:
            </Text>
            <Text className="text-gray-600 text-xs">
              Clientes: {clients.length} | Despesas Agência: {agencyExpenses.length}
            </Text>
            <Text className="text-gray-600 text-xs">
              Total Despesas Agência: {formatCurrency(summary.totalAgencyExpenses)}
            </Text>
            <Text className="text-gray-600 text-xs">
              Comissões Totais: {sellerCommissions.length} | Pagas: {sellerCommissions.filter((c) => c.paymentStatus === "paid").length}
            </Text>
            <Text className="text-gray-600 text-xs">
              Total Comissões Pagas: {formatCurrency(summary.totalCommissions)}
            </Text>
          </View>
          
          {/* Receita */}
          <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="arrow-down" size={20} color="#22c55e" />
              </View>
              <Text className="text-gray-700 font-medium">Receita Total</Text>
            </View>
            <Text className="text-green-600 font-semibold text-base">
              {formatCurrency(summary.totalRevenue)}
            </Text>
          </View>

          {/* Comissões */}
          <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="people" size={20} color="#f97316" />
              </View>
              <Text className="text-gray-700 font-medium">Comissões</Text>
            </View>
            <Text className="text-orange-600 font-semibold text-base">
              -{formatCurrency(summary.totalCommissions)}
            </Text>
          </View>

          {/* Despesas Extras */}
          <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="cash" size={20} color="#a855f7" />
              </View>
              <Text className="text-gray-700 font-medium">Despesas Extras</Text>
            </View>
            <Text className="text-purple-600 font-semibold text-base">
              -{formatCurrency(summary.totalExtraExpenses)}
            </Text>
          </View>

          {/* Despesas da Agência */}
          <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="business" size={20} color="#3b82f6" />
              </View>
              <Text className="text-gray-700 font-medium">Despesas da Agência</Text>
            </View>
            <Text className="text-blue-600 font-semibold text-base">
              -{formatCurrency(summary.totalAgencyExpenses)}
            </Text>
          </View>

          {/* Total de Despesas */}
          <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="arrow-up" size={20} color="#ef4444" />
              </View>
              <Text className="text-gray-700 font-medium">Total de Despesas</Text>
            </View>
            <Text className="text-red-600 font-semibold text-base">
              -{formatCurrency(summary.totalExpenses)}
            </Text>
          </View>

          {/* Lucro Líquido */}
          <View className="flex-row justify-between items-center pt-4">
            <Text className="text-gray-900 font-bold text-base">Lucro Líquido</Text>
            <Text 
              className="font-bold text-lg"
              style={{ color: summary.netProfit >= 0 ? "#22c55e" : "#ef4444" }}
            >
              {formatCurrency(summary.netProfit)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
    </WebContainer>
  );
}
