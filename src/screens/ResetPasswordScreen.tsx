import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../services/supabase";
import WebContainer from "../components/WebContainer";

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);

  useEffect(() => {
    // Verificar se há uma sessão de recovery
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Recovery session:", session);
      
      if (session) {
        setHasRecoverySession(true);
      } else {
        // Se não há sessão de recovery, redirecionar para login
        Alert.alert(
          "Link Expirado",
          "O link de recuperação expirou. Por favor, solicite um novo.",
          [{ text: "OK", onPress: () => (navigation as any).navigate("Login") }]
        );
      }
    };
    
    checkSession();
  }, []);

  const handleResetPassword = async () => {
    if (!hasRecoverySession) {
      Alert.alert("Erro", "Sessão de recuperação inválida");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      // Fazer logout após alterar senha
      await supabase.auth.signOut();

      Alert.alert(
        "Senha Alterada! ✅",
        "Sua senha foi alterada com sucesso. Faça login com a nova senha.",
        [
          {
            text: "OK",
            onPress: () => {
              (navigation as any).navigate("Login");
            }
          }
        ]
      );
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      Alert.alert("Erro", error.message || "Não foi possível alterar a senha");
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
        <View style={{ paddingTop: insets.top + 20 }} className="flex-1 px-6">
          {/* Header */}
          <View className="mb-8">
            <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4 self-center">
              <Ionicons name="key" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Nova Senha
            </Text>
            <Text className="text-base text-gray-500 text-center">
              Digite sua nova senha abaixo
            </Text>
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Nova Senha</Text>
            <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4">
              <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
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

          {/* Submit Button */}
          <Pressable
            onPress={handleResetPassword}
            disabled={loading}
            className={`py-4 rounded-xl items-center ${
              loading ? "bg-blue-300" : "bg-blue-500 active:bg-blue-600"
            }`}
          >
            <Text className="text-white font-bold text-base">
              {loading ? "Alterando..." : "Alterar Senha"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </WebContainer>
  );
}
