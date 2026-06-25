import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { StatusBar } from "expo-status-bar";

function AppContent() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
