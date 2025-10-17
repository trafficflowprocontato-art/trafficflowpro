import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFinancialStore } from "../state/financialStore";
import type { Client } from "../types/financial";
import WebContainer from "../components/WebContainer";

export default function PaymentsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const clients = useFinancialStore((s) => s.clients);
  const updateClient = useFinancialStore((s) => s.updateClient);
  
  const [filter, setFilter] = useState<"all" | "pending" | "overdue" | "paid">("all");

  // Calcular status automaticamente baseado na data
  const getClientStatus = (client: Client): "paid" | "pending" | "overdue" | null => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    // Se tem primeiro mês de pagamento definido, verificar se já chegou
    if (client.firstPaymentMonth) {
      // Converter "2025-11" para Date
      const [year, month] = client.firstPaymentMonth.split('-').map(Number);
      const firstPaymentDate = new Date(year, month - 1, 1);
      const todayFirstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // Se ainda não chegou no primeiro mês de pagamento
      if (todayFirstDay < firstPaymentDate) {
        return null; // Não cobra ainda
      }
    }
    
    // Se já pagou este mês
    if (client.lastPaymentMonth === currentMonth) {
      return "paid";
    }
    
    // Se passou do dia de vencimento
    if (currentDay > client.paymentDate) {
      return "overdue";
    }
    
    // Ainda está no prazo
    return "pending";
  };

  // Filtrar clientes
  // Filtrar clientes
  const filteredClients = useMemo(() => {
    return clients
      .map(client => ({
        ...client,
        realStatus: getClientStatus(client)
      }))
      .filter(client => {
        // Não mostrar clientes que ainda não começaram a ser cobrados
        if (client.realStatus === null) return false;
        
        if (filter === "all") return true;
        return client.realStatus === filter;
      })
      .sort((a, b) => {
        // Atrasados primeiro
        if (a.realStatus === "overdue" && b.realStatus !== "overdue") return -1;
        if (a.realStatus !== "overdue" && b.realStatus === "overdue") return 1;
        // Depois por dia de vencimento
        return a.paymentDate - b.paymentDate;
      });
  }, [clients, filter]);

  // Contadores
  const counts = useMemo(() => {
    const all = clients.map(c => ({ ...c, realStatus: getClientStatus(c) })).filter(c => c.realStatus !== null);
    return {
      all: all.length,
      pending: all.filter(c => c.realStatus === "pending").length,
      overdue: all.filter(c => c.realStatus === "overdue").length,
      paid: all.filter(c => c.realStatus === "paid").length,
    };
  }, [clients]);
      paid: all.filter(c => c.realStatus === "paid").length,
    };
  }, [clients]);

  const handleMarkAsPaid = (client: Client & { realStatus: string }) => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    Alert.alert(
      "Confirmar Pagamento",
      `Marcar ${client.name} como PAGO neste mês?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: () => {
            updateClient(client.id, {
              ...client,
              lastPaymentMonth: currentMonth,
              paymentStatus: "paid"
            });
          }
        }
      ]
    );
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      paid: { bg: "bg-green-100", text: "text-green-700", label: "Pago", icon: "checkmark-circle" as const },
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pendente", icon: "time" as const },
      overdue: { bg: "bg-red-100", text: "text-red-700", label: "Atrasado", icon: "alert-circle" as const },
    };
    
    const c = config[status as keyof typeof config];
    
    return (
      <View className={`flex-row items-center px-3 py-1 rounded-full ${c.bg}`}>
        <Ionicons name={c.icon} size={14} color={c.text.includes('green') ? '#15803d' : c.text.includes('yellow') ? '#a16207' : '#b91c1c'} />
        <Text className={`ml-1 text-xs font-semibold ${c.text}`}>{c.label}</Text>
      </View>
    );
  };

  return (
    <WebContainer>
      <ScrollView className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="bg-blue-600 px-6 py-6 pb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Pressable onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
            <Text className="text-2xl font-bold text-white">Cobranças</Text>
            <View className="w-10" />
          </View>
        </View>

        {/* Filtros */}
        <View className="px-4 -mt-4 mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            <Pressable
              onPress={() => setFilter("all")}
              className={`mr-3 px-4 py-3 rounded-xl flex-row items-center ${filter === "all" ? "bg-blue-600" : "bg-white"}`}
            >
              <Text className={`font-semibold ${filter === "all" ? "text-white" : "text-gray-700"}`}>
                Todos ({counts.all})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setFilter("overdue")}
              className={`mr-3 px-4 py-3 rounded-xl flex-row items-center ${filter === "overdue" ? "bg-red-600" : "bg-white"}`}
            >
              <Ionicons name="alert-circle" size={18} color={filter === "overdue" ? "white" : "#ef4444"} />
              <Text className={`ml-2 font-semibold ${filter === "overdue" ? "text-white" : "text-red-600"}`}>
                Atrasados ({counts.overdue})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setFilter("pending")}
              className={`mr-3 px-4 py-3 rounded-xl flex-row items-center ${filter === "pending" ? "bg-yellow-600" : "bg-white"}`}
            >
              <Ionicons name="time" size={18} color={filter === "pending" ? "white" : "#eab308"} />
              <Text className={`ml-2 font-semibold ${filter === "pending" ? "text-white" : "text-yellow-600"}`}>
                Pendentes ({counts.pending})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setFilter("paid")}
              className={`mr-3 px-4 py-3 rounded-xl flex-row items-center ${filter === "paid" ? "bg-green-600" : "bg-white"}`}
            >
              <Ionicons name="checkmark-circle" size={18} color={filter === "paid" ? "white" : "#22c55e"} />
              <Text className={`ml-2 font-semibold ${filter === "paid" ? "text-white" : "text-green-600"}`}>
                Pagos ({counts.paid})
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Lista de Clientes */}
        <View className="px-4 pb-6">
          {filteredClients.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center">
              <Ionicons name="checkmark-circle-outline" size={64} color="#9ca3af" />
              <Text className="text-gray-500 text-center mt-4">
                Nenhum cliente {filter !== "all" && `com status "${filter}"`}
              </Text>
            </View>
          ) : (
            filteredClients.map((client) => (
              <View key={client.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900">{client.name}</Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      Vencimento: dia {client.paymentDate}
                    </Text>
                    {client.sellerName && (
                      <Text className="text-sm text-gray-500">
                        Vendedor: {client.sellerName}
                      </Text>
                    )}
                  </View>
                  <StatusBadge status={client.realStatus} />
                </View>

                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                  <Text className="text-2xl font-bold text-blue-600">
                    R$ {client.monthlyValue.toFixed(2)}
                  </Text>

                  {client.realStatus !== "paid" && (
                    <Pressable
                      onPress={() => handleMarkAsPaid(client)}
                      className="bg-green-600 px-4 py-2 rounded-xl flex-row items-center"
                    >
                      <Ionicons name="checkmark" size={18} color="white" />
                      <Text className="text-white font-semibold ml-2">Marcar como Pago</Text>
                    </Pressable>
                  )}

                  {client.realStatus === "paid" && (
                    <View className="flex-row items-center">
                      <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                      <Text className="text-green-600 font-semibold ml-2">Pago este mês</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </WebContainer>
  );
}
