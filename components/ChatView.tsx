
import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import Message from './Message';
import MessageInput from './MessageInput';
import UserProfile from './UserProfile';
import VoiceView from './VoiceView';
import type { ChatSession, Message as MessageType, TrainedDocument } from '../types';
import { TypingIndicator } from './icons/Icons';

interface ChatViewProps {
  chat: ChatSession;
  onBack: () => void;
  onNewMessage: (chatId: string, message: MessageType) => void;
  onStreamedMessageUpdate: (chatId: string, messageId: string, chunk: string) => void;
  trainedDocuments: TrainedDocument[];
  onTriggerAiResponse: (chatId: string, prompt: string, image?: { data: string, mimeType: string }) => Promise<void>;
}

const ChatView: React.FC<ChatViewProps> = ({ chat, onBack, onNewMessage, onStreamedMessageUpdate, trainedDocuments, onTriggerAiResponse }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVoiceSessionActive, setIsVoiceSessionActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messages = chat.messages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setIsProfileOpen(false); // Close profile when switching chats
  }, [chat.id]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, chat.isLoading]);

  const handleSendMessage = async (text: string, image?: { data: string, mimeType: string }) => {
    if (!text.trim() && !image) return;

    const userMessage: MessageType = {
      id: `msg-${Date.now()}`,
      text,
      timestamp: new Date().toISOString(),
      sender: 'user',
      ...(image && { imageUrl: `data:${image.mimeType};base64,${image.data}`, imageMimeType: image.mimeType })
    };
    
    onNewMessage(chat.id, userMessage);
    await onTriggerAiResponse(chat.id, text, image);
  };
  
  const handleVoiceSessionEnd = (transcript: Array<{ sender: 'user' | 'ai', text: string }>) => {
    setIsVoiceSessionActive(false);
    const now = Date.now();
    transcript.forEach((entry, index) => {
        if(entry.text.trim()) {
            const message: MessageType = {
                id: `voice-${now}-${index}`,
                text: entry.text,
                timestamp: new Date().toISOString(),
                sender: entry.sender
            };
            onNewMessage(chat.id, message);
        }
    });
  };

  return (
    <div className="relative flex flex-col h-full bg-gray-200 dark:bg-[#0e1621] dark:bg-[url('https://i.pinimg.com/originals/85/ec/df/85ecdf1c361109f7955d93b450b559d2.jpg')] bg-center bg-cover overflow-hidden">
      <Header user={chat.user} onBack={onBack} onProfileClick={() => setIsProfileOpen(true)} capabilities={chat.capabilities} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        {chat.isLoading && (
            <div className="flex justify-start">
                <div className="bg-white dark:bg-[#262d31] rounded-b-xl rounded-tr-xl p-3 max-w-lg flex items-center space-x-2 shadow-md">
                   <TypingIndicator />
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {chat.source === 'app' ? (
        <MessageInput onSendMessage={handleSendMessage} onStartVoiceSession={() => setIsVoiceSessionActive(true)} capabilities={chat.capabilities} />
      ) : (
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-100/80 dark:bg-[#17212b]/80 border-t border-gray-200 dark:border-transparent">
            This is a read-only view of a Telegram chat. Replies are automated.
        </div>
      )}

      {isProfileOpen && <UserProfile user={chat.user} onClose={() => setIsProfileOpen(false)} />}
      {isVoiceSessionActive && <VoiceView onClose={() => setIsVoiceSessionActive(false)} onSessionEnd={handleVoiceSessionEnd} />}
    </div>
  );
};

export default ChatView;
