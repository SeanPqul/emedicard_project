import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ApplicationWithDetails } from '@/src/entities/application';
import { EmptyState } from '@/src/shared/components/feedback';
import { FilterStatus, SortOption } from '@/src/features/application/hooks/useApplicationList';
import { moderateScale } from '@/src/shared/utils/responsive';
import { theme } from '@/src/shared/styles/theme';
import { styles } from './ApplicationListWidget.styles';

// UI constants
const STATUS_COLORS = {
  'Pending Payment': '#FFA500',
  'Submitted': '#2E86AB',
  'Under Review': '#F18F01',
  'Approved': '#28A745',
  'Rejected': '#DC3545',
} as const;

// Business constants
const DEFAULT_TOTAL_AMOUNT = 60; // ₱50 application + ₱10 service by default

const FILTER_OPTIONS: FilterStatus[] = ['All', 'Pending Payment', 'Submitted', 'Under Review', 'Approved', 'Rejected'];
const SORT_OPTIONS: SortOption[] = ['Date', 'Status', 'Category'];

interface ApplicationListWidgetProps {
  applications: ApplicationWithDetails[];
  refreshing: boolean;
  searchQuery: string;
  selectedFilter: FilterStatus;
  selectedSort: SortOption;
  showFilters: boolean;
  onRefresh: () => void;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: FilterStatus) => void;
  onSortChange: (sort: SortOption) => void;
  onToggleFilters: () => void;
  getStatusIcon: (status: string) => string;
  getStatusDescription: (status: string) => string;
  getProgressPercentage: (status: string) => number;
  getProgressText: (status: string) => string;
}

