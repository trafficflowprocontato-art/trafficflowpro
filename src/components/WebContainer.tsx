import React from "react";
import { View, useWindowDimensions, Platform } from "react-native";

interface WebContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export default function WebContainer({ children, maxWidth: customMaxWidth }: WebContainerProps) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  
  // On web, use responsive max widths for better desktop experience
  // Small screens (tablets): 768px
  // Large screens (desktop): 1200px or custom
  const getMaxWidth = () => {
    if (!isWeb) return undefined;
    if (width <= 768) return width;
    return customMaxWidth || 1200;
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
