import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { moderateScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';
import { styles } from './OrientationScheduler.styles';
import { OrientationSchedule } from '../../model/types';

// Philippine timezone constant for booked sessions
const TIMEZONE = 'Asia/Manila';

interface OrientationSchedulerProps {
  schedules: OrientationSchedule[];
  isLoading?: boolean;
  onScheduleSelect: (schedule: OrientationSchedule) => void;
  selectedScheduleId?: string;
  bookedSession?: {
    _id: string;
    scheduleId: string;
    scheduledDate: string;
    venue: {
      name: string;
      address: string;
    };
    status?: string;
    checkInTime?: number;
    checkOutTime?: number;
  } | null;
  onCancelBooking?: () => void;
  isCancelling?: boolean;
  applicationId?: string; // For navigating to QR code
}

export function OrientationScheduler({
  schedules,
  isLoading = false,
  onScheduleSelect,
  selectedScheduleId,
  bookedSession,
  onCancelBooking,
  isCancelling = false,
  applicationId,
}: OrientationSchedulerProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<OrientationSchedule | null>(null);

  const handleSchedulePress = (schedule: OrientationSchedule) => {
    if (bookedSession) return; // Can't select if already booked
    setSelectedSchedule(schedule);
  };

  const handleConfirmBooking = () => {
    if (!selectedSchedule) return;
    
    Alert.alert(
      'Confirm Booking',
      `Are you sure you want to book this orientation session on ${format(toZonedTime(selectedSchedule.date, TIMEZONE), 'MMM dd, yyyy')} at ${selectedSchedule.time}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => onScheduleSelect(selectedSchedule),
        },
      ]
    );
  };

  const handleCancelBooking = () => {
    if (!onCancelBooking) return;
    
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel your orientation booking? You will need to book another slot.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: onCancelBooking,
        },
      ]
    );
  };

  // If user has already booked, show the booked session
  if (bookedSession) {
    // Determine status display based on booking status
    const isCheckedIn = bookedSession.status === "checked-in" || bookedSession.checkInTime != null;
    const isCompleted = bookedSession.status === "completed" || bookedSession.checkOutTime != null;
    const canCancel = bookedSession.status === "scheduled" && !isCheckedIn && !isCompleted;

    type StatusConfig = {
      icon: "checkmark-circle" | "checkmark-done-circle" | "time";
      text: string;
      color: string;
    };

    let statusConfig: StatusConfig = {
      icon: "checkmark-circle",
      text: "Booked",
      color: theme.colors.semantic.success,
    };

    if (isCompleted) {
      statusConfig = {
        icon: "checkmark-done-circle",
        text: "Completed",
        color: theme.colors.semantic.success,
      };
    } else if (isCheckedIn) {
      statusConfig = {
        icon: "time",
        text: "Checked In",
        color: theme.colors.blue[500],
      };
    }

    return (
      <View style={styles.container}>
        <View style={styles.bookedCard}>
          <View style={styles.bookedHeader}>
            <View style={styles.successBadge}>
              <Ionicons name={statusConfig.icon} size={moderateScale(24)} color={statusConfig.color} />
              <Text style={[styles.successBadgeText, { color: statusConfig.color }]}>{statusConfig.text}</Text>
            </View>
          </View>

          <View style={styles.bookedDetails}>
            <View style={styles.bookedRow}>
              <View style={styles.bookedIconContainer}>
                <Ionicons name="calendar" size={moderateScale(20)} color={theme.colors.primary[600]} />
              </View>
              <View style={styles.bookedInfo}>
                <Text style={styles.bookedLabel}>Date & Time</Text>
                <Text style={styles.bookedValue}>
                  {format(toZonedTime(new Date(bookedSession.scheduledDate).getTime(), TIMEZONE), 'EEEE, MMMM dd, yyyy')}
                </Text>
              </View>
            </View>

            <View style={styles.bookedRow}>
              <View style={styles.bookedIconContainer}>
                <Ionicons name="location" size={moderateScale(20)} color={theme.colors.primary[600]} />
              </View>
              <View style={styles.bookedInfo}>
                <Text style={styles.bookedLabel}>Venue</Text>
                <Text style={styles.bookedValue}>{bookedSession.venue.name}</Text>
                <Text style={styles.bookedAddress}>{bookedSession.venue.address}</Text>
              </View>
            </View>
          </View>

          <View style={styles.importantNote}>
            <Ionicons name="information-circle" size={moderateScale(16)} color={theme.colors.semantic.info} />
            <Text style={styles.importantNoteText}>
              Please arrive 15 minutes before the scheduled time. Bring a valid ID and your application reference number.
            </Text>
          </View>

          {/* View QR Code Button */}
          {applicationId && (
            <TouchableOpacity
              style={styles.qrButton}
              onPress={() => router.push(`/(screens)/(shared)/orientation-qr?applicationId=${applicationId}`)}
            >
              <Ionicons name="qr-code" size={moderateScale(20)} color="#FFFFFF" />
              <Text style={styles.qrButtonText}>View My QR Code</Text>
            </TouchableOpacity>
          )}

          {/* Only show cancel button if booking is scheduled (not checked-in or completed) */}
          {onCancelBooking && canCancel && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelBooking}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color={theme.colors.semantic.error} />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={moderateScale(18)} color={theme.colors.semantic.error} />
                  <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Show info message for checked-in/completed status */}
          {(isCheckedIn || isCompleted) && (
            <View style={styles.statusInfo}>
              <Ionicons name="information-circle" size={moderateScale(16)} color={theme.colors.blue[600]} />
              <Text style={styles.statusInfoText}>
                {isCompleted 
                  ? "Your orientation has been completed. Thank you for attending!"
                  : "You are checked in. Please wait for the session to complete, then scan again to check out."}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Loading available schedules...</Text>
      </View>
    );
  }

  // Show empty state if no schedules
  if (schedules.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={moderateScale(48)} color={theme.colors.gray[400]} />
        <Text style={styles.emptyTitle}>No Available Schedules</Text>
        <Text style={styles.emptySubtitle}>
          There are no orientation sessions available at the moment. Please check back later.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Orientation Date</Text>
        <Text style={styles.subtitle}>Choose a convenient time for your mandatory orientation</Text>
      </View>

      <ScrollView 
        style={styles.scheduleList}
        contentContainerStyle={styles.scheduleListContent}
        showsVerticalScrollIndicator={false}
      >
        {schedules.map((schedule) => {
          const isSelected = selectedSchedule?._id === schedule._id;
          const isFull = schedule.availableSlots === 0;
          const isLowSlots = schedule.availableSlots <= 3 && schedule.availableSlots > 0;

          return (
            <TouchableOpacity
              key={schedule._id}
              style={[
                styles.scheduleCard,
                isSelected && styles.scheduleCardSelected,
                isFull && styles.scheduleCardDisabled,
              ]}
              onPress={() => handleSchedulePress(schedule)}
              disabled={isFull}
              activeOpacity={0.7}
            >
              {/* Date & Time Section */}
              <View style={styles.scheduleHeader}>
                <View style={styles.dateContainer}>
                  <Text style={styles.dateMonth}>
                    {schedule.displayDate?.monthName || format(toZonedTime(schedule.date, TIMEZONE), 'MMM')}
                  </Text>
                  <Text style={styles.dateDay}>
                    {schedule.displayDate?.day.toString().padStart(2, '0') || format(toZonedTime(schedule.date, TIMEZONE), 'dd')}
                  </Text>
                  <Text style={styles.dateYear}>
                    {schedule.displayDate?.year || format(toZonedTime(schedule.date, TIMEZONE), 'yyyy')}
                  </Text>
                </View>

                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleDayName}>
                    {schedule.displayDate?.weekday || format(toZonedTime(schedule.date, TIMEZONE), 'EEEE')}
                  </Text>
                  <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={moderateScale(16)} color={theme.colors.text.secondary} />
                    <Text style={styles.scheduleTime}>{schedule.time}</Text>
                  </View>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={moderateScale(16)} color={theme.colors.text.secondary} />
                    <Text style={styles.scheduleVenue}>{schedule.venue.name}</Text>
                  </View>
                </View>

                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={moderateScale(24)} color={theme.colors.primary[500]} />
                  </View>
                )}
              </View>

              {/* Slots Info */}
              <View style={styles.scheduleFooter}>
                <View style={[
                  styles.slotsIndicator,
                  isFull && styles.slotsIndicatorFull,
                  isLowSlots && styles.slotsIndicatorLow,
                ]}>
                  <Ionicons 
                    name={isFull ? 'close-circle' : 'people'} 
                    size={moderateScale(14)} 
                    color={isFull ? theme.colors.semantic.error : isLowSlots ? theme.colors.semantic.warning : theme.colors.semantic.success}
                  />
                  <Text style={[
                    styles.slotsText,
                    isFull && styles.slotsTextFull,
                    isLowSlots && styles.slotsTextLow,
                  ]}>
                    {isFull ? 'Fully Booked' : `${schedule.availableSlots} slots available`}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Confirm Button */}
      {selectedSchedule && (
        <View style={styles.confirmContainer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmBooking}
          >
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
            <Ionicons name="arrow-forward" size={moderateScale(20)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
