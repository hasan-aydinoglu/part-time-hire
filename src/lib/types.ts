export type Listing = {
  id: string;
  title: string;
  location?: string;     // "Kadıköy", "Beşiktaş" gibi
  hourlyRate?: number;   // saatlik ücret (örn: 250)
  // ... mevcut alanların kalsın
};
