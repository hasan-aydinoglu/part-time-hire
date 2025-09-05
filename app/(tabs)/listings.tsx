import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MOCK_OWNER_ID } from '../../src/lib/mock';
import { loadListings, saveListings } from '../../src/lib/storage';
import { Listing } from '../../src/lib/types';
import ListingCard from '../components/ListingCard';

export default function Listings() {
  const [mine, setMine] = useState<Listing[]>([]);
  const [q, setQ] = useState('');           // metin arama (başlık/açıklama/lokasyon)
  const [openOnly, setOpenOnly] = useState(false); // sadece açık ilanlar
  const router = useRouter();

  const refresh = useCallback(async () => {
    const data = await loadListings();
    setMine(data.filter((l) => l.ownerId === MOCK_OWNER_ID));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleDelete = (id: string) => {
    Alert.alert('Silinsin mi?', 'Bu ilan kalıcı olarak silinecek.', [
      { text: 'Vazgeç' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          const all = await loadListings();
          await saveListings(all.filter((l) => l.id !== id));
          refresh();
        },
      },
    ]);
  };

  const filtered = useMemo(() => {
    return mine.filter((l) => {
      if (openOnly && l.status !== 'open') return false;
      if (q) {
        const haystack = `${l.title} ${l.description ?? ''} ${l.location ?? ''}`.toLowerCase();
        if (!haystack.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [mine, q, openOnly]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Filtreler */}
      <View style={styles.filters}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Ara: başlık, açıklama, lokasyon…"
          placeholderTextColor="#9ca3af"
          value={q}
          onChangeText={setQ}
        />
      </View>
      <View style={styles.row}>
        <Text style={{ color: '#d1d5db' }}>Sadece açık ilanlar</Text>
        <Switch value={openOnly} onValueChange={setOpenOnly} />
      </View>

      {/* Liste */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <ListingCard
            item={item}
            mine
            onPress={() => router.push(`/(tabs)/listing/${item.id}`)}
            onEdit={() => router.push(`/(tabs)/post?editId=${item.id}`)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={{ color: '#9ca3af', paddingHorizontal: 16 }}>
            Filtreye uyan ilan bulunamadı.
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
