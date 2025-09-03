import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { loadListings, saveListings } from '../../../src/lib/storage';
import type { Listing } from '../../../src/lib/types';



export default function ListingDetail() {

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<Listing | null>(null);

  useEffect(() => {
    (async () => {
      const all = await loadListings();
      setItem(all.find(l => l.id === id) || null);
    })();
  }, [id]);

  const toggleStatus = async () => {
    if (!item) return;
    const all = await loadListings();
    const idx = all.findIndex(l => l.id === item.id);
    if (idx === -1) return;
    const next: Listing = { ...all[idx], status: all[idx].status === 'open' ? 'closed' : 'open' };
    all[idx] = next;
    await saveListings(all);
    setItem(next);
    Alert.alert('Güncellendi', `Durum: ${next.status}`);
  };

  const goEdit = () => {
    // post ekranına editId ile gider; post.tsx içinde edit modunu okuyan kod olmalı
    router.push(`/(tabs)/post?editId=${id}`);
  };

  const doDelete = async () => {
    Alert.alert('Silinsin mi?', 'Bu ilan kalıcı olarak silinecek.', [
      { text: 'Vazgeç' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          const all = await loadListings();
          await saveListings(all.filter(l => l.id !== id));
          Alert.alert('Silindi');
          router.back();
        },
      },
    ]);
  };

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.h1}>İlan bulunamadı</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 16 }}>
        <Text style={styles.h1}>{item.title}</Text>
        {!!item.description && <Text style={styles.text}>{item.description}</Text>}

        <Text style={styles.text}>Lokasyon: {item.location ?? (item.isRemote ? 'Remote' : '—')}</Text>
        <Text style={styles.text}>
          Ücret: {item.hourlyRate ? `${item.hourlyRate} ${item.currency ?? ''}/saat` : '—'}
        </Text>

        {(item.startAt || item.endAt) && (
          <Text style={styles.text}>
            Vardiya: {item.startAt ? new Date(item.startAt).toLocaleString() : '—'}
            {'  →  '}
            {item.endAt ? new Date(item.endAt).toLocaleString() : '—'}
          </Text>
        )}
        {typeof item.requiredCount === 'number' && (
          <Text style={styles.text}>Gereken kişi: {item.requiredCount}</Text>
        )}

        <Text style={[styles.text, { marginTop: 8 }]}>
          Durum: <Text style={{ color: '#60a5fa' }}>{item.status}</Text>
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <TouchableOpacity onPress={toggleStatus} style={styles.btnPrimary}>
            <Text style={styles.btnText}>{item.status === 'open' ? 'Kapat' : 'Yeniden Aç'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goEdit} style={styles.btnSecondary}>
            <Text style={styles.btnText}>Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={doDelete} style={styles.btnDanger}>
            <Text style={styles.btnText}>Sil</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={[styles.btnSecondary, { marginTop: 12 }]}>
          <Text style={styles.btnText}>Geri</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' },
  h1: { color: 'white', fontSize: 22, fontWeight: '800', marginBottom: 10 },
  text: { color: '#d1d5db', marginTop: 6 },
  btnPrimary: { backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  btnSecondary: { backgroundColor: '#374151', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  btnDanger: { backgroundColor: '#b91c1c', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  btnText: { color: 'white', fontWeight: '700' },
});
