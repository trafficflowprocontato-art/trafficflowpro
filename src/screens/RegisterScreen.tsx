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
  const [emailSent, setEmailSent] = useState(false);

  // Validações de senha
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasSpecialChar;

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos");
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert("Nome inválido", "O nome deve ter no mínimo 2 caracteres");
      return;
    }

    if (!trimmedEmail.includes("@")) {
      Alert.alert("Email inválido", "Digite um email válido");
      return;
    }
    
    // Validação robusta de senha
    if (!isPasswordValid) {
      Alert.alert(
        "Senha não atende os requisitos", 
        "Sua senha deve conter:\n• Pelo menos 6 caracteres\n• Uma letra maiúscula\n• Uma letra minúscula\n• Um caractere especial (!@#$%^&*...)"
      );
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
        let errorMsg = result.error || "Erro ao criar conta";
        
        if (errorMsg.includes("already")) {
          errorMsg = "Email já cadastrado. Tente fazer login.";
        }
        
        Alert.alert("Erro ao criar conta", errorMsg);
      } else {
        // Sucesso - mostrar tela de confirmação de email
        setEmailSent(true);
      }
    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível criar sua conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Tela de confirmação de email
  if (emailSent) {
    return (
      <WebContainer maxWidth={500}>
        <View className="flex-1 bg-gray-50 justify-center px-6" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <View className="bg-white rounded-3xl p-8 shadow-lg">
            <View className="items-center mb-6">
              <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="mail" size={40} color="#22c55e" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                Verifique seu email
              </Text>
              <Text className="text-base text-gray-600 text-center">
                Enviamos um link de confirmação para
              </Text>
              <Text className="text-base font-semibold text-blue-600 text-center mt-1">
                {email}
              </Text>
            </View>

            <View className="bg-blue-50 rounded-xl p-4 mb-6">
              <Text className="text-sm text-gray-700 text-center">
                Clique no link no email para ativar sua conta e fazer login.
              </Text>
            </View>

            <View className="space-y-3">
              <Text className="text-sm text-gray-600 text-center">
                Não recebeu o email?
              </Text>
              <Text className="text-xs text-gray-500 text-center">
                • Verifique a caixa de spam{"\n"}
                • Aguarde alguns minutos{"\n"}
                • Verifique se digitou o email correto
              </Text>
            </View>

            <Pressable
              onPress={() => navigation.goBack()}
              className="mt-6 py-4 bg-blue-600 rounded-xl"
            >
              <Text className="text-white font-bold text-center">
                Voltar para o login
              </Text>
            </Pressable>
          </View>
        </View>
      </WebContainer>
    );
  }

  // Tela de registro
  return (
    <WebContainer maxWidth={500}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-gray-50">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6">
            {/* Banner de versão atualizada */}
            <View className="bg-purple-600 rounded-2xl p-3 mb-3">
              <Text className="text-white text-center font-bold text-sm">🔒 v2.3 - TUDO PRONTO ✓</Text>
            </View>
            
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
                    placeholder="Crie uma senha segura"
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
                
                {/* Indicadores de requisitos de senha */}
                {password.length > 0 && (
                  <View className="mt-3 bg-gray-50 rounded-xl p-3">
                    <Text className="text-xs font-semibold text-gray-700 mb-2">Requisitos da senha:</Text>
                    
                    <View className="flex-row items-center mb-1">
                      <Ionicons 
                        name={hasMinLength ? "checkmark-circle" : "close-circle"} 
                        size={16} 
                        color={hasMinLength ? "#22c55e" : "#ef4444"} 
                      />
                      <Text className={`ml-2 text-xs ${hasMinLength ? "text-green-600" : "text-red-500"}`}>
                        Mínimo 6 caracteres
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center mb-1">
                      <Ionicons 
                        name={hasUppercase ? "checkmark-circle" : "close-circle"} 
                        size={16} 
                        color={hasUppercase ? "#22c55e" : "#ef4444"} 
                      />
                      <Text className={`ml-2 text-xs ${hasUppercase ? "text-green-600" : "text-red-500"}`}>
                        Uma letra maiúscula (A-Z)
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center mb-1">
                      <Ionicons 
                        name={hasLowercase ? "checkmark-circle" : "close-circle"} 
                        size={16} 
                        color={hasLowercase ? "#22c55e" : "#ef4444"} 
                      />
                      <Text className={`ml-2 text-xs ${hasLowercase ? "text-green-600" : "text-red-500"}`}>
                        Uma letra minúscula (a-z)
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center">
                      <Ionicons 
                        name={hasSpecialChar ? "checkmark-circle" : "close-circle"} 
                        size={16} 
                        color={hasSpecialChar ? "#22c55e" : "#ef4444"} 
                      />
                      <Text className={`ml-2 text-xs ${hasSpecialChar ? "text-green-600" : "text-red-500"}`}>
                        Um caractere especial (!@#$%...)
                      </Text>
                    </View>
                  </View>
                )}
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
