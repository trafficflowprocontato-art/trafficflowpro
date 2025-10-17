import React, { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from "react-native";
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
    console.log("🟢 [RegisterScreen] Botão clicado!");
    
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    
    console.log("🟢 [RegisterScreen] Dados:", { trimmedName, trimmedEmail, password: "***" });
    
    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      console.log("❌ [RegisterScreen] Campos vazios");
      Alert.alert("Campos obrigatórios", "Preencha todos os campos");
      return;
    }

    if (trimmedName.length < 2) {
      console.log("❌ [RegisterScreen] Nome muito curto");
      Alert.alert("Nome inválido", "O nome deve ter no mínimo 2 caracteres");
      return;
    }

    if (!trimmedEmail.includes("@")) {
      console.log("❌ [RegisterScreen] Email inválido");
      Alert.alert("Email inválido", "Digite um email válido");
      return;
    }
    
    if (password.length < 6) {
      console.log("❌ [RegisterScreen] Senha muito curta");
      Alert.alert("Senha fraca", "A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      console.log("❌ [RegisterScreen] Senhas diferentes");
      Alert.alert("Senhas diferentes", "As senhas não coincidem");
      return;
    }
    
    console.log("🔵 [RegisterScreen] Chamando register...");
    setLoading(true);
    
    try {
      const result = await register(trimmedEmail, password, trimmedName);
      
      console.log("🔵 [RegisterScreen] Resultado:", result);
      
      if (!result.success) {
        console.error("❌ [RegisterScreen] Erro:", result.error);
        let errorMsg = result.error || "Erro ao criar conta";
        
        if (errorMsg.includes("already")) {
          errorMsg = "Email já cadastrado. Tente fazer login.";
        }
        
        Alert.alert("Erro ao criar conta", errorMsg);
      } else {
        console.log("✅ [RegisterScreen] Sucesso! Conta criada!");
        Alert.alert("Sucesso!", "Conta criada com sucesso! Redirecionando...");
      }
    } catch (error: any) {
      console.error("❌ [RegisterScreen] Erro crítico:", error);
      Alert.alert("Erro", "Não foi possível criar sua conta. Tente novamente.");
    } finally {
      setLoading(false);
      console.log("🔵 [RegisterScreen] Loading finalizado");
    }
  };

  return (
    <WebContainer maxWidth={500}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-gray-50">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6">
            <View className="bg-green-500 rounded-2xl p-4 mb-6">
              <Text className="text-white text-center font-bold text-lg">🎉 7 DIAS GRÁTIS</Text>
              <Text className="text-white text-center text-sm mt-1">Teste completo sem cartão</Text>
            </View>
            
            <View className="mb-6">
              <Pressable onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center mb-4">
                <Ionicons name="arrow-back" size={26} color="#111827" />
              </Pressable>
              <Text className="text-3xl font-bold text-gray-900 mb-2">Criar sua conta</Text>
              <Text className="text-base text-gray-600">Comece agora seu teste gratuito</Text>
            </View>

            <View className="mb-6">
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Nome completo</Text>
                <View className="flex-row items-center bg-white border-2 border-gray-200 rounded-xl px-4">
                  <Ionicons name="person-outline" size={22} color="#6b7280" />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Seu nome"
                    autoCapitalize="words"
                    editable={!loading}
                    className="flex-1 py-4 px-3 text-base text-gray-900"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

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
                    editable={!loading}
                    className="flex-1 py-4 px-3 text-base text-gray-900"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

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
                  <Pressable onPress={() => setShowPassword(!showPassword)} disabled={loading}>
                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color="#6b7280" />
                  </Pressable>
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-2">Confirmar senha</Text>
                <View className="flex-row items-center bg-white border-2 border-gray-200 rounded-xl px-4">
                  <Ionicons name="lock-closed-outline" size={22} color="#6b7280" />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Digite novamente"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    editable={!loading}
                    className="flex-1 py-4 px-3 text-base text-gray-900"
                    placeholderTextColor="#9ca3af"
                  />
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>
                    <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={22} color="#6b7280" />
                  </Pressable>
                </View>
              </View>

              <Pressable onPress={handleRegister} disabled={loading} className={`py-4 rounded-xl items-center ${loading ? "bg-blue-400" : "bg-blue-600"}`}>
                {loading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-white font-bold text-base ml-2">Criando conta...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-bold text-base">Criar conta gratuita</Text>
                )}
              </Pressable>
            </View>

            <View className="flex-row items-center justify-center">
              <Text className="text-gray-600">Já tem conta? </Text>
              <Pressable onPress={() => navigation.goBack()} disabled={loading}>
                <Text className="text-blue-600 font-semibold">Entrar</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </WebContainer>
  );
}
