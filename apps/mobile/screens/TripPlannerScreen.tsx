import React, { useState } from "react";
import {
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { PlaceResult } from "@voltph/shared";
import { getEvModels } from "../api/client";
import { PlaceSearchInput } from "../components/PlaceSearchInput";
import { colors } from "../theme";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "TripPlanner">;

export default function TripPlannerScreen({ navigation }: Props) {
  const {
    data: models = [],
    isLoading,
    isError,
  } = useQuery({ queryKey: ["ev-models"], queryFn: getEvModels });

  const [origin, setOrigin] = useState<PlaceResult | null>(null);
  const [destination, setDestination] = useState<PlaceResult | null>(null);
  const [battery, setBattery] = useState("100");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = models.find((m) => m.id === selectedId) ?? models[0];
  const canPlan = Boolean(origin && destination && selected);

  const onPlan = () => {
    if (!origin || !destination || !selected) return;
    navigation.navigate("Result", {
      plan: {
        origin: {
          lat: origin.latitude,
          lng: origin.longitude,
          address: origin.description,
        },
        destination: {
          lat: destination.latitude,
          lng: destination.longitude,
          address: destination.description,
        },
        evModelId: selected.id,
        initialBatteryPercentage: Number(battery) || 0,
      },
      modelName: `${selected.make} ${selected.model}`,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <PlaceSearchInput
        label="Origin"
        placeholder="Search a place (e.g. Manila)"
        value={origin}
        onSelect={setOrigin}
      />
      <PlaceSearchInput
        label="Destination"
        placeholder="Search a place (e.g. Tagaytay)"
        value={destination}
        onSelect={setDestination}
      />

      <Text style={styles.label}>Current battery (%)</Text>
      <TextInput
        style={styles.input}
        value={battery}
        onChangeText={setBattery}
        keyboardType="number-pad"
        placeholder="100"
      />

      <Text style={styles.label}>EV model</Text>
      {isLoading && <ActivityIndicator color={colors.electricGreen} />}
      {isError && (
        <Text style={styles.error}>
          Could not load EV models. Is the API running?
        </Text>
      )}
      {models.map((m) => {
        const active = selected?.id === m.id;
        return (
          <Pressable
            key={m.id}
            onPress={() => setSelectedId(m.id)}
            style={[styles.modelCard, active && styles.modelCardActive]}
          >
            <Text style={styles.modelName}>
              {m.make} {m.model}
            </Text>
            <Text style={styles.modelMeta}>
              {m.batteryCapacityKWh} kWh · {m.plugTypes.join(", ")}
            </Text>
          </Pressable>
        );
      })}

      <Pressable
        style={[styles.button, !canPlan && styles.buttonDisabled]}
        onPress={onPlan}
        disabled={!canPlan}
      >
        <Text style={styles.buttonText}>Plan Trip</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cloudWhite },
  content: { padding: 20, gap: 8 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.slate600,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.carbonBlack,
  },
  error: { color: colors.red, marginVertical: 6 },
  modelCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  modelCardActive: {
    borderColor: colors.electricGreen,
    backgroundColor: "#DCFCE7",
  },
  modelName: { fontSize: 16, fontWeight: "600", color: colors.carbonBlack },
  modelMeta: { fontSize: 13, color: colors.slate600, marginTop: 2 },
  button: {
    backgroundColor: colors.electricGreen,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: "700" },
});
