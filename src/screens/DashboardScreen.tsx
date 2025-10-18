import React from "react";
import { View, Text, ScrollView, Pressable, Alert, useWindowDimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFinancialStore } from "../state/financialStore";
import { useAuthStore } from "../state/authStore";
import { useAppStore } from "../state/appStore";
import WebContainer from "../components/WebContainer";
import MoneyDisplay from "../components/MoneyDisplay";

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
  const theme = useAppStore((s) => s.theme);
  const [selectedMonth, setSelectedMonth] = React.useState<string>("total"); // "total" ou "2025-10"
  
  const isDark = theme === "dark";
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const hideValues = useAppStore((s) => s.hideValues);
  const toggleHideValues = useAppStore((s) => s.toggleHideValues);
  
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
    ? clients.filter((c) => c.paymentStatus === "paid").length
    : clients.filter(c => c.lastPaymentMonth === selectedMonth).length;
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

  // Desktop Layout Component com Sidebar
  const DesktopDashboard = () => (
    <View className="flex-1 flex-row">
      {/* Sidebar */}
      <View className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} border-r`} style={{ width: 280 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Logo/Brand */}
          <View className={`px-6 py-6 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <View className="flex-row items-center mb-6">
              <View className="w-12 h-12 bg-blue-500 rounded-2xl items-center justify-center mr-3">
                <Ionicons name="bar-chart" size={24} color="white" />
              </View>
              <View>
                <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  TrafficFlow Pro
                </Text>
                <Text className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                  Gestão Financeira
                </Text>
              </View>
            </View>
            
            {/* User Profile */}
            <View className={`p-3 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full items-center justify-center mr-3">
                  <Text className="text-white font-bold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {user?.name || "Usuário"}
                  </Text>
                  <Text className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`} numberOfLines={1}>
                    {user?.email}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Navigation Menu */}
          <View className="py-4 px-3">
            <Text className={`px-3 mb-3 text-xs font-bold uppercase ${isDark ? "text-gray-500" : "text-gray-500"}`}>
              Menu Principal
            </Text>
            
            <Pressable className={`mb-2 rounded-xl ${isDark ? "bg-blue-600/20" : "bg-blue-50"} p-3`}>
              <View className="flex-row items-center">
                <View className="w-9 h-9 bg-blue-500 rounded-lg items-center justify-center mr-3">
                  <Ionicons name="stats-chart" size={20} color="white" />
                </View>
                <Text className={`font-semibold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                  Dashboard
                </Text>
              </View>
            </Pressable>
            
            {/* Outros itens do menu (não ativos) */}
            {[
              { icon: "people", label: "Clientes" },
              { icon: "cash", label: "Vendedores" },
              { icon: "wallet", label: "Despesas" },
              { icon: "card", label: "Cobranças" },
              { icon: "diamond", label: "Planos" },
            ].map((item) => (
              <Pressable key={item.label} className={`mb-2 rounded-xl p-3`}>
                <View className="flex-row items-center">
                  <View className={`w-9 h-9 ${isDark ? "bg-gray-800" : "bg-gray-100"} rounded-lg items-center justify-center mr-3`}>
                    <Ionicons name={item.icon as any} size={20} color={isDark ? "#6b7280" : "#9ca3af"} />
                  </View>
                  <Text className={`font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {item.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Settings Section */}
          <View className={`py-4 px-3 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <Text className={`px-3 mb-3 text-xs font-bold uppercase ${isDark ? "text-gray-500" : "text-gray-500"}`}>
              Configurações
            </Text>
            
            <Pressable onPress={toggleTheme} className={`mb-2 rounded-xl p-3 ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-9 h-9 bg-purple-500 rounded-lg items-center justify-center mr-3">
                    <Ionicons name={isDark ? "moon" : "sunny"} size={20} color="white" />
                  </View>
                  <Text className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Tema {isDark ? "Escuro" : "Claro"}
                  </Text>
                </View>
              </View>
            </Pressable>

            <Pressable onPress={toggleHideValues} className={`mb-2 rounded-xl p-3 ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-9 h-9 bg-indigo-500 rounded-lg items-center justify-center mr-3">
                    <Ionicons name={hideValues ? "eye-off" : "eye"} size={20} color="white" />
                  </View>
                  <Text className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    {hideValues ? "Mostrar" : "Ocultar"}
                  </Text>
                </View>
              </View>
            </Pressable>

            <Pressable onPress={handleLogout} className={`rounded-xl p-3 ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
              <View className="flex-row items-center">
                <View className="w-9 h-9 bg-red-500 rounded-lg items-center justify-center mr-3">
                  <Ionicons name="log-out" size={20} color="white" />
                </View>
                <Text className="font-medium text-red-500">
                  Sair
                </Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      {/* Main Content */}
      <View className="flex-1">
        <ScrollView 
          className={`flex-1 ${isDark ? "bg-gray-950" : "bg-gray-50"}`}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className={`${isDark ? "bg-gray-900" : "bg-white"} px-8 py-6`}>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Seja bem-vindo(a), {user?.name?.split(' ')[0] || "Pedro"}!
                </Text>
                <Text className={`text-sm mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                  Aqui está o resumo do seu negócio hoje
                </Text>
              </View>

        {/* Seletor de Mês */}
        <View className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} border-b px-8 py-4`}>
          <View className="max-w-7xl mx-auto w-full">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setSelectedMonth("total")}
                  className={`px-4 py-2 rounded-xl ${selectedMonth === "total" ? "bg-blue-600" : isDark ? "bg-gray-700" : "bg-gray-100"}`}
                >
                  <Text className={`font-semibold ${selectedMonth === "total" ? "text-white" : isDark ? "text-gray-300" : "text-gray-700"}`}>
                    📊 Total (Tudo)
                  </Text>
                </Pressable>
                
                {availableMonths.map(month => (
                  <Pressable
                    key={month.key}
                    onPress={() => setSelectedMonth(month.key)}
                    className={`px-4 py-2 rounded-xl ${selectedMonth === month.key ? "bg-blue-600" : isDark ? "bg-gray-700" : "bg-gray-100"}`}
                  >
                    <Text className={`font-semibold ${selectedMonth === month.key ? "text-white" : isDark ? "text-gray-300" : "text-gray-700"}`}>
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
            <View className={`flex-1 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl p-6 shadow-lg border`}>
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 bg-green-100 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="trending-up" size={24} color="#10b981" />
                </View>
                <Text className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm font-semibold`}>LUCRO LÍQUIDO</Text>
              </View>
              <MoneyDisplay 
                value={filteredSummary.netProfit} 
                size="xl" 
                color="#10b981"
                showToggle={true}
              />
              <Text className={`${isDark ? "text-gray-500" : "text-gray-500"} text-sm`}>
                Receita: <MoneyDisplay value={filteredSummary.totalRevenue} size="sm" />
              </Text>
            </View>

            {/* Card Receita Total */}
            <View className={`flex-1 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl p-6 shadow-lg border`}>
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="cash" size={24} color="#3b82f6" />
                </View>
                <Text className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm font-semibold`}>RECEITA TOTAL</Text>
              </View>
              <MoneyDisplay 
                value={filteredSummary.totalRevenue} 
                size="xl" 
                color="#3b82f6"
              />
              <Text className={`${isDark ? "text-gray-500" : "text-gray-500"} text-sm`}>
                {clients.length} {clients.length === 1 ? "cliente" : "clientes"}
              </Text>
            </View>

            {/* Card Despesas */}
            <View className={`flex-1 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl p-6 shadow-lg border`}>
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 bg-red-100 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="wallet" size={24} color="#ef4444" />
                </View>
                <Text className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm font-semibold`}>DESPESAS TOTAIS</Text>
              </View>
              <MoneyDisplay 
                value={filteredSummary.totalExpenses} 
                size="xl" 
                color="#ef4444"
              />
              <Text className={`${isDark ? "text-gray-500" : "text-gray-500"} text-sm`}>
                Comissões + Despesas
              </Text>
            </View>
          </View>

          {/* Status de Pagamentos - Grid 3 colunas */}
          <View className="mb-8">
            <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-4`}>Status de Pagamentos</Text>
            <View className="flex-row gap-6">
              <View className={`flex-1 ${isDark ? "bg-green-900/30 border-green-700" : "bg-green-50 border-green-200"} rounded-2xl p-6 border-2`}>
                <View className="flex-row items-center mb-3">
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  <Text className="text-green-700 font-semibold ml-2">PAGOS</Text>
                </View>
                <Text className={`${isDark ? "text-green-400" : "text-green-900"} text-5xl font-bold`}>{filteredPaidClients}</Text>
              </View>

              <View className={`flex-1 ${isDark ? "bg-yellow-900/30 border-yellow-700" : "bg-yellow-50 border-yellow-200"} rounded-2xl p-6 border-2`}>
                <View className="flex-row items-center mb-3">
                  <Ionicons name="time" size={24} color="#f59e0b" />
                  <Text className="text-yellow-700 font-semibold ml-2">PENDENTES</Text>
                </View>
                <Text className={`${isDark ? "text-yellow-400" : "text-yellow-900"} text-5xl font-bold`}>{pendingClients}</Text>
              </View>

              <View className={`flex-1 ${isDark ? "bg-red-900/30 border-red-700" : "bg-red-50 border-red-200"} rounded-2xl p-6 border-2`}>
                <View className="flex-row items-center mb-3">
                  <Ionicons name="alert-circle" size={24} color="#ef4444" />
                  <Text className="text-red-700 font-semibold ml-2">ATRASADOS</Text>
                </View>
                <Text className={`${isDark ? "text-red-400" : "text-red-900"} text-5xl font-bold`}>{overdueClients}</Text>
              </View>
            </View>
          </View>

          {/* Resumo Financeiro - Grid 2 colunas */}
          <View className="flex-row gap-6">
            {/* Coluna Esquerda */}
            <View className={`flex-1 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl p-6 shadow-lg border`}>
              <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}>Resumo Financeiro</Text>
              
              <View className="space-y-4">
                <View className={`flex-row items-center justify-between py-4 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-green-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="arrow-down" size={20} color="#10b981" />
                    </View>
                    <Text className={`${isDark ? "text-gray-300" : "text-gray-700"} font-medium`}>Receita Total</Text>
                  </View>
                  <MoneyDisplay value={filteredSummary.totalRevenue} size="lg" color="#059669" />
                </View>

                <View className={`flex-row items-center justify-between py-4 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-orange-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="people" size={20} color="#f97316" />
                    </View>
                    <Text className={`${isDark ? "text-gray-300" : "text-gray-700"} font-medium`}>Comissões</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-orange-600 text-xl font-bold mr-1">-</Text>
                    <MoneyDisplay value={filteredSummary.totalCommissions} size="lg" color="#f97316" />
                  </View>
                </View>

                <View className={`flex-row items-center justify-between py-4 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-purple-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="cart" size={20} color="#a855f7" />
                    </View>
                    <Text className={`${isDark ? "text-gray-300" : "text-gray-700"} font-medium`}>Despesas Extras</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-purple-600 text-xl font-bold mr-1">-</Text>
                    <MoneyDisplay value={summary.totalExtraExpenses} size="lg" color="#a855f7" />
                  </View>
                </View>

                <View className={`flex-row items-center justify-between py-4 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="business" size={20} color="#3b82f6" />
                    </View>
                    <Text className={`${isDark ? "text-gray-300" : "text-gray-700"} font-medium`}>Despesas da Agência</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-blue-600 text-xl font-bold mr-1">-</Text>
                    <MoneyDisplay value={summary.totalAgencyExpenses} size="lg" color="#3b82f6" />
                  </View>
                </View>

                <View className="flex-row items-center justify-between py-4">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-red-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="arrow-up" size={20} color="#ef4444" />
                    </View>
                    <Text className={`${isDark ? "text-gray-300" : "text-gray-700"} font-medium`}>Total de Despesas</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-red-600 text-xl font-bold mr-1">-</Text>
                    <MoneyDisplay value={filteredSummary.totalExpenses} size="lg" color="#ef4444" />
                  </View>
                </View>
              </View>

              <View className={`${isDark ? "bg-green-900/30 border-green-700" : "bg-green-50 border-green-200"} rounded-xl p-6 mt-6 border-2`}>
                <View className="flex-row items-center justify-between">
                  <Text className={`${isDark ? "text-gray-300" : "text-gray-700"} text-lg font-bold`}>Lucro Líquido</Text>
                  <MoneyDisplay value={filteredSummary.netProfit} size="xl" color="#059669" />
                </View>
              </View>
            </View>

            {/* Coluna Direita - Estatísticas Rápidas */}
            <View className="flex-1 space-y-6">
              <View className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl p-6 shadow-lg border`}>
                <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"} mb-4`}>📊 Estatísticas</Text>
                
                <View className="space-y-4">
                  <View>
                    <Text className={`${isDark ? "text-gray-500" : "text-gray-500"} text-sm mb-1`}>Total de Clientes</Text>
                    <Text className={`${isDark ? "text-white" : "text-gray-900"} text-2xl font-bold`}>{clients.length}</Text>
                  </View>
                  
                  <View>
                    <Text className={`${isDark ? "text-gray-500" : "text-gray-500"} text-sm mb-1`}>Despesas da Agência</Text>
                    <Text className={`${isDark ? "text-white" : "text-gray-900"} text-2xl font-bold`}>{agencyExpenses.length}</Text>
                  </View>
                  
                  <View>
                    <Text className={`${isDark ? "text-gray-500" : "text-gray-500"} text-sm mb-1`}>Comissões Registradas</Text>
                    <Text className={`${isDark ? "text-white" : "text-gray-900"} text-2xl font-bold`}>{sellerCommissions.length}</Text>
                  </View>
                </View>
              </View>

              <View className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg">
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
        className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
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
        
        {/* Header with User Info and Controls */}
        <View className="mb-8">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-1`}>
                TrafficFlow Pro
              </Text>
              <Text className={`text-base ${isDark ? "text-gray-400" : "text-gray-500"}`}>
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
          
          {/* Controles de Tema e Visibilidade */}
          <View className="flex-row gap-3 mb-4">
            <Pressable
              onPress={toggleHideValues}
              className={`flex-1 flex-row items-center justify-center gap-2 px-4 py-3 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border`}
            >
              <Ionicons name={hideValues ? "eye-off" : "eye"} size={18} color={isDark ? "#9ca3af" : "#6b7280"} />
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"} font-semibold text-sm`}>
                {hideValues ? "Mostrar" : "Ocultar"}
              </Text>
            </Pressable>
            
            <Pressable
              onPress={toggleTheme}
              className={`flex-1 flex-row items-center justify-center gap-2 px-4 py-3 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border`}
            >
              <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={isDark ? "#fbbf24" : "#6b7280"} />
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"} font-semibold text-sm`}>
                {isDark ? "Claro" : "Escuro"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Lucro Líquido Card */}
        <View className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-3xl p-6 mb-6 shadow-lg border`}>
          <View className="flex-row items-center mb-2">
            <Ionicons name="trending-up" size={24} color="#3b82f6" />
            <Text className="text-blue-600 text-base ml-2 font-medium">
              Lucro Líquido
            </Text>
          </View>
          <MoneyDisplay 
            value={filteredSummary.netProfit} 
            size="xl" 
            color="#10b981"
            showToggle={true}
          />
          <Text className="text-blue-600 text-sm mt-2">
            Receita total: <MoneyDisplay value={filteredSummary.totalRevenue} size="sm" />
          </Text>
        </View>

        {/* Seletor de Mês Mobile */}
        <View className="mb-6">
          <Text className={`${isDark ? "text-gray-300" : "text-gray-700"} font-semibold mb-3 text-sm`}>Filtrar por período:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setSelectedMonth("total")}
                className={`px-4 py-3 rounded-xl ${selectedMonth === "total" ? "bg-blue-600" : isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-300"}`}
              >
                <Text className={`font-semibold text-sm ${selectedMonth === "total" ? "text-white" : isDark ? "text-gray-300" : "text-gray-700"}`}>
                  📊 Total
                </Text>
              </Pressable>
              
              {availableMonths.slice(-6).map(month => (
                <Pressable
                  key={month.key}
                  onPress={() => setSelectedMonth(month.key)}
                  className={`px-4 py-3 rounded-xl ${selectedMonth === month.key ? "bg-blue-600" : isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-300"}`}
                >
                  <Text className={`font-semibold text-sm ${selectedMonth === month.key ? "text-white" : isDark ? "text-gray-300" : "text-gray-700"}`}>
                    {month.label.split(' ')[0]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Status dos Clientes */}
        <View className="mb-6">
          <Text className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"} mb-3`}>
            Status de Pagamentos
          </Text>
          <View className="flex-row gap-3">
            <View className={`flex-1 ${isDark ? "bg-green-900/30 border-green-700" : "bg-green-50 border-green-100"} rounded-2xl p-4 border`}>
              <View className="flex-row items-center mb-1">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <Text className="text-green-700 text-xs font-medium">PAGOS</Text>
              </View>
              <Text className={`${isDark ? "text-green-400" : "text-green-900"} text-2xl font-bold`}>{filteredPaidClients}</Text>
            </View>
            
            <View className={`flex-1 ${isDark ? "bg-yellow-900/30 border-yellow-700" : "bg-yellow-50 border-yellow-100"} rounded-2xl p-4 border`}>
              <View className="flex-row items-center mb-1">
                <View className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                <Text className="text-yellow-700 text-xs font-medium">PENDENTES</Text>
              </View>
              <Text className={`${isDark ? "text-yellow-400" : "text-yellow-900"} text-2xl font-bold`}>{pendingClients}</Text>
            </View>
            
            <View className={`flex-1 ${isDark ? "bg-red-900/30 border-red-700" : "bg-red-50 border-red-100"} rounded-2xl p-4 border`}>
              <View className="flex-row items-center mb-1">
                <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                <Text className="text-red-700 text-xs font-medium">ATRASADOS</Text>
              </View>
              <Text className={`${isDark ? "text-red-400" : "text-red-900"} text-2xl font-bold`}>{overdueClients}</Text>
            </View>
          </View>
        </View>

        {/* Resumo Financeiro Detalhado */}
        <View className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-3xl p-6 mb-6 shadow-sm border`}>
          <Text className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"} mb-4`}>
            Resumo Financeiro
          </Text>
          
          {/* Debug Info - Remover depois */}
          <View className={`${isDark ? "bg-gray-700" : "bg-gray-100"} rounded-xl p-3 mb-3`}>
            <Text className={`${isDark ? "text-gray-300" : "text-gray-700"} text-xs font-medium mb-1`}>
              📊 Debug Info:
            </Text>
            <Text className={`${isDark ? "text-gray-400" : "text-gray-600"} text-xs`}>
              Clientes: {clients.length} | Despesas Agência: {agencyExpenses.length}
            </Text>
            <Text className={`${isDark ? "text-gray-400" : "text-gray-600"} text-xs`}>
              Total Despesas Agência: <MoneyDisplay value={summary.totalAgencyExpenses} size="sm" />
            </Text>
            <Text className={`${isDark ? "text-gray-400" : "text-gray-600"} text-xs`}>
              Comissões Totais: {sellerCommissions.length} | Pagas: {sellerCommissions.filter((c) => c.paymentStatus === "paid").length}
            </Text>
            <Text className={`${isDark ? "text-gray-400" : "text-gray-600"} text-xs`}>
              Total Comissões Pagas: <MoneyDisplay value={filteredSummary.totalCommissions} size="sm" />
            </Text>
          </View>
          
          {/* Receita */}
          <View className={`flex-row justify-between items-center py-3 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="arrow-down" size={20} color="#22c55e" />
              </View>
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"} font-medium`}>Receita Total</Text>
            </View>
            <MoneyDisplay value={filteredSummary.totalRevenue} size="md" color="#059669" />
          </View>

          {/* Comissões */}
          <View className={`flex-row justify-between items-center py-3 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="people" size={20} color="#f97316" />
              </View>
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"} font-medium`}>Comissões</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-orange-600 font-semibold text-base mr-1">-</Text>
              <MoneyDisplay value={filteredSummary.totalCommissions} size="md" color="#f97316" />
            </View>
          </View>

          {/* Despesas Extras */}
          <View className={`flex-row justify-between items-center py-3 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="cash" size={20} color="#a855f7" />
              </View>
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"} font-medium`}>Despesas Extras</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-purple-600 font-semibold text-base mr-1">-</Text>
              <MoneyDisplay value={summary.totalExtraExpenses} size="md" color="#a855f7" />
            </View>
          </View>

          {/* Despesas da Agência */}
          <View className={`flex-row justify-between items-center py-3 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="business" size={20} color="#3b82f6" />
              </View>
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"} font-medium`}>Despesas da Agência</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-blue-600 font-semibold text-base mr-1">-</Text>
              <MoneyDisplay value={summary.totalAgencyExpenses} size="md" color="#3b82f6" />
            </View>
          </View>

          {/* Total de Despesas */}
          <View className={`flex-row justify-between items-center py-3 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="arrow-up" size={20} color="#ef4444" />
              </View>
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"} font-medium`}>Total de Despesas</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-red-600 font-semibold text-base mr-1">-</Text>
              <MoneyDisplay value={filteredSummary.totalExpenses} size="md" color="#ef4444" />
            </View>
          </View>

          {/* Lucro Líquido */}
          <View className="flex-row justify-between items-center pt-4">
            <Text className={`${isDark ? "text-white" : "text-gray-900"} font-bold text-base`}>Lucro Líquido</Text>
            <MoneyDisplay 
              value={filteredSummary.netProfit} 
              size="lg" 
              color={filteredSummary.netProfit >= 0 ? "#22c55e" : "#ef4444"}
            />
          </View>
        </View>
      </View>
    </ScrollView>
    </WebContainer>
  );

  // Render desktop or mobile based on screen size
  return isDesktop ? <DesktopDashboard /> : <MobileDashboard />;
}
