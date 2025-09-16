import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Listing } from '../../src/lib/types';

type Props = {
  item: Listing;
  mine?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

function fmtDateTime(iso?: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '';
  }
}

export default function ListingCard({
  item,
  mine,
  onPress,
  onEdit,
  onDelete,
}: Props) {
  const location =
    item.location ||
    [item.city, item.district].filter(Boolean).join(', ') ||
    (item.isRemote ? 'Remote' : 'Lokasyon belirtilmedi');

  const pay =
    item.hourlyRate != null
      ? `${item.hourlyRate} ${item.currency ?? 'TRY'}/saat`
      : 'Ücret belirtilmedi';

  const duration =
    item.durationDays || item.hoursPerDay
      ? `${item.durationDays ? `${item.durationDays} gün` : ''}${
          item.durationDays && item.hoursPerDay ? ' • ' : ''
        }${item.hoursPerDay ? `${item.hoursPerDay} saat/gün` : ''}`
      : '';

  const head = item.companyName
    ? `${item.title} • ${item.companyName}`
    : item.title;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={[styles.card, mine && styles.mine]}>
        
        <Text style={styles.title} numberOfLines={2}>
          {head}
        </Text>

        
        {!!item.description && (
          <Text style={styles.desc} numberOfLines={3}>
            {item.description}
          </Text>
        )}

       
        <View style={styles.row}>
          <Text style={styles.meta} numberOfLines={1}>
            📍 {location}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            💸 {pay}
          </Text>
        </View>

        
        {(duration || typeof item.requiredCount === 'number') && (
          <View style={styles.row}>
            {!!duration && (
              <Text style={styles.meta} numberOfLines={1}>
                ⏱️ {duration}
              </Text>
            )}
            {typeof item.requiredCount === 'number' && (
              <Text style={styles.meta} numberOfLines={1}>
                👥 {item.requiredCount} kişi
              </Text>
            )}
          </View>
        )}

        
        {(item.startAt || item.endAt) && (
          <Text style={styles.meta} numberOfLines={2}>
            🗓️ {fmtDateTime(item.startAt)} {item.endAt ? '→ ' + fmtDateTime(item.endAt) : ''}
          </Text>
        )}

        
        <Text style={styles.status}>Durum: {item.status}</Text>

        
        {mine && (
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.chip, styles.edit]} onPress={onEdit}>
              <Text style={styles.chipText}>Düzenle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chip, styles.del]} onPress={onDelete}>
              <Text style={styles.chipText}>Sil</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Pressable>
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
    gap: 6,
  },
  mine: { borderColor: '#2563eb' },
  title: { color: 'white', fontSize: 16, fontWeight: '700' },
  desc: { color: '#d1d5db' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  meta: { color: '#9ca3af', flexShrink: 1 },
  status: { color: '#60a5fa', marginTop: 4, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  edit: { backgroundColor: '#374151' },
  del: { backgroundColor: '#b91c1c' },
  chipText: { color: 'white', fontWeight: '700' },
});
