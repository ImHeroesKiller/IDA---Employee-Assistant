
import React, { useState, useEffect } from 'react';
import ChatList from './components/ChatList';
import ChatView from './components/ChatView';
import UserSettings from './components/UserSettings';
import TrainingModal from './components/TrainingModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import type { ChatSession, TrainedDocument, DocumentSource, TrainingLog, Message as MessageType, Employee, ConnectionStatus } from './types';
import { MOCK_CHAT_SESSIONS } from './constants';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [chats, setChats] = useState<ChatSession[]>(() => {
     try {
      const storedChats = localStorage.getItem('chat-sessions');
      const parsed = storedChats ? JSON.parse(storedChats) : MOCK_CHAT_SESSIONS;
      // Backwards compatibility for chats without isLoading property
      return parsed.map((c: ChatSession) => ({ ...c, isLoading: c.isLoading || false }));
    } catch {
      return MOCK_CHAT_SESSIONS;
    }
  });

  const [selectedChatId, setSelectedChatId] = useState<string | null>(chats[0]?.id || null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [pendingAiResponse, setPendingAiResponse] = useState<{ chatId: string; prompt: string } | null>(null);

  // Theme state
  const [theme, setTheme] = useState(() => {
    try {
      const storedTheme = localStorage.getItem('chat-theme');
      return storedTheme ? storedTheme : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Notification sound state
  const [notificationSound, setNotificationSound] = useState(() => {
    try {
      const storedSound = localStorage.getItem('chat-notification-sound');
      return storedSound ? JSON.parse(storedSound) : true;
    } catch {
      return true;
    }
  });

  // RAG / Knowledge Base State
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [trainedDocuments, setTrainedDocuments] = useState<TrainedDocument[]>(() => {
    try {
      const storedDocs = localStorage.getItem('chat-trained-documents');
      if (storedDocs) {
        const parsedDocs = JSON.parse(storedDocs);
        // Backwards compatibility for documents stored without a source
        return parsedDocs.map((doc: any) => ({ ...doc, source: doc.source || 'file' }));
      }
      return [];
    } catch {
      return [];
    }
  });

  // Training Log State
  const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>(() => {
    try {
      const storedLogs = localStorage.getItem('chat-training-logs');
      return storedLogs ? JSON.parse(storedLogs) : [];
    } catch {
      return [];
    }
  });
  
  // Employee Management State
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
        const stored = localStorage.getItem('employees');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
  });

  // Telegram Integration State
  const [telegramToken, setTelegramToken] = useState<string>(() => {
    try {
      return localStorage.getItem('telegram-token') || '8243094273:AAFBxDSun1841IfTO5QBE3hctrjHQKWVo78';
    } catch {
      return '8243094273:AAFBxDSun1841IfTO5QBE3hctrjHQKWVo78';
    }
  });
  const [telegramConnectionStatus, setTelegramConnectionStatus] = useState<ConnectionStatus>(() => {
    try {
      return localStorage.getItem('telegram-connected') === 'true' ? 'connected' : 'disconnected';
    } catch {
      return 'disconnected';
    }
  });


  useEffect(() => {
    localStorage.setItem('chat-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('chat-notification-sound', JSON.stringify(notificationSound));
  }, [notificationSound]);

  useEffect(() => {
    localStorage.setItem('chat-trained-documents', JSON.stringify(trainedDocuments));
  }, [trainedDocuments]);

  useEffect(() => {
    localStorage.setItem('chat-training-logs', JSON.stringify(trainingLogs));
  }, [trainingLogs]);

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);
  
  useEffect(() => {
    localStorage.setItem('chat-sessions', JSON.stringify(chats));
  }, [chats]);
  
  useEffect(() => {
      localStorage.setItem('telegram-token', telegramToken);
  }, [telegramToken]);
  
  useEffect(() => {
    // Persist only the 'connected' state. Other states are transient.
    if (telegramConnectionStatus === 'connected') {
        localStorage.setItem('telegram-connected', 'true');
    } else {
        localStorage.removeItem('telegram-connected');
    }
  }, [telegramConnectionStatus]);

  useEffect(() => {
    if (pendingAiResponse) {
        const chat = chats.find(c => c.id === pendingAiResponse.chatId);
        if (chat) {
            handleTriggerAiResponse(pendingAiResponse.chatId, pendingAiResponse.prompt);
            setPendingAiResponse(null); // Clear the trigger
        }
    }
  }, [pendingAiResponse, chats]);


  const handleAddDocument = (fileName: string, source: DocumentSource) => {
    const newDoc: TrainedDocument = {
        id: `doc-${Date.now()}`,
        name: fileName,
        status: 'trained',
        trainedAt: new Date().toISOString(),
        source: source,
    };
    setTrainedDocuments(prevDocs => [newDoc, ...prevDocs]);
  };

  const handleRemoveDocument = (documentId: string) => {
    setTrainedDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));
  };

  const handleAddTrainingLog = (log: Omit<TrainingLog, 'id' | 'timestamp'>) => {
    const newLog: TrainingLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...log
    };
    setTrainingLogs(prevLogs => [newLog, ...prevLogs].slice(0, 50)); // Keep last 50 logs
  };

  const handleClearLogs = () => {
    setTrainingLogs([]);
  };

  const handleAddEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = { id: `emp-${Date.now()}`, ...employee };
    setEmployees(prev => [newEmployee, ...prev]);
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
      setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
  };

  const handleDeleteEmployee = (employeeId: string) => {
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
  };

  const handleTriggerAiResponse = async (chatId: string, prompt: string, image?: { data: string, mimeType: string }) => {
    const chatSession = chats.find(c => c.id === chatId);
    if (!chatSession) {
        console.error("Chat session not found for AI response trigger.");
        return;
    }

    if (trainedDocuments.length === 0 && chatSession.source === 'app') {
        const noDocsMessage: MessageType = {
            id: `err-${Date.now()}`,
            text: "My knowledge base is empty. Please use the menu to go to Settings and upload a document before we can chat.",
            timestamp: new Date().toISOString(),
            sender: 'ai',
        };
        handleNewMessage(chatId, noDocsMessage);
        return;
    }

    setChats(prev => prev.map(c => c.id === chatId ? { ...c, isLoading: true } : c));

    const aiMessageId = `msg-${Date.now()}-ai`;
    const aiMessageStub: MessageType = {
        id: aiMessageId,
        text: '',
        timestamp: new Date().toISOString(),
        sender: 'ai'
    };
    handleNewMessage(chatId, aiMessageStub);

    try {
        const stream = await geminiService.sendMessageStream(chatSession, prompt, trainedDocuments, image);
        for await (const result of stream) {
            if (result.type === 'text') {
                handleStreamedMessageUpdate(chatId, aiMessageId, result.content);
            }
        }
    } catch (error) {
        console.error("Failed to get AI response:", error);
        const errorMessage: MessageType = {
            id: aiMessageId, // Use same ID to replace
            text: "Sorry, I couldn't get a response. Please try again.",
            timestamp: new Date().toISOString(),
            sender: 'ai',
        };
        handleReplaceMessage(chatId, aiMessageId, errorMessage);
    } finally {
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, isLoading: false } : c));
    }
  };

  const handleNewTelegramChat = () => {
      if (employees.length === 0) {
        alert("Please add at least one employee in the settings to simulate a chat.");
        return;
      }

      const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
      const sampleQueries = ["I need help with my insurance benefits.", "How do I request time off?", "What's the company policy on remote work?", "Can you tell me about the 401k plan?", "Where can I find the employee handbook?"];
      const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
      const telegramId = randomEmployee.telegramId;

      const newChat: ChatSession = {
          id: `chat-tg-${telegramId}`,
          source: 'telegram',
          isLoading: true,
          user: {
              id: `tg-user-${telegramId}`,
              name: `${randomEmployee.name} (TG)`,
              avatarUrl: `https://i.pravatar.cc/150?u=${telegramId}`,
              isOnline: true,
              telegramId: telegramId
          },
          capabilities: { image: false, voice: false, tools: false },
          messages: [
              { id: `msg-${Date.now()}`, text: randomQuery, timestamp: new Date().toISOString(), sender: 'user' }
          ]
      };

      setChats(prevChats => {
          const existingChatIndex = prevChats.findIndex(c => c.id === newChat.id);
          if (existingChatIndex > -1) {
              // If chat exists, just bring it to top. Don't add new message to avoid confusion.
              const existingChat = prevChats[existingChatIndex];
              const otherChats = prevChats.filter(c => c.id !== newChat.id);
              setSelectedChatId(existingChat.id);
              setPendingAiResponse({ chatId: existingChat.id, prompt: randomQuery });
              // Add the new message to the existing chat
              const updatedChat = { ...existingChat, messages: [...existingChat.messages, newChat.messages[0]]};
              return [updatedChat, ...otherChats];
          }
          setSelectedChatId(newChat.id);
          setPendingAiResponse({ chatId: newChat.id, prompt: randomQuery });
          return [newChat, ...prevChats];
      });
  };

  const selectedChat = chats.find(c => c.id === selectedChatId) || null;

  const handleSelectChat = (id: string) => {
    setSelectedChatId(id);
  };

  const handleBack = () => {
    setSelectedChatId(null);
  };

  const handleNewMessage = (chatId: string, message: MessageType) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, message] }
          : chat
      )
    );
  };
  
  const handleStreamedMessageUpdate = (chatId: string, messageId: string, chunk: string) => {
      setChats(prevChats =>
        prevChats.map(chat => {
          if (chat.id === chatId) {
            const lastMessageIndex = chat.messages.length - 1;
            const lastMessage = chat.messages[lastMessageIndex];
            if (lastMessage && lastMessage.id === messageId && lastMessage.sender === 'ai') {
              const updatedMessages = [...chat.messages];
              updatedMessages[lastMessageIndex] = { ...lastMessage, text: lastMessage.text + chunk };
              return { ...chat, messages: updatedMessages };
            }
          }
          return chat;
        })
      );
  };

  const handleReplaceMessage = (chatId: string, messageIdToReplace: string, newMessage: MessageType) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === chatId) {
          const messageIndex = chat.messages.findIndex(m => m.id === messageIdToReplace);
          if (messageIndex > -1) {
              const updatedMessages = [...chat.messages];
              updatedMessages[messageIndex] = newMessage;
              return { ...chat, messages: updatedMessages };
          }
        }
        return chat;
      })
    );
  };

  return (
    <div className="h-screen w-screen bg-white dark:bg-[#17212b] text-black dark:text-white font-sans overflow-hidden">
      <main className="flex h-full">
        {isSettingsOpen && (
          <UserSettings 
            onClose={() => setIsSettingsOpen(false)}
            theme={theme}
            setTheme={setTheme}
            notificationSound={notificationSound}
            setNotificationSound={setNotificationSound}
            onOpenTrainingModal={() => setIsTrainingModalOpen(true)}
            trainedDocuments={trainedDocuments}
            onRemoveDocument={handleRemoveDocument}
            trainingLogs={trainingLogs}
            onClearLogs={handleClearLogs}
            onOpenAnalytics={() => { setIsSettingsOpen(false); setIsAnalyticsOpen(true); }}
            telegramToken={telegramToken}
            setTelegramToken={setTelegramToken}
            telegramConnectionStatus={telegramConnectionStatus}
            setTelegramConnectionStatus={setTelegramConnectionStatus}
            onNewTelegramChat={handleNewTelegramChat}
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        )}
        {isAnalyticsOpen && (
            <AnalyticsDashboard
                onClose={() => setIsAnalyticsOpen(false)}
                chats={chats}
                trainedDocuments={trainedDocuments}
            />
        )}
        <div className={`w-full md:w-[35%] lg:w-[30%] xl:w-1/4 h-full flex flex-col border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out ${selectedChatId ? 'max-md:-translate-x-full' : 'max-md:translate-x-0'}`}>
          <ChatList 
            chats={chats} 
            onSelectChat={handleSelectChat} 
            selectedChatId={selectedChatId}
            onMenuClick={() => setIsSettingsOpen(true)}
          />
        </div>
        <div className={`w-full md:w-[65%] lg:w-[70%] xl:w-3/4 h-full absolute md:static top-0 left-0 transition-transform duration-300 ease-in-out ${selectedChatId ? 'max-md:translate-x-0' : 'max-md:translate-x-full'}`}>
          {selectedChat ? (
            <ChatView 
              key={selectedChat.id}
              chat={selectedChat} 
              onBack={handleBack}
              onNewMessage={handleNewMessage}
              onStreamedMessageUpdate={handleStreamedMessageUpdate}
              trainedDocuments={trainedDocuments}
              onTriggerAiResponse={handleTriggerAiResponse}
            />
          ) : (
            <div className="h-full hidden md:flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0e1621]">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300">IDA - Employee Assistant</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Upload documents via the settings menu to build the knowledge base.</p>
              </div>
            </div>
          )}
        </div>
      </main>
      {isTrainingModalOpen && (
        <TrainingModal
          onClose={() => setIsTrainingModalOpen(false)}
          onAddDocument={handleAddDocument}
          onAddLog={handleAddTrainingLog}
        />
      )}
    </div>
  );
};

export default App;
