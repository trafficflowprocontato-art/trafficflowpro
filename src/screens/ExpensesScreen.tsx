import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFinancialStore } from "../state/financialStore";
import { useAuthStore } from "../state/authStore";
import { AgencyExpense } from "../types/financial";
import WebContainer from "../components/WebContainer";
import MoneyDisplay from "../components/MoneyDisplay";

export default function ExpensesScreen() {
  const insets = useSafeAreaInsets();
  const agencyExpenses = useFinancialStore((s) => s.agencyExpenses);
  const addAgencyExpense = useFinancialStore((s) => s.addAgencyExpense);
  const deleteAgencyExpense = useFinancialStore((s) => s.deleteAgencyExpense);
  const trialInfo = useAuthStore((s) => s.trialInfo);
  const calculateTrialInfo = useAuthStore((s) => s.calculateTrialInfo);

  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Calcular trial info ao montar
  React.useEffect(() => {
    calculateTrialInfo();
  }, [calculateTrialInfo]);
  
  const isReadOnly = trialInfo && !trialInfo.hasFullAccess;

  // Função para permitir apenas números e pontos/vírgulas
  const handleNumericInput = (text: string) => {
    const cleaned = text.replace(/[^0-9.,]/g, '');
    const normalized = cleaned.replace(',', '.');
    setValue(normalized);
  };

  const handleAddExpense = async () => {
    if (isReadOnly) {
      if (Platform.OS === "web") {
        window.alert("Seu período de teste expirou. Assine para continuar adicionando despesas.");
      } else {
        Alert.alert(
          "Acesso Limitado",
          "Seu período de teste expirou. Assine para continuar adicionando despesas."
        );
      }
      return;
    }
    
    if (!description.trim() || !value) {
      if (Platform.OS === "web") {
        window.alert("Por favor, preencha a descrição e o valor.");
      } else {
        Alert.alert("Campos obrigatórios", "Por favor, preencha a descrição e o valor.");
      }
      return;
    }

    const expense: AgencyExpense = {
      id: Date.now().toString(),
      description: description.trim(),
      value: parseFloat(value),
      category: category.trim() || "Geral",
    };

    try {
      await addAgencyExpense(expense);
      setDescription("");
      setValue("");
      setCategory("");
      setShowAddForm(false);
      
      if (Platform.OS === "web") {
        // Sucesso silencioso no web
      } else {
        Alert.alert("Sucesso", "Despesa adicionada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao adicionar despesa:", error);
      if (Platform.OS === "web") {
        window.alert("Erro ao adicionar despesa. Tente novamente.");
      } else {
        Alert.alert("Erro", "Não foi possível adicionar a despesa. Tente novamente.");
      }
    }
  };

  const handleDeleteExpense = (id: string, desc: string) => {
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
      const confirmed = window.confirm(`Tem certeza que deseja excluir "${desc}"?`);
      if (confirmed) {
        deleteAgencyExpense(id);
      }
    } else {
      Alert.alert(
        "Excluir Despesa",
        `Tem certeza que deseja excluir "${desc}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Excluir",
            style: "destructive",
            onPress: () => deleteAgencyExpense(id),
          },
        ]
      );
    }
  };

  const totalExpenses = agencyExpenses.reduce(
    (sum, expense) => sum + expense.value,
    0
  );

  const expensesByCategory = agencyExpenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = [];
    }
    acc[expense.category].push(expense);
    return acc;
  }, {} as Record<string, AgencyExpense[]>);

  return (
    <WebContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-gray-50"
      >
        <View className="flex-1">
          <ScrollView
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ paddingTop: insets.top + 20 }} className="px-6">
              {/* Header */}
              <View className="mb-6">
                <Text className="text-3xl font-bold text-gray-900 mb-1">
                  Despesas da Agência
                </Text>
                <Text className="text-base text-gray-500">
                  Gerencie os custos operacionais
                </Text>
              </View>

              {/* Total Card */}
              <View className="bg-red-500 rounded-3xl p-6 mb-6 shadow-lg">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="wallet" size={24} color="white" />
                  <Text className="text-white text-base ml-2 font-medium">
                    Total de Despesas
                  </Text>
                </View>
                <MoneyDisplay 
                  value={totalExpenses} 
                  size="xl" 
                  color="#ffffff"
                  showToggle={true}
                />
                <Text className="text-red-100 text-sm mt-2">
                  {agencyExpenses.length}{" "}
                  {agencyExpenses.length === 1 ? "despesa" : "despesas"} cadastradas
                </Text>
              </View>

              {/* Add Button */}
              <Pressable
                onPress={() => {
                  if (isReadOnly) {
                    if (Platform.OS === "web") {
                      window.alert("Seu período de teste expirou. Assine para continuar adicionando despesas.");
                    } else {
                      Alert.alert(
                        "Acesso Limitado",
                        "Seu período de teste expirou. Assine para continuar adicionando despesas."
                      );
                    }
                    return;
                  }
                  setShowAddForm(!showAddForm);
                }}
                className={`py-4 rounded-2xl flex-row items-center justify-center mb-6 ${
                  isReadOnly ? "bg-gray-400" : "bg-blue-500 active:bg-blue-600"
                }`}
                disabled={isReadOnly}
              >
                <Ionicons
                  name={showAddForm ? "close-circle" : "add-circle"}
                  size={24}
                  color="white"
                />
                <Text className="text-white font-bold text-base ml-2">
                  {isReadOnly ? "Assine para Adicionar" : (showAddForm ? "Cancelar" : "Nova Despesa")}
                </Text>
              </Pressable>

              {/* Add Form */}
              {showAddForm && (
                <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
                  <Text className="text-lg font-semibold text-gray-900 mb-4">
                    Adicionar Despesa
                  </Text>

                  <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">
                      Categoria *
                    </Text>
                    <TextInput
                      value={category}
                      onChangeText={setCategory}
                      placeholder="Ex: Aluguel, Salários, Softwares"
                      className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">
                      Descrição *
                    </Text>
                    <TextInput
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Descreva a despesa"
                      className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">
                      Valor (R$) *
                    </Text>
                    <TextInput
                      value={value}
                      onChangeText={handleNumericInput}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  <Pressable
                    onPress={handleAddExpense}
                    className="bg-green-500 py-3 rounded-xl items-center active:bg-green-600"
                  >
                    <Text className="text-white font-bold text-base">
                      Adicionar Despesa
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Empty State */}
              {agencyExpenses.length === 0 ? (
                <View className="items-center justify-center py-20">
                  <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
                    <Ionicons name="receipt-outline" size={40} color="#9ca3af" />
                  </View>
                  <Text className="text-gray-500 text-base mb-2">
                    Nenhuma despesa cadastrada
                  </Text>
                  <Text className="text-gray-400 text-sm text-center px-8">
                    Adicione despesas da agência para controlar seus custos
                  </Text>
                </View>
              ) : (
                /* Expenses by Category */
                <View className="gap-6">
                  {Object.keys(expensesByCategory).map((cat) => {
                    const expenses = expensesByCategory[cat];
                    const categoryTotal = expenses.reduce(
                      (sum, exp) => sum + exp.value,
                      0
                    );

                    return (
                      <View key={cat}>
                        <View className="flex-row justify-between items-center mb-3">
                          <Text className="text-lg font-semibold text-gray-900">
                            {cat}
                          </Text>
                          <MoneyDisplay value={categoryTotal} size="lg" color="#dc2626" />
                        </View>

                        <View className="gap-3">
                          {expenses.map((expense) => (
                            <View
                              key={expense.id}
                              className="bg-white rounded-2xl p-4 shadow-sm flex-row items-center"
                            >
                              <View className="flex-1">
                                <Text className="text-gray-900 font-medium mb-1">
                                  {expense.description}
                                </Text>
                                <MoneyDisplay value={expense.value} size="md" color="#dc2626" />
                              </View>
                              <Pressable
                                onPress={() =>
                                  handleDeleteExpense(
                                    expense.id,
                                    expense.description
                                  )
                                }
                                className={`w-10 h-10 rounded-xl items-center justify-center ${
                                  isReadOnly ? "bg-gray-200" : "bg-red-100"
                                }`}
                                disabled={isReadOnly}
                              >
                                <Ionicons name="trash" size={20} color={isReadOnly ? "#9ca3af" : "#ef4444"} />
                              </Pressable>
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </WebContainer>
  );
}
