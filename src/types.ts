export type Listing = {
    id: string;
    ownerId: string;
    title: string;
    description?: string;
    hourlyRate?: number;
    currency?: 'TRY' | 'USD' | 'EUR' | 'GBP';
    location?: string;
    isRemote?: boolean;
    startAt?: string; // ISO
    endAt?: string;   // ISO
    requiredCount?: number;
    createdAt: string; // ISO
    status: 'open' | 'closed' | 'draft';
  };
  