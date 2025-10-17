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
    // Validações
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }
    
    setLoading(true);
    const result = await register(email.trim(), password, name.trim());
    setLoading(false);
    
    if (!result.success) {
      Alert.alert("Erro no Cadastro", result.error || "Erro desconhecido");
    }
    // Se sucesso, a navegação será automática pelo AppNavigator
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
        >
          <View className="flex-1 px-6">
            {/* Version Badge - NOVO SISTEMA */}
            <View className="bg-green-500 rounded-2xl p-4 mb-6 border-2 border-green-600">
              <Text className="text-white text-center font-bold text-base">
                🎉 7 DIAS GRÁTIS
              </Text>
              <Text className="text-white text-center text-sm mt-1">
                Teste completo sem precisar pagar nada!
              </Text>
            </View>
            
            {/* Header */}
            <View className="mb-8">
              <Pressable
                onPress={() => navigation.goBack()}
                className="w-10 h-10 items-center justify-center mb-4"
              >
                <Ionicons name="arrow-back" size={24} color="#111827" />
              </Pressable>
              
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Criar Conta
              </Text>
              <Text className="text-base text-gray-500">
                Preencha seus dados para começar
              </Text>
            </View>

            {/* Register Form */}
            <View className="mb-8">
              {/* Name Input */}
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">Nome Completo</Text>
                <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4">
                  <Ionicons name="person-outline" size={20} color="#9ca3af" />
                  <TextInput
                    value={name}
                    onChangeText={(text) => {
                      if (text.length <= 255) {
                        setName(text);
                      }
                    }}
                    placeholder="Ex: João Silva"
                    autoCapitalize="words"
                    maxLength={255}
                    className="flex-1 py-3 px-3 text-base text-gray-900"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">Email</Text>
                <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4">
                  <Ionicons name="mail-outline" size={20} color="#9ca3af" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="seu@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    className="flex-1 py-3 px-3 text-base text-gray-900"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">Senha</Text>
                <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4">
                  <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Mínimo 6 caracteres"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    className="flex-1 py-3 px-3 text-base text-gray-900"
                    placeholderTextColor="#9ca3af"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#9ca3af"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-2">Confirmar Senha</Text>
                <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4">
                  <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Digite a senha novamente"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    className="flex-1 py-3 px-3 text-base text-gray-900"
                    placeholderTextColor="#9ca3af"
                  />
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#9ca3af"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Register Button */}
              <Pressable
                onPress={handleRegister}
                disabled={loading}
                className={`py-4 rounded-xl items-center ${
                  loading ? "bg-blue-300" : "bg-blue-500 active:bg-blue-600"
                }`}
              >
                <Text className="text-white font-bold text-base">
                  {loading ? "Criando conta..." : "Criar Conta"}
                </Text>
              </Pressable>
            </View>

            {/* Login Link */}
            <View className="flex-row items-center justify-center">
              <Text className="text-gray-600 mr-2">Já tem uma conta?</Text>
              <Pressable onPress={() => navigation.goBack()}>
                <Text className="text-blue-500 font-semibold">Entrar</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </WebContainer>
  );
}
