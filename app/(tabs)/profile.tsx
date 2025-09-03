import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { MOCK_OWNER_ID } from '../../src/lib/mock';

export default function Profile() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 16 }}>
        <Text style={styles.h1}>Profil / Şirket Bilgisi</Text>

        <Text style={styles.line}>Kullanıcı (mock): {MOCK_OWNER_ID}</Text>
        <Text style={styles.line}>Şirket adı: (Firebase eklenince)</Text>
        <Text style={styles.line}>Telefon: (Firebase eklenince)</Text>

        <Text style={[styles.line, { marginTop: 12, color: '#60a5fa' }]}>
          Not: Auth + Firestore bağlandığında gerçek veriler buraya gelecek.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' },
  h1: { color: 'white', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  line: { color: '#d1d5db', marginTop: 4 },
});
