import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import TripPlannerScreen from "./screens/TripPlannerScreen";
import ResultScreen from "./screens/ResultScreen";
import StationDetailScreen from "./screens/StationDetailScreen";
import SignInScreen from "./screens/SignInScreen";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { SignOutButton } from "./components/SignOutButton";
import type { RootStackParamList } from "./navigation/types";
import { colors } from "./theme";

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Root() {
  const { session, loading, authEnabled } = useAuth();

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.electricGreen} />
      </View>
    );
  }

  // Enforce sign-in only when Supabase is configured; otherwise run open (dev).
  if (authEnabled && !session) {
    return <SignInScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.white },
          headerTintColor: colors.carbonBlack,
          contentStyle: { backgroundColor: colors.cloudWhite },
        }}
      >
        <Stack.Screen
          name="TripPlanner"
          component={TripPlannerScreen}
          options={{
            title: "Plan a Trip",
            headerRight: () => <SignOutButton />,
          }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{ title: "Trip Result" }}
        />
        <Stack.Screen
          name="StationDetail"
          component={StationDetailScreen}
          options={{ title: "Charging Station" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="dark" />
          <Root />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cloudWhite,
  },
});
