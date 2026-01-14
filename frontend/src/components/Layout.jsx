'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';
import { FiHome, FiCompass, FiUser, FiLogOut, FiBell, FiSearch, FiBookmark } from 'react-icons/fi';
import { BiSolidPlus } from 'react-icons/bi';
import CreatePostModal from './CreatePostModal';

export default function Layout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, initAuth } = useAuthStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return children;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <div className="flex h-screen bg-white dark:bg-black">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col">
          <Link href="/" className="mb-12 text-2xl font-bold text-red-500">
            Reel App
          </Link>

          <nav className="flex-1 space-y-4">
            <NavLink href="/home" icon={<FiHome />} label="Home" isActive={pathname === '/home'} />
            <NavLink href="/explore" icon={<FiCompass />} label="Explore" isActive={pathname === '/explore'} />
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              <BiSolidPlus size={20} />
              <span>Create</span>
            </button>
            <NavLink href="/search" icon={<FiSearch />} label="Search" isActive={pathname === '/search'} />
            <NavLink href="/notifications" icon={<FiBell />} label="Notifications" isActive={pathname === '/notifications'} />
            <NavLink href="/saved" icon={<FiBookmark />} label="Saved" isActive={pathname === '/saved'} />
            <NavLink href={`/profile/${user?.userName}`} icon={<FiUser />} label="Profile" isActive={pathname?.includes('/profile')} />
          </nav>

          {user && (
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
              >
                <FiLogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}

function NavLink({ href, icon, label, isActive }) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${isActive ? 'bg-gray-100 dark:bg-gray-900 text-black dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}
