import React from "react";
import { View, Platform } from "react-native";
import { useAppStore } from "../state/appStore";

interface WebContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export default function WebContainer({ children, maxWidth: customMaxWidth }: WebContainerProps) {
  const isWeb = Platform.OS === "web";
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === "dark";
  
  // Full width on web for modern dashboard experience
  const getMaxWidth = () => {
    if (!isWeb) return undefined;
    return customMaxWidth || undefined; // No max width = full screen
  };
  
  // Dynamic background based on theme
  const backgroundColor = isDark ? "#1a1a1a" : (isWeb ? "#f9fafb" : undefined);
  
  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        maxWidth: getMaxWidth(),
        alignSelf: "center",
        backgroundColor,
      }}
    >
      {children}
    </View>
  );
}
