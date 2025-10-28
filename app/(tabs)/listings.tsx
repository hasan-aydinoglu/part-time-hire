import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import FilterSheet, { Filters } from "../../src/components/FilterSheet";
import { loadFavorites, loadListings } from "../../src/lib/storage";
import type { Listing } from "../../src/lib/types";

type SortOrder = "asc" | "desc";

export default function ListingsScreen() {
  const [all, setAll] = useState<Listing[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [open, setOpen] = useState(false);

  const [favIds, setFavIds] = useState<string[]>([]);
  const [onlyFavs, setOnlyFavs] = useState(false);

  // Pull-to-Refresh
  const [refreshing, setRefreshing] = useState(false);

  // Ücrete göre sıralama (varsayılan: azalan)
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Tek yerden veri çekme
  const reload = useCallback(async () => {
    const data = await loadListings();
    setAll(data || []);
    const f = await loadFavorites();
    setFavIds(f || []);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await reload();
    } finally {
      setRefreshing(false);
    }
  }, [reload]);

  const applyFilters = useCallback(
    (items: Listing[], f: Filters) => {
      return items.filter((it) => {
        const okFav = !onlyFavs ? true : favIds.includes(it.id);

        const okLoc = f.location
          ? (it.location || "").toLowerCase().includes(f.location.toLowerCase())
          : true;

        const rate = it.hourlyRate ?? 0;
        const okMin = f.minRate != null ? rate >= (f.minRate || 0) : true;
        const okMax = f.maxRate != null ? rate <= (f.maxRate || Number.POSITIVE_INFINITY) : true;

        return okFav && okLoc && okMin && okMax;
      });
    },
    [onlyFavs, favIds]
  );

  const filtered = useMemo(() => applyFilters(all, filters), [all, filters, applyFilters]);

  // 🔽 Sıralama (hourlyRate olmayanlar sona)
  const sorted = useMemo(() => {
    const val = (x: number | undefined, order: SortOrder) => {
      if (x == null) return order === "asc" ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
      return x;
    };
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = val(a.hourlyRate, sortOrder);
      const bv = val(b.hourlyRate, sortOrder);
      return sortOrder === "asc" ? av - bv : bv - av;
    });
    return copy;
  }, [filtered, sortOrder]);

  const toggleSort = useCallback(() => {
    setSortOrder((s) => (s === "asc" ? "desc" : "asc"));
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Başlık + Favori Switch + Filtre + Sıralama */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, justifyContent: "space-between" }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>İş İlanları</Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ marginRight: 6 }}>Yalnızca Favoriler</Text>
            <Switch value={onlyFavs} onValueChange={setOnlyFavs} />
          </View>

          {/* Ücrete göre sıralama butonu */}
          <TouchableOpacity
            onPress={toggleSort}
            style={{ paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 8 }}
          >
            <Text>Ücret {sortOrder === "asc" ? "↑" : "↓"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setOpen(true)}
            style={{ paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 8 }}
          >
            <Text>Filtrele</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Aktif filtre/sıralama chip’leri */}
      {(filters.location || filters.minRate || filters.maxRate || onlyFavs || sortOrder) ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {onlyFavs ? (
            <View style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#eef3ff", borderRadius: 999 }}>
              <Text>Yalnızca Favoriler</Text>
            </View>
          ) : null}
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
          <View style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#eef3ff", borderRadius: 999 }}>
            <Text>Sıralama: Ücret {sortOrder === "asc" ? "↑" : "↓"}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setFilters({});
              setOnlyFavs(false);
              setSortOrder("desc");
            }}
            style={{ marginLeft: 6, padding: 6 }}
          >
            <Text>Temizle</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Liste */}
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {sorted.map((it) => (
          <View key={it.id} style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" }}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>{it.title}</Text>
            {!!it.location && <Text>{it.location}</Text>}
            {!!it.hourlyRate && <Text>₺{it.hourlyRate}/saat</Text>}
          </View>
        ))}
        {sorted.length === 0 && (
          <Text style={{ marginTop: 20, color: "#666" }}>
            {onlyFavs ? "Favorilerinde bu filtrelere uygun ilan yok." : "Filtrelere uygun ilan bulunamadı."}
          </Text>
        )}
      </ScrollView>

      {/* Filter Sheet */}
      <FilterSheet
        visible={open}
        initial={filters}
        onClose={() => setOpen(false)}
        onApply={(f) => setFilters(f)}
      />
    </View>
  );
}
