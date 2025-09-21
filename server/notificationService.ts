import { db } from "./db";
import { notifications, users, type InsertNotification, type Notification } from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(data: Omit<InsertNotification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(data).returning();
    return notification;
  }

  /**
   * Create multiple notifications (for broadcasting)
   */
  static async createNotifications(notificationData: Omit<InsertNotification, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Notification[]> {
    if (notificationData.length === 0) return [];
    return await db.insert(notifications).values(notificationData).returning();
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(userId: string, options?: {
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<Notification[]> {
    const { limit = 20, unreadOnly = false } = options || {};
    
    let query = db.select().from(notifications).where(eq(notifications.userId, userId));
    
    if (unreadOnly) {
      query = query.where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    }
    
    return await query
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    await db.update(notifications)
      .set({ read: true, updatedAt: new Date() })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ read: true, updatedAt: new Date() })
      .where(eq(notifications.userId, userId));
  }

  /**
   * Get unread count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    
    return result[0]?.count || 0;
  }

  /**
   * Delete old notifications (cleanup)
   */
  static async deleteOldNotifications(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    await db.delete(notifications)
      .where(sql`created_at < ${cutoffDate}`);
  }

  // Convenience methods for creating specific notification types

  /**
   * Notify admin when talent accepts booking
   */
  static async notifyAdminBookingAccepted(adminId: string, data: {
    talentName: string;
    bookingTitle: string;
    bookingId: string;
    bookingTalentId: string;
  }) {
    return this.createNotification({
      userId: adminId,
      type: 'booking_accepted',
      title: `${data.talentName} accepted booking`,
      message: `${data.talentName} has accepted the booking "${data.bookingTitle}". You can now create a contract.`,
      data: {
        bookingId: data.bookingId,
        bookingTalentId: data.bookingTalentId
      },
      actionUrl: `/admin/contracts?booking=${data.bookingId}&talent=${data.bookingTalentId}`,
      read: false
    });
  }

  /**
   * Notify talent when contract is created
   */
  static async notifyTalentContractCreated(talentId: string, data: {
    bookingTitle: string;
    contractId: string;
  }) {
    return this.createNotification({
      userId: talentId,
      type: 'contract_created',
      title: 'Contract ready for signature',
      message: `Your contract for "${data.bookingTitle}" is ready for signature. Please review and sign within 7 days.`,
      data: {
        contractId: data.contractId
      },
      actionUrl: '/talent/contracts',
      read: false
    });
  }

  /**
   * Notify admin when contract is signed
   */
  static async notifyAdminContractSigned(adminId: string, data: {
    talentName: string;
    bookingTitle: string;
    contractId: string;
  }) {
    return this.createNotification({
      userId: adminId,
      type: 'contract_signed',
      title: `Contract signed by ${data.talentName}`,
      message: `${data.talentName} has signed the contract for "${data.bookingTitle}". The booking is now fully confirmed.`,
      data: {
        contractId: data.contractId
      },
      actionUrl: '/admin/contracts',
      read: false
    });
  }

  /**
   * Notify talent when they receive a booking request
   */
  static async notifyTalentBookingRequest(talentId: string, data: {
    bookingTitle: string;
    clientName: string;
    bookingId: string;
  }) {
    return this.createNotification({
      userId: talentId,
      type: 'booking_request',
      title: 'New booking request',
      message: `${data.clientName} has requested to book you for "${data.bookingTitle}". Please review and respond.`,
      data: {
        bookingId: data.bookingId
      },
      actionUrl: '/talent/bookings',
      read: false
    });
  }

  /**
   * Notify talent when they are approved
   */
  static async notifyTalentApproved(talentId: string) {
    return this.createNotification({
      userId: talentId,
      type: 'talent_approved',
      title: 'Profile approved!',
      message: 'Congratulations! Your talent profile has been approved and is now visible to clients.',
      data: {},
      actionUrl: '/talent/dashboard',
      read: false
    });
  }
}
