// Orientation feature types

/**
 * Unified orientation status flow (matches backend orientationBookings.status)
 * scheduled → checked-in → completed
 *          ↓  cancelled / missed / excused / no-show
 */
export type OrientationStatus =
  | 'scheduled'     // Initial booking
  | 'checked-in'    // Arrived and checked in
  | 'completed'     // Check-in + check-out done
  | 'cancelled'     // User cancelled
  | 'missed'        // No-show (after finalization)
  | 'excused'       // Admin excused
  | 'no-show';      // Marked as no-show

/**
 * Orientation booking/session
 * Represents a user's orientation booking (unified table: orientationBookings)
 */
export interface OrientationSession {
  _id: string;
  userId: string;
  applicationId: string;
  scheduledDate: string;
  completedDate?: string;
  status: OrientationStatus;
  venue: {
    name: string;
    address: string;
    room?: string;
  };
  instructor?: {
    name: string;
    designation: string;
  };
  certificateId?: string;
  notes?: string;
}

// Type alias for clarity (OrientationSession = OrientationBooking)
export type OrientationBooking = OrientationSession;

export interface OrientationCertificate {
  _id: string;
  sessionId: string;
  userId: string;
  issueDate: string;
  expirationDate: string;
  certificateNumber: string;
  qrCode?: string;
}

export interface OrientationSchedule {
  _id: string;
  date: string;
  time: string;
  venue: {
    name: string;
    address: string;
    capacity: number;
  };
  availableSlots: number;
  totalSlots: number;
  isAvailable: boolean;
  // Server-side formatted display fields (PHT timezone)
  displayDate?: {
    year: number;
    month: number; // 1-12
    day: number;
    weekday: string; // e.g., "Monday"
    monthName: string; // e.g., "Nov"
  };
}

export interface OrientationRequirement {
  jobCategoryId: string;
  isRequired: boolean;
  validityPeriod: number; // months
  description: string;
}
