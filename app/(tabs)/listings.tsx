import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet } from 'react-native';
import ListingCard from '../components/ListingCard';
import { MOCK_OWNER_ID } from '../lib/mock';
import { loadListings } from '../lib/storage';
import { Listing } from '../lib/types';

export default function Listings() {
  const [mine, setMine] = useState<Listing[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const data = await loadListings();
        setMine(data.filter((l) => l.ownerId === MOCK_OWNER_ID));
      })();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={mine}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => <ListingCard item={item} mine />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' },
});
