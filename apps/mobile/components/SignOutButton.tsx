import React from "react";
import { Pressable, Text } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { colors } from "../theme";

/** Header sign-out action; renders nothing when auth is disabled or signed out. */
export function SignOutButton() {
  const { authEnabled, session, signOut } = useAuth();
  if (!authEnabled || !session) return null;
  return (
    <Pressable onPress={() => signOut()} hitSlop={8}>
      <Text style={{ color: colors.chargeBlue, fontWeight: "600" }}>
        Sign out
      </Text>
    </Pressable>
  );
}
