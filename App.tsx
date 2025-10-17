import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { View, Text, Platform } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useAuthStore } from "./src/state/authStore";
import { APP_VERSION } from "./VERSION";

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project. 
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    // Log da versão para debug
    console.log("🎯 TrafficFlow Pro Version:", APP_VERSION);
    console.log("🆕 NOVO SISTEMA DE TRIAL ATIVO");
    
    // Verificar se existe uma sessão ativa ao abrir o app
    checkSession();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppNavigator />
        <StatusBar style="dark" />
        
        {/* Version Badge - Apenas em desenvolvimento web */}
        {Platform.OS === 'web' && (
          <View style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            backgroundColor: '#10b981',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            zIndex: 9999,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
          }}>
            <Text style={{
              color: 'white',
              fontSize: 11,
              fontWeight: 'bold',
            }}>
              ✨ v{APP_VERSION}
            </Text>
          </View>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
