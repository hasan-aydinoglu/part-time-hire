import AsyncStorage from '@react-native-async-storage/async-storage';
import { Listing } from './types';

const KEY = 'LISTINGS_V1';

export async function loadListings(): Promise<Listing[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as Listing[]; } catch { return []; }
}

export async function saveListings(items: Listing[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}
