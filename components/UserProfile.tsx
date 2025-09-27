
import React from 'react';
import type { User } from '../types';
import { ArrowLeftIcon, PhoneIcon, InfoIcon } from './icons/Icons';

interface UserProfileProps {
  user: User;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onClose }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-white dark:bg-[#17212b] z-20 flex flex-col animate-slide-in">
      <header className="flex items-center p-2.5 bg-gray-100/80 dark:bg-[#242f3d]/80 backdrop-blur-sm shadow-md z-10 flex-shrink-0">
        <button onClick={onClose} className="p-2 mr-4 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
          <ArrowLeftIcon />
        </button>
        <h2 className="font-semibold text-black dark:text-white text-lg">Profile</h2>
      </header>
      
      <div className="flex-grow overflow-y-auto text-black dark:text-white">
        <div className="flex flex-col items-center p-6 bg-gray-100 dark:bg-[#242f3d]">
            <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full mb-4 ring-4 ring-blue-500/50" />
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-sm text-blue-500 dark:text-blue-400">{user.isOnline ? 'online' : 'last seen recently'}</p>
        </div>

        <div className="py-2">
            <div className="p-4 hover:bg-gray-100 dark:hover:bg-[#242f3d] transition-colors duration-200 cursor-pointer">
                <div className="flex items-center">
                    <InfoIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-4"/>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Bio</p>
                        <p>Gemini-powered chat assistant. Your friendly guide to the world of AI.</p>
                    </div>
                </div>
            </div>
            <div className="p-4 hover:bg-gray-100 dark:hover:bg-[#242f3d] transition-colors duration-200 cursor-pointer">
                 <div className="flex items-center">
                    <PhoneIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-4"/>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="text-blue-500 dark:text-blue-400">+1 234 567 8900</p>
                    </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const styles = `
@keyframes slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.animate-slide-in {
  animation: slide-in 0.3s ease-out forwards;
}
`;
if (!document.getElementById('user-profile-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'user-profile-styles';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

export default UserProfile;
