import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { loadListings } from '../../src/lib/storage';
import { Listing } from '../../src/lib/types';
import ListingCard from '../components/ListingCard';


export default function Explore() {
  const [items, setItems] = useState<Listing[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const data = await loadListings();
        setItems(data);
      })();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <ListingCard
            item={item}
            onPress={() => router.push(`/(tabs)/listing/${item.id}`)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' },
});
