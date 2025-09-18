import { Slot } from "expo-router";
import React from "react";
import { StatusBar, View } from "react-native";
import { ThemeProvider, useThemeX } from "../src/theme/ThemeContext";

function Shell() {
  const { theme } = useThemeX();
  const isDark = theme === "dark";
  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0f1115" : "#ffffff" }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Slot />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  );
}
