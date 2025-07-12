import { ConvexReactClient } from 'convex/react';
import { api } from '../../convex/_generated/api';
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
      return await this.client.query(api.users.getCurrentUser);
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  static async updateUserProfile(userData: Partial<User>): Promise<boolean> {
    try {
      await this.client.mutation(api.users.updateProfile, userData);
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  // Application Operations
  static async getUserApplications(): Promise<Application[]> {
    try {
      return await this.client.query(api.forms.getUserApplications) || [];
    } catch (error) {
      console.error('Error fetching user applications:', error);
      return [];
    }
  }

  static async createApplication(applicationData: Omit<Application, '_id'>): Promise<string | null> {
    try {
      return await this.client.mutation(api.forms.createApplication, applicationData);
    } catch (error) {
      console.error('Error creating application:', error);
      return null;
    }
  }

  static async updateApplicationStatus(applicationId: string, status: Application['status']): Promise<boolean> {
    try {
      await this.client.mutation(api.forms.updateApplicationStatus, { applicationId, status });
      return true;
    } catch (error) {
      console.error('Error updating application status:', error);
      return false;
    }
  }

  // Payment Operations
  static async getUserPayments(): Promise<Payment[]> {
    try {
      return await this.client.query(api.payments.getUserPayments) || [];
    } catch (error) {
      console.error('Error fetching user payments:', error);
      return [];
    }
  }

  static async createPayment(paymentData: Omit<Payment, '_id'>): Promise<string | null> {
    try {
      return await this.client.mutation(api.payments.createPayment, paymentData);
    } catch (error) {
      console.error('Error creating payment:', error);
      return null;
    }
  }

  static async updatePaymentStatus(paymentId: string, status: Payment['status']): Promise<boolean> {
    try {
      await this.client.mutation(api.payments.updatePaymentStatus, { paymentId, status });
      return true;
    } catch (error) {
      console.error('Error updating payment status:', error);
      return false;
    }
  }

  // Health Card Operations
  static async getUserHealthCards(): Promise<HealthCard[]> {
    try {
      return await this.client.query(api.healthCards.getUserHealthCards) || [];
    } catch (error) {
      console.error('Error fetching user health cards:', error);
      return [];
    }
  }

  static async getHealthCardByToken(token: string): Promise<HealthCard | null> {
    try {
      return await this.client.query(api.healthCards.getByVerificationToken, { token });
    } catch (error) {
      console.error('Error fetching health card by token:', error);
      return null;
    }
  }

  // Notification Operations
  static async getUserNotifications(): Promise<Notification[]> {
    try {
      return await this.client.query(api.notifications.getUserNotifications) || [];
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      await this.client.mutation(api.notifications.markAsRead, { notificationId });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  static async markAllNotificationsAsRead(): Promise<boolean> {
    try {
      await this.client.mutation(api.notifications.markAllAsRead);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Document Operations
  static async uploadDocument(file: File, documentType: string): Promise<string | null> {
    try {
      // TODO: Implement file upload logic with Convex storage
      return await this.client.mutation(api.documents.upload, { file, documentType });
    } catch (error) {
      console.error('Error uploading document:', error);
      return null;
    }
  }

  static async deleteDocument(documentId: string): Promise<boolean> {
    try {
      await this.client.mutation(api.documents.delete, { documentId });
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  // Analytics Operations
  static async getDashboardAnalytics(userId: string): Promise<any> {
    try {
      return await this.client.query(api.analytics.getDashboardData, { userId });
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      return null;
    }
  }

  // Utility Operations
  static async healthCheck(): Promise<boolean> {
    try {
      await this.client.query(api.health.check);
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}
