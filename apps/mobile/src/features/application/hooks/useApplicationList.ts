import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { ApplicationWithDetails } from '@/src/entities/application';

// Feature-specific types
export type FilterStatus = 'All' | 'Pending Payment' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
export type SortOption = 'Date' | 'Status' | 'Category';

export function useApplicationList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('All');
  const [selectedSort, setSelectedSort] = useState<SortOption>('Date');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Convex queries
  const applications = useQuery(api.applications.getUserApplications.getUserApplicationsQuery) as ApplicationWithDetails[] | undefined;
  
  const onRefresh = async () => {
    setRefreshing(true);
    // The query will automatically refetch
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const filteredAndSortedApplications = useMemo(() => {
    if (!applications) return [];

    let filtered = applications;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(app => 
        app.form?.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.form?.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobCategory?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app._id?.toLowerCase().includes(searchQuery.toLowerCase())
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
  }, [applications, searchQuery, selectedFilter, selectedSort]);

  // Utility functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending Payment':
        return 'time-outline';
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
      case 'Pending Payment':
        return 'Application submitted. Payment required to proceed';
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

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'Pending Payment': return 10;
      case 'Submitted': return 25;
      case 'Under Review': return 50;
      case 'Approved': return 100;
      case 'Rejected': return 100;
      default: return 0;
    }
  };

  const getProgressText = (status: string) => {
    switch (status) {
      case 'Pending Payment': return 'Awaiting payment';
      case 'Submitted': return 'Application received';
      case 'Under Review': return 'Being reviewed';
      case 'Approved': return 'Approved - Card ready';
      case 'Rejected': return 'Application rejected';
      default: return 'Unknown status';
    }
  };

  return {
    // Data
    applications: filteredAndSortedApplications,
    isLoading: applications === undefined,
    
    // State
    searchQuery,
    selectedFilter,
    selectedSort,
    refreshing,
    showFilters,
    
    // State setters
    setSearchQuery,
    setSelectedFilter,
    setSelectedSort,
    setShowFilters,
    
    // Actions
    onRefresh,
    
    // Utilities
    getStatusIcon,
    getStatusDescription,
    getProgressPercentage,
    getProgressText,
  };
}
