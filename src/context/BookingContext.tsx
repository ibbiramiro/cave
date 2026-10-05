import React, { createContext, useContext, useState, useCallback } from 'react';
import type { EventFormat, MeetingPlatform, ITBundle } from '../lib/types';

// ── State Shape ───────────────────────────────────────────────

export interface SelectedRoom {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  facilities: string[];
}

export interface ITSupportState {
  needsAudio: boolean;
  needsStreaming: boolean;
  needsTechnician: boolean;
  bundle: ITBundle | null;
  additionalNotes: string;
}

export interface BookingState {
  // Step 1: Format selection
  format: EventFormat | null;
  
  // Step 2: Event info
  eventName: string;
  picName: string;
  
  // Step 3a: Room booking (onsite/hybrid)
  locationName: string;
  locationId: string;
  selectedRoom: SelectedRoom | null;
  participants: string[];
  otherParticipantDetail: string;
  hasGR: boolean;
  
  // Step 3b: Online booking (hybrid/online)
  isDirectorAttending: boolean;
  platform: MeetingPlatform | null;
  
  // Step 4: Date/Time
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  
  // Step 5: IT Support
  needsITSupport: boolean | null;
  itSupport: ITSupportState;
  
  // Result
  createdEventId: string | null;
}

const DEFAULT_STATE: BookingState = {
  format: null,
  eventName: '',
  picName: '',
  locationName: 'Binus@Medan',
  locationId: '',
  selectedRoom: null,
  participants: [],
  otherParticipantDetail: '',
  hasGR: false,
  isDirectorAttending: false,
  platform: 'zoom',
  startDate: '',
  endDate: '',
  startTime: '10:00',
  endTime: '12:00',
  needsITSupport: null,
  itSupport: {
    needsAudio: true,
    needsStreaming: true,
    needsTechnician: false,
    bundle: 'hybrid',
    additionalNotes: '',
  },
  createdEventId: null,
};

// ── Context ───────────────────────────────────────────────────

interface BookingContextValue {
  booking: BookingState;
  updateBooking: (updates: Partial<BookingState>) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [booking, setBooking] = useState<BookingState>(DEFAULT_STATE);

  const updateBooking = useCallback((updates: Partial<BookingState>) => {
    setBooking(prev => ({ ...prev, ...updates }));
  }, []);

  const resetBooking = useCallback(() => {
    setBooking(DEFAULT_STATE);
  }, []);

  return (
    <BookingContext.Provider value={{ booking, updateBooking, resetBooking }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}
