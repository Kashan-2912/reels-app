import { useEffect, useCallback, useRef, useState } from 'react';
import { notificationService } from '@/src/services/notificationService';
import toast from 'react-hot-toast';

/**
 * Hook for real-time notifications using polling
 * Can be replaced with WebSocket/Socket.io later
 */
export const useRealtimeNotifications = (enabled = true) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const pollingIntervalRef = useRef(null);
  const lastCheckRef = useRef(Date.now());

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      // const data = await notificationService.getNotifications();
      
      // Mock data for now
      const mockNotifications = [
        {
          id: 1,
          type: 'like',
          message: 'John Doe liked your post',
          postId: 1,
          userId: 1,
          isRead: false,
          createdAt: new Date(),
        },
        {
          id: 2,
          type: 'follow',
          message: 'Jane Smith started following you',
          userId: 2,
          isRead: false,
          createdAt: new Date(),
        },
      ];

      const unread = mockNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
      setNotifications(mockNotifications);

      // Show toast for new notifications
      const newNotifications = mockNotifications.filter(n => !n.isRead);
      if (newNotifications.length > 0) {
        const latest = newNotifications[0];
        toast.success(latest.message, {
          icon: getNotificationIcon(latest.type),
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  // Setup polling
  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchNotifications();

    // Setup polling (every 30 seconds)
    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [enabled, fetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      // TODO: Call API
      // await notificationService.markAsRead(notificationId);
      
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      // TODO: Call API
      // await notificationService.clearAll();
      
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      // TODO: Call API
      // await notificationService.delete(notificationId);
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    clearAll,
    deleteNotification,
    refetch: fetchNotifications,
  };
};

/**
 * Get icon for notification type
 */
const getNotificationIcon = (type) => {
  const icons = {
    like: '❤️',
    comment: '💬',
    follow: '👤',
    share: '📤',
    mention: '@',
  };

  return icons[type] || '🔔';
};

/**
 * Format notification message
 */
export const formatNotificationMessage = (notification) => {
  const { type, data } = notification;

  switch (type) {
    case 'like':
      return `${data.userName} liked your post`;
    case 'comment':
      return `${data.userName} commented on your post`;
    case 'follow':
      return `${data.userName} started following you`;
    case 'share':
      return `${data.userName} shared your post`;
    case 'mention':
      return `${data.userName} mentioned you`;
    default:
      return 'New notification';
  }
};

/**
 * WebSocket alternative (for future use with Socket.io)
 */
export const useWebsocketNotifications = (enabled = false) => {
  const [notifications, setNotifications] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    // TODO: Implement WebSocket connection
    // const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // wsRef.current = new WebSocket(`${protocol}//${window.location.host}/ws/notifications`);

    // wsRef.current.onmessage = (event) => {
    //   const notification = JSON.parse(event.data);
    //   setNotifications(prev => [notification, ...prev]);
    //   toast.success(formatNotificationMessage(notification));
    // };

    // return () => {
    //   if (wsRef.current) {
    //     wsRef.current.close();
    //   }
    // };
  }, [enabled]);

  return { notifications };
};

export default useRealtimeNotifications;
