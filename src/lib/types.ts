export type Currency = 'TRY' | 'USD' | 'EUR' | 'GBP';

export type Listing = {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  hourlyRate?: number;
  currency?: Currency;
  location?: string;
  isRemote?: boolean;
  startAt?: string;       // ISO
  endAt?: string;         // ISO
  requiredCount?: number; // kaç kişi lazım
  createdAt: string;      // ISO
  status: 'open' | 'closed' | 'draft';
};
