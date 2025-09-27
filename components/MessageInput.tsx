
import React, { useState, useRef } from 'react';
import { PaperclipIcon, MicIcon, SendIcon, XIcon } from './icons/Icons';
import type { ChatSession } from '../types';

interface MessageInputProps {
  onSendMessage: (text: string, image?: { data: string, mimeType: string }) => void;
  onStartVoiceSession: () => void;
  capabilities?: ChatSession['capabilities'];
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onStartVoiceSession, capabilities }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<{ file: File, previewUrl: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        setImage({ file, previewUrl });
    }
  };

  const fileToBase64 = (file: File): Promise<{ data: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const data = result.split(',')[1];
            resolve({ data, mimeType: file.type });
        };
        reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !image) return;

    let imagePayload;
    if (image) {
        imagePayload = await fileToBase64(image.file);
    }

    onSendMessage(text, imagePayload);
    setText('');
    setImage(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
    }
  };
  
  const showSendButton = text || image;

  return (
    <div className="p-2.5 bg-gray-100/80 dark:bg-[#17212b]/80 backdrop-blur-sm border-t border-gray-200 dark:border-transparent">
        {image && (
            <div className="relative w-24 h-24 p-2">
                <img src={image.previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                <button 
                    onClick={() => setImage(null)}
                    className="absolute -top-1 -right-1 bg-gray-800 text-white rounded-full p-0.5"
                >
                    <XIcon className="w-4 h-4"/>
                </button>
            </div>
        )}
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden"/>
        {capabilities?.image && (
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white">
            <PaperclipIcon />
          </button>
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message"
          rows={1}
          className="flex-grow bg-white dark:bg-[#242f3d] text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl py-2 px-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-40"
        />
        <button
          type={showSendButton ? "submit" : "button"}
          onClick={!showSendButton && capabilities?.voice ? onStartVoiceSession : undefined}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center transition-transform duration-200 active:scale-90"
          aria-label={showSendButton ? "Send message" : "Start voice session"}
        >
          {showSendButton ? <SendIcon /> : <MicIcon />}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;