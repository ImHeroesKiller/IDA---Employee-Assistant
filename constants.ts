import type { ChatSession } from './types';

export const MOCK_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'chat-ida',
    user: {
      id: 'ai-ida',
      name: 'IDA - Employee Assistant',
      avatarUrl: `https://cdn-icons-png.flaticon.com/512/8649/8649624.png`,
      isOnline: true,
    },
    source: 'app',
    isLoading: false,
    capabilities: {
      tools: false,
      image: true,
      voice: true,
    },
    messages: [
      {
        id: 'msg-ida-1',
        text: "Hello! I am IDA, your new AI Employee Assistant. My knowledge is based on the documents you provide. Please upload a document through the settings menu to get started. How can I help you today based on the information I have?",
        timestamp: new Date().toISOString(),
        sender: 'ai',
      },
    ],
  },
];
