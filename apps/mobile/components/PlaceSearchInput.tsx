import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import type { PlaceResult } from "@voltph/shared";
import { searchPlaces } from "../api/client";
import { colors } from "../theme";

interface Props {
  label: string;
  placeholder?: string;
  value: PlaceResult | null;
  onSelect: (place: PlaceResult) => void;
}

/** Debounced place search backed by the API's /places/search proxy. */
export function PlaceSearchInput({
  label,
  placeholder,
  value,
  onSelect,
}: Props) {
  const [text, setText] = useState(value?.description ?? "");
  const [debounced, setDebounced] = useState(text);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(text), 300);
    return () => clearTimeout(id);
  }, [text]);

  const enabled = open && debounced.trim().length >= 2;
  const { data: results = [], isFetching } = useQuery({
    queryKey: ["places", debounced],
    queryFn: () => searchPlaces(debounced),
    enabled,
  });

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={text}
        placeholder={placeholder}
        autoCapitalize="words"
        onFocus={() => setOpen(true)}
        onChangeText={(t) => {
          setText(t);
          setOpen(true);
        }}
      />
      {enabled && (
        <View style={styles.dropdown}>
          {isFetching && (
            <ActivityIndicator
              style={styles.loading}
              color={colors.electricGreen}
            />
          )}
          {!isFetching && results.length === 0 && (
            <Text style={styles.empty}>No matches</Text>
          )}
          {results.map((p) => (
            <Pressable
              key={`${p.description}:${p.latitude},${p.longitude}`}
              style={styles.item}
              onPress={() => {
                onSelect(p);
                setText(p.description);
                setOpen(false);
              }}
            >
              <Text style={styles.itemText}>{p.description}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  dropdown: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginTop: 4,
    overflow: "hidden",
  },
  loading: { padding: 12 },
  empty: { padding: 12, color: colors.slate600 },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  itemText: { fontSize: 15, color: colors.carbonBlack },
});
