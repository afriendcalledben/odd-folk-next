
export type Condition = 'Like New' | 'Good' | 'Fair' | 'Poor' | 'Vintage/Antique';

export interface Product {
  id: number;
  name: string;
  description: string;
  pricePerDay: number;
  price3Day?: number | null;
  price7Day?: number | null;
  imageUrl: string;
  images?: string[];
  tags?: string[];
  color?: string;
  locationId?: string | null;
  location: string;
  locationLat?: number | null;
  locationLng?: number | null;
  blockedDates?: Array<{ start: string; end: string }>;
  category: string;
  condition: Condition;
  quantityAvailable: number;
  owner: {
    id: string;
    name: string;
    avatarUrl: string;
    avgRating?: number | null;
    reviewCount?: number;
  };
}

export type BookingStatus =
  | 'pending'        // Hirer requested
  | 'approved'       // Lister approved
  | 'declined'       // Lister declined
  | 'paid'           // Hirer paid (escrow held)
  | 'collected'      // Hirer confirmed collection
  | 'returned'       // Lister confirmed item returned
  | 'completed'      // Lister confirmed item condition — escrow released
  | 'cancelled'
  | 'auto_declined'  // Lister didn't respond within 48 hours
  | 'disputed';

export interface Booking {
  id: string;
  productId: number;
  productName: string;
  productImage: string;
  hirerId: string;
  listerId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  quantity: number; // Quantity booked
  status: BookingStatus;
  
  // Financials
  basePrice: number;
  hirerFee: number;
  damageProtection: number;
  totalHirerCost: number;
  listerFee: number;
  listerPayout: number;

  responseDeadlineAt?: string;
  hasReviewed?: boolean;
  threadId?: string | null;
  hirer?: { id: string; name: string; avatarUrl?: string };
  lister?: { id: string; name: string; avatarUrl?: string };
}

export interface Message {
  id: string;
  bookingId?: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}

export interface Review {
  id: string;
  productId: number;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  itemBorrowed?: string;
}

export interface Dispute {
  id: string;
  bookingId: string;
  reporterId: string; // Who opened it
  issueType: 'damage' | 'missing_item' | 'late_return' | 'not_as_described' | 'other';
  description: string;
  photoUrl?: string; // Evidence
  status: 'open' | 'resolving' | 'resolved';
  createdAt: number;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string; // or productId if relevant
  reason: string;
  details: string;
  createdAt: number;
}
