import { api } from '../../convex/_generated/api';
import { ConvexReactClient } from 'convex/react';
import { Id } from '../../convex/_generated/dataModel';

// Interface for data service to abstract away Convex implementation
export interface IDataService {
  // User operations
  getCurrentUser(): Promise<any>;
  createUser(userData: any): Promise<void>;
  updateUser(userData: any): Promise<void>;
  
  // Application operations
  getUserApplications(): Promise<any[]>;
  createApplication(data: any): Promise<void>;
  updateApplicationStatus(id: string, status: string): Promise<void>;
  
  // Payment operations
  getUserPayments(): Promise<any[]>;
  createPayment(data: any): Promise<void>;
  
  // Health card operations
  getUserHealthCards(): Promise<any[]>;
  
  // Notification operations
  getUserNotifications(): Promise<any[]>;
  markNotificationAsRead(id: string): Promise<void>;
  markAllNotificationsAsRead(): Promise<void>;
}

// Convex implementation of the data service
export class ConvexDataService implements IDataService {
  constructor(private client: ConvexReactClient) {}
  
  async getCurrentUser() {
    return this.client.query(api.users.getCurrentUser);
  }
  
  async createUser(userData: any) {
    await this.client.mutation(api.users.createUser, userData);
  }
  
  async updateUser(userData: any) {
    await this.client.mutation(api.users.updateUser, userData);
  }
  
  async getUserApplications() {
    return this.client.query(api.forms.getUserApplications) || [];
  }
  
  async createApplication(data: any) {
    await this.client.mutation(api.forms.createApplication, data);
  }
  
  async updateApplicationStatus(id: string, status: string) {
    await this.client.mutation(api.forms.updateApplicationStatus, { id, status });
  }
  
  async getUserPayments() {
    return this.client.query(api.payments.getUserPayments) || [];
  }
  
  async createPayment(data: any) {
    await this.client.mutation(api.payments.createPayment, data);
  }
  
  async getUserHealthCards() {
    return this.client.query(api.healthCards.getUserHealthCards) || [];
  }
  
  async getUserNotifications() {
    return this.client.query(api.notifications.getUserNotifications) || [];
  }
  
  async markNotificationAsRead(id: string) {
    await this.client.mutation(api.notifications.markAsRead, { id });
  }
  
  async markAllNotificationsAsRead() {
    await this.client.mutation(api.notifications.markAllAsRead);
  }
}

// Factory function to create data service instances
export function createDataService(client: ConvexReactClient): IDataService {
  return new ConvexDataService(client);
}

// Mock implementation for testing
export class MockDataService implements IDataService {
  async getCurrentUser() {
    return { id: '1', name: 'Test User', email: 'test@example.com' };
  }
  
  async createUser(userData: any) {
    console.log('Mock: Creating user', userData);
  }
  
  async updateUser(userData: any) {
    console.log('Mock: Updating user', userData);
  }
  
  async getUserApplications() {
    return [];
  }
  
  async createApplication(data: any) {
    console.log('Mock: Creating application', data);
  }
  
  async updateApplicationStatus(id: string, status: string) {
    console.log('Mock: Updating application status', id, status);
  }
  
  async getUserPayments() {
    return [];
  }
  
  async createPayment(data: any) {
    console.log('Mock: Creating payment', data);
  }
  
  async getUserHealthCards() {
    return [];
  }
  
  async getUserNotifications() {
    return [];
  }
  
  async markNotificationAsRead(id: string) {
    console.log('Mock: Marking notification as read', id);
  }
  
  async markAllNotificationsAsRead() {
    console.log('Mock: Marking all notifications as read');
  }
}
