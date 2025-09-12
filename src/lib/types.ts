export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export type Application = {
  id: string;
  listingId: string;
  name: string;
  phone?: string;
  note?: string;
  status: ApplicationStatus;
  createdAt: string; // ISO
};
