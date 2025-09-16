import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  loadApplications,
  loadListings,
  saveApplications,
  saveListings,
} from '../../../src/lib/storage';
import type {
  Application,
  ApplicationStatus,
  Listing,
} from '../../../src/lib/types';

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<Listing | null>(null);
  const [allApps, setAllApps] = useState<Application[]>([]);

  // Yeni başvuru formu
  const [appName, setAppName] = useState('');
  const [appPhone, setAppPhone] = useState('');
  const [appNote, setAppNote] = useState('');

  useEffect(() => {
    (async () => {
      const all = await loadListings();
      setItem(all.find((l) => l.id === id) || null);

      const apps = await loadApplications();
      setAllApps(apps);
    })();
  }, [id]);

  const myApps = useMemo(
    () => allApps.filter((a) => a.listingId === id),
    [allApps, id]
  );

  const toggleStatus = async () => {
    if (!item) return;
    const all = await loadListings();
    const idx = all.findIndex((l) => l.id === item.id);
    if (idx === -1) return;
    const next: Listing = {
      ...all[idx],
      status: all[idx].status === 'open' ? 'closed' : 'open',
    };
    all[idx] = next;
    await saveListings(all);
    setItem(next);
    Alert.alert('Güncellendi', `Durum: ${next.status}`);
  };

  const goEdit = () => {
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
          await saveListings(all.filter((l) => l.id !== id));

          
          const apps = await loadApplications();
          await saveApplications(apps.filter((a) => a.listingId !== id));

          Alert.alert('Silindi');
          router.back();
        },
      },
    ]);
  };

  const addApplication = async () => {
    if (!item) return;
    if (!appName.trim()) {
      Alert.alert('Hata', 'İsim zorunlu');
      return;
    }
    const apps = await loadApplications();
    const newApp: Application = {
      id: `a_${Date.now()}`,
      listingId: item.id,
      name: appName.trim(),
      phone: appPhone.trim() || undefined,
      note: appNote.trim() || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const next = [newApp, ...apps];
    await saveApplications(next);
    setAllApps(next);
    setAppName('');
    setAppPhone('');
    setAppNote('');
  };

  const setAppStatus = async (appId: string, status: ApplicationStatus) => {
    const apps = await loadApplications();
    const idx = apps.findIndex((a) => a.id === appId);
    if (idx === -1) return;
    apps[idx] = { ...apps[idx], status };
    await saveApplications(apps);
    setAllApps(apps);
  };

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.h1}>İlan bulunamadı</Text>
      </SafeAreaView>
    );
  }

  const location =
    item.location ||
    [item.city, item.district].filter(Boolean).join(', ') ||
    (item.isRemote ? 'Remote' : '—');

  const pay =
    item.hourlyRate != null ? `${item.hourlyRate} ${item.currency ?? 'TRY'}/saat` : '—';

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 16 }}>
        <Text style={styles.h1}>{item.title}</Text>
        {!!item.companyName && <Text style={styles.text}>Şirket: {item.companyName}</Text>}
        {!!item.description && <Text style={styles.text}>{item.description}</Text>}

        <Text style={styles.text}>Lokasyon: {location}</Text>
        <Text style={styles.text}>Ücret: {pay}</Text>

        {(item.startAt || item.endAt) && (
          <Text style={styles.text}>
            Vardiya: {item.startAt ? new Date(item.startAt).toLocaleString() : '—'}
            {'  →  '}
            {item.endAt ? new Date(item.endAt).toLocaleString() : '—'}
          </Text>
        )}
        {(item.durationDays || item.hoursPerDay) && (
          <Text style={styles.text}>
            Süre: {item.durationDays ? `${item.durationDays} gün` : ''}
            {item.durationDays && item.hoursPerDay ? ' • ' : ''}
            {item.hoursPerDay ? `${item.hoursPerDay} saat/gün` : ''}
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
            <Text style={styles.btnText}>
              {item.status === 'open' ? 'Kapat' : 'Yeniden Aç'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goEdit} style={styles.btnSecondary}>
            <Text style={styles.btnText}>Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={doDelete} style={styles.btnDanger}>
            <Text style={styles.btnText}>Sil</Text>
          </TouchableOpacity>
        </View>

        
        <Text style={[styles.h2, { marginTop: 18 }]}>Başvuru Ekle</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="İsim *"
            placeholderTextColor="#9ca3af"
            value={appName}
            onChangeText={setAppName}
          />
          <TextInput
            style={styles.input}
            placeholder="Telefon"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            value={appPhone}
            onChangeText={setAppPhone}
          />
        </View>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          multiline
          placeholder="Not"
          placeholderTextColor="#9ca3af"
          value={appNote}
          onChangeText={setAppNote}
        />
        <TouchableOpacity
          onPress={addApplication}
          style={[styles.btnPrimary, { marginTop: 8, alignSelf: 'flex-start' }]}
        >
          <Text style={styles.btnText}>Ekle</Text>
        </TouchableOpacity>

        {/* Başvurular listesi */}
        <Text style={[styles.h2, { marginTop: 18 }]}>Başvurular</Text>
        <FlatList
          data={myApps}
          keyExtractor={(i) => i.id}
          style={{ marginTop: 6 }}
          renderItem={({ item: ap }) => (
            <View style={styles.appCard}>
              <Text style={styles.appTitle}>{ap.name}</Text>
              {!!ap.phone && <Text style={styles.appText}>☎ {ap.phone}</Text>}
              {!!ap.note && <Text style={styles.appText}>“{ap.note}”</Text>}
              <Text style={[styles.appText, { color: '#60a5fa' }]}>
                Durum: {ap.status}
              </Text>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TouchableOpacity
                  onPress={() => setAppStatus(ap.id, 'accepted')}
                  style={styles.chipAccept}
                >
                  <Text style={styles.chipText}>Kabul</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAppStatus(ap.id, 'rejected')}
                  style={styles.chipReject}
                >
                  <Text style={styles.chipText}>Ret</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAppStatus(ap.id, 'pending')}
                  style={styles.chipPending}
                >
                  <Text style={styles.chipText}>Bekleyen</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: '#9ca3af', marginTop: 8 }}>
              Henüz başvuru yok.
            </Text>
          }
        />

        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.btnSecondary, { marginTop: 12 }]}
        >
          <Text style={styles.btnText}>Geri</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' },
  h1: { color: 'white', fontSize: 22, fontWeight: '800', marginBottom: 10 },
  h2: { color: 'white', fontSize: 18, fontWeight: '700' },
  text: { color: '#d1d5db', marginTop: 6 },
  btnPrimary: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  btnSecondary: {
    backgroundColor: '#374151',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  btnDanger: {
    backgroundColor: '#b91c1c',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  btnText: { color: 'white', fontWeight: '700' },
  input: {
    backgroundColor: '#111827',
    color: 'white',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    flex: 1,
  },
  inputRow: { flexDirection: 'row', gap: 8 },
  appCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  appTitle: { color: 'white', fontWeight: '700' },
  appText: { color: '#d1d5db', marginTop: 2 },
  chipText: { color: 'white', fontWeight: '700' },
  chipAccept: {
    backgroundColor: '#16a34a',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  chipReject: {
    backgroundColor: '#b91c1c',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  chipPending: {
    backgroundColor: '#374151',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
});
