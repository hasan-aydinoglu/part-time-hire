// en üstlerde:
import type { Application } from './types';

// LISTINGS_KEY zaten var, buna ek:
const APPS_KEY = 'APPLICATIONS_V1';

// dosyanın herhangi yerine (export'larla beraber):
export async function loadApplications(): Promise<Application[]> {
  const raw = await AsyncStorage.getItem(APPS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as Application[]; } catch { return []; }
}

export async function saveApplications(items: Application[]): Promise<void> {
  await AsyncStorage.setItem(APPS_KEY, JSON.stringify(items));
}
