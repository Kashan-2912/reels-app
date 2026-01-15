'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';
import { FiLoader, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import { FaHeart, FaComment, FaUserPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { notificationService } from '@/src/services';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, likes, comments, follows

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.push('/login');
      return;
    }

    fetchNotifications();
  }, [user, isInitialized, router]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Fetch notifications from backend
      const response = await notificationService.getNotifications(1, 20, null, null);
      setNotifications(response.data?.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const clearAllNotifications = async () => {
    if (!window.confirm('Clear all notifications?')) return;

    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  const getFilteredNotifications = () => {
    if (activeTab === 'all') return notifications;
    return notifications.filter((n) => n.type === activeTab);
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FiLoader className="animate-spin text-4xl text-red-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">{unreadCount} new notifications</p>
            )}
          </div>
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="text-sm px-3 py-1 text-red-500 hover:text-red-600 transition"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-4 border-b border-gray-200 dark:border-gray-800">
          {['all', 'likes', 'comments', 'follows'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold border-b-2 transition capitalize ${
                activeTab === tab
                  ? 'border-red-500 text-red-500'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab === 'all' ? 'All' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={() => markAsRead(notification.id)}
              onDelete={() => deleteNotification(notification.id)}
            />
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="text-4xl mb-2">🔔</div>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'all'
                ? 'No notifications yet'
                : `No ${activeTab} notifications`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationItem({ notification, onMarkAsRead, onDelete }) {
  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return <FaHeart size={20} className="text-red-500" />;
      case 'comment':
        return <FaComment size={20} className="text-blue-500" />;
      case 'follow':
        return <FaUserPlus size={20} className="text-green-500" />;
      default:
        return null;
    }
  };

  const getMessage = (notification) => {
    switch (notification.type) {
      case 'like':
        return `${notification.profileName} liked your post`;
      case 'comment':
        return `${notification.profileName} commented: "${notification.comment}"`;
      case 'follow':
        return `${notification.profileName} started following you`;
      default:
        return 'New notification';
    }
  };

  const getLink = (notification) => {
    if (notification.type === 'follow') {
      return `/profile/${notification.userName}`;
    }
    return `/post/${notification.postId}`;
  };

  return (
    <div
      className={`p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900 bg-opacity-20' : ''
      }`}
    >
      {/* Icon */}
      <div className="flex-shrink-0">{getIcon(notification.type)}</div>

      {/* Content */}
      <Link href={getLink(notification)} className="flex-1">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
            <img
              src={notification.profilePic}
              alt={notification.userName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-black dark:text-white">
              <span className="font-semibold">{notification.profileName}</span>{' '}
              {notification.type === 'comment' && (
                <>
                  <span className="text-gray-700 dark:text-gray-300">commented: </span>
                  <span className="text-gray-600 dark:text-gray-400 italic">
                    "{notification.comment}"
                  </span>
                </>
              )}
              {notification.type === 'like' && (
                <span className="text-gray-700 dark:text-gray-300">liked your post</span>
              )}
              {notification.type === 'follow' && (
                <span className="text-gray-700 dark:text-gray-300">started following you</span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {getTimeAgo(notification.timestamp)}
            </p>
          </div>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!notification.isRead && (
          <button
            onClick={onMarkAsRead}
            className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition"
            title="Mark as read"
          >
            <FiCheckCircle size={18} />
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition"
          title="Delete"
        >
          <FiTrash2 size={18} />
        </button>
      </div>
    </div>
  );
}

function getTimeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
