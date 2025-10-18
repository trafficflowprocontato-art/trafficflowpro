import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Platform, View, useWindowDimensions } from "react-native";
import { useAuthStore } from "../state/authStore";
import Sidebar from "../components/Sidebar";
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

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function DrawerNavigator() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;
  
  return (
    <Drawer.Navigator
      drawerContent={(props) => <Sidebar {...props} currentRoute={props.state.routeNames[props.state.index]} />}
      screenOptions={{
        headerShown: false,
        drawerType: isDesktop ? "permanent" : "front",
        drawerStyle: {
          width: 260,
        },
        overlayColor: "rgba(0,0,0,0.5)",
        swipeEnabled: !isDesktop,
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Clients" component={ClientsScreen} />
      <Drawer.Screen name="Sellers" component={SellersScreen} />
      <Drawer.Screen name="Expenses" component={ExpensesScreen} />
      <Drawer.Screen name="Payments" component={PaymentsScreen} />
      <Drawer.Screen name="Plans" component={PricingScreen} />
    </Drawer.Navigator>
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
  const isWeb = Platform.OS === 'web';
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={DrawerNavigator} />
      <Stack.Screen
        name="AddClient"
        component={AddClientScreen}
        options={{
          presentation: isWeb ? "card" : "modal",
        }}
      />
      <Stack.Screen name="Payments" component={PaymentsScreen} />
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
        const pathname = window.location.pathname;
        
        console.log("URL params:", { type, hash, pathname, fullUrl: window.location.href });
        
        // Limpar URLs indesejadas
        const invalidPaths = ['subscription-success', 'subscription', 'checkout'];
        const hasInvalidPath = invalidPaths.some(path => pathname.includes(path));
        
        if (hasInvalidPath && !type) {
          console.log("⚠️ Detected invalid URL, cleaning:", pathname);
          window.history.replaceState({}, document.title, "/");
          window.location.href = "/";
          return;
        }
        
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

  // Configuração de linking para web
  const linking = {
    prefixes: [],
    config: {
      screens: {
        Login: 'login',
        Register: 'register',
        ForgotPassword: 'forgot-password',
        ResetPassword: 'reset-password',
        Main: {
          path: '',
          screens: {
            Dashboard: 'dashboard',
            Clients: 'clients',
            Sellers: 'sellers',
            Expenses: 'expenses',
            Payments: 'payments',
            Plans: 'plans',
          },
        },
        AddClient: 'add-client',
      },
    },
  };

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
