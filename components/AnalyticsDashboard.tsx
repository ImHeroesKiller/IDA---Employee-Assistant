
import React, { useMemo } from 'react';
import { ArrowLeftIcon, BarChartIcon, MessageSquareIcon, UsersIcon, AlertTriangleIcon, BookOpenIcon, TelegramIcon } from './icons/Icons';
import type { ChatSession, TrainedDocument } from '../types';

interface AnalyticsDashboardProps {
  onClose: () => void;
  chats: ChatSession[];
  trainedDocuments: TrainedDocument[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onClose, chats, trainedDocuments }) => {

  const analytics = useMemo(() => {
    const totalChats = chats.length;
    const telegramChats = chats.filter(c => c.source === 'telegram');
    const totalMessages = chats.reduce((acc, chat) => acc + chat.messages.length, 0);
    const aiResponses = chats.flatMap(c => c.messages).filter(m => m.sender === 'ai');
    
    const knowledgeBaseMisses = aiResponses.filter(m => 
        m.text.toLowerCase().includes("not in my knowledge base") ||
        m.text.toLowerCase().includes("i cannot find the information") ||
        m.text.toLowerCase().includes("i don't have information about that")
    ).length;
    
    const kbSuccessRate = aiResponses.length > 0 
        ? ((aiResponses.length - knowledgeBaseMisses) / aiResponses.length) * 100 
        : 100;

    const chatActivity = chats.map(chat => ({
        id: chat.id,
        name: chat.user.name,
        messageCount: chat.messages.length,
        source: chat.source,
    })).sort((a, b) => b.messageCount - a.messageCount);
    
    const maxMessages = Math.max(...chatActivity.map(c => c.messageCount), 0);

    const telegramEmployees = Array.from(new Set(telegramChats.map(c => c.user.telegramId)))
        .map(id => telegramChats.find(c => c.user.telegramId === id)!.user);

    return {
        totalChats,
        telegramChatCount: telegramChats.length,
        totalMessages,
        knowledgeBaseMisses,
        kbSuccessRate,
        chatActivity,
        maxMessages,
        telegramEmployees,
    };
  }, [chats]);

  const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string | number, color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-white dark:bg-[#242f3d] p-6 rounded-2xl shadow-lg flex items-center space-x-4">
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
        <p className="text-2xl font-bold text-black dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-gray-100 dark:bg-[#0e1621] z-20 flex flex-col animate-fade-in-analytics">
      <header className="flex items-center p-2.5 bg-white dark:bg-[#242f3d] shadow-md z-10 flex-shrink-0">
        <button onClick={onClose} className="p-2 mr-4 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
          <ArrowLeftIcon />
        </button>
        <div className="flex items-center space-x-2">
            <BarChartIcon className="w-6 h-6 text-blue-500"/>
            <h2 className="font-semibold text-black dark:text-white text-lg">Analytics Dashboard</h2>
        </div>
      </header>
      
      <div className="flex-grow overflow-y-auto p-6 space-y-6">
        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<UsersIcon className="w-6 h-6 text-white"/>} title="Total Chats" value={analytics.totalChats} color="bg-blue-500" />
            <StatCard icon={<MessageSquareIcon className="w-6 h-6 text-white"/>} title="Total Messages" value={analytics.totalMessages} color="bg-indigo-500" />
            <StatCard icon={<AlertTriangleIcon className="w-6 h-6 text-white"/>} title="KB Misses" value={analytics.knowledgeBaseMisses} color="bg-red-500" />
            <StatCard icon={<TelegramIcon className="w-6 h-6 text-white"/>} title="Telegram Chats" value={analytics.telegramChatCount} color="bg-sky-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Activity */}
          <div className="lg:col-span-2 bg-white dark:bg-[#242f3d] p-6 rounded-2xl shadow-lg">
              <h3 className="font-bold text-lg mb-4 text-black dark:text-white">Chat Activity</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {analytics.chatActivity.map(chat => (
                      <div key={chat.id}>
                          <div className="flex justify-between items-center text-sm mb-1">
                              <div className="flex items-center truncate">
                                {chat.source === 'telegram' && <TelegramIcon className="w-4 h-4 mr-2 text-sky-500 flex-shrink-0" />}
                                <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{chat.name}</span>
                              </div>
                              <span className="font-bold text-black dark:text-white">{chat.messageCount}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-[#17212b] rounded-full h-2.5">
                              <div 
                                  className="bg-blue-500 h-2.5 rounded-full" 
                                  style={{ width: analytics.maxMessages > 0 ? `${(chat.messageCount / analytics.maxMessages) * 100}%` : '0%' }}
                              ></div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* KB Performance & Employee List */}
          <div className="space-y-6">
              <div className="bg-white dark:bg-[#242f3d] p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center">
                  <h3 className="font-bold text-lg mb-2 text-black dark:text-white">KB Success Rate</h3>
                  <div className="relative w-32 h-32">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                          <path
                              className="text-gray-200 dark:text-gray-700"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                              className={analytics.kbSuccessRate > 80 ? "text-green-500" : "text-yellow-500"}
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeDasharray={`${analytics.kbSuccessRate}, 100`}
                              strokeLinecap="round"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-black dark:text-white">{analytics.kbSuccessRate.toFixed(0)}%</span>
                      </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{trainedDocuments.length} documents in KB</p>
              </div>

               <div className="bg-white dark:bg-[#242f3d] p-6 rounded-2xl shadow-lg">
                    <h3 className="font-bold text-lg mb-4 text-black dark:text-white">Telegram Employees</h3>
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                        {analytics.telegramEmployees.length > 0 ? analytics.telegramEmployees.map(user => (
                            <div key={user.id} className="flex items-center space-x-3">
                                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                                <div className="truncate">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{user.name.replace(' (TG)', '')}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {user.telegramId}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No Telegram chats simulated yet.</p>
                        )}
                    </div>
               </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = `
@keyframes fade-in-analytics {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in-analytics {
  animation: fade-in-analytics 0.3s ease-out forwards;
}
`;
if (!document.getElementById('analytics-dashboard-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'analytics-dashboard-styles';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

export default AnalyticsDashboard;
