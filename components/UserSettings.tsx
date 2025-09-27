
import React, { useState } from 'react';
import { ArrowLeftIcon, MoonIcon, BellIcon, DatabaseIcon, SunIcon, BookOpenIcon, FileTextIcon, Trash2Icon, GlobeIcon, GoogleDriveIcon, CheckCircleIcon, XCircleIcon, BarChartIcon, TelegramIcon, UserPlusIcon, EditIcon, Loader2Icon, BeakerIcon } from './icons/Icons';
import ToggleSwitch from './ToggleSwitch';
import EmployeeModal from './EmployeeModal';
import type { TrainedDocument, TrainingLog, Employee, ConnectionStatus } from '../types';

interface UserSettingsProps {
  onClose: () => void;
  theme: string;
  setTheme: (theme: string) => void;
  notificationSound: boolean;
  setNotificationSound: (enabled: boolean) => void;
  onOpenTrainingModal: () => void;
  trainedDocuments: TrainedDocument[];
  onRemoveDocument: (docId: string) => void;
  trainingLogs: TrainingLog[];
  onClearLogs: () => void;
  onOpenAnalytics: () => void;
  telegramToken: string;
  setTelegramToken: (token: string) => void;
  telegramConnectionStatus: ConnectionStatus;
  setTelegramConnectionStatus: (status: ConnectionStatus) => void;
  onNewTelegramChat: () => void;
  employees: Employee[];
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
}

const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

const DocumentIcon = ({ source }: { source: TrainedDocument['source'] }) => {
    switch (source) {
        case 'gdrive':
            return <GoogleDriveIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />;
        case 'web':
            return <GlobeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />;
        case 'file':
        default:
            return <FileTextIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />;
    }
}


