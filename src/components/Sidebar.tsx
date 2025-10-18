import React from "react";
import { View, Text, Pressable, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../state/authStore";
import { useAppStore } from "../state/appStore";

interface SidebarProps {
  navigation: any;
  currentRoute: string;
}

export default function Sidebar({ navigation, currentRoute }: SidebarProps) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const hideValues = useAppStore((s) => s.hideValues);
  const toggleHideValues = useAppStore((s) => s.toggleHideValues);
  
  const isDark = theme === "dark";
  
  // Cores dinâmicas baseadas no tema
  const colors = {
    bg: isDark ? "#1a1a1a" : "#ffffff",
    bgSecondary: isDark ? "#2d2d2d" : "#f9fafb",
    text: isDark ? "#ffffff" : "#111827",
    textSecondary: isDark ? "#9ca3af" : "#6b7280",
    border: isDark ? "#374151" : "#e5e7eb",
    active: "#3b82f6",
    activeGradient: isDark ? "#2563eb" : "#3b82f6",
  };

  const menuItems = [
    { 
      icon: "stats-chart", 
      label: "Dashboard", 
      route: "Dashboard",
      screen: "Dashboard"
    },
    { 
      icon: "people", 
      label: "Clientes", 
      route: "Clients",
      screen: "Clients"
    },
    { 
      icon: "bar-chart", 
      label: "Gráficos", 
      route: "Graphics",
      screen: "Graphics"
    },
    { 
      icon: "cash", 
      label: "Vendedores", 
      route: "Sellers",
      screen: "Sellers"
    },
    { 
      icon: "wallet", 
      label: "Despesas", 
      route: "Expenses",
      screen: "Expenses"
    },
    { 
      icon: "card", 
      label: "Cobranças", 
      route: "Payments",
      screen: "Payments"
    },
    { 
      icon: "diamond", 
      label: "Planos", 
      route: "Plans",
      screen: "Plans"
    },
  ];

  const handleNavigate = (route: string, screen: string) => {
    if (Platform.OS === 'web') {
      navigation.navigate(route);
    } else {
      navigation.navigate("Main", { screen });
    }
  };

  return (
    <View 
      className="h-full border-r"
      style={{ 
        backgroundColor: colors.bg,
        borderRightColor: colors.border,
        paddingTop: insets.top,
        width: 260,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-6 border-b" style={{ borderBottomColor: colors.border }}>
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-blue-500 rounded-xl items-center justify-center mr-3">
              <Ionicons name="bar-chart" size={24} color="white" />
            </View>
            <View>
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                TrafficFlow Pro
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Gestão Financeira
              </Text>
            </View>
          </View>
          
          {/* User Info */}
          <View 
            className="p-3 rounded-xl flex-row items-center"
            style={{ backgroundColor: colors.bgSecondary }}
          >
            <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-sm" style={{ color: colors.text }}>
                {user?.name || "Usuário"}
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }} numberOfLines={1}>
                {user?.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Navigation Menu */}
        <View className="py-4">
          <Text 
            className="px-6 mb-2 text-xs font-semibold uppercase"
            style={{ color: colors.textSecondary }}
          >
            Menu
          </Text>
          
          {menuItems.map((item) => {
            const isActive = currentRoute === item.route;
            
            return (
              <Pressable
                key={item.route}
                onPress={() => handleNavigate(item.route, item.screen)}
                className="mx-3 mb-1 rounded-xl overflow-hidden"
              >
                <View
                  className="flex-row items-center px-3 py-3"
                  style={{
                    backgroundColor: isActive ? colors.activeGradient + "15" : "transparent",
                  }}
                >
                  <View
                    className="w-9 h-9 rounded-lg items-center justify-center mr-3"
                    style={{
                      backgroundColor: isActive ? colors.active : colors.bgSecondary,
                    }}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={isActive ? "white" : colors.textSecondary}
                    />
                  </View>
                  <Text
                    className="flex-1 font-medium"
                    style={{
                      color: isActive ? colors.active : colors.text,
                    }}
                  >
                    {item.label}
                  </Text>
                  {isActive && (
                    <View className="w-1 h-6 bg-blue-500 rounded-full" />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Settings Section */}
        <View className="px-3 py-4 border-t" style={{ borderTopColor: colors.border }}>
          <Text 
            className="px-3 mb-2 text-xs font-semibold uppercase"
            style={{ color: colors.textSecondary }}
          >
            Configurações
          </Text>
          
          {/* Toggle Theme */}
          <Pressable
            onPress={toggleTheme}
            className="flex-row items-center px-3 py-3 rounded-xl mb-2"
            style={{ backgroundColor: colors.bgSecondary }}
          >
            <View className="w-9 h-9 rounded-lg items-center justify-center mr-3 bg-blue-500">
              <Ionicons
                name={isDark ? "moon" : "sunny"}
                size={20}
                color="white"
              />
            </View>
            <Text className="flex-1 font-medium" style={{ color: colors.text }}>
              Tema {isDark ? "Escuro" : "Claro"}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>

          {/* Toggle Hide Values */}
          <Pressable
            onPress={toggleHideValues}
            className="flex-row items-center px-3 py-3 rounded-xl mb-2"
            style={{ backgroundColor: colors.bgSecondary }}
          >
            <View className="w-9 h-9 rounded-lg items-center justify-center mr-3 bg-purple-500">
              <Ionicons
                name={hideValues ? "eye-off" : "eye"}
                size={20}
                color="white"
              />
            </View>
            <Text className="flex-1 font-medium" style={{ color: colors.text }}>
              {hideValues ? "Mostrar" : "Ocultar"} Valores
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>

          {/* Logout */}
          <Pressable
            onPress={logout}
            className="flex-row items-center px-3 py-3 rounded-xl"
            style={{ backgroundColor: colors.bgSecondary }}
          >
            <View className="w-9 h-9 rounded-lg items-center justify-center mr-3 bg-red-500">
              <Ionicons name="log-out" size={20} color="white" />
            </View>
            <Text className="flex-1 font-medium text-red-500">
              Sair
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View className="px-6 py-4 border-t" style={{ borderTopColor: colors.border }}>
          <Text className="text-xs text-center" style={{ color: colors.textSecondary }}>
            TrafficFlow Pro v2.0
          </Text>
          <Text className="text-xs text-center mt-1" style={{ color: colors.textSecondary }}>
            © 2025 Todos os direitos reservados
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
