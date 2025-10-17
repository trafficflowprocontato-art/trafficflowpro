import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../state/authStore";
import WebContainer from "../components/WebContainer";

export default function RegisterScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const register = useAuthStore((s) => s.register);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Limpar espaços
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    
    // Validações
    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos para continuar");
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert("Nome inválido", "O nome deve ter no mínimo 2 caracteres");
      return;
    }

    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      Alert.alert("Email inválido", "Digite um email válido");
      return;
    }
    
    if (password.length < 6) {
      Alert.alert("Senha fraca", "A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Senhas diferentes", "As senhas não coincidem");
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await register(trimmedEmail, password, trimmedName);
      
      if (!result.success) {
        // Tratar erros específicos
        let errorMessage = result.error || "Erro ao criar conta";
        
        if (errorMessage.includes("already registered") || errorMessage.includes("already exists")) {
          errorMessage = "Este email já está cadastrado. Tente fazer login.";
        } else if (errorMessage.includes("Invalid email")) {
          errorMessage = "Email inválido. Verifique e tente novamente.";
        } else if (errorMessage.includes("Password")) {
          errorMessage = "Senha inválida. Use no mínimo 6 caracteres.";
        }
        
        Alert.alert("Erro ao criar conta", errorMessage);
      }
      // Se sucesso, o AppNavigator redireciona automaticamente
    } catch (error: any) {
      console.error("Erro no registro:", error);
      Alert.alert(
        "Erro inesperado", 
        "Não foi possível criar sua conta. Verifique sua conexão e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <WebContainer maxWidth={500}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-gray-50"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6">
            {/* Banner de Trial Gratuito */}
            <View className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 mb-6 shadow-lg">
              <View className="flex-row items-center justify-center">
                <Ionicons name="gift" size={24} color="white" />
                <Text className="text-white text-center font-bold text-lg ml-2">
                  7 DIAS GRÁTIS
                </Text>
              </View>
              <Text className="text-white text-center text-sm mt-2">
                Teste completo • Sem cartão de crédito
              </Text>
            </View>
            
            {/* Header */}
            <View className="mb-6">
              <Pressable
                onPress={() => navigation.goBack()}
                className="w-10 h-10 items-center justify-center mb-4 -ml-2"
              >
                <Ionicons name="arrow-back" size={26} color="#111827" />
              </Pressable>
              
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Criar sua conta
              </Text>
              <Text className="text-base text-gray-600">
                Comece agora seu período de teste gratuito
              </Text>
            </View>

            {/* Form */}
            <View className="mb-6">
              {/* Nome */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Nome completo</Text>
                <View className="flex-row items-center bg-white border-2 border-gray-200 rounded-xl px-4 focus:border-blue-500">
                  <Ionicons name="person-outline" size={22} color="#6b7280" />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Seu nome"
                    autoCapitalize="words"
                    maxLength={100}
                    editable={!loading}
                    className="flex-1 py-4 px-3 text-base text-gray-900"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              {/* Email */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Email</Text>
                <View className="flex-row items-center bg-white border-2 border-gray-200 rounded-xl px-4">
                  <Ionicons name="mail-outline" size={22} color="#6b7280" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="seu@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!loading}
                    className="flex-1 py-4 px-3 text-base text-gray-900"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              {/* Senha */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Senha</Text>
                <View className="flex-row items-center bg-white border-2 border-gray-200 rounded-xl px-4">
                  <Ionicons name="lock-closed-outline" size={22} color="#6b7280" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Mínimo 6 caracteres"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!loading}
                    className="flex-1 py-4 px-3 text-base text-gray-900"
                    placeholderTextColor="#9ca3af"
                  />
                  <Pressable 
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="p-1"
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={22}
                      color="#6b7280"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Confirmar Senha */}
              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-2">Confirmar senha</Text>
                <View className="flex-row items-center bg-white border-2 border-gray-200 rounded-xl px-4">
                  <Ionicons name="lock-closed-outline" size={22} color="#6b7280" />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Digite a senha novamente"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    editable={!loading}
                    className="flex-1 py-4 px-3 text-base text-gray-900"
                    placeholderTextColor="#9ca3af"
                  />
                  <Pressable 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    className="p-1"
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                      size={22}
                      color="#6b7280"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Botão Criar Conta */}
              <Pressable
                onPress={handleRegister}
                disabled={loading}
                className={`py-4 rounded-xl items-center justify-center shadow-lg ${
                  loading ? "bg-blue-400" : "bg-blue-600 active:bg-blue-700"
                }`}
              >
                {loading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-white font-bold text-base ml-2">
                      Criando sua conta...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white font-bold text-base">
                    Criar conta gratuita
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Link para Login */}
            <View className="flex-row items-center justify-center mt-4">
              <Text className="text-gray-600 text-base">Já tem uma conta? </Text>
              <Pressable 
                onPress={() => navigation.goBack()}
                disabled={loading}
              >
                <Text className="text-blue-600 font-semibold text-base">
                  Entrar
                </Text>
              </Pressable>
            </View>

            {/* Termos */}
            <Text className="text-gray-500 text-xs text-center mt-6 px-4">
              Ao criar uma conta, você concorda com nossos Termos de Uso e Política de Privacidade
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </WebContainer>
  );
}
