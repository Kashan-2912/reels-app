"use client";

import React, { useMemo } from 'react';
import {
  FiHome,
  FiSearch,
  FiCompass,
  FiPlay,
  FiMessageCircle,
  FiHeart,
  FiPlusSquare,
  FiUser,
  FiMoreHorizontal,
} from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navItems = useMemo(() => {
    const profileHref = user?.userName ? `/profile/${user.userName}` : '/profile';
    return [
      { label: 'Home', href: '/home', icon: FiHome },
      { label: 'Search', href: '/search', icon: FiSearch },
      { label: 'Explore', href: '/explore', icon: FiCompass },
      { label: 'Reels', href: '/reels', icon: FiPlay },
      { label: 'Messages', href: '#', icon: FiMessageCircle },
      { label: 'Notifications', href: '/notifications', icon: FiHeart },
      { label: 'Create', href: '/post/new', icon: FiPlusSquare },
      { label: 'Profile', href: profileHref, icon: FiUser },
    ];
  }, [user]);

  return (
    <aside className="hidden lg:flex w-64 flex-col justify-between py-8 pr-8 border-r border-neutral-900 sticky top-0 h-screen">
      <div className="space-y-8">
        <div className="px-3 text-2xl font-semibold tracking-tight">Instagram</div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.href !== '#' && pathname.startsWith(item.href);
            return (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-neutral-900 ${
                  isActive ? 'font-semibold' : 'text-gray-300'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>
      <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-300 hover:bg-neutral-900 transition">
        <FiMoreHorizontal size={20} />
        More
      </button>
    </aside>
  );
}
