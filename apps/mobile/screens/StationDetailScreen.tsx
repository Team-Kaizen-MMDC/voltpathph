import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../theme";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "StationDetail">;

export default function StationDetailScreen({ route }: Props) {
  const { station } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.name}>{station.name}</Text>
      <Text style={styles.provider}>{station.provider}</Text>

      <View
        style={[
          styles.badge,
          {
            backgroundColor: station.isAvailable
              ? colors.electricGreen
              : colors.slate400,
          },
        ]}
      >
        <Text style={styles.badgeText}>
          {station.isAvailable ? "Available" : "In use"}
        </Text>
      </View>

      <Row label="Power" value={`${station.powerKW} kW`} />
      <Row label="Connectors" value={station.plugTypes.join(", ")} />
      <Row
        label="Coordinates"
        value={`${station.latitude.toFixed(5)}, ${station.longitude.toFixed(5)}`}
      />
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cloudWhite },
  content: { padding: 20, gap: 10 },
  name: { fontSize: 22, fontWeight: "800", color: colors.carbonBlack },
  provider: { fontSize: 15, color: colors.slate600, marginBottom: 8 },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  badgeText: { color: colors.white, fontWeight: "700", fontSize: 13 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
  },
  rowLabel: { color: colors.slate600, fontSize: 14 },
  rowValue: {
    color: colors.carbonBlack,
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
  },
});
