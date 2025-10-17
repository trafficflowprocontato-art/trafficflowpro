import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useAuthStore } from "../state/authStore";
import DashboardScreen from "../screens/DashboardScreen";
import ClientsScreen from "../screens/ClientsScreen";
import ExpensesScreen from "../screens/ExpensesScreen";
import SellersScreen from "../screens/SellersScreen";
import AddClientScreen from "../screens/AddClientScreen";
import PaymentsScreen from "../screens/PaymentsScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import PricingScreen from "../screens/PricingScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingTop: 8,
          height: 88,
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 8,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Clients"
        component={ClientsScreen}
        options={{
          tabBarLabel: "Clientes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Sellers"
        component={SellersScreen}
        options={{
          tabBarLabel: "Vendedores",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{
          tabBarLabel: "Despesas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{
          tabBarLabel: "Cobranças",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="card" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Plans"        component={PricingScreen}
        options={{
          tabBarLabel: "Planos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="diamond" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen
        name="AddClient"
      <Stack.Screen name="Payments" component={PaymentsScreen} />
        component={AddClientScreen}
        options={{
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log("🚀 AppNavigator: NEW TRIAL SYSTEM ACTIVE");
    // Detectar se é página de reset de senha
    if (Platform.OS === "web") {
      const checkUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get("type");
        const hash = window.location.hash;
        
        console.log("URL params:", { type, hash, fullUrl: window.location.href });
        
        // Verificar tanto query params quanto hash para reset
        if (type === "recovery" || hash.includes("type=recovery")) {
          console.log("Password reset detected!");
          setIsPasswordReset(true);
        }
        setIsChecking(false);
      };
      
      // Aguardar um pouco para garantir que a URL está completa
      setTimeout(checkUrl, 100);
    } else {
      setIsChecking(false);
    }
  }, []);

  console.log("AppNavigator state:", { isAuthenticated, isPasswordReset, isChecking });

  // Mostrar loading enquanto verifica
  if (isChecking) {
    return null;
  }

  // Password reset flow
  if (isPasswordReset) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Not authenticated - show auth screens
  if (!isAuthenticated) {
    console.log("🔓 Showing AUTH screens");
    return (
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    );
  }

  // Authenticated - show app (trial logic handled within screens)
  console.log("✅ Showing APP screens (no subscription blocking)");
  return (
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>
  );
}
