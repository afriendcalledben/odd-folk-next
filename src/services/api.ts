
import type { Product, Booking, BookingStatus, Message, Review, Dispute, Report } from '../types';

// --- CONFIGURATION ---
const API_BASE_URL = '/api';

// --- AUTH TOKEN MANAGEMENT ---
const getToken = (): string | null => localStorage.getItem('oddfolk_token');
const setToken = (token: string) => localStorage.setItem('oddfolk_token', token);
const removeToken = () => localStorage.removeItem('oddfolk_token');

// --- HTTP CLIENT ---
const api = {
  async get<T>(endpoint: string): Promise<T> {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }
    const data = await res.json();
    return data.data ?? data;
  },

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }
    const data = await res.json();
    return data.data ?? data;
  },

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }
    const data = await res.json();
    return data.data ?? data;
  },

  async delete<T>(endpoint: string): Promise<T> {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }
    const data = await res.json();
    return data.data ?? data;
  },

  async uploadFiles(endpoint: string, files: File[], fieldName = 'images'): Promise<string[]> {
    const token = getToken();
    const formData = new FormData();
    files.forEach(file => formData.append(fieldName, file));

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }
    const data = await res.json();
    return data.data?.urls || [data.data?.url] || [];
  },
};

// --- AUTH ---
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
}

export const auth = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const result = await api.post<{ user: User; token: string }>('/auth/login', { email, password });
    setToken(result.token);
    return result;
  },

  async signup(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    const result = await api.post<{ user: User; token: string }>('/auth/register', { email, password, name });
    setToken(result.token);
    return result;
  },

  async getCurrentUser(): Promise<User | null> {
    if (!getToken()) return null;
    try {
      const result = await api.get<{ user: User }>('/auth/me');
      return result.user;
    } catch {
      removeToken();
      return null;
    }
  },

  logout() {
    removeToken();
  },

  isLoggedIn(): boolean {
    return !!getToken();
  },

  getToken,
};

// --- HELPER: Convert backend product to frontend Product type ---
const toFrontendProduct = (p: Record<string, unknown>): Product => ({
  id: p.id as number,
  name: (p as Record<string, unknown>).title as string,
  description: p.description as string,
  pricePerDay: (p as Record<string, unknown>).price1Day as number,
  imageUrl: ((p as Record<string, unknown>).images as string[])?.[0] || 'https://picsum.photos/seed/default/800/600',
  images: (p as Record<string, unknown>).images as string[] || [],
  location: ((p as Record<string, unknown>).location as Record<string, unknown>)?.city as string || 'London',
  category: p.category as string,
  condition: p.condition as Product['condition'],
  quantityAvailable: (p.quantity as number) || 1,
  owner: {
    id: ((p.owner as Record<string, unknown>)?.id as string) || (p.ownerId as string),
    name: ((p.owner as Record<string, unknown>)?.name as string) || 'Unknown',
    avatarUrl: ((p.owner as Record<string, unknown>)?.avatarUrl as string) || 'https://i.pravatar.cc/150',
  },
});

// --- PRODUCTS ---
export interface SearchParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
}

