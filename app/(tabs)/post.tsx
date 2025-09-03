import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { z } from 'zod';
import { MOCK_OWNER_ID } from '../../src/lib/mock';
import { loadListings, saveListings } from '../../src/lib/storage';
import type { Listing } from '../../src/lib/types';

const schema = z.object({
  title: z.string().min(3, 'En az 3 karakter'),
  description: z.string().optional(),
  location: z.string().optional(),
  hourlyRate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Post() {
  const router = useRouter();
  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: { title: '', description: '', location: '', hourlyRate: '' },
  });

  const onSubmit = async (data: FormData) => {
    const all = await loadListings();
    const newItem: Listing = {
      id: `l_${Date.now()}`,
      ownerId: MOCK_OWNER_ID,
      title: data.title,
      description: data.description?.trim() || undefined,
      location: data.location?.trim() || undefined,
      hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
      currency: 'TRY',
      createdAt: new Date().toISOString(),
      status: 'open',
    };
    await saveListings([newItem, ...all]);
    Alert.alert('İlan oluşturuldu', newItem.title);
    reset();
    router.push('/(tabs)/listings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.h1}>Yeni İlan</Text>

        <Text style={styles.label}>Başlık</Text>
        <Controller
          control={control}
          name="title"
          rules={{ required: 'Zorunlu alan' }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Örn: Hafta sonu barista"
              placeholderTextColor="#6b7280"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.title && <Text style={styles.err}>{errors.title.message}</Text>}

        <Text style={styles.label}>Açıklama</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              multiline
              placeholder="Kısa açıklama"
              placeholderTextColor="#6b7280"
              value={value}
              onChangeText={onChange}
            />
          )}
        />

        <Text style={styles.label}>Lokasyon</Text>
        <Controller
          control={control}
          name="location"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Örn: Kadıköy, İstanbul"
              placeholderTextColor="#6b7280"
              value={value}
              onChangeText={onChange}
            />
          )}
        />

        <Text style={styles.label}>Saatlik Ücret (TRY)</Text>
        <Controller
          control={control}
          name="hourlyRate"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Örn: 220"
              placeholderTextColor="#6b7280"
              value={value}
              onChangeText={onChange}
            />
          )}
        />

        <TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.btn}>
          <Text style={styles.btnText}>İlanı Yayınla</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' },
  inner: { padding: 16 },
  h1: { color: 'white', fontSize: 22, fontWeight: '800', marginBottom: 16 },
  label: { color: '#9ca3af', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#111827',
    color: 'white',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  btn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  btnText: { color: 'white', fontWeight: '700' },
  err: { color: '#f87171', marginTop: 4 },
});
