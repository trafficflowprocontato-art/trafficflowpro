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

export default function LoginScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const login = useAuthStore((s) => s.login);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Campos obrigatórios", "Preencha email e senha");
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    
    if (!result.success) {
      let errorMessage = result.error || "Erro ao fazer login";
      
      // Mensagem específica para email não confirmado
      if (errorMessage.includes("Email not confirmed") || errorMessage.includes("not confirmed")) {
        Alert.alert(
          "Email não confirmado", 
          "Por favor, verifique sua caixa de entrada e clique no link de confirmação que enviamos para o seu email."
        );
      } else if (errorMessage.includes("Invalid login credentials") || errorMessage.includes("Invalid")) {
        Alert.alert("Erro no Login", "Email ou senha incorretos");
      } else {
        Alert.alert("Erro no Login", errorMessage);
      }
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
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 justify-center">
            {/* Version Badge - NOVO SISTEMA */}
            <View className="bg-green-500 rounded-2xl p-4 mb-6 border-2 border-green-600">
              <Text className="text-white text-center font-bold text-base">
                ✨ NOVO SISTEMA v2.0
              </Text>
              <Text className="text-white text-center text-sm mt-1">
                7 dias de trial gratuito para todos!
              </Text>
            </View>
            
            {/* Logo/Header */}
            <View className="items-center mb-10">
              <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
                <Ionicons name="bar-chart" size={40} color="white" />
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                TrafficFlow Pro
              </Text>
              <Text className="text-base text-gray-500">
                Gestão Financeira para Agências
              </Text>
            </View>

            {/* Login Form */}
            <View className="mb-8">
              <Text className="text-2xl font-bold text-gray-900 mb-6">
                Entrar
              </Text>

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
              <View className="mb-2">
                <Text className="text-gray-700 font-medium mb-2">Senha</Text>
                <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4">
                  <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
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

              {/* Forgot Password Link */}
              <Pressable 
                onPress={() => navigation.navigate("ForgotPassword")}
                className="mb-6"
              >
                <Text className="text-blue-500 font-medium text-sm text-right">
                  Esqueci minha senha
                </Text>
              </Pressable>

              {/* Login Button */}
              <Pressable
                onPress={handleLogin}
                disabled={loading}
                className={`py-4 rounded-xl items-center ${
                  loading ? "bg-blue-300" : "bg-blue-500 active:bg-blue-600"
                }`}
              >
                <Text className="text-white font-bold text-base">
                  {loading ? "Entrando..." : "Entrar"}
                </Text>
              </Pressable>
            </View>

            {/* Register Link */}
            <View className="flex-row items-center justify-center">
              <Text className="text-gray-600 mr-2">Não tem uma conta?</Text>
              <Pressable onPress={() => navigation.navigate("Register")}>
                <Text className="text-blue-500 font-semibold">Cadastre-se</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </WebContainer>
  );
}
