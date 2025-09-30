import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import FilterSheet, { Filters } from "../../src/components/FilterSheet";
import { loadListings } from "../../src/lib/storage";
import type { Listing } from "../../src/lib/types";

export default function ListingsScreen() {
  const [all, setAll] = useState<Listing[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await loadListings();
      setAll(data || []);
    })();
  }, []);

  const applyFilters = useCallback((items: Listing[], f: Filters) => {
    return items.filter((it) => {
      const okLoc = f.location
        ? (it.location || "").toLowerCase().includes(f.location.toLowerCase())
        : true;

      const rate = it.hourlyRate ?? 0;
      const okMin = f.minRate != null ? rate >= (f.minRate || 0) : true;
      const okMax = f.maxRate != null ? rate <= (f.maxRate || Number.POSITIVE_INFINITY) : true;

      return okLoc && okMin && okMax;
    });
  }, []);

  const filtered = useMemo(() => applyFilters(all, filters), [all, filters, applyFilters]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Header / Filter butonu */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>İş İlanları</Text>
        <TouchableOpacity
          onPress={() => setOpen(true)}
          style={{ paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 8 }}
        >
          <Text>Filtrele</Text>
        </TouchableOpacity>
      </View>

      {/* Aktif filtre özetini göster (varsa) */}
      {(filters.location || filters.minRate || filters.maxRate) ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {filters.location ? (
            <View style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#eef3ff", borderRadius: 999 }}>
              <Text>Konum: {filters.location}</Text>
            </View>
          ) : null}
          {filters.minRate ? (
            <View style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#eef3ff", borderRadius: 999 }}>
              <Text>Min: ₺{filters.minRate}</Text>
            </View>
          ) : null}
          {filters.maxRate ? (
            <View style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#eef3ff", borderRadius: 999 }}>
              <Text>Max: ₺{filters.maxRate}</Text>
            </View>
          ) : null}
          <TouchableOpacity onPress={() => setFilters({})} style={{ marginLeft: 6, padding: 6 }}>
            <Text>Temizle</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Liste */}
      <ScrollView>
        {filtered.map((it) => (
          <View key={it.id} style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" }}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>{it.title}</Text>
            {!!it.location && <Text>{it.location}</Text>}
            {!!it.hourlyRate && <Text>₺{it.hourlyRate}/saat</Text>}
          </View>
        ))}
        {filtered.length === 0 && (
          <Text style={{ marginTop: 20, color: "#666" }}>Filtrelere uygun ilan bulunamadı.</Text>
        )}
      </ScrollView>

      {/* Sheet */}
      <FilterSheet
        visible={open}
        initial={filters}
        onClose={() => setOpen(false)}
        onApply={(f) => setFilters(f)}
      />
    </View>
  );
}
