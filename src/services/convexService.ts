import { api } from '../../convex/_generated/api';
import { ConvexReactClient } from 'convex/react';
import { User, Application, Payment, HealthCard, Notification } from '../types';

/**
 * Service layer for Convex database operations
 * Centralizes all database queries and mutations
 */
export class ConvexService {
  private static client: ConvexReactClient;

  static initialize(client: ConvexReactClient) {
    this.client = client;
  }

  // User Operations
  static async getCurrentUser(): Promise<User | null> {
    try {
      return await this.client.query(api.users.getCurrentUser.getCurrentUser);
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  static async updateUserProfile(userData: Partial<User>): Promise<boolean> {
    try {
      await this.client.mutation(api.users.updateUser.updateUser, userData);
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  // Application Operations
  static async getUserApplications(): Promise<Application[]> {
    try {
      return await this.client.query(api.forms.getUserApplications.getUserApplications) || [];
    } catch (error) {
      console.error('Error fetching user applications:', error);
      return [];
    }
  }

  static async createApplication(applicationData: Omit<Application, '_id'>): Promise<string | null> {
    try {
      return await this.client.mutation(api.forms.createForm.createForm, applicationData);
    } catch (error) {
      console.error('Error creating application:', error);
      return null;
    }
  }

  static async updateApplicationStatus(applicationId: string, status: Application['status']): Promise<boolean> {
    try {
      await this.client.mutation(api.forms.updateForm.updateForm, { formId: applicationId, status });
      return true;
    } catch (error) {
      console.error('Error updating application status:', error);
      return false;
    }
  }

  // Payment Operations
  static async getUserPayments(): Promise<Payment[]> {
    try {
      return await this.client.query(api.payments.getUserPayments.getUserPayments) || [];
    } catch (error) {
      console.error('Error fetching user payments:', error);
      return [];
    }
  }

  static async createPayment(paymentData: Omit<Payment, '_id'>): Promise<string | null> {
    try {
      return await this.client.mutation(api.payments.createPayment.createPayment, paymentData);
    } catch (error) {
      console.error('Error creating payment:', error);
      return null;
    }
  }

  static async updatePaymentStatus(paymentId: string, status: Payment['status']): Promise<boolean> {
    try {
      // Note: updatePaymentStatus function doesn't exist in your Convex functions
      // You may need to implement this function in your Convex backend
      console.warn('updatePaymentStatus function not implemented in Convex backend');
      return false;
    } catch (error) {
      console.error('Error updating payment status:', error);
      return false;
    }
  }

  // Health Card Operations
  static async getUserHealthCards(): Promise<HealthCard[]> {
    try {
      return await this.client.query(api.healthCards.getUserCards.getUserHealthCards) || [];
    } catch (error) {
      console.error('Error fetching user health cards:', error);
      return [];
    }
  }

  static async getHealthCardByToken(token: string): Promise<HealthCard | null> {
    try {
      return await this.client.query(api.healthCards.getByVerificationToken.getByVerificationToken, { token });
    } catch (error) {
      console.error('Error fetching health card by token:', error);
      return null;
    }
  }

  // Notification Operations
  static async getUserNotifications(): Promise<Notification[]> {
    try {
      return await this.client.query(api.notifications.getUserNotifications.getUserNotifications) || [];
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      await this.client.mutation(api.notifications.markAsRead.markNotificationAsRead, { notificationId });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  static async markAllNotificationsAsRead(): Promise<boolean> {
    try {
      // Note: markAllAsRead function doesn't exist in your Convex functions
      // You may need to implement this function in your Convex backend
      console.warn('markAllNotificationsAsRead function not implemented in Convex backend');
      return false;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Document Operations
  static async uploadDocument(file: File, documentType: string): Promise<string | null> {
    try {
      // TODO: Implement file upload logic with Convex storage
      return await this.client.mutation(api.requirements.uploadDocument.uploadDocument, { file, documentType });
    } catch (error) {
      console.error('Error uploading document:', error);
      return null;
    }
  }

  static async deleteDocument(documentId: string): Promise<boolean> {
    try {
      await this.client.mutation(api.requirements.deleteDocument.deleteDocument, { documentId });
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  // Analytics Operations
  static async getDashboardAnalytics(userId: string): Promise<any> {
    try {
      // Note: analytics.getDashboardData function doesn't exist in your Convex functions
      // You may need to implement this function in your Convex backend
      console.warn('getDashboardAnalytics function not implemented in Convex backend');
      return null;
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      return null;
    }
  }

  // Utility Operations
  static async healthCheck(): Promise<boolean> {
    try {
      // Note: health.check function doesn't exist in your Convex functions
      // You may need to implement this function in your Convex backend
      console.warn('healthCheck function not implemented in Convex backend');
      return false;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}
