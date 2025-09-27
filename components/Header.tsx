
import React from 'react';
import type { User, ChatSession } from '../types';
import { ArrowLeftIcon, SearchIcon, MoreVerticalIcon, ToolIcon, ImageIcon } from './icons/Icons';

interface HeaderProps {
  user: User;
  onBack: () => void;
  onProfileClick: () => void;
  capabilities?: ChatSession['capabilities'];
}

const Header: React.FC<HeaderProps> = ({ user, onBack, onProfileClick, capabilities }) => {
  return (
    <header className="flex items-center p-2.5 bg-gray-100/80 dark:bg-[#242f3d]/80 backdrop-blur-sm shadow-md z-10">
      <button onClick={onBack} className="p-2 mr-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white md:hidden">
        <ArrowLeftIcon />
      </button>
      <div onClick={onProfileClick} className="flex items-center flex-grow cursor-pointer mr-4">
        <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
        <div className="ml-4 flex-grow overflow-hidden">
          <div className="flex items-center space-x-2">
             <h2 className="font-semibold text-black dark:text-white truncate">{user.name}</h2>
             {/* FIX: Wrap icons in a span and apply title attribute to the span to fix TS error and provide tooltip. */}
             {capabilities?.tools && <span title="This AI can use tools"><ToolIcon className="w-4 h-4 text-blue-500 dark:text-blue-400" /></span>}
             {capabilities?.image && <span title="This AI can understand images"><ImageIcon className="w-4 h-4 text-blue-500 dark:text-blue-400" /></span>}
          </div>
          <p className="text-sm text-blue-500 dark:text-blue-400">{user.isOnline ? 'online' : 'last seen recently'}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
          <SearchIcon />
        </button>
        <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
          <MoreVerticalIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;
