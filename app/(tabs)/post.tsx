import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text, TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { z } from 'zod';
import { MOCK_OWNER_ID } from '../../src/lib/mock';
import { loadListings, saveListings } from '../../src/lib/storage';
import { Listing } from '../../src/lib/types';

const schema = z.object({
  
  title: z.string().min(3, 'En az 3 karakter'),
  companyName: z.string().optional(),
  description: z.string().optional(),

  
  city: z.string().optional(),
  district: z.string().optional(),
  isRemote: z.boolean().default(false),

 
  hourlyRate: z.string().optional(),      
  requiredCount: z.string().optional(),   

  
  durationDays: z.string().optional(),
  hoursPerDay: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function Post() {
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEdit = !!editId;

  const { control, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      title: '', companyName: '', description: '',
      city: '', district: '', isRemote: false,
      hourlyRate: '', requiredCount: '',
      durationDays: '', hoursPerDay: '',
    },
  });

 
  const [multiDay, setMultiDay] = useState(false);
  const [start, setStart] = useState<Date>(new Date());
  const [end, setEnd] = useState<Date>(new Date(Date.now() + 2 * 60 * 60 * 1000));
  const [showStartDate, setShowStartDate] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const all = await loadListings();
      const found = all.find(l => l.id === editId);
      if (found) {
        setValue('title', found.title);
        setValue('companyName', found.companyName ?? '');
        setValue('description', found.description ?? '');
        setValue('city', found.city ?? '');
        setValue('district', found.district ?? '');
        setValue('isRemote', !!found.isRemote);
        setValue('hourlyRate', found.hourlyRate ? String(found.hourlyRate) : '');
        setValue('requiredCount', typeof found.requiredCount === 'number' ? String(found.requiredCount) : '');
        setValue('durationDays', typeof found.durationDays === 'number' ? String(found.durationDays) : '');
        setValue('hoursPerDay', typeof found.hoursPerDay === 'number' ? String(found.hoursPerDay) : '');

        if (found.startAt) setStart(new Date(found.startAt));
        if (found.endAt) setEnd(new Date(found.endAt));
        if (found.startAt && found.endAt) {
          const s = new Date(found.startAt), e = new Date(found.endAt);
          setMultiDay(s.toDateString() !== e.toDateString());
        }
      }
    })();
  }, [isEdit, editId, setValue]);

  const onSubmit = async (data: FormData) => {
    const all = await loadListings();

    
    let finalStart = new Date(start);
    let finalEnd = new Date(end);
    if (!multiDay) {
      finalEnd = new Date(
        finalStart.getFullYear(), finalStart.getMonth(), finalStart.getDate(),
        end.getHours(), end.getMinutes(), 0, 0
      );
    }

    const common: Partial<Listing> = {
      title: data.title,
      companyName: data.companyName?.trim() || undefined,
      description: data.description?.trim() || undefined,

      city: data.city?.trim() || undefined,
      district: data.district?.trim() || undefined,
      location: [data.city?.trim(), data.district?.trim()].filter(Boolean).join(', ') || undefined,
      isRemote: !!data.isRemote,

      hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
      requiredCount: data.requiredCount ? Number(data.requiredCount) : undefined,

      durationDays: data.durationDays ? Number(data.durationDays) : undefined,
      hoursPerDay: data.hoursPerDay ? Number(data.hoursPerDay) : undefined,

      startAt: finalStart.toISOString(),
      endAt: finalEnd.toISOString(),
      currency: 'TRY',
    };

    if (isEdit) {
      const idx = all.findIndex(l => l.id === editId);
      if (idx === -1) return Alert.alert('Hata', 'İlan bulunamadı');
      const next: Listing = { ...all[idx], ...common };
      all[idx] = next;
      await saveListings(all);
      Alert.alert('Güncellendi', next.title);
      router.replace(`/(tabs)/listing/${next.id}`);
      return;
    }

    const newItem: Listing = {
      id: `l_${Date.now()}`,
      ownerId: MOCK_OWNER_ID,
      createdAt: new Date().toISOString(),
      status: 'open',
      ...common,
    } as Listing;

    await saveListings([newItem, ...all]);
    Alert.alert('İlan oluşturuldu', newItem.title);
    reset();
    router.push('/(tabs)/listings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.h1}>{isEdit ? 'İlanı Düzenle' : 'Yeni İlan'}</Text>

       
        <Text style={styles.label}>Başlık *</Text>
        <Controller control={control} name="title" rules={{ required: 'Zorunlu alan' }}
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} placeholder="Örn: Hafta sonu barista"
              placeholderTextColor="#6b7280" value={value} onChangeText={onChange} />
          )}
        />
        {errors.title && <Text style={styles.err}>{errors.title.message}</Text>}

        <Text style={styles.label}>Şirket Adı</Text>
        <Controller control={control} name="companyName"
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} placeholder="Örn: Hasanlar Cafe"
              placeholderTextColor="#6b7280" value={value} onChangeText={onChange} />
          )}
        />

        <Text style={styles.label}>Açıklama</Text>
        <Controller control={control} name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              multiline placeholder="Kısa açıklama" placeholderTextColor="#6b7280"
              value={value} onChangeText={onChange} />
          )}
        />

       
        <Text style={styles.sub}>Konum</Text>
        <View style={styles.row}>
          <Controller control={control} name="city"
            render={({ field: { onChange, value } }) => (
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Şehir"
                placeholderTextColor="#6b7280" value={value} onChangeText={onChange} />
            )}
          />
          <View style={{ width: 8 }} />
          <Controller control={control} name="district"
            render={({ field: { onChange, value } }) => (
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="İlçe"
                placeholderTextColor="#6b7280" value={value} onChangeText={onChange} />
            )}
          />
        </View>

        <View style={styles.rowSpace}>
          <Text style={{ color: '#d1d5db' }}>Uzaktan (remote)</Text>
          <Controller control={control} name="isRemote"
            render={({ field: { onChange, value } }) => (
              <Switch value={value} onValueChange={onChange} />
            )}
          />
        </View>

        
        <Text style={styles.sub}>Ücret & İhtiyaç</Text>
        <View style={styles.row}>
          <Controller control={control} name="hourlyRate"
            render={({ field: { onChange, value } }) => (
              <TextInput style={[styles.input, { flex: 1 }]} keyboardType="numeric"
                placeholder="Saatlik Ücret (TRY)" placeholderTextColor="#6b7280"
                value={value} onChangeText={onChange} />
            )}
          />
          <View style={{ width: 8 }} />
          <Controller control={control} name="requiredCount"
            render={({ field: { onChange, value } }) => (
              <TextInput style={[styles.input, { flex: 1 }]} keyboardType="number-pad"
                placeholder="Kaç kişi?" placeholderTextColor="#6b7280"
                value={value} onChangeText={onChange} />
            )}
          />
        </View>

        
        <Text style={styles.sub}>Süre</Text>
        <View style={styles.row}>
          <Controller control={control} name="durationDays"
            render={({ field: { onChange, value } }) => (
              <TextInput style={[styles.input, { flex: 1 }]} keyboardType="number-pad"
                placeholder="Kaç gün?" placeholderTextColor="#6b7280"
                value={value} onChangeText={onChange} />
            )}
          />
          <View style={{ width: 8 }} />
          <Controller control={control} name="hoursPerDay"
            render={({ field: { onChange, value } }) => (
              <TextInput style={[styles.input, { flex: 1 }]} keyboardType="number-pad"
                placeholder="Günde kaç saat?" placeholderTextColor="#6b7280"
                value={value} onChangeText={onChange} />
            )}
          />
        </View>

       
        <View style={styles.rowSpace}>
          <Text style={{ color: '#d1d5db' }}>Çok gün (multi-day)</Text>
          <Switch value={multiDay} onValueChange={setMultiDay} />
        </View>
        <Text style={styles.sub}>Başlangıç</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowStartDate(true)}>
            <Text style={styles.pickerText}>{start.toLocaleDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowStartTime(true)}>
            <Text style={styles.pickerText}>{start.toLocaleTimeString()}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sub}>Bitiş {multiDay ? 'Tarihi' : 'Saati'}</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowEndDate(true)}>
            <Text style={styles.pickerText}>{end.toLocaleDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowEndTime(true)}>
            <Text style={styles.pickerText}>{end.toLocaleTimeString()}</Text>
          </TouchableOpacity>
        </View>

        {showStartDate && (
          <DateTimePicker value={start} mode="date"
            onChange={(_, d) => { setShowStartDate(Platform.OS === 'ios'); if (d) setStart(d); }} />
        )}
        {showStartTime && (
          <DateTimePicker value={start} mode="time"
            onChange={(_, d) => { setShowStartTime(Platform.OS === 'ios'); if (d) setStart(d); }} />
        )}
        {showEndDate && (
          <DateTimePicker value={end} mode="date"
            onChange={(_, d) => { setShowEndDate(Platform.OS === 'ios'); if (d) setEnd(d); }} />
        )}
        {showEndTime && (
          <DateTimePicker value={end} mode="time"
            onChange={(_, d) => { setShowEndTime(Platform.OS === 'ios'); if (d) setEnd(d); }} />
        )}

        
        <TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.btn}>
          <Text style={styles.btnText}>{isEdit ? 'Kaydet' : 'İlanı Yayınla'}</Text>
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
  sub: { color: '#9ca3af', marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: '#111827', color: 'white', borderWidth: 1, borderColor: '#1f2937',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowSpace: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  btn: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 10, marginTop: 20, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '700' },
  err: { color: '#f87171', marginTop: 4 },
  pickerBtn: { backgroundColor: '#1f2937', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginRight: 8 },
  pickerText: { color: 'white' },
});
