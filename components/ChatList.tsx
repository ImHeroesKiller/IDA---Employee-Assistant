
import React, { useState, useEffect } from 'react';
import ChatListItem from './ChatListItem';
import type { ChatSession } from '../types';
import { SearchIcon, MenuIcon, ClockIcon, XIcon, MessageCircleIcon } from './icons/Icons';

interface ChatListProps {
  chats: ChatSession[];
  onSelectChat: (id: string) => void;
  selectedChatId: string | null;
  onMenuClick: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, onSelectChat, selectedChatId, onMenuClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('chatSearchHistory');
      if (storedHistory) {
        setSearchHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse search history from localStorage", error);
      setSearchHistory([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatSearchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const trimmedSearch = searchTerm.trim();
    if (e.key === 'Enter' && trimmedSearch !== '') {
      const newHistory = [trimmedSearch, ...searchHistory.filter(item => item !== trimmedSearch)].slice(0, 10);
      setSearchHistory(newHistory);
    }
  };

  const handleHistoryItemClick = (term: string) => {
    setSearchTerm(term);
  };

  const handleRemoveHistoryItem = (e: React.MouseEvent, termToRemove: string) => {
    e.stopPropagation();
    setSearchHistory(prevHistory => prevHistory.filter(term => term !== termToRemove));
  };

  const filteredChats = chats.filter(chat =>
    chat.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showHistory = isSearchFocused && searchTerm.length === 0 && searchHistory.length > 0;

  return (
    <div className="bg-white dark:bg-[#17212b] h-full flex flex-col">
      <header className="p-2.5 flex items-center bg-gray-100 dark:bg-[#242f3d] shadow-md z-10">
        <button onClick={onMenuClick} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-white">
          <MenuIcon />
        </button>
        <div className="relative flex-grow ml-4">
          <SearchIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            onKeyDown={handleSearchKeyDown}
            className="w-full bg-gray-200 dark:bg-[#17212b] text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </header>
      <div className="flex-grow overflow-y-auto">
        {showHistory ? (
          <div>
            {searchHistory.map(term => (
              <div
                key={term}
                onClick={() => handleHistoryItemClick(term)}
                className="flex items-center justify-between p-3 cursor-pointer transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-[#242f3d]"
                role="button"
                aria-label={`Search for ${term}`}
              >
                <div className="flex items-center text-black dark:text-white">
                  <ClockIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-4 flex-shrink-0" />
                  <span className="truncate">{term}</span>
                </div>
                <button
                  onClick={(e) => handleRemoveHistoryItem(e, term)}
                  className="p-1 text-gray-500 hover:text-black dark:hover:text-white"
                  aria-label={`Remove "${term}" from history`}
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <>
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-4">
                <MessageCircleIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                <h3 className="text-lg font-semibold mt-4 text-black dark:text-white">No Chats Yet</h3>
                <p className="mt-1">Start a new conversation to see it here.</p>
              </div>
            ) : filteredChats.length > 0 ? (
              filteredChats.map(chat => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  isSelected={chat.id === selectedChatId}
                  onSelect={() => onSelectChat(chat.id)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-4">
                <SearchIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                <p className="mt-4 text-black dark:text-white">No chats found for "{searchTerm}".</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatList;
