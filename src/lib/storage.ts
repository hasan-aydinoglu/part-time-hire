import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Listing } from './types';

const LISTINGS_KEY = 'LISTINGS_V1';

export async function loadListings(): Promise<Listing[]> {
  const raw = await AsyncStorage.getItem(LISTINGS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as Listing[]; } catch { return []; }
}

export async function saveListings(items: Listing[]): Promise<void> {
  await AsyncStorage.setItem(LISTINGS_KEY, JSON.stringify(items));
}
