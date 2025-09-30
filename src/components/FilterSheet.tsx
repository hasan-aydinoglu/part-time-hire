import React, { useEffect, useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

export type Filters = {
  minRate?: number | null;
  maxRate?: number | null;
  location?: string;
};

export default function FilterSheet({
  visible,
  initial,
  onClose,
  onApply,
}: {
  visible: boolean;
  initial?: Filters;
  onClose: () => void;
  onApply: (f: Filters) => void;
}) {
  const [minRate, setMinRate] = useState<string>("");
  const [maxRate, setMaxRate] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  useEffect(() => {
    setMinRate(initial?.minRate ? String(initial!.minRate) : "");
    setMaxRate(initial?.maxRate ? String(initial!.maxRate) : "");
    setLocation(initial?.location ?? "");
  }, [initial, visible]);

  const apply = () => {
    onApply({
      minRate: minRate ? Number(minRate) : null,
      maxRate: maxRate ? Number(maxRate) : null,
      location: location.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>Filtreler</Text>

          <Text style={{ marginBottom: 6 }}>Konum (içerir):</Text>
          <TextInput
            placeholder="Örn: Kadıköy"
            value={location}
            onChangeText={setLocation}
            style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 12 }}
          />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 6 }}>Min ₺/saat</Text>
              <TextInput
                keyboardType="numeric"
                placeholder="örn: 200"
                value={minRate}
                onChangeText={setMinRate}
                style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 12 }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 6 }}>Max ₺/saat</Text>
              <TextInput
                keyboardType="numeric"
                placeholder="örn: 400"
                value={maxRate}
                onChangeText={setMaxRate}
                style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 12 }}
              />
            </View>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
            <TouchableOpacity onPress={onClose} style={{ padding: 12 }}>
              <Text style={{ fontSize: 16 }}>Kapat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={apply}
              style={{ paddingVertical: 12, paddingHorizontal: 16, backgroundColor: "#1b5ccc", borderRadius: 8 }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Uygula</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
