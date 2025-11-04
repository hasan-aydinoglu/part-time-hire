import Slider from "@react-native-community/slider";
import React, { useEffect, useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

export type Filters = {
  minRate?: number | null;
  maxRate?: number | null;
  location?: string;
};

type Props = {
  visible: boolean;
  initial?: Filters;
  onClose: () => void;
  onApply: (f: Filters) => void;

  /**
   * Slider sınırları (opsiyonel). Göndermezsen varsayılan 0–1000 ₺ olur.
   * Örn: parent’tan dinamik göndermek istersen:
   * <FilterSheet range={{ min: 100, max: 800 }} ... />
   */
  range?: { min: number; max: number };
};

export default function FilterSheet({ visible, initial, onClose, onApply, range }: Props) {
  // Varsayılan slider limiti
  const MIN_LIMIT = range?.min ?? 0;
  const MAX_LIMIT = range?.max ?? 1000;

  // Text input’lar
  const [location, setLocation] = useState<string>("");

  // Slider değerleri (number)
  const [minVal, setMinVal] = useState<number>(MIN_LIMIT);
  const [maxVal, setMaxVal] = useState<number>(MAX_LIMIT);

  // Text input’ları slider’la senkron tutmak için string state
  const [minRate, setMinRate] = useState<string>("");
  const [maxRate, setMaxRate] = useState<string>("");

  useEffect(() => {
    // initial değerleri ekrana yansıt
    const initMin = initial?.minRate ?? null;
    const initMax = initial?.maxRate ?? null;

    setLocation(initial?.location ?? "");

    const sMin = initMin == null ? "" : String(initMin);
    const sMax = initMax == null ? "" : String(initMax);
    setMinRate(sMin);
    setMaxRate(sMax);

    // slider başlangıcı (boşsa limitlere otur)
    setMinVal(initMin == null ? MIN_LIMIT : Math.max(MIN_LIMIT, Math.min(initMin, MAX_LIMIT)));
    setMaxVal(initMax == null ? MAX_LIMIT : Math.max(MIN_LIMIT, Math.min(initMax, MAX_LIMIT)));
  }, [initial, visible, MIN_LIMIT, MAX_LIMIT]);

  // Text -> Slider senkronizasyonu
  const onChangeMinText = (t: string) => {
    setMinRate(t);
    const n = Number(t);
    if (!Number.isNaN(n)) {
      // min, max’ı geçmesin
      const clamped = Math.max(MIN_LIMIT, Math.min(n, maxVal));
      setMinVal(clamped);
    } else if (t === "") {
      setMinVal(MIN_LIMIT);
    }
  };

  const onChangeMaxText = (t: string) => {
    setMaxRate(t);
    const n = Number(t);
    if (!Number.isNaN(n)) {
      // max, min’in altına düşmesin
      const clamped = Math.min(MAX_LIMIT, Math.max(n, minVal));
      setMaxVal(clamped);
    } else if (t === "") {
      setMaxVal(MAX_LIMIT);
    }
  };

  // Slider -> Text senkronizasyonu
  const onSlideMin = (v: number) => {
    const val = Math.min(v, maxVal); // min, max’tan büyük olmasın
    setMinVal(val);
    setMinRate(String(Math.round(val)));
  };

  const onSlideMax = (v: number) => {
    const val = Math.max(v, minVal); // max, min’den küçük olmasın
    setMaxVal(val);
    setMaxRate(String(Math.round(val)));
  };

  const apply = () => {
    // Boş string’ler null olsun
    const min = minRate.trim() === "" ? null : Number(minRate);
    const max = maxRate.trim() === "" ? null : Number(maxRate);

    onApply({
      minRate: min,
      maxRate: max,
      location: location.trim() || undefined,
    });
    onClose();
  };

  const resetRange = () => {
    setMinVal(MIN_LIMIT);
    setMaxVal(MAX_LIMIT);
    setMinRate("");
    setMaxRate("");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>Filtreler</Text>

          {/* Konum */}
          <Text style={{ marginBottom: 6 }}>Konum (içerir):</Text>
          <TextInput
            placeholder="Örn: Kadıköy"
            value={location}
            onChangeText={setLocation}
            style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 16 }}
          />

          {/* Ücret aralığı başlık */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
            <Text style={{ fontWeight: "600" }}>Ücret aralığı (₺/saat)</Text>
            <TouchableOpacity onPress={resetRange}>
              <Text style={{ color: "#1b5ccc" }}>Sıfırla</Text>
            </TouchableOpacity>
          </View>

          {/* Min/Max input + canlı değer etiketi */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 6 }}>Min</Text>
              <TextInput
                keyboardType="numeric"
                placeholder={`${MIN_LIMIT}`}
                value={minRate}
                onChangeText={onChangeMinText}
                style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 8 }}
              />
              <Text style={{ color: "#666" }}>Slider: ₺{Math.round(minVal)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 6 }}>Max</Text>
              <TextInput
                keyboardType="numeric"
                placeholder={`${MAX_LIMIT}`}
                value={maxRate}
                onChangeText={onChangeMaxText}
                style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 8 }}
              />
              <Text style={{ color: "#666" }}>Slider: ₺{Math.round(maxVal)}</Text>
            </View>
          </View>

          {/* İki adet slider (min ve max) */}
          <View style={{ marginTop: 10 }}>
            <Text style={{ marginBottom: 6 }}>Min slider</Text>
            <Slider
              value={minVal}
              minimumValue={MIN_LIMIT}
              maximumValue={MAX_LIMIT}
              onValueChange={onSlideMin}
              step={10}
            />
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={{ marginBottom: 6 }}>Max slider</Text>
            <Slider
              value={maxVal}
              minimumValue={MIN_LIMIT}
              maximumValue={MAX_LIMIT}
              onValueChange={onSlideMax}
              step={10}
            />
          </View>

          {/* Alt butonlar */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
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
