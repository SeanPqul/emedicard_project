import { useMemo } from 'react';
import { UserRole } from '../types';

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
          defaultRoute: '/(tabs)/inspectorDashboard',
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

    // Inspector tabs - Dashboard-focused with minimal navigation
    if (permissions.canAccessInspectorTabs) {
      baseTabs.push(
        {
          name: 'inspectorDashboard',
          icon: 'analytics',
          label: 'Dashboard',
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

    // Note: Admin functionality is handled via web interface, not mobile app

    return baseTabs;
  }, [permissions]);

  const canAccessScreen = (screenName: string): boolean => {
    const inspectorScreens = ['inspectorDashboard', 'reviewApplications', 'inspection-queue', 'scanner'];
    const applicantScreens = ['index', 'application', 'apply', 'notification'];

    if (inspectorScreens.includes(screenName)) {
      return permissions.canAccessInspectorTabs;
    }
    
    if (applicantScreens.includes(screenName)) {
      return permissions.canAccessApplicantTabs;
    }

    if (screenName === 'profile') {
      return true; // All roles can access profile
    }

    // Admin screens are not accessible via mobile app
    return false;
  };

  return {
    permissions,
    visibleTabs: getVisibleTabs,
    canAccessScreen,
    userRole: userRole || 'applicant',
  };
}
