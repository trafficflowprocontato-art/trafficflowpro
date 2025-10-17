import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { resetPassword } from "../services/supabase";
import WebContainer from "../components/WebContainer";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Erro", "Digite seu email");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Erro", "Digite um email válido");
      return;
    }

    setLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        throw error;
      }

      setEmailSent(true);
      Alert.alert(
        "Email Enviado! ✅",
        "Verifique sua caixa de entrada e clique no link para redefinir sua senha.",
        [{ text: "OK" }]
      );
    } catch (error: any) {
      console.error("Erro ao enviar email:", error);
      Alert.alert("Erro", error.message || "Não foi possível enviar o email de recuperação");
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
        {/* Back Button */}
        <Pressable
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center mb-8 active:bg-gray-100"
          style={{ alignSelf: "flex-start" }}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </Pressable>

        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Esqueceu sua senha?
          </Text>
          <Text className="text-base text-gray-500">
            {emailSent
              ? "Email enviado! Verifique sua caixa de entrada."
              : "Digite seu email e enviaremos um link para redefinir sua senha."}
          </Text>
        </View>

        {!emailSent ? (
          <>
            {/* Email Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">Email</Text>
              <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
                <Ionicons name="mail-outline" size={20} color="#9ca3af" />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="seu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Send Button */}
            <Pressable
              onPress={handleResetPassword}
              disabled={loading}
              className={`py-4 rounded-xl flex-row items-center justify-center ${
                loading ? "bg-blue-300" : "bg-blue-500 active:bg-blue-600"
              }`}
            >
              <Ionicons name="paper-plane" size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">
                {loading ? "Enviando..." : "Enviar Link de Recuperação"}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            {/* Success Icon */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="checkmark-circle" size={50} color="#22c55e" />
              </View>
              <Text className="text-gray-700 text-base text-center mb-2">
                Enviamos um email para:
              </Text>
              <Text className="text-blue-600 font-semibold text-base mb-4">
                {email}
              </Text>
              <Text className="text-gray-500 text-sm text-center px-4">
                Clique no link do email para criar uma nova senha. O link expira em 1 hora.
              </Text>
            </View>

            {/* Resend Button */}
            <Pressable
              onPress={() => {
                setEmailSent(false);
                handleResetPassword();
              }}
              disabled={loading}
              className="py-4 rounded-xl border-2 border-blue-500 flex-row items-center justify-center active:bg-blue-50 mb-4"
            >
              <Ionicons name="refresh" size={20} color="#3b82f6" />
              <Text className="text-blue-600 font-bold text-base ml-2">
                Reenviar Email
              </Text>
            </Pressable>

            {/* Back to Login */}
            <Pressable
              onPress={() => navigation.goBack()}
              className="py-4 rounded-xl bg-gray-200 flex-row items-center justify-center active:bg-gray-300"
            >
              <Ionicons name="arrow-back" size={20} color="#374151" />
              <Text className="text-gray-700 font-bold text-base ml-2">
                Voltar para Login
              </Text>
            </Pressable>
          </>
        )}

        {/* Help Text */}
        {!emailSent && (
          <View className="mt-6">
            <Text className="text-gray-400 text-sm text-center">
              Lembrou da senha?{" "}
              <Text
                onPress={() => navigation.goBack()}
                className="text-blue-600 font-semibold"
              >
                Fazer login
              </Text>
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
    </WebContainer>
  );
}
