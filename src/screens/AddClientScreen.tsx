import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useFinancialStore } from "../state/financialStore";
import { Client, ExtraExpense, PaymentStatus } from "../types/financial";
import WebContainer from "../components/WebContainer";

export default function AddClientScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const addClient = useFinancialStore((s) => s.addClient);
  const updateClient = useFinancialStore((s) => s.updateClient);

  const editingClient = (route.params as any)?.client as Client | undefined;
  const isEditing = !!editingClient;

  const [name, setName] = useState("");
  const [monthlyValue, setMonthlyValue] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [sellerCommission, setSellerCommission] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [extraExpenses, setExtraExpenses] = useState<ExtraExpense[]>([]);
  const [contractStartDate, setContractStartDate] = useState("");
  const [firstPaymentMonth, setFirstPaymentMonth] = useState("");
  const [newExpenseDesc, setNewExpenseDesc] = useState("");
  const [newExpenseValue, setNewExpenseValue] = useState("");

  // Função para permitir apenas números e pontos/vírgulas
  const handleNumericInput = (text: string, setter: (value: string) => void) => {
    // Remove tudo que não é número, ponto ou vírgula
    const cleaned = text.replace(/[^0-9.,]/g, '');
    // Substitui vírgula por ponto para padronizar
    const normalized = cleaned.replace(',', '.');
    setter(normalized);
  };

  // Função para permitir apenas números inteiros (dia de vencimento)
  const handleIntegerInput = (text: string, setter: (value: string) => void) => {
    // Remove tudo que não é número
    const cleaned = text.replace(/[^0-9]/g, '');
    // Limita de 1 a 31
    const num = parseInt(cleaned);
    if (cleaned === '' || (num >= 1 && num <= 31)) {
      setter(cleaned);
    }

  // Função para formatar data no padrão brasileiro (DD/MM/AAAA)
  const handleDateInput = (text: string, setter: (value: string) => void) => {
    // Remove tudo que não é número
    const cleaned = text.replace(/[^0-9]/g, '');
    
    let formatted = cleaned;
    
    // Adiciona a primeira barra após o dia (DD/)
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    
    // Adiciona a segunda barra após o mês (DD/MM/)
    if (cleaned.length >= 4) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }
    
    setter(formatted);
  };

  // Função para formatar mês/ano (MM/AAAA)
  const handleMonthYearInput = (text: string, setter: (value: string) => void) => {
    // Remove tudo que não é número
    const cleaned = text.replace(/[^0-9]/g, '');
    
    let formatted = cleaned;
    
    // Adiciona barra após o mês (MM/)
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 6);
    }
    
    setter(formatted);
  };

  // Converter DD/MM/AAAA para AAAA-MM-DD ao salvar
  const convertBRDateToISO = (brDate: string): string => {
    if (!brDate || brDate.length !== 10) return '';
    const [day, month, year] = brDate.split('/');
    return `${year}-${month}-${day}`;
  };

  // Converter MM/AAAA para AAAA-MM ao salvar
  const convertMonthYearToISO = (monthYear: string): string => {
    if (!monthYear || monthYear.length !== 7) return '';
    const [month, year] = monthYear.split('/');
    return `${year}-${month}`;
  };

  // Converter AAAA-MM-DD para DD/MM/AAAA ao carregar
  const convertISODateToBR = (isoDate: string): string => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    if (!year || !month || !day) return '';
    return `${day}/${month}/${year}`;
  };

  // Converter AAAA-MM para MM/AAAA ao carregar
  const convertISOMonthToBR = (isoMonth: string): string => {
    if (!isoMonth) return '';
    const [year, month] = isoMonth.split('-');
    if (!year || !month) return '';
    return `${month}/${year}`;
  };
  };

  useEffect(() => {
    if (editingClient) {
      setName(editingClient.name);
      setMonthlyValue(editingClient.monthlyValue.toString());
      setPaymentDate(editingClient.paymentDate.toString());
      setPaymentStatus(editingClient.paymentStatus);
      setSellerCommission(editingClient.sellerCommission.toString());
      setSellerName(editingClient.sellerName || "");
      setExtraExpenses(editingClient.extraExpenses);
      setContractStartDate(convertISODateToBR(editingClient.contractStartDate || ""));
      setFirstPaymentMonth(convertISOMonthToBR(editingClient.firstPaymentMonth || ""));
    }
  }, [editingClient]);

  const handleAddExtraExpense = () => {
    if (newExpenseDesc.trim() && newExpenseValue) {
      const expense: ExtraExpense = {
        id: Date.now().toString(),
        description: newExpenseDesc.trim(),
        value: parseFloat(newExpenseValue),
      };
      setExtraExpenses([...extraExpenses, expense]);
      setNewExpenseDesc("");
      setNewExpenseValue("");
    }
  };

  const handleRemoveExtraExpense = (id: string) => {
    setExtraExpenses(extraExpenses.filter((exp) => exp.id !== id));
  };

  const handleSave = () => {
    if (!name.trim() || !monthlyValue || !paymentDate) {
      return;
    }

    // Se não tiver vendedor, comissão é 0
    const commission = sellerCommission ? parseFloat(sellerCommission) : 0;
    const seller = sellerName.trim() || "Sem vendedor";

    const clientData: Client = {
      id: editingClient?.id || Date.now().toString(),
      name: name.trim(),
      monthlyValue: parseFloat(monthlyValue),
      paymentDate: parseInt(paymentDate),
      paymentStatus,
      sellerCommission: commission,
      sellerName: seller,
      contractStartDate: convertBRDateToISO(contractStartDate) || undefined,
      firstPaymentMonth: convertMonthYearToISO(firstPaymentMonth) || undefined,
      firstPaymentMonth: firstPaymentMonth || undefined,
    };

    if (isEditing) {
      updateClient(clientData.id, clientData);
    } else {
      addClient(clientData);
    }

    navigation.goBack();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const statusOptions: { value: PaymentStatus; label: string; color: string }[] = [
    { value: "paid", label: "Pago", color: "#22c55e" },
    { value: "pending", label: "Pendente", color: "#eab308" },
    { value: "overdue", label: "Atrasado", color: "#ef4444" },
  ];

  return (
    <WebContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-gray-50"
      >
        <View className="flex-1">
          {/* Header */}
          <View
            style={{ paddingTop: insets.top + 10 }}
            className="px-6 pb-4 bg-white border-b border-gray-200"
          >
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={() => navigation.goBack()}
                className="w-10 h-10 items-center justify-center"
              >
                <Ionicons name="arrow-back" size={24} color="#111827" />
              </Pressable>
              <Text className="text-xl font-bold text-gray-900">
                {isEditing ? "Editar Cliente" : "Novo Cliente"}
              </Text>
              <View className="w-10" />
            </View>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-6 py-6">
              {/* Name Input */}
              <View className="mb-5">
                <Text className="text-gray-700 font-medium mb-2">
                  Nome do Cliente *
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Digite o nome do cliente"
                  className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Monthly Value Input */}
              <View className="mb-5">
                <Text className="text-gray-700 font-medium mb-2">
                  Valor Mensal (R$) *
                </Text>
                <TextInput
                  value={monthlyValue}
                  onChangeText={(text) => handleNumericInput(text, setMonthlyValue)}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Payment Date Input */}
              <View className="mb-5">
                <Text className="text-gray-700 font-medium mb-2">
                  Dia de Vencimento (1-31) *
                </Text>
                <TextInput
                  value={paymentDate}
                  onChangeText={(text) => handleIntegerInput(text, setPaymentDate)}
                  placeholder="5"
                  keyboardType="number-pad"
                  maxLength={2}
                  className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Data de Início do Contrato */}
              <View className="mb-5">
                <Text className="text-gray-700 font-medium mb-2">
                  Data de Início do Contrato
                </Text>
                <Text className="text-gray-500 text-xs mb-2">
                  Quando o cliente fechou o contrato (ex: 05/10/2025)
                </Text>
                <TextInput
                  value={contractStartDate}
                  onChangeText={(text) => handleDateInput(text, setContractStartDate)}
                  placeholder="05/10/2025"
                  keyboardType="number-pad"
                  maxLength={10}
                  className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Primeiro Mês de Pagamento */}
              <View className="mb-5">
                <Text className="text-gray-700 font-medium mb-2">
                  Primeiro Mês de Pagamento
                </Text>
                <Text className="text-gray-500 text-xs mb-2">
                  Quando ele deve pagar pela primeira vez (ex: 11/2025)
                </Text>
                <TextInput
                  value={firstPaymentMonth}
                  onChangeText={(text) => handleMonthYearInput(text, setFirstPaymentMonth)}
                  placeholder="11/2025"
                  keyboardType="number-pad"
                  maxLength={7}
                  className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                  placeholderTextColor="#9ca3af"
                />
                {contractStartDate && !firstPaymentMonth && (
                  <Text className="text-orange-600 text-xs mt-2">
                    💡 Dica: Se fechou em 10/2025, normalmente o 1º pagamento é 11/2025
                  </Text>
                )}
              </View>
                />
                {contractStartDate && !firstPaymentMonth && (
                  <Text className="text-orange-600 text-xs mt-2">
                    💡 Dica: Se fechou em 2025-10, normalmente o 1º pagamento é 2025-11
                  </Text>
                )}
              </View>

              {/* Payment Status */}
              <View className="mb-5">
                <Text className="text-gray-700 font-medium mb-2">
                  Status de Pagamento *
                </Text>
                <View className="flex-row gap-3">
                  {statusOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => setPaymentStatus(option.value)}
                      className={`flex-1 py-3 rounded-xl border-2 items-center ${
                        paymentStatus === option.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      <View
                        className="w-3 h-3 rounded-full mb-1"
                        style={{ backgroundColor: option.color }}
                      />
                      <Text
                        className={`text-sm font-medium ${
                          paymentStatus === option.value
                            ? "text-blue-700"
                            : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Seller Name Input */}
              <View className="mb-5">
                <Text className="text-gray-700 font-medium mb-2">
                  Nome do Vendedor (Opcional)
                </Text>
                <TextInput
                  value={sellerName}
                  onChangeText={setSellerName}
                  placeholder="Digite o nome do vendedor"
                  className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
                  placeholderTextColor="#9ca3af"
                />
                <Text className="text-gray-500 text-xs mt-1">
                  Deixe vazio se não houver vendedor
                </Text>
              </View>

              {/* Seller Commission Input */}
              <View className="mb-5">
                <Text className="text-gray-700 font-medium mb-2">
                  Comissão do Vendedor (%)
                </Text>
                <TextInput
                  value={sellerCommission}
                  onChangeText={(text) => handleNumericInput(text, setSellerCommission)}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
                  placeholderTextColor="#9ca3af"
                />
                <Text className="text-gray-500 text-xs mt-1">
                  Deixe 0 ou vazio se não houver comissão
                </Text>
              </View>

              {/* Extra Expenses Section */}
              <View className="mb-5">
                <Text className="text-gray-700 font-medium mb-2">
                  Despesas Extras
                </Text>
                <Text className="text-gray-500 text-sm mb-3">
                  Ex: Filmmaker, serviços terceirizados
                </Text>

                {/* Add Extra Expense */}
                <View className="bg-white border border-gray-300 rounded-xl p-4 mb-3">
                  <TextInput
                    value={newExpenseDesc}
                    onChangeText={setNewExpenseDesc}
                    placeholder="Descrição da despesa"
                    className="border-b border-gray-200 pb-2 mb-3 text-base text-gray-900"
                    placeholderTextColor="#9ca3af"
                  />
                  <View className="flex-row gap-3">
                    <TextInput
                      value={newExpenseValue}
                      onChangeText={(text) => handleNumericInput(text, setNewExpenseValue)}
                      placeholder="Valor (R$)"
                      keyboardType="decimal-pad"
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-base text-gray-900"
                      placeholderTextColor="#9ca3af"
                    />
                    <Pressable
                      onPress={handleAddExtraExpense}
                      className="bg-blue-500 px-4 rounded-lg items-center justify-center active:bg-blue-600"
                    >
                      <Ionicons name="add" size={24} color="white" />
                    </Pressable>
                  </View>
                </View>

                {/* Extra Expenses List */}
                {extraExpenses.length > 0 && (
                  <View className="gap-2">
                    {extraExpenses.map((expense) => (
                      <View
                        key={expense.id}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
                      >
                        <View className="flex-1">
                          <Text className="text-gray-900 font-medium">
                            {expense.description}
                          </Text>
                          <Text className="text-purple-600 font-semibold">
                            {formatCurrency(expense.value)}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => handleRemoveExtraExpense(expense.id)}
                          className="w-8 h-8 bg-red-100 rounded-lg items-center justify-center"
                        >
                          <Ionicons name="trash" size={18} color="#ef4444" />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View
            className="absolute bottom-0 left-0 right-0 px-6 bg-white border-t border-gray-200"
            style={{ paddingBottom: insets.bottom + 20, paddingTop: 16 }}
          >
            <Pressable
              onPress={handleSave}
              className="bg-blue-500 py-4 rounded-2xl items-center active:bg-blue-600"
            >
              <Text className="text-white font-bold text-base">
                {isEditing ? "Salvar Alterações" : "Adicionar Cliente"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </WebContainer>
  );
}
