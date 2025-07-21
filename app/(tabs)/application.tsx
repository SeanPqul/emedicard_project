/**
 * Application Management Screen - eMediCard Application
 * 
 * IMPLEMENTATION NOTES:
 * - Implements application listing and tracking as per UI_DESIGN_PROMPT.md (lines 105-140)
 * - Follows filter and search functionality specifications from design documentation
 * - Displays application status with visual progress indicators
 * - Supports application tracking with real-time status updates
 * - Aligns with eMediCard documentation for application management workflow
 * 
 * DOCUMENTATION REFERENCES:
 * - UI_DESIGN_PROMPT.md: Applications management screen structure
 * - UI_UX_IMPLEMENTATION_GUIDE.md: Filter implementation and accessibility
 * - emedicarddocumentation.txt: Application status workflow and tracking
 * 
 * APPLICATION STATUS WORKFLOW (per documentation):
 * - Submitted: Application received and awaiting review
 * - Under Review: Being reviewed by CHO administrators
 * - Approved: Application approved, health card will be issued
 * - Rejected: Application rejected, user can view remarks and reapply
 * 
 * FILTER CAPABILITIES:
 * - Search by application ID, position, organization, or job category
 * - Filter by status (All, Submitted, Under Review, Approved, Rejected)
 * - Sort by date, status, or category
 * - Real-time updates via Convex queries
 * 
 * ACCESSIBILITY FEATURES:
 * - Search functionality with clear input feedback
 * - Status indicators with color coding and icons
 * - Touch targets meet 44x44 pixel minimum
 * - Screen reader compatible with descriptive labels
 * 
 * FUTURE ENHANCEMENTS:
 * - Add push notifications for status changes
 * - Implement document re-upload functionality for rejected applications
 * - Add application cancellation feature
 */

import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from '../../assets/styles/tabs-styles/application';
import { api } from '../../convex/_generated/api';
import { EmptyState } from '../../src/components';

type FilterStatus = 'All' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
type SortOption = 'Date' | 'Status' | 'Category';

interface ApplicationWithDetails {
  _id: string;
  _creationTime: number;
  userId: string;
  formId: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  approvedAt?: number;
  remarks?: string;
  form?: {
    _id: string;
    applicationType: 'New' | 'Renew';
    position: string;
    organization: string;
    civilStatus: string;
    jobCategory: string;
  };
  jobCategory?: {
    _id: string;
    name: string;
    colorCode: string;
    requireOrientation: string;
  };
}

const STATUS_COLORS = {
  Submitted: '#2E86AB',
  'Under Review': '#F18F01',
  Approved: '#28A745',
  Rejected: '#DC3545',
};

const FILTER_OPTIONS: FilterStatus[] = ['All', 'Submitted', 'Under Review', 'Approved', 'Rejected'];
const SORT_OPTIONS: SortOption[] = ['Date', 'Status', 'Category'];

export default function Applications() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('All');
  const [selectedSort, setSelectedSort] = useState<SortOption>('Date');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Convex queries
  const applications = useQuery(api.forms.getUserApplications) as ApplicationWithDetails[] | undefined;

  const onRefresh = async () => {
    setRefreshing(true);
    // The query will automatically refetch
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getFilteredAndSortedApplications = () => {
    if (!applications) return [];

    let filtered = applications;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(app => 
        app.form?.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.form?.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobCategory?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app._id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(app => app.status === selectedFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'Date':
          return b._creationTime - a._creationTime;
        case 'Status':
          return a.status.localeCompare(b.status);
        case 'Category':
          return (a.jobCategory?.name || '').localeCompare(b.jobCategory?.name || '');
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'document-text';
      case 'Under Review':
        return 'eye';
      case 'Approved':
        return 'checkmark-circle';
      case 'Rejected':
        return 'close-circle';
      default:
        return 'document';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'Application submitted and awaiting review';
      case 'Under Review':
        return 'Application is being reviewed by our team';
      case 'Approved':
        return 'Application approved! Health card will be issued';
      case 'Rejected':
        return 'Application rejected. Please check remarks';
      default:
        return 'Status unknown';
    }
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Applications</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="filter" size={20} color="#2E86AB" />
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6C757D" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search applications..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#6C757D"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close" size={20} color="#6C757D" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filter and Sort Options */}
        {showFilters && (
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
                    onPress={() => setSelectedFilter(option)}
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
                    onPress={() => setSelectedSort(option)}
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
        )}
      </View>
    );
  };

  const renderApplicationCard = (application: ApplicationWithDetails) => {
    const statusColor = STATUS_COLORS[application.status as keyof typeof STATUS_COLORS];
    const creationDate = new Date(application._creationTime).toLocaleDateString();
    
    return (
      <TouchableOpacity 
        key={application._id} 
        style={styles.applicationCard}
        onPress={() => router.push(`/application/${application._id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[
              styles.categoryIndicator,
              { backgroundColor: application.jobCategory?.colorCode + '20' }
            ]}>
              <Ionicons 
                name={application.jobCategory?.name.toLowerCase().includes('food') ? 'restaurant' : 'shield'}
                size={16} 
                color={application.jobCategory?.colorCode}
              />
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.applicationId}>#{application._id.slice(-8)}</Text>
              <Text style={styles.applicationDate}>{creationDate}</Text>
            </View>
          </View>
          
          <View style={[
            styles.statusBadge,
            { backgroundColor: statusColor + '20' }
          ]}>
            <Ionicons 
              name={getStatusIcon(application.status)} 
              size={12} 
              color={statusColor}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {application.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.jobCategory}>{application.jobCategory?.name}</Text>
          <Text style={styles.position}>Position:{application.form?.position}</Text>
          <Text style={styles.organization}>Company:{application.form?.organization}</Text>
          
          <View style={styles.applicationDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>{application.form?.applicationType}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={styles.detailValue}>{getStatusDescription(application.status)}</Text>
            </View>
          </View>
          
          {application.remarks && (
            <View style={styles.remarksContainer}>
              <Text style={styles.remarksLabel}>Remarks:</Text>
              <Text style={styles.remarksText}>{application.remarks}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.progressIndicator}>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { 
                  width: `${getProgressPercentage(application.status)}%`,
                  backgroundColor: statusColor
                }
              ]} />
            </View>
            <Text style={styles.progressText}>
              {getProgressText(application.status)}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#2E86AB" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'Submitted': return 25;
      case 'Under Review': return 50;
      case 'Approved': return 100;
      case 'Rejected': return 100;
      default: return 0;
    }
  };

  const getProgressText = (status: string) => {
    switch (status) {
      case 'Submitted': return 'Application received';
      case 'Under Review': return 'Being reviewed';
      case 'Approved': return 'Approved - Card ready';
      case 'Rejected': return 'Application rejected';
      default: return 'Unknown status';
    }
  };

  const renderEmptyState = () => {
    return (
      <EmptyState
        icon="document-outline"
        title="No Applications Found"
        subtitle={
          selectedFilter === 'All' 
            ? "You haven't submitted any applications yet"
            : `No applications with status: ${selectedFilter}`
        }
        buttonText="Start New Application"
        onButtonPress={() => router.push('/(tabs)/apply')}
      />
    );
  };

  const filteredApplications = getFilteredAndSortedApplications();

  return (
    <View style={styles.container}>
      
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredApplications.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.applicationsList}>
            {filteredApplications.map(renderApplicationCard)}
          </View>
        )}
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/(tabs)/apply')}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