const UserSettings: React.FC<UserSettingsProps> = ({ onClose, theme, setTheme, notificationSound, setNotificationSound, onOpenTrainingModal, trainedDocuments, onRemoveDocument, trainingLogs, onClearLogs, onOpenAnalytics, telegramToken, setTelegramToken, telegramConnectionStatus, setTelegramConnectionStatus, onNewTelegramChat, employees, onAddEmployee, onUpdateEmployee, onDeleteEmployee }) => {
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleThemeChange = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleOpenAddModal = () => {
    setEmployeeToEdit(null);
    setIsEmployeeModalOpen(true);
  };
  
  const handleOpenEditModal = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setIsEmployeeModalOpen(true);
  };
  
  const handleSaveEmployee = (employeeData: Omit<Employee, 'id'> | Employee) => {
    if ('id' in employeeData) {
      onUpdateEmployee(employeeData);
    } else {
      onAddEmployee(employeeData);
    }
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      // Use the provided token to check for success (for demo purposes)
      if (telegramToken === '8243094273:AAFBxDSun1841IfTO5QBE3hctrjHQKWVo78') {
        alert('✅ Connection test successful! The token appears valid.');
      } else {
        alert('❌ Connection test failed. Please check your token.');
      }
    }, 1000);
  };

  const handleConnectTelegram = () => {
    setTelegramConnectionStatus('connecting');
    // Simulate API call
    setTimeout(() => {
      // Use the provided token to check for success (for demo purposes)
      if (telegramToken === '8243094273:AAFBxDSun1841IfTO5QBE3hctrjHQKWVo78') {
        setTelegramConnectionStatus('connected');
      } else {
        setTelegramConnectionStatus('failed');
      }
    }, 1500);
  };

  const handleDisconnectTelegram = () => {
    setTelegramConnectionStatus('disconnected');
  };

  const isConnecting = telegramConnectionStatus === 'connecting';
  const isConnected = telegramConnectionStatus === 'connected';

  return (
    <>
    <div className="absolute top-0 left-0 w-full md:w-[35%] lg:w-[30%] xl:w-1/4 h-full bg-white dark:bg-[#17212b] z-30 flex flex-col animate-slide-in-left shadow-2xl">
      <header className="flex items-center p-2.5 bg-gray-100 dark:bg-[#242f3d] shadow-md z-10 flex-shrink-0">
        <button onClick={onClose} className="p-2 mr-4 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
          <ArrowLeftIcon />
        </button>
        <h2 className="font-semibold text-black dark:text-white text-lg">Settings</h2>
      </header>
      
      <div className="flex-grow overflow-y-auto text-black dark:text-white">
        <div className="p-4 space-y-6">

            <div className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#242f3d] transition-colors duration-200 cursor-pointer" onClick={onOpenAnalytics}>
                <BarChartIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-4"/>
                <span>Analytics Dashboard</span>
            </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-blue-500 dark:text-blue-400 px-2">Preferences</h3>
            
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#242f3d] transition-colors duration-200 cursor-pointer" onClick={handleThemeChange}>
                <div className="flex items-center">
                    {theme === 'dark' ? <MoonIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-4"/> : <SunIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-4"/>}
                    <span>Dark Mode</span>
                </div>
                <ToggleSwitch isEnabled={theme === 'dark'} onToggle={handleThemeChange} />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#242f3d] transition-colors duration-200 cursor-pointer" onClick={() => setNotificationSound(!notificationSound)}>
                <div className="flex items-center">
                    <BellIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-4"/>
                    <span>Notification Sounds</span>
                </div>
                <ToggleSwitch isEnabled={notificationSound} onToggle={() => setNotificationSound(!notificationSound)} />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-blue-500 dark:text-blue-400 px-2">Integrations</h3>
            <div className="p-3 rounded-lg bg-gray-100 dark:bg-[#242f3d]">
                <div className="flex items-center mb-3">
                    <TelegramIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-4"/>
                    <span className="font-semibold">Telegram Bot</span>
                    <span className={`ml-auto text-xs font-bold px-2 py-1 rounded-full flex items-center
                        ${telegramConnectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' : ''}
                        ${telegramConnectionStatus === 'disconnected' ? 'bg-gray-500/20 text-gray-400' : ''}
                        ${telegramConnectionStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                        ${telegramConnectionStatus === 'failed' ? 'bg-red-500/20 text-red-400' : ''}
                    `}>
                        {isConnecting && <Loader2Icon className="w-3 h-3 mr-1 animate-spin" />}
                        {telegramConnectionStatus.charAt(0).toUpperCase() + telegramConnectionStatus.slice(1)}
                    </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Note: For security, this is a frontend simulation. In a real app, your token must be stored securely on a server.</p>
                <input 
                    type="password"
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                    className="w-full bg-gray-200 dark:bg-[#17212b] text-sm rounded-md p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="Your Telegram Bot Token"
                    disabled={isConnecting || isTesting}
                />
                <div className="grid grid-cols-2 gap-2">
                    {isConnected ? (
                        <button onClick={handleDisconnectTelegram} className="col-span-2 p-2 text-sm font-semibold rounded-md transition-colors bg-red-500 text-white hover:bg-red-600">
                            Disconnect
                        </button>
                    ) : (
                        <>
                            <button onClick={handleTestConnection} className="p-2 text-sm font-semibold rounded-md bg-gray-200 dark:bg-gray-600 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 flex items-center justify-center" disabled={isConnecting || isTesting}>
                                 {isTesting ? <Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> : <BeakerIcon className="w-4 h-4 mr-2" />}
                                 {isTesting ? 'Testing...' : 'Test'}
                            </button>
                            <button onClick={handleConnectTelegram} className="p-2 text-sm font-semibold rounded-md transition-colors bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center justify-center" disabled={isConnecting || isTesting}>
                                {isConnecting && <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />}
                                {isConnecting ? 'Connecting...' : 'Connect'}
                            </button>
                        </>
                    )}
                </div>
                {telegramConnectionStatus === 'failed' && <p className="text-xs text-red-400 mt-2 text-center">Connection failed. Please check your token and try again.</p>}
                
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/50">
                    <button 
                        onClick={onNewTelegramChat} 
                        className="w-full p-2 text-sm font-semibold rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        disabled={!isConnected || employees.length === 0}
                        title={!isConnected ? "Connect to Telegram first" : (employees.length === 0 ? "Add an employee to enable simulation" : "Simulate a new chat from a random employee")}
                    >
                       Simulate New Chat
                    </button>
                </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-blue-500 dark:text-blue-400 px-2">Employee Management</h3>
            <button onClick={handleOpenAddModal} className="w-full flex items-center justify-center p-3 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors duration-200 font-semibold">
              <UserPlusIcon className="w-5 h-5 mr-3" />
              <span>Add New Employee</span>
            </button>
            
            {employees.length > 0 && (
              <div className="pt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                {employees.map(emp => (
                  <div key={emp.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-100 dark:bg-[#242f3d]">
                    <div className="truncate">
                      <p className="font-medium truncate">{emp.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ID: {emp.telegramId}</p>
                    </div>
                    <div className="flex items-center ml-2 flex-shrink-0">
                      <button onClick={() => handleOpenEditModal(emp)} className="p-1 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400">
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => onDeleteEmployee(emp.id)} className="p-1 text-gray-500 hover:text-red-500 dark:hover:text-red-400">
                        <Trash2Icon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-blue-500 dark:text-blue-400 px-2">Knowledge Base</h3>
            
            <button onClick={onOpenTrainingModal} className="w-full flex items-center justify-center p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 font-semibold">
                <BookOpenIcon className="w-5 h-5 mr-3"/>
                <span>Train New Document</span>
            </button>
            
            {trainedDocuments.length > 0 && (
                <div className="pt-2 space-y-2">
                    {trainedDocuments.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-100 dark:bg-[#242f3d]">
                            <div className="flex items-center overflow-hidden">
                                <DocumentIcon source={doc.source} />
                                <div className="truncate">
                                    <p className="font-medium truncate">{doc.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Trained on {formatDate(doc.trainedAt)}</p>
                                </div>
                            </div>
                            <button onClick={() => onRemoveDocument(doc.id)} className="p-1 text-gray-500 hover:text-red-500 dark:hover:text-red-400 ml-2 flex-shrink-0">
                                <Trash2Icon className="w-5 h-5"/>
                            </button>
                        </div>
                    ))}
                </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-2">
                <h3 className="text-sm font-semibold text-blue-500 dark:text-blue-400">Training Logs</h3>
                {trainingLogs.length > 0 && (
                <button onClick={onClearLogs} className="text-xs font-medium text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    Clear Logs
                </button>
                )}
            </div>
            
            {trainingLogs.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                    {trainingLogs.map(log => (
                        <div key={log.id} className="flex items-start p-2 rounded-lg bg-gray-50 dark:bg-[#242f3d]">
                            {log.status === 'success' ? <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5"/> : <XCircleIcon className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5"/>}
                            <div className="truncate flex-grow">
                                <p className="font-medium truncate" title={log.name}>{log.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(log.timestamp).toLocaleString()}
                                </p>
                                {log.details && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">"{log.details}"</p>}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-[#242f3d] rounded-lg">
                No training activities recorded yet.
                </div>
            )}
          </div>

        </div>
      </div>
    </div>
    {isEmployeeModalOpen && (
        <EmployeeModal 
          onClose={() => setIsEmployeeModalOpen(false)}
          onSave={handleSaveEmployee}
          employeeToEdit={employeeToEdit}
        />
      )}
    </>
  );
};

const styles = `
@keyframes slide-in-left {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
.animate-slide-in-left {
  animation: slide-in-left 0.3s ease-out forwards;
}
`;
if (!document.getElementById('user-settings-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'user-settings-styles';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

export default UserSettings;
