import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FilterSheet, { Filters } from "../../src/components/FilterSheet";
import { loadFavorites, loadListings } from "../../src/lib/storage";
import type { Listing } from "../../src/lib/types";

type SortOrder = "asc" | "desc";

// Aksan/şapka duyarsız arama için normalize helper
function norm(s?: string) {
  return (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

// Hızlı konum önerileri
const QUICK_LOCS = ["Kadıköy", "Beşiktaş", "Üsküdar", "Şişli", "Ataşehir"];

export default function ListingsScreen() {
  const router = useRouter();

  const [all, setAll] = useState<Listing[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [open, setOpen] = useState(false);

  const [favIds, setFavIds] = useState<string[]>([]);
  const [onlyFavs, setOnlyFavs] = useState(false);

  // Pull-to-Refresh
  const [refreshing, setRefreshing] = useState(false);

  // Ücrete göre sıralama (varsayılan: azalan)
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Arama
  const [query, setQuery] = useState("");

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
      const q = norm(query);
      return items.filter((it) => {
        const okFav = !onlyFavs ? true : favIds.includes(it.id);

        const okLoc = f.location ? norm(it.location).includes(norm(f.location)) : true;

        const rate = it.hourlyRate ?? 0;
        const okMin = f.minRate != null ? rate >= (f.minRate || 0) : true;
        const okMax = f.maxRate != null ? rate <= (f.maxRate || Number.POSITIVE_INFINITY) : true;

        // Başlık + konumda arama
        const okQuery =
          q.length === 0 ? true : norm(it.title).includes(q) || norm(it.location).includes(q);

        return okFav && okLoc && okMin && okMax && okQuery;
      });
    },
    [onlyFavs, favIds, query]
  );

  const filtered = useMemo(() => applyFilters(all, filters), [all, filters, applyFilters]);

  // Sıralama (hourlyRate olmayanlar sona)
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

  const clearAll = useCallback(() => {
    setFilters({});
    setOnlyFavs(false);
    setSortOrder("desc");
    setQuery("");
  }, []);

  // Chip davranışı: aynı chip’e basılırsa temizle; değilse set et
  const onPickQuickLocation = useCallback((loc: string) => {
    setFilters((prev) => {
      const current = prev.location ?? "";
      if (norm(current) === norm(loc)) {
        const { location, ...rest } = prev;
        return { ...rest };
      }
      return { ...prev, location: loc };
    });
  }, []);

  const selectedQuick = filters.location
    ? QUICK_LOCS.find((l) => norm(l) === norm(filters.location))
    : undefined;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Başlık satırı */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "700" }}>İş İlanları</Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ marginRight: 6 }}>Yalnızca Favoriler</Text>
            <Switch value={onlyFavs} onValueChange={setOnlyFavs} />
          </View>

          {/* Ücrete göre sıralama */}
          <TouchableOpacity
            onPress={toggleSort}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
            }}
          >
            <Text>Ücret {sortOrder === "asc" ? "↑" : "↓"}</Text>
          </TouchableOpacity>

          {/* Filtre Sheet aç */}
          <TouchableOpacity
            onPress={() => setOpen(true)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
            }}
          >
            <Text>Filtrele</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Arama kutusu */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 6,
          marginBottom: 10,
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ color: "#888", marginRight: 6 }}>🔎</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Pozisyon ara…"
          placeholderTextColor="#999"
          style={{ flex: 1, paddingVertical: 6, fontSize: 16 }}
          returnKeyType="search"
          clearButtonMode="while-editing" // iOS
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")} style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
            <Text style={{ color: "#1b5ccc" }}>Temizle</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Hızlı konum chip’leri */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {QUICK_LOCS.map((loc) => {
            const active = norm(loc) === norm(selectedQuick);
            return (
              <TouchableOpacity
                key={loc}
                onPress={() => onPickQuickLocation(loc)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: active ? "#1b5ccc" : "#ddd",
                  backgroundColor: active ? "#eaf1ff" : "#fff",
                }}
              >
                <Text style={{ color: active ? "#1b5ccc" : "#333" }}>{loc}</Text>
              </TouchableOpacity>
            );
          })}
          {/* Tümünü temizle chip’i */}
          <TouchableOpacity
            onPress={() => setFilters((p) => ({ ...p, location: undefined }))}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "#ddd",
              backgroundColor: "#fff",
            }}
          >
            <Text>Temizle</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Aktif filtre/sıralama/arama chip’leri */}
      {(filters.location ||
        filters.minRate ||
        filters.maxRate ||
        onlyFavs ||
        sortOrder ||
        query) ? (
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
          {query ? (
            <View style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#eef3ff", borderRadius: 999 }}>
              <Text>Ara: {query}</Text>
            </View>
          ) : null}
          <View style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#eef3ff", borderRadius: 999 }}>
            <Text>Sıralama: Ücret {sortOrder === "asc" ? "↑" : "↓"}</Text>
          </View>
          <TouchableOpacity onPress={clearAll} style={{ marginLeft: 6, padding: 6 }}>
            <Text>Hepsini Temizle</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Liste */}
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {sorted.map((it) => (
          <TouchableOpacity
            key={it.id}
            onPress={() => router.push(`/listing/${it.id}`)} // Detay route'unu projenle eşleştir
            style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600" }}>{it.title}</Text>
            {!!it.location && <Text>{it.location}</Text>}
            {!!it.hourlyRate && <Text>₺{it.hourlyRate}/saat</Text>}
            <Text style={{ marginTop: 4, color: "#1b5ccc" }}>Detaya git →</Text>
          </TouchableOpacity>
        ))}

        {/* Boş durum (emoji’li) */}
        {sorted.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            <Text style={{ fontSize: 42 }}>🙈</Text>
            <Text style={{ fontSize: 16, color: "#666", marginTop: 8 }}>Hiç sonuç yok</Text>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              <TouchableOpacity
                onPress={clearAll}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#ccc",
                }}
              >
                <Text>Filtreleri Temizle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setOpen(true)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: "#1b5ccc",
                }}
              >
                <Text style={{ color: "#fff" }}>Filtrele</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ marginTop: 6, color: "#888", fontSize: 13, textAlign: "center" }}>
              {onlyFavs
                ? "Favorilerinde bu kriterlere uyan ilan yok."
                : "Kriterleri gevşetmeyi deneyebilirsin."}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Filter Sheet (slider için range örneği eklendi) */}
      <FilterSheet
        visible={open}
        initial={filters}
        range={{ min: 0, max: 2000 }}
        onClose={() => setOpen(false)}
        onApply={(f) => setFilters(f)}
      />
    </View>
  );
}
