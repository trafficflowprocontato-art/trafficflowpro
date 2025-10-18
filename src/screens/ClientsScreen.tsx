import React from "react";
import { View, Text, ScrollView, Pressable, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFinancialStore } from "../state/financialStore";
import { useAuthStore } from "../state/authStore";
import { Client } from "../types/financial";
import WebContainer from "../components/WebContainer";
import MoneyDisplay from "../components/MoneyDisplay";

export default function ClientsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const clients = useFinancialStore((s) => s.clients);
  const deleteClient = useFinancialStore((s) => s.deleteClient);
  const trialInfo = useAuthStore((s) => s.trialInfo);
  const calculateTrialInfo = useAuthStore((s) => s.calculateTrialInfo);
  
  // Calcular trial info ao montar
  React.useEffect(() => {
    calculateTrialInfo();
  }, [calculateTrialInfo]);
  
  const isReadOnly = trialInfo && !trialInfo.hasFullAccess;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" };
      case "pending":
        return { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" };
      case "overdue":
        return { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "pending":
        return "Pendente";
      case "overdue":
        return "Atrasado";
      default:
        return status;
    }
  };

  const handleDeleteClient = (id: string, name: string) => {
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
      const confirmed = window.confirm(`Tem certeza que deseja excluir ${name}?`);
      if (confirmed) {
        deleteClient(id);
      }
    } else {
      Alert.alert(
        "Excluir Cliente",
        `Tem certeza que deseja excluir ${name}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Excluir",
            style: "destructive",
            onPress: () => deleteClient(id),
          },
        ]
      );
    }
  };

  const handleEditClient = (client: Client) => {
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
    (navigation.navigate as any)("AddClient", { client });
  };
  
  const handleAddClient = () => {
    if (isReadOnly) {
      if (Platform.OS === "web") {
        window.alert("Seu período de teste expirou. Assine para continuar criando clientes.");
      } else {
        Alert.alert(
          "Acesso Limitado",
          "Seu período de teste expirou. Assine para continuar criando clientes."
        );
      }
      return;
    }
    (navigation.navigate as any)("AddClient");
  };

  return (
    <WebContainer>
      <View className="flex-1 bg-gray-50">
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View style={{ paddingTop: insets.top + 20 }} className="px-6">
          {/* Header */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-1">
                <Text className="text-3xl font-bold text-gray-900 mb-1">
                  Clientes
                </Text>
                <Text className="text-base text-gray-500">
                  {clients.length} {clients.length === 1 ? "cliente" : "clientes"} cadastrados
                </Text>
              </View>
              <Pressable
                onPress={handleAddClient}
                className={`px-5 py-3 rounded-xl flex-row items-center shadow-sm ${
                  isReadOnly ? "bg-gray-400" : "bg-blue-500 active:bg-blue-600"
                }`}
                disabled={isReadOnly}
              >
                <Ionicons name="add-circle" size={20} color="white" />
                <Text className="text-white font-semibold text-sm ml-2">
                  {isReadOnly ? "Assinar" : "Novo Cliente"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Empty State */}
          {clients.length === 0 ? (
            <View className="items-center justify-center py-20">
              <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
                <Ionicons name="people-outline" size={40} color="#9ca3af" />
              </View>
              <Text className="text-gray-500 text-base mb-2">
                Nenhum cliente cadastrado
              </Text>
              <Text className="text-gray-400 text-sm text-center px-8">
                Adicione seu primeiro cliente tocando no botão abaixo
              </Text>
            </View>
          ) : (
            /* Clients List */
            <View className="gap-4">
              {clients.map((client) => {
                const statusColors = getStatusColor(client.paymentStatus);
                const totalExtraExpenses = client.extraExpenses.reduce(
                  (sum, exp) => sum + exp.value,
                  0
                );
                const commission = (client.monthlyValue * client.sellerCommission) / 100;

                return (
                  <View
                    key={client.id}
                    className="bg-white rounded-2xl p-5 shadow-sm"
                  >
                     {/* Header with Name and Status */}
                    <View className="flex-row justify-between items-start mb-4">
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-900 mb-1">
                          {client.name}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          Vencimento: dia {client.paymentDate}
                        </Text>
                        {(!client.sellerName || client.sellerName.trim() === "") && (
                          <View className="flex-row items-center mt-1">
                            <Ionicons name="warning" size={14} color="#ef4444" />
                            <Text className="text-red-500 text-xs ml-1 font-medium">
                              Vendedor não definido
                            </Text>
                          </View>
                        )}
                      </View>
                      <View
                        className={`px-3 py-1 rounded-full border ${statusColors.bg} ${statusColors.border}`}
                      >
                        <Text className={`text-xs font-medium ${statusColors.text}`}>
                          {getStatusText(client.paymentStatus)}
                        </Text>
                      </View>
                    </View>

                    {/* Financial Info */}
                    <View className="border-t border-gray-100 pt-4 mb-4">
                      {client.sellerName && client.sellerName.trim() !== "" && (
                        <View className="flex-row justify-between mb-2">
                          <Text className="text-gray-600 text-sm">Vendedor</Text>
                          <Text className="text-gray-900 font-medium">
                            {client.sellerName}
                          </Text>
                        </View>
                      )}
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600 text-sm">Valor Mensal</Text>
                        <MoneyDisplay value={client.monthlyValue} size="md" />
                      </View>
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600 text-sm">
                          Comissão ({client.sellerCommission}%)
                        </Text>
                        <MoneyDisplay value={commission} size="md" color="#f97316" />
                      </View>
                      {totalExtraExpenses > 0 && (
                        <View className="flex-row justify-between">
                          <Text className="text-gray-600 text-sm">
                            Despesas Extras
                          </Text>
                          <MoneyDisplay value={totalExtraExpenses} size="md" color="#a855f7" />
                        </View>
                      )}
                    </View>

                    {/* Extra Expenses List */}
                    {client.extraExpenses.length > 0 && (
                      <View className="bg-gray-50 rounded-xl p-3 mb-4">
                        <Text className="text-gray-700 font-medium text-sm mb-2">
                          Despesas Extras:
                        </Text>
                        {client.extraExpenses.map((expense) => (
                          <View
                            key={expense.id}
                            className="flex-row justify-between py-1"
                          >
                            <Text className="text-gray-600 text-sm flex-1">
                              • {expense.description}
                            </Text>
                            <MoneyDisplay value={expense.value} size="sm" />
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Actions */}
                    <View className="flex-row gap-3">
                      <Pressable
                        onPress={() => handleEditClient(client)}
                        className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${
                          isReadOnly ? "bg-gray-300" : "bg-blue-500 active:bg-blue-600"
                        }`}
                        disabled={isReadOnly}
                      >
                        <Ionicons name="pencil" size={18} color={isReadOnly ? "#9ca3af" : "white"} />
                        <Text className={`font-semibold ml-2 ${isReadOnly ? "text-gray-500" : "text-white"}`}>
                          Editar
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleDeleteClient(client.id, client.name)}
                        className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${
                          isReadOnly ? "bg-gray-300" : "bg-red-500 active:bg-red-600"
                        }`}
                        disabled={isReadOnly}
                      >
                        <Ionicons name="trash" size={18} color={isReadOnly ? "#9ca3af" : "white"} />
                        <Text className={`font-semibold ml-2 ${isReadOnly ? "text-gray-500" : "text-white"}`}>
                          Excluir
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
    </WebContainer>
  );
}
