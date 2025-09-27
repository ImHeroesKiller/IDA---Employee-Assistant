
import React from 'react';
import type { ChatSession } from '../types';
import { TelegramIcon } from './icons/Icons';

interface ChatListItemProps {
  chat: ChatSession;
  isSelected: boolean;
  onSelect: () => void;
}

const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const ChatListItem: React.FC<ChatListItemProps> = ({ chat, isSelected, onSelect }) => {
  const lastMessage = chat.messages[chat.messages.length - 1];

  return (
    <div
      onClick={onSelect}
      className={`flex items-center p-3 cursor-pointer transition-colors duration-200 ${
        isSelected ? 'bg-blue-500 dark:bg-[#2b5278]' : 'hover:bg-gray-100 dark:hover:bg-[#242f3d]'
      }`}
    >
      <div className="relative">
        <img src={chat.user.avatarUrl} alt={chat.user.name} className="w-12 h-12 rounded-full" />
        {chat.user.isOnline && (
            <span className={`absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-500 border-2 ${isSelected ? 'border-blue-500 dark:border-[#2b5278]' : 'border-white dark:border-[#17212b]'}`}></span>
        )}
      </div>
      <div className="flex-grow ml-4 overflow-hidden">
        <div className="flex justify-between items-center">
          <div className="flex items-center truncate">
              <h3 className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-black dark:text-white'}`}>{chat.user.name}</h3>
              {chat.source === 'telegram' && <TelegramIcon className="w-4 h-4 ml-2 text-blue-300 flex-shrink-0" />}
          </div>
          {lastMessage && (
            <p className={`text-xs whitespace-nowrap ${isSelected ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>{formatDate(lastMessage.timestamp)}</p>
          )}
        </div>
        {lastMessage && (
          <p className={`text-sm truncate ${isSelected ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>{lastMessage.text}</p>
        )}
      </div>
    </div>
  );
};

export default ChatListItem;
