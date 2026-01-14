'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, User } from 'lucide-react';
import { profileService } from '@/src/services/profileService';

/**
 * Mention input component with autocomplete
 * Triggered by @ symbol
 */
export default function MentionableTextarea({
  value,
  onChange,
  placeholder,
  className,
  maxLength = 2200,
  onMentions,
}) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentions, setMentions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Extract mention query from text
  const extractMentionQuery = (text, cursorPos) => {
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex === -1) {
      return { query: '', position: -1 };
    }

    const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ', lastAtIndex);
    const isValidMention =
      lastAtIndex === 0 ||
      textBeforeCursor[lastAtIndex - 1] === ' ' ||
      textBeforeCursor[lastAtIndex - 1] === '\n';

    if (!isValidMention) {
      return { query: '', position: -1 };
    }

    const query = textBeforeCursor.substring(lastAtIndex + 1);
    return { query: query.trim(), position: lastAtIndex };
  };

  // Handle text change
  const handleChange = (e) => {
    const text = e.target.value;
    const cursor = e.target.selectionStart;

    onChange(text);
    setCursorPosition(cursor);

    const { query, position } = extractMentionQuery(text, cursor);

    if (position !== -1 && query.length > 0) {
      setMentionQuery(query);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Debounce search
      setIsLoading(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          // TODO: Replace with actual API call
          // const users = await profileService.searchUsers(query);

          // Mock data
          const users = [
            {
              id: 1,
              username: 'john_doe',
              name: 'John Doe',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
            },
            {
              id: 2,
              username: 'jane_smith',
              name: 'Jane Smith',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
            },
            {
              id: 3,
              username: 'mike_wilson',
              name: 'Mike Wilson',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
            },
          ].filter(
            (user) =>
              user.username.includes(query.toLowerCase()) ||
              user.name.toLowerCase().includes(query.toLowerCase())
          );

          setMentions(users);
          setShowMentions(true);
          setSelectedMentionIndex(0);
        } catch (error) {
          console.error('Mention search error:', error);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else {
      setShowMentions(false);
      setMentions([]);
    }
  };

  // Handle mention selection
  const handleSelectMention = (username) => {
    const text = value;
    const cursorPos = cursorPosition;
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    const beforeMention = text.substring(0, lastAtIndex);
    const afterMention = text.substring(cursorPos);
    const newText = `${beforeMention}@${username} ${afterMention}`;

    onChange(newText);
    setShowMentions(false);
    setMentions([]);
    setMentionQuery('');

    // Update onMentions callback
    if (onMentions) {
      const mentionedUsers = extractMentions(newText);
      onMentions(mentionedUsers);
    }

    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = beforeMention.length + username.length + 2;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Extract all mentioned users from text
  const extractMentions = (text) => {
    const regex = /@(\w+)/g;
    const matches = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1]);
    }

    return [...new Set(matches)]; // Remove duplicates
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showMentions || mentions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedMentionIndex(
          (selectedMentionIndex + 1) % mentions.length
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedMentionIndex(
          (selectedMentionIndex - 1 + mentions.length) % mentions.length
        );
        break;
      case 'Enter':
        e.preventDefault();
        handleSelectMention(mentions[selectedMentionIndex].username);
        break;
      case 'Escape':
        e.preventDefault();
        setShowMentions(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Write something... (use @name to mention)'}
        maxLength={maxLength}
        className={`w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
          className || ''
        }`}
        rows={4}
      />

      {/* Character count */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {value.length}/{maxLength}
      </div>

      {/* Mention suggestions */}
      {showMentions && mentions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {mentions.map((user, index) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectMention(user.username)}
                  className={`w-full flex items-center gap-2 p-3 transition ${
                    index === selectedMentionIndex
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="text-left min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      @{user.username}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Hook to parse mentions from text
 */
export const useMentions = (text) => {
  const mentions = [];
  const regex = /@(\w+)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    mentions.push({
      username: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return mentions;
};
