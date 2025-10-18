import React from "react";
import { Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../state/appStore";

interface MoneyDisplayProps {
  value: number;
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  showToggle?: boolean;
  style?: any;
  className?: string;
}

export default function MoneyDisplay({ 
  value, 
  size = "md", 
  color,
  showToggle = false,
  style,
  className 
}: MoneyDisplayProps) {
  const hideValues = useAppStore((s) => s.hideValues);
  const toggleHideValues = useAppStore((s) => s.toggleHideValues);
  const theme = useAppStore((s) => s.theme);
  
  const isDark = theme === "dark";
  const defaultColor = color || (isDark ? "#ffffff" : "#111827");
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const getSizeClass = () => {
    switch (size) {
      case "sm": return "text-sm";
      case "md": return "text-base";
      case "lg": return "text-2xl";
      case "xl": return "text-4xl";
      default: return "text-base";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm": return 14;
      case "md": return 18;
      case "lg": return 24;
      case "xl": return 32;
      default: return 18;
    }
  };

  const displayValue = hideValues 
    ? "R$ " + "•".repeat(formatCurrency(value).length - 3)
    : formatCurrency(value);

  if (showToggle) {
    return (
      <View className="flex-row items-center gap-2">
        <Text 
          className={`font-bold ${getSizeClass()} ${className || ""}`}
          style={[{ color: defaultColor }, style]}
        >
          {displayValue}
        </Text>
        <Pressable 
          onPress={toggleHideValues}
          className="p-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={hideValues ? "eye-off" : "eye"}
            size={getIconSize()}
            color={isDark ? "#9ca3af" : "#6b7280"}
          />
        </Pressable>
      </View>
    );
  }

  return (
    <Text 
      className={`font-bold ${getSizeClass()} ${className || ""}`}
      style={[{ color: defaultColor }, style]}
    >
      {displayValue}
    </Text>
  );
}
