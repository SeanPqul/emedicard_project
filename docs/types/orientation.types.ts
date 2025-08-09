/**
 * Orientation Service Type Definitions
 * This file contains all types related to the Orientation service.
 */

// Orientation Types
export type OrientationStatus = 'Scheduled' | 'Completed' | 'Missed' | 'Cancelled';

/**
 * Orientation Interface
 * Represents a food safety orientation session
 */
export interface Orientation {
  _id: string;
  formId: string;
  scheduleAt: number;
  qrCodeUrl: string;
  checkInTime?: number;
  checkOutTime?: number;
  status: OrientationStatus;
  location?: string;
  instructorId?: string;
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Orientation Create Data
 * Used when scheduling a new orientation
 */
export interface OrientationCreateData {
  formId: string;
  scheduleAt: number;
  qrCodeUrl: string;
  location?: string;
  instructorId?: string;
  notes?: string;
}

/**
 * Orientation Update Data
 * Used when updating an orientation
 */
export interface OrientationUpdateData {
  scheduleAt?: number;
  status?: OrientationStatus;
  checkInTime?: number;
  checkOutTime?: number;
  location?: string;
  instructorId?: string;
  notes?: string;
}

/**
 * Orientation Schedule Data
 * Used for displaying orientation schedules
 */
export interface OrientationSchedule {
  date: string;
  time: string;
  availableSlots: number;
  totalSlots: number;
  location: string;
  instructor?: string;
}

/**
 * Orientation Attendance
 * Used for tracking attendance
 */
export interface OrientationAttendance {
  orientationId: string;
  userId: string;
  checkInTime?: number;
  checkOutTime?: number;
  attended: boolean;
  notes?: string;
}

/**
 * Orientation Summary
 * Used for displaying orientation statistics
 */
export interface OrientationSummary {
  totalOrientations: number;
  scheduledOrientations: number;
  completedOrientations: number;
  missedOrientations: number;
  upcomingOrientations: number;
  attendanceRate: number;
}

/**
 * Orientation Service Interface
 * Defines methods for working with orientations
 */
export interface OrientationService {
  createOrientation(data: OrientationCreateData): Promise<Orientation>;
  updateOrientation(orientationId: string, data: OrientationUpdateData): Promise<Orientation>;
  getOrientationById(orientationId: string): Promise<Orientation | null>;
  getOrientationByFormId(formId: string): Promise<Orientation | null>;
  getUserOrientations(userId: string): Promise<Orientation[]>;
  getUpcomingOrientations(): Promise<Orientation[]>;
  checkInToOrientation(orientationId: string): Promise<Orientation>;
  checkOutFromOrientation(orientationId: string): Promise<Orientation>;
  completeOrientation(orientationId: string): Promise<Orientation>;
  getOrientationSummary(userId?: string): Promise<OrientationSummary>;
  getAvailableSchedules(): Promise<OrientationSchedule[]>;
}
