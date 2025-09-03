import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { MOCK_OWNER_ID } from '../../src/lib/mock';
import { loadListings, saveListings } from '../../src/lib/storage';
import { Listing } from '../../src/lib/types';
import ListingCard from '../components/ListingCard';


export default function Listings() {
  const [mine, setMine] = useState<Listing[]>([]);
  const router = useRouter();

  const refresh = useCallback(() => {
    (async () => {
      const data = await loadListings();
      setMine(data.filter((l) => l.ownerId === MOCK_OWNER_ID));
    })();
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

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

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={mine}
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
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' },
});
