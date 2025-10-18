import React from "react";
import { View, Text, ScrollView, useWindowDimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFinancialStore } from "../state/financialStore";
import WebContainer from "../components/WebContainer";

export default function GraphicsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  
  const clients = useFinancialStore((s) => s.clients);
  const getFinancialSummary = useFinancialStore((s) => s.getFinancialSummary);
  const summary = getFinancialSummary();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Dados para gráfico de pizza - Clientes por Status
  const paidClients = clients.filter((c) => c.paymentStatus === "paid").length;
  const pendingClients = clients.filter((c) => c.paymentStatus === "pending").length;
  const overdueClients = clients.filter((c) => c.paymentStatus === "overdue").length;
  const totalClients = clients.length;

  const paidPercent = totalClients > 0 ? (paidClients / totalClients) * 100 : 0;
  const pendingPercent = totalClients > 0 ? (pendingClients / totalClients) * 100 : 0;
  const overduePercent = totalClients > 0 ? (overdueClients / totalClients) * 100 : 0;

  // Previsão do mês atual
  const getCurrentMonthForecast = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const totalExpected = clients.reduce((sum, c) => sum + c.monthlyValue, 0);
    const paidThisMonth = clients
      .filter(c => c.lastPaymentMonth === currentMonth)
      .reduce((sum, c) => sum + c.monthlyValue, 0);
    const toReceive = totalExpected - paidThisMonth;
    
    return { totalExpected, paidThisMonth, toReceive };
  };
  
  const forecast = getCurrentMonthForecast();

  // Cálculo de margem de lucro
  const profitMargin = summary.totalRevenue > 0
    ? ((summary.netProfit / summary.totalRevenue) * 100).toFixed(1)
    : "0";

  return (
    <WebContainer>
      <View className="flex-1 bg-gray-50">
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingTop: insets.top + 20 }} className="px-6">
            {/* Header */}
            <View className="mb-6">
              <Text className="text-3xl font-bold text-gray-900 mb-1">
                📊 Gráficos e Análises
              </Text>
              <Text className="text-base text-gray-500">
                Visualize o desempenho financeiro da sua agência
              </Text>
            </View>

            {/* KPIs Cards */}
            <View className={`gap-4 mb-6 ${isDesktop ? "flex-row" : ""}`}>
              <View className="flex-1 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-5 shadow-lg">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-white text-sm font-semibold opacity-90">LUCRO LÍQUIDO</Text>
                  <Ionicons name="trending-up" size={24} color="rgba(255,255,255,0.9)" />
                </View>
                <Text className="text-white text-3xl font-bold mb-1">
                  {formatCurrency(summary.netProfit)}
                </Text>
                <Text className="text-white text-xs opacity-75">
                  Margem: {profitMargin}%
                </Text>
              </View>

              <View className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 shadow-lg">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-white text-sm font-semibold opacity-90">FATURAMENTO</Text>
                  <Ionicons name="cash" size={24} color="rgba(255,255,255,0.9)" />
                </View>
                <Text className="text-white text-3xl font-bold mb-1">
                  {formatCurrency(summary.totalRevenue)}
                </Text>
                <Text className="text-white text-xs opacity-75">
                  {totalClients} clientes ativos
                </Text>
              </View>

              <View className="flex-1 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-5 shadow-lg">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-white text-sm font-semibold opacity-90">DESPESAS</Text>
                  <Ionicons name="wallet" size={24} color="rgba(255,255,255,0.9)" />
                </View>
                <Text className="text-white text-3xl font-bold mb-1">
                  {formatCurrency(summary.totalExpenses)}
                </Text>
                <Text className="text-white text-xs opacity-75">
                  {((summary.totalExpenses / summary.totalRevenue) * 100).toFixed(1)}% do faturamento
                </Text>
              </View>
            </View>

            {/* Gráfico de Pizza - Clientes por Status */}
            <View className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                🥧 Clientes por Status de Pagamento
              </Text>
              
              <View className={`${isDesktop ? "flex-row items-center" : ""} gap-6`}>
                {/* Pizza Chart Visual - Simplificado */}
                <View className="items-center justify-center mb-6">
                  <View className="w-48 h-48 rounded-full border-8 border-gray-200 items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
                    <View>
                      <Text className="text-4xl font-bold text-gray-900 text-center">{totalClients}</Text>
                      <Text className="text-sm text-gray-500 text-center">Clientes</Text>
                    </View>
                  </View>
                  
                  {/* Mini indicadores de status */}
                  <View className="flex-row gap-2 mt-4">
                    <View className="items-center">
                      <View className="w-12 h-12 bg-green-500 rounded-full items-center justify-center">
                        <Text className="text-white font-bold">{paidClients}</Text>
                      </View>
                      <Text className="text-xs text-gray-500 mt-1">Pagos</Text>
                    </View>
                    <View className="items-center">
                      <View className="w-12 h-12 bg-yellow-500 rounded-full items-center justify-center">
                        <Text className="text-white font-bold">{pendingClients}</Text>
                      </View>
                      <Text className="text-xs text-gray-500 mt-1">Pendentes</Text>
                    </View>
                    <View className="items-center">
                      <View className="w-12 h-12 bg-red-500 rounded-full items-center justify-center">
                        <Text className="text-white font-bold">{overdueClients}</Text>
                      </View>
                      <Text className="text-xs text-gray-500 mt-1">Atrasados</Text>
                    </View>
                  </View>
                </View>

                {/* Legenda */}
                <View className="flex-1 gap-3">
                  <View className="flex-row items-center justify-between bg-green-50 p-4 rounded-xl">
                    <View className="flex-row items-center gap-3">
                      <View className="w-4 h-4 bg-green-500 rounded-full" />
                      <View>
                        <Text className="text-gray-700 font-semibold">Pagos</Text>
                        <Text className="text-gray-500 text-xs">{paidClients} clientes</Text>
                      </View>
                    </View>
                    <Text className="text-green-600 font-bold text-lg">{paidPercent.toFixed(0)}%</Text>
                  </View>

                  <View className="flex-row items-center justify-between bg-yellow-50 p-4 rounded-xl">
                    <View className="flex-row items-center gap-3">
                      <View className="w-4 h-4 bg-yellow-500 rounded-full" />
                      <View>
                        <Text className="text-gray-700 font-semibold">Pendentes</Text>
                        <Text className="text-gray-500 text-xs">{pendingClients} clientes</Text>
                      </View>
                    </View>
                    <Text className="text-yellow-600 font-bold text-lg">{pendingPercent.toFixed(0)}%</Text>
                  </View>

                  <View className="flex-row items-center justify-between bg-red-50 p-4 rounded-xl">
                    <View className="flex-row items-center gap-3">
                      <View className="w-4 h-4 bg-red-500 rounded-full" />
                      <View>
                        <Text className="text-gray-700 font-semibold">Atrasados</Text>
                        <Text className="text-gray-500 text-xs">{overdueClients} clientes</Text>
                      </View>
                    </View>
                    <Text className="text-red-600 font-bold text-lg">{overduePercent.toFixed(0)}%</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Gráfico de Barras - Faturamento vs Despesas */}
            <View className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                📊 Análise Financeira
              </Text>
              
              <View className="gap-5">
                {/* Faturamento */}
                <View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-700 font-semibold">💰 Faturamento Total</Text>
                    <Text className="text-green-600 font-bold">{formatCurrency(summary.totalRevenue)}</Text>
                  </View>
                  <View className="h-8 bg-gray-100 rounded-full overflow-hidden">
                    <View 
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full items-end justify-center pr-3"
                      style={{ width: "100%" }}
                    >
                      <Text className="text-white text-xs font-bold">100%</Text>
                    </View>
                  </View>
                </View>

                {/* Despesas */}
                <View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-700 font-semibold">💸 Despesas Totais</Text>
                    <Text className="text-red-600 font-bold">{formatCurrency(summary.totalExpenses)}</Text>
                  </View>
                  <View className="h-8 bg-gray-100 rounded-full overflow-hidden">
                    <View 
                      className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full items-end justify-center pr-3"
                      style={{ 
                        width: `${Math.min((summary.totalExpenses / Math.max(summary.totalRevenue, 1)) * 100, 100)}%` 
                      }}
                    >
                      <Text className="text-white text-xs font-bold">
                        {((summary.totalExpenses / Math.max(summary.totalRevenue, 1)) * 100).toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Lucro */}
                <View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-700 font-semibold">📈 Lucro Líquido</Text>
                    <Text className={`font-bold ${summary.netProfit >= 0 ? "text-blue-600" : "text-red-600"}`}>
                      {formatCurrency(summary.netProfit)}
                    </Text>
                  </View>
                  <View className="h-8 bg-gray-100 rounded-full overflow-hidden">
                    <View 
                      className={`h-full rounded-full items-end justify-center pr-3 ${
                        summary.netProfit >= 0 
                          ? "bg-gradient-to-r from-blue-400 to-blue-600" 
                          : "bg-gradient-to-r from-red-400 to-red-600"
                      }`}
                      style={{ 
                        width: `${Math.min(Math.abs(summary.netProfit) / Math.max(summary.totalRevenue, 1) * 100, 100)}%` 
                      }}
                    >
                      <Text className="text-white text-xs font-bold">
                        {((Math.abs(summary.netProfit) / Math.max(summary.totalRevenue, 1)) * 100).toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Breakdown de Despesas */}
              <View className="mt-6 pt-6 border-t border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-3">
                  Detalhamento de Despesas
                </Text>
                
                <View className="gap-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-600">Comissões de Vendedores</Text>
                    <Text className="text-gray-900 font-semibold">{formatCurrency(summary.totalCommissions)}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-600">Despesas Extras de Clientes</Text>
                    <Text className="text-gray-900 font-semibold">{formatCurrency(summary.totalExtraExpenses)}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-600">Despesas da Agência</Text>
                    <Text className="text-gray-900 font-semibold">{formatCurrency(summary.totalAgencyExpenses)}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Previsão do Mês */}
            <View className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 shadow-lg mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="calendar" size={28} color="white" />
                <Text className="text-white text-xl font-bold ml-3">
                  🔮 Previsão do Mês Atual
                </Text>
              </View>

              <View className="gap-4">
                <View className="bg-white bg-opacity-20 rounded-xl p-4">
                  <Text className="text-white text-sm opacity-90 mb-1">Faturamento Esperado</Text>
                  <Text className="text-white text-2xl font-bold">{formatCurrency(forecast.totalExpected)}</Text>
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1 bg-white bg-opacity-20 rounded-xl p-4">
                    <Text className="text-white text-xs opacity-90 mb-1">Já Recebido</Text>
                    <Text className="text-white text-lg font-bold">{formatCurrency(forecast.paidThisMonth)}</Text>
                    <Text className="text-white text-xs opacity-75 mt-1">
                      {forecast.totalExpected > 0 ? ((forecast.paidThisMonth / forecast.totalExpected) * 100).toFixed(0) : 0}%
                    </Text>
                  </View>

                  <View className="flex-1 bg-white bg-opacity-20 rounded-xl p-4">
                    <Text className="text-white text-xs opacity-90 mb-1">A Receber</Text>
                    <Text className="text-white text-lg font-bold">{formatCurrency(forecast.toReceive)}</Text>
                    <Text className="text-white text-xs opacity-75 mt-1">
                      {forecast.totalExpected > 0 ? ((forecast.toReceive / forecast.totalExpected) * 100).toFixed(0) : 0}%
                    </Text>
                  </View>
                </View>

                {/* Barra de progresso */}
                <View className="bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
                  <View 
                    className="h-full bg-white rounded-full"
                    style={{ 
                      width: `${forecast.totalExpected > 0 ? (forecast.paidThisMonth / forecast.totalExpected) * 100 : 0}%` 
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Insights e Recomendações */}
            <View className="bg-white rounded-2xl p-6 shadow-lg">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                💡 Insights e Recomendações
              </Text>
              
              <View className="gap-3">
                {summary.netProfit > 0 && (
                  <View className="flex-row items-start bg-green-50 p-4 rounded-xl">
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                    <View className="flex-1 ml-3">
                      <Text className="text-green-800 font-semibold mb-1">Lucro Positivo!</Text>
                      <Text className="text-green-700 text-sm">
                        Sua agência está lucrando {profitMargin}%. Continue assim!
                      </Text>
                    </View>
                  </View>
                )}

                {overdueClients > 0 && (
                  <View className="flex-row items-start bg-red-50 p-4 rounded-xl">
                    <Ionicons name="alert-circle" size={24} color="#ef4444" />
                    <View className="flex-1 ml-3">
                      <Text className="text-red-800 font-semibold mb-1">Atenção aos Atrasos</Text>
                      <Text className="text-red-700 text-sm">
                        Você tem {overdueClients} cliente{overdueClients > 1 ? "s" : ""} com pagamento atrasado. Entre em contato!
                      </Text>
                    </View>
                  </View>
                )}

                {forecast.toReceive > 0 && (
                  <View className="flex-row items-start bg-blue-50 p-4 rounded-xl">
                    <Ionicons name="information-circle" size={24} color="#3b82f6" />
                    <View className="flex-1 ml-3">
                      <Text className="text-blue-800 font-semibold mb-1">A Receber este Mês</Text>
                      <Text className="text-blue-700 text-sm">
                        Você ainda tem {formatCurrency(forecast.toReceive)} para receber neste mês.
                      </Text>
                    </View>
                  </View>
                )}

                {summary.totalExpenses / summary.totalRevenue > 0.7 && summary.totalRevenue > 0 && (
                  <View className="flex-row items-start bg-yellow-50 p-4 rounded-xl">
                    <Ionicons name="warning" size={24} color="#f59e0b" />
                    <View className="flex-1 ml-3">
                      <Text className="text-yellow-800 font-semibold mb-1">Despesas Altas</Text>
                      <Text className="text-yellow-700 text-sm">
                        Suas despesas representam {((summary.totalExpenses / summary.totalRevenue) * 100).toFixed(0)}% do faturamento. Considere otimizar custos.
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </WebContainer>
  );
}
