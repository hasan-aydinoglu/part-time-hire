import { Tabs } from "expo-router";
import { Pressable, Text } from "react-native";
import { useThemeX } from "../../src/theme/ThemeContext";

export default function TabsLayout() {
  const { theme, toggleTheme } = useThemeX();
  const isDark = theme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: isDark ? "#0f1115" : "#fff" },
        headerTitleStyle: { color: isDark ? "#fff" : "#000" },
        tabBarStyle: { backgroundColor: isDark ? "#0f1115" : "#fff" },
        tabBarActiveTintColor: isDark ? "#fff" : "#111",
        headerRight: () => (
          <Pressable onPress={toggleTheme} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ color: isDark ? "#9ecbff" : "#1b5ccc" }}>
              {isDark ? "Light" : "Dark"}
            </Text>
          </Pressable>
        ),
      }}
    >
      {/* örnek: */}
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="listings" options={{ title: "Listings" }} />
      {/* varsa diğer tablar */}
    </Tabs>
  );
}
