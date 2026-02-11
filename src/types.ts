
export type Condition = 'Like New' | 'Good' | 'Fair' | 'Poor' | 'Vintage/Antique';

export interface Product {
  id: number;
  name: string;
  description: string;
  pricePerDay: number;
  imageUrl: string;
  images?: string[];
  location: string;
  category: string;
  condition: Condition;
  quantityAvailable: number;
  owner: {
    id: string;
    name: string;
    avatarUrl: string;
  };
}

export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'paid'
  | 'handover_pending'
  | 'active'
  | 'return_pending'
  | 'completed'
  | 'cancelled'
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
  quantity: number;
  status: BookingStatus;
  basePrice: number;
  hirerFee: number;
  damageProtection: number;
  totalHirerCost: number;
  listerFee: number;
  listerPayout: number;
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
  reporterId: string;
  issueType: 'damage' | 'missing_item' | 'late_return' | 'not_as_described' | 'other';
  description: string;
  photoUrl?: string;
  status: 'open' | 'resolving' | 'resolved';
  createdAt: number;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  details: string;
  createdAt: number;
}
