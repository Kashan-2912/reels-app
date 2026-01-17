'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';
import { postService } from '@/src/services';
import toast from 'react-hot-toast';
import Sidebar from '@/src/components/Sidebar';
import CreatePostModal from '@/src/components/CreatePostModal';

export default function CreatePage() {
  const router = useRouter();
  const { user, isInitialized, initAuth } = useAuthStore();
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.push('/login');
      return;
    }
  }, [isInitialized, user, router]);

  if (!isInitialized) {
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-7xl mx-auto flex">
        <Sidebar />
        <main className="flex-1 px-4 md:px-10 py-8">
          <div className="text-center">
            <p className="text-gray-400">Use the modal to create a new post</p>
          </div>
        </main>
      </div>

      {showModal && <CreatePostModal onClose={() => {
        setShowModal(false);
        router.push('/home');
      }} />}
    </div>
  );
}
