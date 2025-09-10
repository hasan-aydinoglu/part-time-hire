export type Listing = {
  id: string;
  ownerId: string;
  title: string;              // ilan başlığı
  companyName?: string;       // şirket adı
  description?: string;

  // Konum
  city?: string;              // şehir
  district?: string;          // ilçe
  location?: string;          // istersen birleşik gösterim için

  // Ücret / İhtiyaç
  hourlyRate?: number;        // ücret (saatlik)
  currency?: 'TRY' | 'USD' | 'EUR' | 'GBP';
  requiredCount?: number;     // kaç kişi lazım

  // Süre
  durationDays?: number;      // kaç gün
  hoursPerDay?: number;       // günde kaç saat
  startAt?: string;           // ISO
  endAt?: string;             // ISO

  isRemote?: boolean;
  createdAt: string;          // ISO
  status: 'open' | 'closed' | 'draft';
};
