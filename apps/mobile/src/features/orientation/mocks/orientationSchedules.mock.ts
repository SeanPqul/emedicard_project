import { OrientationSchedule } from '../model/types';
import { addDays, addWeeks, setHours, setMinutes } from 'date-fns';

/**
 * Mock orientation schedules for UI testing
 * This can be used until the backend is implemented
 */
export const MOCK_ORIENTATION_SCHEDULES: OrientationSchedule[] = [
  {
    _id: 'mock-schedule-1',
    date: setMinutes(setHours(addDays(new Date(), 3), 9), 0).toISOString(),
    time: '9:00 AM - 11:00 AM',
    venue: {
      name: 'City Health Office',
      address: '123 Health St., Downtown, Metro Manila',
      capacity: 30,
    },
    availableSlots: 12,
    totalSlots: 30,
    isAvailable: true,
  },
  {
    _id: 'mock-schedule-2',
    date: setMinutes(setHours(addDays(new Date(), 5), 14), 0).toISOString(),
    time: '2:00 PM - 4:00 PM',
    venue: {
      name: 'Barangay Hall Community Center',
      address: '456 Community Ave., Barangay Center',
      capacity: 25,
    },
    availableSlots: 8,
    totalSlots: 25,
    isAvailable: true,
  },
  {
    _id: 'mock-schedule-3',
    date: setMinutes(setHours(addWeeks(new Date(), 1), 10), 0).toISOString(),
    time: '10:00 AM - 12:00 PM',
    venue: {
      name: 'Main City Hall',
      address: '789 Government Complex, City Center',
      capacity: 50,
    },
    availableSlots: 35,
    totalSlots: 50,
    isAvailable: true,
  },
  {
    _id: 'mock-schedule-4',
    date: setMinutes(setHours(addWeeks(new Date(), 1), 13), 0).toISOString(),
    time: '1:00 PM - 3:00 PM',
    venue: {
      name: 'District Health Center',
      address: '321 Medical Plaza, District 2',
      capacity: 20,
    },
    availableSlots: 2,
    totalSlots: 20,
    isAvailable: true,
  },
  {
    _id: 'mock-schedule-5',
    date: setMinutes(setHours(addWeeks(new Date(), 2), 9), 30).toISOString(),
    time: '9:30 AM - 11:30 AM',
    venue: {
      name: 'City Health Office',
      address: '123 Health St., Downtown, Metro Manila',
      capacity: 30,
    },
    availableSlots: 0,
    totalSlots: 30,
    isAvailable: false,
  },
];

/**
 * Mock booked session for testing the "already booked" UI state
 */
export const MOCK_BOOKED_SESSION = {
  _id: 'mock-session-1',
  scheduleId: 'mock-schedule-1',
  scheduledDate: setMinutes(setHours(addDays(new Date(), 3), 9), 0).toISOString(),
  venue: {
    name: 'City Health Office',
    address: '123 Health St., Downtown, Metro Manila',
  },
};
