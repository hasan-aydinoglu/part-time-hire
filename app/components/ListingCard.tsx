import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Listing } from '../types';

type Props = {
  item: Listing;
  mine?: boolean;
};

export default function ListingCard({ item, mine }: Props) {
  return (
    <View style={[styles.card, mine && styles.mine]}>
      <Text style={styles.title}>{item.title}</Text>
      {!!item.description && <Text style={styles.desc}>{item.description}</Text>}
      <Text style={styles.meta}>
        {item.location ?? (item.isRemote ? 'Remote' : 'Lokasyon belirtilmedi')}
      </Text>
      <Text style={styles.meta}>
        {item.hourlyRate ? `${item.hourlyRate} ${item.currency ?? ''}/saat` : 'Ücret belirtilmedi'}
      </Text>
      <Text style={styles.status}>Durum: {item.status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  mine: { borderColor: '#2563eb' },
  title: { color: 'white', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  desc: { color: '#d1d5db', marginBottom: 6 },
  meta: { color: '#9ca3af' },
  status: { color: '#60a5fa', marginTop: 6, fontWeight: '600' },
});
