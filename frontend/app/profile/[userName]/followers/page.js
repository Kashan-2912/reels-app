'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import FollowButton from '@/src/components/FollowButton';
import { useRouter, useParams } from 'next/navigation';

// Mock data - replace with API calls
const mockFollowers = [
  { id: 1, username: 'john_doe', name: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', bio: 'Photography enthusiast' },
  { id: 2, username: 'jane_smith', name: 'Jane Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane', bio: 'Travel lover' },
  { id: 3, username: 'mike_wilson', name: 'Mike Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', bio: 'Tech enthusiast' },
  { id: 4, username: 'sarah_jones', name: 'Sarah Jones', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', bio: 'Designer & artist' },
];

const mockFollowing = [
  { id: 5, username: 'alex_brown', name: 'Alex Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', bio: 'Developer' },
  { id: 6, username: 'emma_davis', name: 'Emma Davis', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma', bio: 'Content creator' },
  { id: 7, username: 'chris_miller', name: 'Chris Miller', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chris', bio: 'Photographer' },
];

export default function FollowersPage() {
  const router = useRouter();
  const params = useParams();
  const userName = params?.userName || '';
  
  const [activeTab, setActiveTab] = useState('followers');
  const [searchQuery, setSearchQuery] = useState('');
  const [followers, setFollowers] = useState(mockFollowers);
  const [following, setFollowing] = useState(mockFollowing);

  // Filter based on search query
  const filteredList = (activeTab === 'followers' ? followers : following).filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900 dark:text-white">{userName}</h1>
            <p className="text-xs text-gray-500">{activeTab}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('followers')}
            className={`flex-1 py-4 font-semibold text-center transition ${
              activeTab === 'followers'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Followers ({followers.length})
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-4 font-semibold text-center transition ${
              activeTab === 'following'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Following ({following.length})
          </button>
        </div>

        {/* Search */}
        <div className="sticky top-[56px] z-30 p-4 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {filteredList.length > 0 ? (
            filteredList.map((user) => (
              <div
                key={user.id}
                className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
              >
                <Link href={`/profile/${user.username}`} className="flex-shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </Link>
                <Link
                  href={`/profile/${user.username}`}
                  className="flex-1 min-w-0 hover:opacity-75 transition"
                >
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {user.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    @{user.username}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                    {user.bio}
                  </div>
                </Link>
                <FollowButton userId={user.id} isFollowing={activeTab === 'following'} />
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No users found' : `No ${activeTab} yet`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
