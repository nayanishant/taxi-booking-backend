export interface IUser {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface IRide {
  id: string;
  userId: string;
  pickup: { type: 'Point'; coordinates: [number, number] };
  dropoff: { type: 'Point'; coordinates: [number, number] };
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface ValidationResult {
  formattedAddress: string;
  location: LatLng;
}