export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  skyId?: string; // Para compatibilidad con API actual
  entityId?: string; // Para compatibilidad con API actual
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: Airport;
    time: string;
    date: string;
  };
  arrival: {
    airport: Airport;
    time: string;
    date: string;
  };
  price: number | { formatted?: string; raw?: number }; // Flexible para diferentes formatos de API
  currency: string;
  duration: string;
  stops: number;
  aircraft: string;
  class: FlightClass;
  legs?: any[]; // Para compatibilidad con formato actual de API
}

export interface SearchParams {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  passengers: PassengerCounts;
  class: FlightClass;
}

// Compatible with current SearchBox implementation
export interface LegacySearchParams {
  flightType: "round-trip" | "one-way";
  passengers: number;
  cabinClass: string;
  origin: { entityId: string; skyId: string };
  destination: { entityId: string; skyId: string };
  departureDate: string;
  returnDate?: string; // Optional para permitir undefined
}

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

export type FlightClass = "economy" | "business" | "first";

export interface FilterOptions {
  airlines: string[];
  priceRange: [number, number];
  maxStops: number;
  departureTime: TimeOfDay | "all";
  duration?: [number, number]; // in minutes
}

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface FlightSearchResponse {
  flights: Flight[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface BookingDetails {
  flightId: string;
  passengers: PassengerInfo[];
  contactInfo: ContactInfo;
  paymentInfo?: PaymentInfo;
}

export interface PassengerInfo {
  type: "adult" | "child" | "infant";
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passport?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface PaymentInfo {
  method: "card" | "paypal" | "bank_transfer";
  amount: number;
  currency: string;
}

// Error types
export class FlightApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
  ) {
    super(message);
    this.name = "FlightApiError";
  }
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message: string;
  code?: string;
}
