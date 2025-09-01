import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Part-Time İşveren Paneli</Text>
      <Text style={styles.subtitle}>İlan aç, işçini hemen bul!</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.replace('/(tabs)/explore')}
      >
        <Text style={styles.btnText}>Başla</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b1220' },
  title: { color: 'white', fontSize: 26, fontWeight: '800', marginBottom: 12 },
  subtitle: { color: '#9ca3af', fontSize: 16, marginBottom: 30 },
  btn: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  btnText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
