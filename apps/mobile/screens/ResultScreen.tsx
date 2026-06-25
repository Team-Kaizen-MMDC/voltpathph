import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useQuery } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { optimizeTrip } from "../api/client";
import { colors } from "../theme";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Result">;

/** Map arrival SoC to a green/amber/red reachability verdict. */
function getVerdict(soc: number): { color: string; label: string } {
  if (soc >= 20)
    return {
      color: colors.electricGreen,
      label: `You'll make it — about ${soc.toFixed(0)}% on arrival`,
    };
  if (soc >= 0)
    return {
      color: colors.amber,
      label: `Cutting it close — about ${soc.toFixed(0)}% on arrival`,
    };
  return {
    color: colors.red,
    label: `Won't make it — charge en route`,
  };
}

export default function ResultScreen({ route, navigation }: Props) {
  const { plan, modelName } = route.params;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["optimize", plan],
    queryFn: () => optimizeTrip(plan),
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.electricGreen} />
        <Text style={styles.muted}>Calculating route and battery…</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>
          Could not plan the trip. Check that the API is running.
        </Text>
      </View>
    );
  }

  const verdict = getVerdict(data.remainingBatteryPercentage);
  const midLat = (plan.origin.lat + plan.destination.lat) / 2;
  const midLng = (plan.origin.lng + plan.destination.lng) / 2;
  const latDelta = Math.max(
    Math.abs(plan.origin.lat - plan.destination.lat) * 1.8,
    0.1,
  );
  const lngDelta = Math.max(
    Math.abs(plan.origin.lng - plan.destination.lng) * 1.8,
    0.1,
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.verdict, { backgroundColor: verdict.color }]}>
        <Text style={styles.verdictText}>{verdict.label}</Text>
      </View>

      <Text style={styles.model}>{modelName}</Text>

      <View style={styles.statsRow}>
        <Stat label="Distance" value={`${data.totalDistanceKm} km`} />
        <Stat label="Duration" value={`${data.totalDurationMin} min`} />
      </View>
      <View style={styles.statsRow}>
        <Stat
          label="Energy"
          value={`${data.estimatedBatteryConsumptionKWh} kWh`}
        />
        <Stat
          label="Arrival SoC"
          value={`${data.remainingBatteryPercentage.toFixed(1)}%`}
        />
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: midLat,
          longitude: midLng,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        }}
      >
        <Marker
          coordinate={{
            latitude: plan.origin.lat,
            longitude: plan.origin.lng,
          }}
          title="Origin"
          description={plan.origin.address}
          pinColor={colors.chargeBlue}
        />
        <Marker
          coordinate={{
            latitude: plan.destination.lat,
            longitude: plan.destination.lng,
          }}
          title="Destination"
          description={plan.destination.address}
          pinColor={colors.electricGreen}
        />
        {data.recommendedChargingStops.map((s) => (
          <Marker
            key={s.id}
            coordinate={{ latitude: s.latitude, longitude: s.longitude }}
            title={s.name}
            description={s.provider}
            pinColor={colors.amber}
          />
        ))}
      </MapView>

      <Text style={styles.sectionTitle}>
        Charging stations ({data.recommendedChargingStops.length})
      </Text>
      {data.recommendedChargingStops.length === 0 && (
        <Text style={styles.muted}>
          No charging stops needed for this trip.
        </Text>
      )}
      {data.recommendedChargingStops.map((s) => (
        <Pressable
          key={s.id}
          style={styles.stationCard}
          onPress={() => navigation.navigate("StationDetail", { station: s })}
        >
          <Text style={styles.stationName}>{s.name}</Text>
          <Text style={styles.stationMeta}>
            {s.provider} · {s.powerKW} kW ·{" "}
            {s.isAvailable ? "Available" : "In use"}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cloudWhite },
  content: { padding: 16, gap: 12 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.cloudWhite,
  },
  muted: { color: colors.slate600, textAlign: "center" },
  error: { color: colors.red, textAlign: "center", fontSize: 16 },
  verdict: { borderRadius: 14, padding: 16 },
  verdictText: { color: colors.white, fontSize: 16, fontWeight: "700" },
  model: { fontSize: 14, color: colors.slate600 },
  statsRow: { flexDirection: "row", gap: 12 },
  stat: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: { fontSize: 12, color: colors.slate600 },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.carbonBlack,
    marginTop: 2,
  },
  map: { height: 260, borderRadius: 14, marginTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.carbonBlack,
    marginTop: 8,
  },
  stationCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stationName: { fontSize: 15, fontWeight: "600", color: colors.carbonBlack },
  stationMeta: { fontSize: 13, color: colors.slate600, marginTop: 2 },
});
