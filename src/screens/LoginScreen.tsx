import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../state/authStore";
import WebContainer from "../components/WebContainer";
import { resendConfirmationEmail } from "../services/supabase";

export default function LoginScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;
  const login = useAuthStore((s) => s.login);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [debugMode, setDebugMode] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [showResendButton, setShowResendButton] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogoTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    
    if (newCount >= 5) {
      setDebugMode(!debugMode);
      setTapCount(0);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setErrorMessage("Digite seu email para reenviar a confirmação");
      return;
    }

    setResendingEmail(true);
    const { error } = await resendConfirmationEmail(email.trim());
    setResendingEmail(false);

    if (error) {
      setErrorMessage("Erro ao reenviar email: " + error.message);
      setSuccessMessage("");
    } else {
      setErrorMessage("");
      setShowResendButton(false);
      setSuccessMessage("Email de confirmação reenviado! Verifique sua caixa de entrada.");
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  };

  const handleLogin = async () => {
    setErrorMessage("");
    
    if (!email || !password) {
      setErrorMessage("Preencha email e senha");
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    
    if (!result.success) {
      let message = result.error || "Erro ao fazer login";
      
      // Mensagens mais específicas e amigáveis
      if (message.includes("Email not confirmed") || message.includes("not confirmed")) {
        setErrorMessage("Por favor, verifique sua caixa de entrada e confirme seu email antes de fazer login.");
        setShowResendButton(true);
      } else if (message.includes("Invalid login credentials") || message.includes("Invalid")) {
        setShowResendButton(false);
        setErrorMessage(debugMode 
          ? `Credenciais inválidas. Detalhes: ${message}`
          : "Email ou senha incorretos. Verifique suas credenciais e tente novamente.");
      } else {
        setShowResendButton(false);
        setErrorMessage(message);
      }
    }
  };

  // Layout para Desktop vs Mobile
  if (isDesktop) {
    return (
      <View className="flex-1 flex-row bg-white">
        {/* Left Side - Login Form */}
        <View className="flex-1 items-center justify-center px-12 bg-gray-50">
          <ScrollView 
            contentContainerStyle={{ 
              flexGrow: 1, 
              justifyContent: 'center',
              paddingVertical: 40,
              maxWidth: 480,
              width: '100%'
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <Pressable onPress={handleLogoTap}>
              <View className="items-center mb-8">
                <View className="w-16 h-16 bg-blue-500 rounded-2xl items-center justify-center mb-4">
                  <Ionicons name="bar-chart" size={32} color="white" />
                </View>
                <Text className="text-2xl font-bold text-gray-900">
                  TrafficFlow Pro
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Gestão Financeira para Agências
                </Text>
                {debugMode ? (
                  <Text className="text-xs text-orange-500 mt-2">
                    🐛 Modo Debug Ativado
                  </Text>
                ) : null}
              </View>
            </Pressable>

            {/* Welcome Text */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Bem-vindo de volta!
              </Text>
              <Text className="text-base text-gray-500">
                Faça login para acessar sua conta
              </Text>
            </View>

            {/* Success Message */}
            {successMessage ? (
              <View className="bg-green-100 border border-green-400 rounded-xl p-4 mb-4 flex-row items-start">
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" style={{ marginTop: 2 }} />
                <Text className="text-green-700 ml-2 flex-1">{successMessage}</Text>
              </View>
            ) : null}

            {/* Error Message */}
            {errorMessage ? (
              <View className="bg-red-100 border border-red-400 rounded-xl p-4 mb-4">
                <View className="flex-row items-start">
                  <Ionicons name="alert-circle" size={20} color="#dc2626" style={{ marginTop: 2 }} />
                  <Text className="text-red-700 ml-2 flex-1">{errorMessage}</Text>
                </View>
                {showResendButton ? (
                  <Pressable 
                    onPress={handleResendConfirmation}
                    disabled={resendingEmail}
                    className="mt-3 bg-red-600 py-2 px-4 rounded-lg"
                  >
                    <Text className="text-white text-center font-semibold">
                      {resendingEmail ? "Reenviando..." : "Reenviar Email de Confirmação"}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2 text-sm">Email</Text>
              <View className="flex-row items-center bg-white border-2 border-gray-300 rounded-xl px-4 focus:border-blue-500">
                <Ionicons name="mail-outline" size={20} color="#6b7280" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  className="flex-1 py-4 px-3 text-base text-gray-900"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-2">
              <Text className="text-gray-700 font-semibold mb-2 text-sm">Senha</Text>
              <View className="flex-row items-center bg-white border-2 border-gray-300 rounded-xl px-4">
                <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  className="flex-1 py-4 px-3 text-base text-gray-900"
                  placeholderTextColor="#9ca3af"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#6b7280"
                  />
                </Pressable>
              </View>
            </View>

            {/* Forgot Password */}
            <Pressable 
              onPress={() => navigation.navigate("ForgotPassword")}
              className="mb-6 self-end"
            >
              <Text className="text-blue-500 font-medium text-sm">
                Esqueceu a senha?
              </Text>
            </Pressable>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              className={`py-4 rounded-xl items-center mb-6 ${
                loading ? "bg-blue-300" : "bg-blue-500"
              }`}
              style={Platform.OS === 'web' ? { cursor: loading ? 'not-allowed' : 'pointer' } as any : undefined}
            >
              <Text className="text-white font-bold text-base">
                {loading ? "Entrando..." : "Entrar"}
              </Text>
            </Pressable>

            {/* Register Link */}
            <View className="flex-row items-center justify-center mb-6">
              <Text className="text-gray-600 mr-2">Não tem uma conta?</Text>
              <Pressable onPress={() => navigation.navigate("Register")}>
                <Text className="text-blue-500 font-semibold">Cadastre-se</Text>
              </Pressable>
            </View>

            {/* Footer Links */}
            <View className="flex-row items-center justify-center gap-4 pt-4 border-t border-gray-200">
              <Text className="text-gray-400 text-xs">Termos de Uso</Text>
              <Text className="text-gray-400 text-xs">•</Text>
              <Text className="text-gray-400 text-xs">Política de Privacidade</Text>
            </View>
          </ScrollView>
        </View>

        {/* Right Side - Brand/Marketing */}
        <View className="flex-1 bg-blue-500 items-center justify-center px-16" style={{ backgroundColor: '#3b82f6' }}>
          <View className="max-w-lg">
            <Text className="text-white text-5xl font-bold mb-6" style={{ lineHeight: 60 }}>
              Gerencie suas finanças com inteligência
            </Text>
            <Text className="text-blue-100 text-xl mb-12" style={{ lineHeight: 32 }}>
              Controle total de clientes, vendedores, pagamentos e relatórios em uma única plataforma.
            </Text>
            
            {/* Features */}
            <View className="gap-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-400 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="checkmark" size={24} color="white" />
                </View>
                <Text className="text-white text-lg">Dashboard financeiro completo</Text>
              </View>
              
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-400 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="checkmark" size={24} color="white" />
                </View>
                <Text className="text-white text-lg">Gestão de comissões automática</Text>
              </View>
              
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-400 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="checkmark" size={24} color="white" />
                </View>
                <Text className="text-white text-lg">Relatórios detalhados em tempo real</Text>
              </View>
              
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-400 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="checkmark" size={24} color="white" />
                </View>
                <Text className="text-white text-lg">Sincronização em nuvem</Text>
              </View>
            </View>

            {/* Trial Badge */}
            <View className="bg-blue-400 rounded-2xl p-6 mt-12">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-white text-2xl font-bold mb-1">7 dias grátis</Text>
                  <Text className="text-blue-100">Teste todas as funcionalidades</Text>
                </View>
                <Ionicons name="gift" size={48} color="white" />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Mobile Layout (original)
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
              <Pressable onPress={handleLogoTap}>
                <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
                  <Ionicons name="bar-chart" size={40} color="white" />
                </View>
              </Pressable>
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                TrafficFlow Pro
              </Text>
              <Text className="text-base text-gray-500">
                Gestão Financeira para Agências
              </Text>
              {debugMode ? (
                <Text className="text-xs text-orange-500 mt-2">
                  🐛 Modo Debug Ativado
                </Text>
              ) : null}
            </View>

            {/* Login Form */}
            <View className="mb-8">
              <Text className="text-2xl font-bold text-gray-900 mb-6">
                Entrar
              </Text>

              {/* Success Message */}
              {successMessage ? (
                <View className="bg-green-100 border border-green-400 rounded-xl p-4 mb-4 flex-row items-start">
                  <Ionicons name="checkmark-circle" size={20} color="#16a34a" style={{ marginTop: 2 }} />
                  <Text className="text-green-700 ml-2 flex-1">{successMessage}</Text>
                </View>
              ) : null}

              {/* Error Message */}
              {errorMessage ? (
                <View className="bg-red-100 border border-red-400 rounded-xl p-4 mb-4">
                  <View className="flex-row items-start">
                    <Ionicons name="alert-circle" size={20} color="#dc2626" style={{ marginTop: 2 }} />
                    <Text className="text-red-700 ml-2 flex-1">{errorMessage}</Text>
                  </View>
                  {showResendButton ? (
                    <Pressable 
                      onPress={handleResendConfirmation}
                      disabled={resendingEmail}
                      className="mt-3 bg-red-600 py-2 px-4 rounded-lg"
                    >
                      <Text className="text-white text-center font-semibold">
                        {resendingEmail ? "Reenviando..." : "Reenviar Email de Confirmação"}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}

              {/* Info Message - Helpful for users */}
              <View className="bg-blue-50 border border-blue-300 rounded-xl p-4 mb-4">
                <Text className="text-blue-800 text-sm">
                  💡 Se você acabou de se cadastrar, verifique sua caixa de entrada e confirme seu email antes de fazer login.
                </Text>
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
            <View className="flex-row items-center justify-center mb-8">
              <Text className="text-gray-600 mr-2">Não tem uma conta?</Text>
              <Pressable onPress={() => navigation.navigate("Register")}>
                <Text className="text-blue-500 font-semibold">Cadastre-se</Text>
              </Pressable>
            </View>

            {/* Help Section */}
            <View className="bg-amber-50 border border-amber-300 rounded-xl p-4">
              <Text className="text-amber-900 font-semibold mb-2">
                🔐 Problemas para fazer login?
              </Text>
              <Text className="text-amber-800 text-sm mb-2">
                • Verifique se confirmou seu email após o cadastro
              </Text>
              <Text className="text-amber-800 text-sm mb-2">
                • Certifique-se de usar o email e senha corretos
              </Text>
              <Text className="text-amber-800 text-sm mb-2">
                • Use a opção "Esqueci minha senha" para redefinir
              </Text>
              <Text className="text-amber-800 text-sm">
                • Se acabou de se cadastrar, aguarde o email de confirmação
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </WebContainer>
  );
}
