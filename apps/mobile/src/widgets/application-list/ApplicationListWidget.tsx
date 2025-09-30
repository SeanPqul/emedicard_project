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
  getStatusIcon: (status: string) => keyof typeof Ionicons.glyphMap;
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
  
  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Applications</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={onToggleFilters}
          >
            <Ionicons name="filter" size={moderateScale(20)} color={theme.colors.accent.medicalBlue} />
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>
       
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={moderateScale(20)} color={theme.colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search applications..."
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholderTextColor={theme.colors.text.secondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <Ionicons name="close" size={moderateScale(20)} color={theme.colors.text.secondary} />
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
                name={application.jobCategory?.name?.toLowerCase().includes('food') ? 'restaurant' : 'shield'}
                size={moderateScale(16)} 
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
              size={moderateScale(12)} 
              color={statusColor}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {application.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.jobCategory}>{application.jobCategory?.name}</Text>
          <Text style={styles.position}>Position: {application.form?.position}</Text>
          <Text style={styles.organization}>Company: {application.form?.organization}</Text>
          
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
            <Ionicons name="chevron-forward" size={moderateScale(16)} color={theme.colors.accent.medicalBlue} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
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
        actionText="Start New Application"
        onActionPress={() => router.push('/(tabs)/apply')}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20 // Add padding to account for tab bar
        }}
      >
        {applications.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.applicationsList}>
            {applications.map(renderApplicationCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
