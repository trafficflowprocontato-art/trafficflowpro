import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../state/authStore";
import { useAppStore } from "../state/appStore";
import Sidebar from "../components/Sidebar";
import DashboardScreen from "../screens/DashboardScreen";
import ClientsScreen from "../screens/ClientsScreen";
import GraphicsScreen from "../screens/GraphicsScreen";
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
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Drawer com Sidebar para Mobile (hamburger menu)
function MobileDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <Sidebar {...props} currentRoute={props.state.routeNames[props.state.index]} />}
      screenOptions={{
        headerShown: false,
        drawerType: "front", // Overlay em vez de push
        drawerStyle: {
          width: 280,
        },
        swipeEnabled: true, // Permitir swipe para abrir
        overlayColor: "rgba(0,0,0,0.5)", // Overlay escuro
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Clients" component={ClientsScreen} />
      <Drawer.Screen name="Graphics" component={GraphicsScreen} />
      <Drawer.Screen name="Sellers" component={SellersScreen} />
      <Drawer.Screen name="Expenses" component={ExpensesScreen} />
      <Drawer.Screen name="Payments" component={PaymentsScreen} />
      <Drawer.Screen name="Pricing" component={PricingScreen} />
    </Drawer.Navigator>
  );
}

// Bottom Tabs para Mobile (DEPRECATED - usando Drawer agora)
function MobileTabNavigator() {
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === "dark";
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#1a1a1a" : "white",
          borderTopWidth: 1,
          borderTopColor: isDark ? "#374151" : "#e5e7eb",
          paddingTop: 8,
          height: 88,
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: isDark ? "#9ca3af" : "#6b7280",
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
        name="Graphics"
        component={GraphicsScreen}
        options={{
          tabBarLabel: "Gráficos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Sellers"
        component={SellersScreen}
        options={{
          tabBarLabel: "Vendedores",
          tabBarIcon: ({ color, size}) => (
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
        name="Plans"
        component={PricingScreen}
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

// Drawer com Sidebar para Desktop
function DesktopDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <Sidebar {...props} currentRoute={props.state.routeNames[props.state.index]} />}
      screenOptions={{
        headerShown: false,
        drawerType: "permanent",
        drawerStyle: {
          width: 260,
        },
        swipeEnabled: false,
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Clients" component={ClientsScreen} />
      <Drawer.Screen name="Graphics" component={GraphicsScreen} />
      <Drawer.Screen name="Sellers" component={SellersScreen} />
      <Drawer.Screen name="Expenses" component={ExpensesScreen} />
      <Drawer.Screen name="Payments" component={PaymentsScreen} />
      <Drawer.Screen name="Plans" component={PricingScreen} />
    </Drawer.Navigator>
  );
}

// Navegador principal que escolhe entre Tabs ou Drawer
function MainNavigator() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;
  
  // Desktop: Sidebar permanente
  // Mobile: Drawer com hamburger menu
  return isDesktop ? <DesktopDrawerNavigator /> : <MobileDrawerNavigator />;
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
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width >= 1024;
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // No web desktop, usar apresentação modal consistente
        presentation: (isDesktop ? "card" : "modal"),
      }}
    >
      <Stack.Screen name="Main" component={MainNavigator} />
      <Stack.Screen
        name="AddClient"
        component={AddClientScreen}
        options={{
          // Forçar card no web para evitar página branca
          presentation: "card",
          animation: isWeb ? "fade" : "default",
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