export const fetchProducts = async (params?: SearchParams): Promise<Product[]> => {
  try {
    const queryParts: string[] = [];
    if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params?.category && params.category !== 'All') queryParts.push(`category=${encodeURIComponent(params.category)}`);
    if (params?.minPrice) queryParts.push(`minPrice=${params.minPrice}`);
    if (params?.maxPrice) queryParts.push(`maxPrice=${params.maxPrice}`);
    if (params?.condition) queryParts.push(`condition=${encodeURIComponent(params.condition)}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await api.get<{ items: any[] }>(`/products${queryString}`);
    return (result.items || []).map(toFrontendProduct);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
};

export const fetchProductById = async (id: number | string): Promise<Product | undefined> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await api.get<any>(`/products/${id}`);
    return toFrontendProduct(result);
  } catch {
    return undefined;
  }
};

export const fetchReviewsForProduct = async (id: number | string): Promise<Review[]> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reviews = await api.get<any[]>(`/products/${id}/reviews`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return reviews.map((r: any) => ({
      id: r.id,
      productId: r.productId,
      reviewerName: r.reviewer?.name || 'Anonymous',
      reviewerAvatar: r.reviewer?.avatarUrl,
      rating: r.rating,
      comment: r.comment || '',
      date: r.createdAt,
    }));
  } catch {
    return [];
  }
};

export const createProduct = async (productData: {
  title: string;
  description: string;
  category: string;
  tags: string[];
  condition: string;
  color: string;
  quantity: number;
  price1Day: number;
  price3Day?: number;
  price7Day?: number;
  images: string[];
  locationId?: string;
}): Promise<Product> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await api.post<any>('/products', productData);
  return toFrontendProduct(result);
};

// --- BOOKINGS ---
export const createBookingRequest = async (
  product: Product,
  startDate: string,
  endDate: string,
  quantity: number = 1
): Promise<Booking> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await api.post<any>('/bookings', {
    productId: product.id,
    startDate,
    endDate,
    quantity,
  });

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return {
    id: result.id,
    productId: typeof product.id === 'string' ? parseInt(product.id) : product.id,
    productName: product.name,
    productImage: product.imageUrl,
    hirerId: result.hirerId,
    listerId: result.listerId,
    startDate: result.startDate,
    endDate: result.endDate,
    totalDays: days,
    quantity,
    status: result.status?.toLowerCase() || 'pending',
    basePrice: result.totalHirerCost * 0.8,
    hirerFee: result.totalHirerCost * 0.1,
    damageProtection: result.totalHirerCost * 0.1,
    totalHirerCost: result.totalHirerCost,
    listerFee: result.platformFee,
    listerPayout: result.listerPayout,
  };
};

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  void userId;
  try {
    const [hirerBookings, listerBookings] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.get<any[]>('/bookings?type=hirer').catch(() => []),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.get<any[]>('/bookings?type=lister').catch(() => []),
    ]);

    const allBookings = [...(hirerBookings || []), ...(listerBookings || [])];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return allBookings.map((b: any) => ({
      id: b.id,
      productId: b.productId,
      productName: b.product?.title || 'Unknown Product',
      productImage: b.product?.images?.[0] || 'https://picsum.photos/seed/default/800/600',
      hirerId: b.hirerId,
      listerId: b.listerId,
      startDate: b.startDate,
      endDate: b.endDate,
      totalDays: Math.ceil(
        (new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 60 * 60 * 24)
      ) + 1,
      quantity: 1,
      status: b.status?.toLowerCase() || 'pending',
      basePrice: b.totalHirerCost * 0.8,
      hirerFee: b.totalHirerCost * 0.1,
      damageProtection: b.totalHirerCost * 0.1,
      totalHirerCost: b.totalHirerCost,
      listerFee: b.platformFee,
      listerPayout: b.listerPayout,
    }));
  } catch {
    return [];
  }
};

export const updateBookingStatus = async (bookingId: string, status: BookingStatus): Promise<Booking> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await api.put<any>(`/bookings/${bookingId}/status`, {
    status: status.toUpperCase()
  });

  return {
    id: result.id,
    productId: result.productId,
    productName: result.product?.title || 'Unknown',
    productImage: result.product?.images?.[0] || '',
    hirerId: result.hirerId,
    listerId: result.listerId,
    startDate: result.startDate,
    endDate: result.endDate,
    totalDays: 1,
    quantity: 1,
    status: result.status?.toLowerCase() || status,
    basePrice: result.totalHirerCost * 0.8,
    hirerFee: result.totalHirerCost * 0.1,
    damageProtection: result.totalHirerCost * 0.1,
    totalHirerCost: result.totalHirerCost,
    listerFee: result.platformFee,
    listerPayout: result.listerPayout,
  };
};

// --- SUPPORT & SAFETY ---
export const createDispute = async (
  bookingId: string,
  issueType: Dispute['issueType'],
  description: string,
  photoUrl?: string
): Promise<Dispute> => {
  const newDispute: Dispute = {
    id: `dsp_${Date.now()}`,
    bookingId,
    reporterId: 'user_current',
    issueType,
    description,
    photoUrl,
    status: 'open',
    createdAt: Date.now(),
  };

  await updateBookingStatus(bookingId, 'disputed');

  return newDispute;
};

export const reportUser = async (
  reportedUserId: string,
  reason: string,
  details: string
): Promise<Report> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await api.post<any>('/reports', {
    type: 'USER',
    targetId: reportedUserId,
    reason,
    details,
  });

  return {
    id: result.id || `rpt_${Date.now()}`,
    reporterId: 'user_current',
    reportedUserId,
    reason,
    details,
    createdAt: Date.now(),
  };
};

// --- MESSAGING ---
export const getMessagesForBooking = async (bookingId: string): Promise<Message[]> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messages = await api.get<any[]>(`/bookings/${bookingId}/messages`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (messages || []).map((m: any) => ({
      id: m.id,
      bookingId: m.bookingId,
      senderId: m.senderId,
      receiverId: m.sender?.id === m.senderId ? 'other' : m.senderId,
      text: m.text,
      timestamp: new Date(m.createdAt).getTime(),
    }));
  } catch {
    return [];
  }
};

export const sendMessage = async (
  bookingId: string,
  text: string,
  senderId: string
): Promise<Message> => {
  void senderId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await api.post<any>(`/bookings/${bookingId}/messages`, { text });

  return {
    id: result.id,
    bookingId: result.bookingId,
    senderId: result.senderId,
    receiverId: 'other',
    text: result.text,
    timestamp: new Date(result.createdAt).getTime(),
  };
};

// --- LOCATIONS ---
export const getLocations = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return api.get<any[]>('/locations');
};

export const createLocation = async (location: {
  name: string;
  address: string;
  postcode: string;
  city: string;
  type?: string;
}) => {
  return api.post('/locations', location);
};

// --- IMAGE UPLOAD ---
export const uploadImages = async (files: File[]): Promise<string[]> => {
  return api.uploadFiles('/uploads/images', files);
};

// --- WALLET ---
export const getWalletBalance = async () => {
  return api.get<{ available: number; pending: number; escrow: number }>('/wallet/balance');
};

export const getTransactions = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return api.get<any[]>('/wallet/transactions');
};

// --- FAVORITES ---
export const toggleFavorite = async (productId: string): Promise<boolean> => {
  const result = await api.post<{ isFavorited: boolean }>(`/products/${productId}/favorite`);
  return result.isFavorited;
};

export const getUserFavorites = async (): Promise<Product[]> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await api.get<any[]>('/users/me/favorites');
    return (result || []).map(toFrontendProduct);
  } catch {
    return [];
  }
};

export const getUserFavoriteIds = async (): Promise<string[]> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const favorites = await api.get<any[]>('/users/me/favorites');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (favorites || []).map((p: any) => p.id);
  } catch {
    return [];
  }
};

// --- CONTACT ---
export const submitContactForm = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ message: string }> => {
  return api.post('/contact', data);
};

// --- VERIFICATION ---
export interface VerificationStatus {
  idVerified: boolean;
  addressVerified: boolean;
  phoneVerified: boolean;
  hasPhone: boolean;
  documents: Array<{ type: string; url: string; uploadedAt: string }>;
  verifiedAt: string | null;
  isFullyVerified: boolean;
}

export const getVerificationStatus = async (): Promise<VerificationStatus> => {
  return api.get('/users/me/verification');
};

export const submitVerificationDocument = async (
  documentType: 'id' | 'address',
  documentUrl: string
): Promise<{ idVerified: boolean; addressVerified: boolean; phoneVerified: boolean }> => {
  return api.post('/users/me/verification/documents', { documentType, documentUrl });
};

export const verifyPhone = async (
  phone: string,
  code?: string
): Promise<{ idVerified: boolean; addressVerified: boolean; phoneVerified: boolean }> => {
  return api.post('/users/me/verification/phone', { phone, code });
};

// --- PRODUCT AVAILABILITY ---
export const getProductAvailability = async (productId: string): Promise<string[]> => {
  try {
    const result = await api.get<string[]>(`/products/${productId}/availability`);
    return result || [];
  } catch {
    return [];
  }
};

// --- PUBLIC USER PROFILES ---
export interface PublicUserProfile {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  avgRating: number | null;
  _count: {
    products: number;
    reviewsReceived: number;
  };
}

export interface UserReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  product: {
    id: string;
    title: string;
  };
}

export const getPublicUserProfile = async (userId: string): Promise<PublicUserProfile | null> => {
  try {
    return await api.get<PublicUserProfile>(`/users/${userId}`);
  } catch {
    return null;
  }
};

export const getUserProducts = async (userId: string): Promise<Product[]> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await api.get<any[]>(`/users/${userId}/products`);
    return (result || []).map(toFrontendProduct);
  } catch {
    return [];
  }
};

export const getUserReviews = async (userId: string): Promise<UserReview[]> => {
  try {
    const result = await api.get<UserReview[]>(`/users/${userId}/reviews`);
    return result || [];
  } catch {
    return [];
  }
};
