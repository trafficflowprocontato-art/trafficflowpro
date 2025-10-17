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
  const [selectedMonth, setSelectedMonth] = React.useState<string>("total"); // "total" ou "2025-10"
  
  // Calcular trial info ao montar componente
  React.useEffect(() => {
    calculateTrialInfo();
  }, [calculateTrialInfo]);
  
  const summary = getFinancialSummary();
  
  // Gerar lista de meses disponíveis
  const getAvailableMonths = () => {
    const months = [];
    const today = new Date();
    
    // Últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      months.push({ key: monthKey, label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1) });
    }
    
    return months;
  };
  
  const availableMonths = getAvailableMonths();
  
  // Calcular summary filtrado por mês
  const getFilteredSummary = () => {
    if (selectedMonth === "total") {
      return getFinancialSummary();
    }
    
    // Filtrar clientes que pagaram no mês selecionado
    const monthClients = clients.filter(c => c.lastPaymentMonth === selectedMonth);
    
    // Calcular receita do mês
    const totalRevenue = monthClients.reduce((sum, c) => sum + c.monthlyValue, 0);
    
    // Despesas extras dos clientes do mês
    const totalExtraExpenses = monthClients.reduce((sum, c) => {
      return sum + c.extraExpenses.reduce((expSum, exp) => expSum + exp.value, 0);
    }, 0);
    
    // Comissões do mês
    const monthCommissions = sellerCommissions.filter(sc => sc.month === selectedMonth);
    const totalCommissions = monthCommissions.reduce((sum, sc) => sum + sc.commissionValue, 0);
    
    // Despesas da agência (todas, pois não temos filtro por mês ainda)
    const totalAgencyExpenses = summary.totalAgencyExpenses;
    
    const totalExpenses = totalCommissions + totalExtraExpenses + totalAgencyExpenses;
    const netProfit = totalRevenue - totalExpenses;
    
    return {
      totalRevenue,
      totalExpenses,
      totalCommissions,
      totalExtraExpenses,
      totalAgencyExpenses,
      netProfit,
    };
  };
  
  const filteredSummary = getFilteredSummary();
  const filteredPaidClients = selectedMonth === "total" 
    ? filteredPaidClients 
    : clients.filter(c => c.lastPaymentMonth === selectedMonth).length;
  const filteredPaidClients = clients.filter((c) => c.paymentStatus === "paid").length;
  const pendingClients = clients.filter((c) => c.paymentStatus === "pending").length;
  const overdueClients = clients.filter((c) => c.paymentStatus === "overdue").length;

  // Debug: Log para verificar valores
  console.log("Dashboard Debug:", {
    clients: clients.length,
    agencyExpenses: agencyExpenses.length,
    sellerCommissions: sellerCommissions.length,
    paidCommissions: sellerCommissions.filter((c) => c.paymentStatus === "paid").length,
    totalCommissions: filteredSummary.totalCommissions,
    totalAgencyExpenses: summary.totalAgencyExpenses,
    totalRevenue: filteredSummary.totalRevenue,
    totalExpenses: filteredSummary.totalExpenses,
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

  // Desktop Layout Component
  const DesktopDashboard = () => (
    <View className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Desktop */}
        <View className="bg-white border-b border-gray-200 px-8 py-6">
          <View className="max-w-7xl mx-auto w-full flex-row justify-between items-center">
            <View>
              <Text className="text-3xl font-bold text-gray-900">Dashboard</Text>
              <Text className="text-gray-500 mt-1">Bem-vindo, {user?.name || "Usuário"}! 👋</Text>
            </View>
            <Pressable
              onPress={handleLogout}
              className="flex-row items-center gap-2 px-4 py-2 bg-red-50 rounded-xl border border-red-200"
            >
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text className="text-red-600 font-semibold">Sair</Text>
            </Pressable>
          </View>
        </View>

        {/* Seletor de Mês */}
        <View className="bg-white border-b border-gray-100 px-8 py-4">
          <View className="max-w-7xl mx-auto w-full">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setSelectedMonth("total")}
                  className={`px-4 py-2 rounded-xl ${selectedMonth === "total" ? "bg-blue-600" : "bg-gray-100"}`}
                >
                  <Text className={`font-semibold ${selectedMonth === "total" ? "text-white" : "text-gray-700"}`}>
                    📊 Total (Tudo)
                  </Text>
                </Pressable>
                
                {availableMonths.map(month => (
                  <Pressable
                    key={month.key}
                    onPress={() => setSelectedMonth(month.key)}
                    className={`px-4 py-2 rounded-xl ${selectedMonth === month.key ? "bg-blue-600" : "bg-gray-100"}`}
                  >
                    <Text className={`font-semibold ${selectedMonth === month.key ? "text-white" : "text-gray-700"}`}>
                      {month.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        <View className="max-w-7xl mx-auto w-full px-8 py-8">
          {/* Trial Banner Desktop */}
          {trialInfo && !trialInfo.hasFullAccess && (
            <View className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 mb-8 shadow-sm">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-amber-400 rounded-full items-center justify-center mr-4">
                    <Ionicons name="time-outline" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-amber-900 text-xl font-bold mb-1">Período Gratuito Expirado</Text>
                    <Text className="text-amber-700 text-sm">Assine para continuar criando e editando seus dados</Text>
                  </View>
                </View>
                <Pressable className="bg-amber-500 px-6 py-3 rounded-xl">
                  <Text className="text-white font-bold">Ver Planos</Text>
                </Pressable>
              </View>
            </View>
          )}
          
          {trialInfo && trialInfo.hasFullAccess && trialInfo.daysLeft <= 7 && (
            <View className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6 mb-8 shadow-sm">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-4">
                    <Ionicons name="gift-outline" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-blue-900 text-xl font-bold mb-1">
                      {trialInfo.daysLeft} {trialInfo.daysLeft === 1 ? "dia" : "dias"} restantes
                    </Text>
                    <Text className="text-blue-700 text-sm">Aproveite seu teste gratuito!</Text>
                  </View>
                </View>
                <Pressable className="bg-blue-500 px-6 py-3 rounded-xl">
                  <Text className="text-white font-bold">Assinar Agora</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Cards Grid - 3 colunas */}
          <View className="flex-row gap-6 mb-8">
            {/* Card Lucro Líquido */}
            <View className="flex-1 bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 bg-green-100 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="trending-up" size={24} color="#10b981" />
                </View>
                <Text className="text-gray-600 text-sm font-semibold">LUCRO LÍQUIDO</Text>
              </View>
              <Text className="text-green-500 text-4xl font-bold mb-2">
                {formatCurrency(filteredSummary.netProfit)}
              </Text>
              <Text className="text-gray-500 text-sm">
                Receita: {formatCurrency(filteredSummary.totalRevenue)}
              </Text>
            </View>

            {/* Card Receita Total */}
            <View className="flex-1 bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="cash" size={24} color="#3b82f6" />
                </View>
                <Text className="text-gray-600 text-sm font-semibold">RECEITA TOTAL</Text>
              </View>
              <Text className="text-blue-600 text-4xl font-bold mb-2">
                {formatCurrency(filteredSummary.totalRevenue)}
              </Text>
              <Text className="text-gray-500 text-sm">
                {clients.length} {clients.length === 1 ? "cliente" : "clientes"}
              </Text>
            </View>

            {/* Card Despesas */}
            <View className="flex-1 bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 bg-red-100 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="wallet" size={24} color="#ef4444" />
                </View>
                <Text className="text-gray-600 text-sm font-semibold">DESPESAS TOTAIS</Text>
              </View>
              <Text className="text-red-500 text-4xl font-bold mb-2">
                {formatCurrency(filteredSummary.totalExpenses)}
              </Text>
              <Text className="text-gray-500 text-sm">
                Comissões + Despesas
              </Text>
            </View>
          </View>

          {/* Status de Pagamentos - Grid 3 colunas */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-gray-900 mb-4">Status de Pagamentos</Text>
            <View className="flex-row gap-6">
              <View className="flex-1 bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  <Text className="text-green-700 font-semibold ml-2">PAGOS</Text>
                </View>
                <Text className="text-green-900 text-5xl font-bold">{filteredPaidClients}</Text>
              </View>

              <View className="flex-1 bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="time" size={24} color="#f59e0b" />
                  <Text className="text-yellow-700 font-semibold ml-2">PENDENTES</Text>
                </View>
                <Text className="text-yellow-900 text-5xl font-bold">{pendingClients}</Text>
              </View>

              <View className="flex-1 bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="alert-circle" size={24} color="#ef4444" />
                  <Text className="text-red-700 font-semibold ml-2">ATRASADOS</Text>
                </View>
                <Text className="text-red-900 text-5xl font-bold">{overdueClients}</Text>
              </View>
            </View>
          </View>

          {/* Resumo Financeiro - Grid 2 colunas */}
          <View className="flex-row gap-6">
            {/* Coluna Esquerda */}
            <View className="flex-1 bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <Text className="text-xl font-bold text-gray-900 mb-6">Resumo Financeiro</Text>
              
              <View className="space-y-4">
                <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-green-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="arrow-down" size={20} color="#10b981" />
                    </View>
                    <Text className="text-gray-700 font-medium">Receita Total</Text>
                  </View>
                  <Text className="text-green-600 text-xl font-bold">{formatCurrency(filteredSummary.totalRevenue)}</Text>
                </View>

                <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-orange-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="people" size={20} color="#f97316" />
                    </View>
                    <Text className="text-gray-700 font-medium">Comissões</Text>
                  </View>
                  <Text className="text-orange-600 text-xl font-bold">-{formatCurrency(filteredSummary.totalCommissions)}</Text>
                </View>

                <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-purple-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="cart" size={20} color="#a855f7" />
                    </View>
                    <Text className="text-gray-700 font-medium">Despesas Extras</Text>
                  </View>
                  <Text className="text-purple-600 text-xl font-bold">-{formatCurrency(summary.totalExtraExpenses)}</Text>
                </View>

                <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="business" size={20} color="#3b82f6" />
                    </View>
                    <Text className="text-gray-700 font-medium">Despesas da Agência</Text>
                  </View>
                  <Text className="text-blue-600 text-xl font-bold">-{formatCurrency(summary.totalAgencyExpenses)}</Text>
                </View>

                <View className="flex-row items-center justify-between py-4">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-red-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="arrow-up" size={20} color="#ef4444" />
                    </View>
                    <Text className="text-gray-700 font-medium">Total de Despesas</Text>
                  </View>
                  <Text className="text-red-600 text-xl font-bold">-{formatCurrency(filteredSummary.totalExpenses)}</Text>
                </View>
              </View>

              <View className="bg-green-50 rounded-xl p-6 mt-6 border-2 border-green-200">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-700 text-lg font-bold">Lucro Líquido</Text>
                  <Text className="text-green-600 text-3xl font-bold">{formatCurrency(filteredSummary.netProfit)}</Text>
                </View>
              </View>
            </View>

            {/* Coluna Direita - Estatísticas Rápidas */}
            <View className="flex-1 space-y-6">
              <View className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-4">📊 Estatísticas</Text>
                
                <View className="space-y-4">
                  <View>
                    <Text className="text-gray-500 text-sm mb-1">Total de Clientes</Text>
                    <Text className="text-gray-900 text-2xl font-bold">{clients.length}</Text>
                  </View>
                  
                  <View>
                    <Text className="text-gray-500 text-sm mb-1">Despesas da Agência</Text>
                    <Text className="text-gray-900 text-2xl font-bold">{agencyExpenses.length}</Text>
                  </View>
                  
                  <View>
                    <Text className="text-gray-500 text-sm mb-1">Comissões Registradas</Text>
                    <Text className="text-gray-900 text-2xl font-bold">{sellerCommissions.length}</Text>
                  </View>
                </View>
              </View>

              <View className="bg-blue-500 rounded-2xl p-6 shadow-lg">
                <Ionicons name="rocket" size={32} color="white" />
                <Text className="text-white text-xl font-bold mt-4 mb-2">Melhore seus Resultados</Text>
                <Text className="text-blue-100 text-sm mb-4">Explore todas as funcionalidades do TrafficFlow Pro</Text>
                <Pressable className="bg-white rounded-xl py-3 px-4">
                  <Text className="text-blue-600 font-bold text-center">Saiba Mais</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  // Mobile Layout Component (mantém o design atual)
  const MobileDashboard = () => (
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
            {formatCurrency(filteredSummary.netProfit)}
          </Text>
          <Text className="text-blue-600 text-sm mt-2">

        {/* Seletor de Mês Mobile */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-3 text-sm">Filtrar por período:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setSelectedMonth("total")}
                className={`px-4 py-3 rounded-xl ${selectedMonth === "total" ? "bg-blue-600" : "bg-white border border-gray-300"}`}
              >
                <Text className={`font-semibold text-sm ${selectedMonth === "total" ? "text-white" : "text-gray-700"}`}>
                  📊 Total
                </Text>
              </Pressable>
              
              {availableMonths.slice(-6).map(month => (
                <Pressable
                  key={month.key}
                  onPress={() => setSelectedMonth(month.key)}
                  className={`px-4 py-3 rounded-xl ${selectedMonth === month.key ? "bg-blue-600" : "bg-white border border-gray-300"}`}
                >
                  <Text className={`font-semibold text-sm ${selectedMonth === month.key ? "text-white" : "text-gray-700"}`}>
                    {month.label.split(' ')[0]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
            Receita total: {formatCurrency(filteredSummary.totalRevenue)}
          </Text>
        </View>

        {/* Status dos Clientes */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Status de Pagamentos
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-green-50 rounded-2xl p-4 border border-green-100">
              <View className="flex-row items-center mb-1">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <Text className="text-green-700 text-xs font-medium">PAGOS</Text>
              </View>
              <Text className="text-green-900 text-2xl font-bold">{filteredPaidClients}</Text>
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
              Total Comissões Pagas: {formatCurrency(filteredSummary.totalCommissions)}
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
              {formatCurrency(filteredSummary.totalRevenue)}
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
              -{formatCurrency(filteredSummary.totalCommissions)}
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
              -{formatCurrency(filteredSummary.totalExpenses)}
            </Text>
          </View>

          {/* Lucro Líquido */}
          <View className="flex-row justify-between items-center pt-4">
            <Text className="text-gray-900 font-bold text-base">Lucro Líquido</Text>
            <Text 
              className="font-bold text-lg"
              style={{ color: filteredSummary.netProfit >= 0 ? "#22c55e" : "#ef4444" }}
            >
              {formatCurrency(filteredSummary.netProfit)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
    </WebContainer>
  );

  // Render desktop or mobile based on screen size
  return isDesktop ? <DesktopDashboard /> : <MobileDashboard />;
}
