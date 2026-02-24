
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
  condition: Condition; // Updated to strict type
  quantityAvailable: number; // Total stock
  owner: {
    id: string;
    name: string;
    avatarUrl: string;
  };
}

export type BookingStatus = 
  | 'pending'           // Hirer requested
  | 'approved'          // Lister approved
  | 'paid'              // Hirer paid (Escrow)
  | 'handover_pending'  // Payment secured, ready for pickup
  | 'active'            // Item picked up (Handover confirmed)
  | 'return_pending'    // Rental period over, item returned by hirer
  | 'completed'         // Lister confirmed return (Funds released)
  | 'cancelled'
  | 'disputed';         // Issue reported

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
