import { prisma } from '../config/db.js'

/**
 * Create a notification for an admin (or broadcast to all).
 */
export async function createNotification(data: {
  adminId?: string | null
  type: string
  title: string
  message: string
  link?: string
}) {
  return prisma.adminNotification.create({
    data: {
      adminId: data.adminId || null,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link || null,
    },
  })
}

/**
 * Get unread notifications for an admin.
 */
export async function getNotifications(adminId: string, limit: number = 20) {
  const notifications = await prisma.adminNotification.findMany({
    where: {
      OR: [
        { adminId },
        { adminId: null }, // broadcast notifications
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  const unreadCount = await prisma.adminNotification.count({
    where: {
      OR: [
        { adminId },
        { adminId: null },
      ],
      isRead: false,
    },
  })

  return {
    notifications: notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  }
}

/**
 * Mark a notification as read.
 */
export async function markAsRead(id: string) {
  return prisma.adminNotification.update({
    where: { id },
    data: { isRead: true },
  })
}

/**
 * Mark all notifications as read for an admin.
 */
export async function markAllAsRead(adminId: string) {
  return prisma.adminNotification.updateMany({
    where: {
      OR: [
        { adminId },
        { adminId: null },
      ],
      isRead: false,
    },
    data: { isRead: true },
  })
}

/**
 * Helper: Create notification when a ticket is created.
 */
export async function notifyNewTicket(ticketSubject: string, schoolName: string, ticketId: string) {
  return createNotification({
    type: 'ticket_new',
    title: 'New Support Ticket',
    message: `${schoolName}: ${ticketSubject}`,
    link: `/tickets/${ticketId}`,
  })
}

/**
 * Helper: Create notification when payment is received.
 */
export async function notifyPaymentReceived(schoolName: string, amount: number, invoiceId: string) {
  return createNotification({
    type: 'payment_received',
    title: 'Payment Received',
    message: `${schoolName} paid ₹${amount.toLocaleString('en-IN')}`,
    link: `/billing/invoices/${invoiceId}`,
  })
}

/**
 * Helper: Create notification when a school is created.
 */
export async function notifySchoolCreated(schoolName: string, schoolId: string) {
  return createNotification({
    type: 'school_created',
    title: 'New School Created',
    message: `${schoolName} has joined the platform`,
    link: `/schools/${schoolId}`,
  })
}
