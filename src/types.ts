/**
 * Types representing Phetchaburi Go's Firestore collections (columns & rows)
 */

export interface Attraction {
  id: string;
  name: string;
  category: 'culture' | 'nature' | 'beach' | string;
  image: string;
  description: string;
  tag: string;
  rating: number;
  location: string;
}

export interface Restaurant {
  id: string;
  name: string;
  category: 'food' | 'cafe' | string;
  image: string;
  description: string;
  price: string;
  rating: number;
  tag: string;
  location: string;
}

export interface Hotel {
  id: string;
  name: string;
  category: 'hotel' | string;
  image: string;
  description: string;
  price: string;
  rating: number;
  tag: string;
  location: string;
}

export interface Promotion {
  id: string;
  providerId: string;
  providerType: 'restaurant' | 'hotel' | string;
  providerName: string;
  title: string;
  description: string;
  code: string;
  pointsRequired: number;
  discount: string;
}

export interface SwipeItem {
  id: string;
  name: string;
  category: 'beach' | 'nature' | 'cafe' | 'culture' | string;
  tag: string;
  image: string;
  description: string;
  matchRate: number;
  typeText: string;
  behaviorLog: string;
}

export interface UserVoucher {
  id: string;
  title: string;
  code: string;
  providerName: string;
  used: boolean;
  userId: string;
}

export interface Transaction {
  id: string;
  type: 'restaurant' | 'hotel' | string;
  providerId: string;
  providerName: string;
  user: string;
  discount: string;
  date: string;
  profit: number;
}
