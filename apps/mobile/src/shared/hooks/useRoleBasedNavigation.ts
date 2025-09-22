import { useMemo } from 'react';
import { UserRole } from '../types/domain/user';

export interface RolePermissions {
  canAccessApplicantTabs: boolean;
  canAccessInspectorTabs: boolean;
  canAccessAdminTabs: boolean;
  canViewAllApplications: boolean;
  canManageUsers: boolean;
  canApproveApplications: boolean;
  canViewAnalytics: boolean;
  defaultRoute: string;
}

export interface TabConfig {
  name: string;
  icon: string;
  label: string;
  visible: boolean;
}

export function useRoleBasedNavigation(userRole?: UserRole) {
  const permissions = useMemo((): RolePermissions => {
    switch (userRole) {
      case 'inspector':
        return {
          canAccessApplicantTabs: false,
          canAccessInspectorTabs: true,
          canAccessAdminTabs: false,
          canViewAllApplications: true,
          canManageUsers: false,
          canApproveApplications: true,
          canViewAnalytics: false,
          defaultRoute: '/(screens)/(inspector)/dashboard',
        };
      
      case 'applicant':
      default:
        return {
          canAccessApplicantTabs: true,
          canAccessInspectorTabs: false,
          canAccessAdminTabs: false,
          canViewAllApplications: false,
          canManageUsers: false,
          canApproveApplications: false,
          canViewAnalytics: false,
          defaultRoute: '/(tabs)/index',
        };
    }
  }, [userRole]);

  const getVisibleTabs = useMemo((): TabConfig[] => {
    const baseTabs: TabConfig[] = [];

    // Applicant tabs
    if (permissions.canAccessApplicantTabs) {
      baseTabs.push(
        {
          name: 'index',
          icon: 'home',
          label: 'Dashboard',
          visible: true,
        },
        {
          name: 'application',
          icon: 'document-text',
          label: 'Applications',
          visible: true,
        },
        {
          name: 'apply',
          icon: 'add-circle',
          label: 'Apply',
          visible: true,
        },
        {
          name: 'notification',
          icon: 'notifications',
          label: 'Notifications',
          visible: true,
        },
        {
          name: 'profile',
          icon: 'person',
          label: 'Profile',
          visible: true,
        }
      );
    }

    // Inspector tabs - No tabs navigation for inspectors
    // Inspectors use (screens)/(inspector) routes only
    if (permissions.canAccessInspectorTabs) {
      // Inspectors don't get tab navigation - they use full screen routes
      // No tabs to add for inspectors
    }

    // Note: Admin functionality is handled via web interface, not mobile app

    return baseTabs;
  }, [permissions]);

  const canAccessScreen = (screenName: string): boolean => {
    // Inspector-only screens
    const inspectorOnlyScreens = ['inspector-dashboard', 'review-applications', 'inspection-queue', 'scanner'];
    
    // Applicant tab screens
    const applicantTabScreens = ['index', 'application', 'apply', 'notification'];
    
    // Shared screens - both roles can access
    const universalSharedScreens = ['(shared)', 'edit', 'change-password', 'qr-scanner'];
    
    // Applicant-only shared screens
    const applicantSharedScreens = ['activity', 'document-requirements', 'health-cards', 'orientation', 'payment', 'qr-code', 'upload-documents'];

    if (permissions.canAccessInspectorTabs) {
      return inspectorOnlyScreens.includes(screenName) || 
             universalSharedScreens.includes(screenName) || 
             screenName === 'profile';
    }
    
    if (permissions.canAccessApplicantTabs) {
      return applicantTabScreens.includes(screenName) || 
             universalSharedScreens.includes(screenName) ||
             applicantSharedScreens.includes(screenName) ||
             screenName === 'profile';
    }
    
    return false;
  };

  return {
    permissions,
    visibleTabs: getVisibleTabs,
    canAccessScreen,
    userRole: userRole || 'applicant',
  };
}