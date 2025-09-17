import { Slot } from "expo-router";
import React, { useState } from "react";
import { Switch, View } from "react-native";

export default function RootLayout() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: darkMode ? "#111" : "#fff" }}>
      {/* Tema değiştirici switch */}
      <Switch
        value={darkMode}
        onValueChange={setDarkMode}
        style={{ position: "absolute", top: 40, right: 20 }}
      />
      <Slot />
    </View>
  );
}
