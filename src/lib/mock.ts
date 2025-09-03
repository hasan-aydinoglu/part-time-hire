import { Listing } from './types';

export const MOCK_OWNER_ID = 'local-owner-1';

export const MOCK_LISTINGS: Listing[] = [
  {
    id: 'l1',
    ownerId: MOCK_OWNER_ID,
    title: 'Kafe için hafta sonu barista',
    description: 'Cumartesi–Pazar 10:00–18:00. Deneyim tercih.',
    hourlyRate: 220,
    currency: 'TRY',
    location: 'Kadıköy, İstanbul',
    isRemote: false,
    createdAt: new Date().toISOString(),
    status: 'open',
  },
];
