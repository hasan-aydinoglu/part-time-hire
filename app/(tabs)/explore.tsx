import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { loadListings } from '../../src/lib/storage';
import { Listing } from '../../src/lib/types';
import ListingCard from '../components/ListingCard';

export default function Explore() {
  const [items, setItems] = useState<Listing[]>([]);
  const [q, setQ] = useState('');       
  const [minPay, setMinPay] = useState(''); 
  const [openOnly, setOpenOnly] = useState(true); 
  const router = useRouter();

 
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const data = await loadListings();
        setItems(data);
      })();
    }, [])
  );

  
  const filtered = useMemo(() => {
    return items.filter((l) => {
      if (openOnly && l.status !== 'open') return false;

      if (q) {
        const haystack = `${l.title} ${l.description ?? ''} ${l.location ?? ''}`.toLowerCase();
        if (!haystack.includes(q.toLowerCase())) return false;
      }

      if (minPay) {
        const m = Number(minPay);
        if (!Number.isNaN(m) && (l.hourlyRate ?? 0) < m) return false;
      }

      return true;
    });
  }, [items, q, minPay, openOnly]);

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.filters}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Ara: başlık, açıklama, lokasyon…"
          placeholderTextColor="#9ca3af"
          value={q}
          onChangeText={setQ}
        />
        <TextInput
          style={[styles.input, { width: 110, marginLeft: 8 }]}
          placeholder="Min ₺/saat"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          value={minPay}
          onChangeText={setMinPay}
        />
      </View>

      <View style={styles.row}>
        <Text style={{ color: '#d1d5db' }}>Sadece açık ilanlar</Text>
        <Switch value={openOnly} onValueChange={setOpenOnly} />
      </View>

      
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        renderItem={({ item }) => (
          <ListingCard
            item={item}
            onPress={() => router.push(`/(tabs)/listing/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <Text style={{ color: '#9ca3af', padding: 16 }}>
            Sonuç bulunamadı. Filtleri gevşetmeyi deneyin.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' },
  filters: { flexDirection: 'row', padding: 16, paddingBottom: 8, gap: 8 },
  input: {
    backgroundColor: '#111827',
    color: 'white',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});
