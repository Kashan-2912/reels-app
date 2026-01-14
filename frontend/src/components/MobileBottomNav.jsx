'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  FiHome,
  FiCompass,
  FiSearch,
  FiBell,
  FiUser,
} from 'react-icons/fi';
import { BiSolidPlus } from 'react-icons/bi';
import CreatePostModal from './CreatePostModal';

/**
 * Mobile Bottom Navigation Component
 * Shown only on mobile devices (< 768px)
 */
export default function MobileBottomNav({ user, notificationCount = 0 }) {
  const pathname = usePathname();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const navItems = [
    { href: '/home', icon: FiHome, label: 'Home' },
    { href: '/explore', icon: FiCompass, label: 'Explore' },
    { href: '/search', icon: FiSearch, label: 'Search' },
    { href: '/notifications', icon: FiBell, label: 'Notifications', badge: notificationCount > 0 },
    { href: `/profile/${user?.userName}`, icon: FiUser, label: 'Profile' },
  ];

  const isActive = (href) => {
    if (href === '/home') return pathname === '/home';
    if (href === '/explore') return pathname === '/explore';
    if (href === '/search') return pathname === '/search';
    if (href === '/notifications') return pathname === '/notifications';
    return pathname?.includes('/profile');
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden">
        <div className="flex justify-around items-center">
          {navItems.slice(0, 2).map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={isActive(item.href)}
            />
          ))}

          {/* Create Button - Center */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-3 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition"
            aria-label="Create post"
          >
            <BiSolidPlus size={24} />
          </button>

          {navItems.slice(2).map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={isActive(item.href)}
              badge={item.badge}
            />
          ))}
        </div>
      </nav>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}

function NavItem({ href, icon: Icon, label, isActive, badge }) {
  return (
    <Link
      href={href}
      className={`flex-1 flex flex-col items-center justify-center py-3 transition relative ${
        isActive
          ? 'text-blue-500 dark:text-blue-400'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
      title={label}
    >
      <Icon size={24} />
      {badge && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
      )}
    </Link>
  );
}