export function ApplicationListWidget({
  applications,
  refreshing,
  searchQuery,
  selectedFilter,
  selectedSort,
  showFilters,
  onRefresh,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onToggleFilters,
  getStatusIcon,
  getStatusDescription,
  getProgressPercentage,
  getProgressText,
}: ApplicationListWidgetProps) {
  
  const renderFilters = () => {
    if (!showFilters) return null;
    
    return (
      <View style={styles.filtersContainer}>
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Status:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {FILTER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.filterChip,
                  selectedFilter === option && styles.filterChipActive
                ]}
                onPress={() => onFilterChange(option)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedFilter === option && styles.filterChipTextActive
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Sort by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.filterChip,
                  selectedSort === option && styles.filterChipActive
                ]}
                onPress={() => onSortChange(option)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedSort === option && styles.filterChipTextActive
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderApplicationCard = (application: ApplicationWithDetails) => {
    const statusColor = STATUS_COLORS[application.status as keyof typeof STATUS_COLORS] || '#6C757D';
    const creationDate = new Date(application._creationTime).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    const daysSinceCreation = Math.floor((Date.now() - application._creationTime) / (1000 * 60 * 60 * 24));
    
    // Determine what's most important for each status
    const getStatusInfo = () => {
      switch (application.status) {
        case 'Pending Payment':
          const paymentDeadline = daysSinceCreation >= 5 ? `${7 - daysSinceCreation} days left` : 'Due within 7 days';
          return {
            mainText: 'Awaiting Payment',
            subText: paymentDeadline,
            icon: 'warning-outline',
            showPaymentBadge: true,
            isUrgent: daysSinceCreation >= 5
          };
        case 'Submitted':
          return {
            mainText: 'Application Submitted',
            subText: 'Under initial review',
            icon: 'checkmark-circle-outline',
            showPaymentBadge: false,
            isUrgent: false
          };
        case 'Under Review':
          return {
            mainText: 'Being Processed',
            subText: 'Medical review in progress',
            icon: 'time-outline',
            showPaymentBadge: false,
            isUrgent: false
          };
        case 'Approved':
          return {
            mainText: 'Health Card Ready',
            subText: 'Download available',
            icon: 'checkmark-circle',
            showPaymentBadge: false,
            isUrgent: false
          };
        case 'Rejected':
          // Check if this is a document revision case
          const isDocumentRevision = application.remarks?.toLowerCase().includes('document') || 
                                     application.remarks?.toLowerCase().includes('revision');
          return {
            mainText: isDocumentRevision ? 'Documents Rejected' : 'Application Rejected',
            subText: isDocumentRevision ? 'Resubmission required' : (application.remarks || 'View details for more info'),
            icon: 'close-circle',
            showPaymentBadge: false,
            isUrgent: true
          };
        default:
          return {
            mainText: application.status,
            subText: 'View details',
            icon: 'information-circle-outline',
            showPaymentBadge: false,
            isUrgent: false
          };
      }
    };
    
    const statusInfo = getStatusInfo();
    
    // Determine primary action
    const getPrimaryAction = () => {
      switch (application.status) {
        case 'Pending Payment':
          {
            const amount = (application as any)?.payment?.netAmount ?? DEFAULT_TOTAL_AMOUNT;
            return { text: `Pay ₱${Number(amount).toFixed(2)}`, icon: 'card-outline' };
          }
        case 'Approved':
          return { text: 'Download Card', icon: 'download-outline' };
        case 'Rejected':
          // Check if this is a document revision case
          const isDocumentRevision = application.remarks?.toLowerCase().includes('document') || 
                                     application.remarks?.toLowerCase().includes('revision');
          return isDocumentRevision 
            ? { text: 'Fix Documents', icon: 'document-text-outline' }
            : { text: 'View Details', icon: 'eye-outline' };
        default:
          return null;
      }
    };
    
    const primaryAction = getPrimaryAction();
    
    return (
      <TouchableOpacity 
        key={application._id} 
        style={styles.applicationCard}
        onPress={() => router.push(`/(screens)/(application)/${application._id}`)}
        activeOpacity={0.7}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[
              styles.categoryIndicator,
              { backgroundColor: application.jobCategory?.colorCode + '20' }
            ]}>
              <Ionicons 
                name={application.jobCategory?.name?.toLowerCase().includes('food') ? 'restaurant' as keyof typeof Ionicons.glyphMap : 'shield' as keyof typeof Ionicons.glyphMap}
                size={moderateScale(24)} 
                color={application.jobCategory?.colorCode}
              />
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.jobCategory} numberOfLines={1} ellipsizeMode="tail">
                {application.jobCategory?.name?.toUpperCase()}
              </Text>
              <Text style={styles.position} numberOfLines={1} ellipsizeMode="tail">
                {application.form?.position}
              </Text>
              <Text style={styles.organization} numberOfLines={1} ellipsizeMode="tail">
                {application.form?.organization}
              </Text>
            </View>
          </View>
          <View style={styles.cardHeaderRight}>
            <Text style={styles.applicationId}>#{application._id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.dateApplied}>{creationDate}</Text>
          </View>
        </View>
        
        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <Ionicons 
                name={statusInfo.icon as keyof typeof Ionicons.glyphMap} 
                size={moderateScale(20)} 
                color={statusColor} 
              />
              <View style={styles.statusTextContainer}>
                <Text style={[styles.statusMainText, { color: statusColor }]}>
                  {statusInfo.mainText}
                </Text>
                <Text style={styles.statusSubText}>{statusInfo.subText}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Payment Badge if needed */}
        {statusInfo.showPaymentBadge && (
          <View style={styles.paymentRequiredBadge}>
            <Ionicons name="card-outline" size={moderateScale(16)} color="#FFA500" />
            <Text style={styles.paymentBadgeText}>
              ₱{(((application as any)?.payment?.netAmount) ?? DEFAULT_TOTAL_AMOUNT).toFixed(2)} payment required
            </Text>
          </View>
        )}
        
        {/* Primary Action if available */}
        {primaryAction && (
          <TouchableOpacity 
            style={[
              styles.primaryActionButton,
              { borderColor: statusColor }
            ]} 
            activeOpacity={0.7}
            onPress={(e) => {
              e.stopPropagation();
              // Handle primary action
              router.push(`/(screens)/(application)/${application._id}`);
            }}
          >
            <Ionicons name={primaryAction.icon as keyof typeof Ionicons.glyphMap} size={moderateScale(18)} color={statusColor} />
            <Text style={[styles.primaryActionText, { color: statusColor }]}>
              {primaryAction.text}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Remarks if any */}
        {application.remarks && (
          <View style={styles.remarksContainer}>
            <Ionicons name="information-circle" size={moderateScale(16)} color={theme.colors.status.warning} style={styles.remarksIcon} />
            <Text style={styles.remarksText} numberOfLines={2} ellipsizeMode="tail">
              {application.remarks}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary[500]}
            colors={[theme.colors.primary[500]]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Inline Header Section */}
        <View style={styles.inlineHeaderSection}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.pageTitle}>Applications</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{applications.length}</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.filterButton,
                showFilters && styles.filterButtonActive
              ]}
              onPress={onToggleFilters}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={showFilters ? 'funnel' : 'funnel-outline'} 
                size={moderateScale(20)} 
                color={showFilters ? theme.colors.brand.primary : theme.colors.text.secondary}
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subtitle}>
            {applications.length} {applications.length === 1 ? 'application' : 'applications'} total
          </Text>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons 
              name="search" 
              size={moderateScale(18)} 
              color={theme.colors.text.tertiary}
              style={styles.searchIcon} 
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search applications..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={searchQuery}
              onChangeText={onSearchChange}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => onSearchChange('')}>
                <Ionicons 
                  name="close-circle" 
                  size={moderateScale(18)} 
                  color={theme.colors.text.tertiary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Filters Section */}
        {renderFilters()}
        
        {/* Applications List */}
        {applications.length > 0 ? (
          <View style={styles.listContainer}>
            {applications.map(renderApplicationCard)}
          </View>
        ) : (
          <EmptyState
            icon="document-outline"
            title="No Applications Found"
            subtitle={
              selectedFilter === 'All' 
                ? "You haven't submitted any applications yet"
                : `No applications with status: ${selectedFilter}`
            }
            actionText="Start New Application"
            onActionPress={() => router.push('/(tabs)/apply')}
          />
        )}
      </ScrollView>
    </View>
  );
}
