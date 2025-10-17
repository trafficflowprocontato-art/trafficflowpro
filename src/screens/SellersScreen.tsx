import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFinancialStore } from "../state/financialStore";
import { useAuthStore } from "../state/authStore";
import WebContainer from "../components/WebContainer";

export default function SellersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const sellerCommissions = useFinancialStore((s) => s.sellerCommissions);
  const deleteClient = useFinancialStore((s) => s.deleteClient);
  const generateCommissionsForMonth = useFinancialStore((s) => s.generateCommissionsForMonth);
  const updateCommissionStatus = useFinancialStore((s) => s.updateCommissionStatus);
  const trialInfo = useAuthStore((s) => s.trialInfo);
  const calculateTrialInfo = useAuthStore((s) => s.calculateTrialInfo);
  
  // Calcular trial info ao montar
  React.useEffect(() => {
    calculateTrialInfo();
  }, [calculateTrialInfo]);
  
  const isReadOnly = trialInfo && !trialInfo.hasFullAccess;
  
  // Mês atual no formato "2025-10"
  const [currentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split("-");
    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  };

  // Gerar comissões ao carregar a tela
  useEffect(() => {
    generateCommissionsForMonth(currentMonth);
  }, [currentMonth]);

  const commissionsThisMonth = sellerCommissions.filter((c) => c.month === currentMonth);

  const handleTogglePayment = (id: string, currentStatus: "paid" | "pending") => {
    if (isReadOnly) {
      if (Platform.OS === "web") {
        window.alert("Seu período de teste expirou. Assine para continuar editando.");
      } else {
        Alert.alert(
          "Acesso Limitado",
          "Seu período de teste expirou. Assine para continuar editando."
        );
      }
      return;
    }
    
    const newStatus = currentStatus === "paid" ? "pending" : "paid";
    const paidDate = newStatus === "paid" ? new Date().toISOString() : undefined;
    
    updateCommissionStatus(id, newStatus, paidDate);
  };

  const handleDeleteClientWithoutSeller = (clientId: string, clientName: string) => {
    if (isReadOnly) {
      if (Platform.OS === "web") {
        window.alert("Seu período de teste expirou. Assine para continuar editando.");
      } else {
        Alert.alert(
          "Acesso Limitado",
          "Seu período de teste expirou. Assine para continuar editando."
        );
      }
      return;
    }
    
    if (Platform.OS === "web") {
      const confirmed = window.confirm(`Deseja remover o cliente "${clientName}"? Isso também removerá a comissão associada.`);
      if (confirmed) {
        deleteClient(clientId);
        window.alert("Cliente e comissão removidos com sucesso!");
      }
    } else {
      Alert.alert(
        "Remover Cliente Sem Vendedor",
        `Deseja remover o cliente "${clientName}"? Isso também removerá a comissão associada.`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Remover",
            style: "destructive",
            onPress: () => {
              deleteClient(clientId);
              Alert.alert("Sucesso", "Cliente e comissão removidos com sucesso!");
            },
          },
        ]
      );
    }
  };

  // Totais
  const totalCommissions = commissionsThisMonth.reduce((sum, c) => sum + c.commissionValue, 0);
  const paidCommissions = commissionsThisMonth.filter((c) => c.paymentStatus === "paid");
  const totalPaid = paidCommissions.reduce((sum, c) => sum + c.commissionValue, 0);
  const totalPending = totalCommissions - totalPaid;

  return (
    <WebContainer>
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View style={{ paddingTop: insets.top + 20 }} className="px-6">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-900 mb-1">
              Comissões de Vendedores
            </Text>
            <Text className="text-base text-gray-500">
              {formatMonth(currentMonth)}
            </Text>
          </View>

          {/* Summary Cards */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <Text className="text-blue-700 text-xs font-medium mb-1">TOTAL</Text>
              <Text className="text-blue-900 text-xl font-bold">
                {formatCurrency(totalCommissions)}
              </Text>
            </View>
            
            <View className="flex-1 bg-green-50 rounded-2xl p-4 border border-green-100">
              <Text className="text-green-700 text-xs font-medium mb-1">PAGOS</Text>
              <Text className="text-green-900 text-xl font-bold">
                {formatCurrency(totalPaid)}
              </Text>
            </View>
            
            <View className="flex-1 bg-yellow-50 rounded-2xl p-4 border border-yellow-100">
              <Text className="text-yellow-700 text-xs font-medium mb-1">PENDENTES</Text>
              <Text className="text-yellow-900 text-xl font-bold">
                {formatCurrency(totalPending)}
              </Text>
            </View>
          </View>

          {/* Commissions List */}
          {commissionsThisMonth.length === 0 ? (
            <View className="items-center justify-center py-20">
              <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
                <Ionicons name="cash-outline" size={40} color="#9ca3af" />
              </View>
              <Text className="text-gray-500 text-base mb-2">
                Nenhuma comissão para este mês
              </Text>
              <Text className="text-gray-400 text-sm text-center px-8">
                Adicione clientes com status "PAGO" para gerar comissões
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {commissionsThisMonth.map((commission) => {
                const isPaid = commission.paymentStatus === "paid";
                const isWithoutSeller = commission.sellerName === "Sem vendedor" || !commission.sellerName;
                
                return (
                  <View
                    key={commission.id}
                    className={`bg-white rounded-2xl p-5 shadow-sm ${isWithoutSeller ? "border-2 border-red-200" : ""}`}
                  >
                    {/* Warning for clients without seller */}
                    {isWithoutSeller && (
                      <View className="bg-red-50 rounded-xl p-3 mb-3 border border-red-100">
                        <View className="flex-row items-center mb-2">
                          <Ionicons name="warning" size={20} color="#ef4444" />
                          <Text className="text-red-600 font-semibold ml-2">
                            Cliente sem vendedor
                          </Text>
                        </View>
                        <Text className="text-red-600 text-sm mb-3">
                          Este cliente não tem vendedor cadastrado. Remova-o ou adicione um vendedor.
                        </Text>
                        <View className="flex-row gap-2">
                          <Pressable
                            onPress={() => handleDeleteClientWithoutSeller(commission.clientId, commission.clientName)}
                            className="flex-1 bg-red-500 py-2 rounded-lg flex-row items-center justify-center active:bg-red-600"
                          >
                            <Ionicons name="trash" size={16} color="white" />
                            <Text className="text-white font-semibold text-sm ml-1">
                              Remover Cliente
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() => (navigation.navigate as any)("Clients")}
                            className="flex-1 bg-blue-500 py-2 rounded-lg flex-row items-center justify-center active:bg-blue-600"
                          >
                            <Ionicons name="pencil" size={16} color="white" />
                            <Text className="text-white font-semibold text-sm ml-1">
                              Ir para Clientes
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    )}

                    {/* Header */}
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <Text className={`text-lg font-semibold mb-1 ${isWithoutSeller ? "text-red-600" : "text-gray-900"}`}>
                          {commission.sellerName}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          Cliente: {commission.clientName}
                        </Text>
                      </View>
                      <View
                        className={`px-3 py-1 rounded-full ${
                          isPaid ? "bg-green-100" : "bg-yellow-100"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            isPaid ? "text-green-700" : "text-yellow-700"
                          }`}
                        >
                          {isPaid ? "Pago" : "Pendente"}
                        </Text>
                      </View>
                    </View>

                    {/* Value */}
                    <View className="bg-gray-50 rounded-xl p-3 mb-3">
                      <Text className="text-gray-600 text-sm mb-1">Valor da Comissão</Text>
                      <Text className="text-gray-900 text-2xl font-bold">
                        {formatCurrency(commission.commissionValue)}
                      </Text>
                      {isPaid && commission.paidDate && (
                        <Text className="text-gray-500 text-xs mt-1">
                          Pago em: {new Date(commission.paidDate).toLocaleDateString("pt-BR")}
                        </Text>
                      )}
                    </View>

                    {/* Toggle Button */}
                    {!isWithoutSeller && (
                      <Pressable
                        onPress={() => handleTogglePayment(commission.id, commission.paymentStatus)}
                        className={`py-3 rounded-xl flex-row items-center justify-center ${
                          isReadOnly
                            ? "bg-gray-400"
                            : isPaid
                            ? "bg-yellow-500 active:bg-yellow-600"
                            : "bg-green-500 active:bg-green-600"
                        }`}
                        disabled={isReadOnly}
                      >
                        <Ionicons
                          name={isPaid ? "close-circle" : "checkmark-circle"}
                          size={20}
                          color="white"
                        />
                        <Text className="text-white font-semibold ml-2">
                          {isReadOnly ? "Assine para Editar" : (isPaid ? "Marcar como Pendente" : "Marcar como Pago")}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </WebContainer>
  );
}
