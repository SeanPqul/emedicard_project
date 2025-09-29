// Orientation feature types

export type OrientationStatus = 'pending' | 'scheduled' | 'completed' | 'expired';

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
}

export interface OrientationRequirement {
  jobCategoryId: string;
  isRequired: boolean;
  validityPeriod: number; // months
  description: string;
}
