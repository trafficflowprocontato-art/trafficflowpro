import React from "react";
import { View, Platform } from "react-native";

interface WebContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export default function WebContainer({ children, maxWidth: customMaxWidth }: WebContainerProps) {
  const isWeb = Platform.OS === "web";
  
  // Full width on web for modern dashboard experience
  const getMaxWidth = () => {
    if (!isWeb) return undefined;
    return customMaxWidth || undefined; // No max width = full screen
  };
  
  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        maxWidth: getMaxWidth(),
        alignSelf: "center",
        backgroundColor: isWeb ? "#f9fafb" : undefined,
      }}
    >
      {children}
    </View>
  );
}
