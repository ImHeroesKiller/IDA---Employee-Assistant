import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message as MessageType } from '../types';
import { DoubleCheckIcon, ToolIcon } from './icons/Icons';

interface MessageProps {
  message: MessageType;
}

const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative rounded-b-xl px-3 py-2 max-w-md lg:max-w-2xl shadow-md ${
          isUser
            ? 'bg-blue-500 dark:bg-[#2b5278] text-white rounded-tl-xl'
            : 'bg-white dark:bg-[#262d31] text-black dark:text-white rounded-tr-xl'
        }`}
      >
        {message.imageUrl && (
            <img src={message.imageUrl} alt="Uploaded content" className="rounded-lg mb-2 max-w-xs max-h-64" />
        )}
        {message.text && (
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.text}
              </ReactMarkdown>
            </div>
        )}
        <div className={`text-right text-xs mt-1 flex items-center ${isUser ? 'justify-end' : 'justify-start'} ${isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
           {message.toolInfo && (
                <span className="mr-auto flex items-center">
                    <ToolIcon className="w-3 h-3 mr-1"/>
                    Used {message.toolInfo.name}
                </span>
           )}
          <span>{formatTime(message.timestamp)}</span>
          {isUser && <span className="ml-1.5"><DoubleCheckIcon /></span>}
        </div>
      </div>
    </div>
  );
};

const styles = `
.markdown-content {
  word-break: break-word;
}
.markdown-content p {
  margin-bottom: 0.5rem;
}
.markdown-content p:last-child {
  margin-bottom: 0;
}
.markdown-content pre {
  background-color: #e5e7eb; /* gray-200 */
  color: #1f2937; /* gray-800 */
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  font-family: monospace;
  font-size: 0.875rem;
  margin: 0.5rem 0;
}
.dark .markdown-content pre {
  background-color: #0e1621;
  color: #e5e7eb;
}
.markdown-content code {
  font-family: monospace;
  background-color: rgba(0,0,0,0.05);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}
.dark .markdown-content code {
  background-color: rgba(255,255,255,0.1);
}
.markdown-content pre code {
  background-color: transparent;
  padding: 0;
}
.markdown-content ul, .markdown-content ol {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}
.markdown-content ul {
  list-style-type: disc;
}
.markdown-content ol {
  list-style-type: decimal;
}
.markdown-content li {
  margin-bottom: 0.25rem;
}
.markdown-content blockquote {
  border-left: 4px solid #d1d5db; /* gray-300 */
  padding-left: 1rem;
  margin: 0.5rem 0;
  font-style: italic;
  color: #6b7280; /* gray-500 */
}
.dark .markdown-content blockquote {
  border-left-color: #4b5563; /* gray-600 */
  color: #9ca3af; /* gray-400 */
}
.markdown-content a {
  color: inherit;
  text-decoration: underline;
  font-weight: 600;
}
.markdown-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}
.markdown-content th, .markdown-content td {
  border: 1px solid #d1d5db;
  padding: 0.5rem;
}
.dark .markdown-content th, .dark .markdown-content td {
  border-color: #4b5563;
}
.markdown-content th {
  background-color: #f3f4f6;
}
.dark .markdown-content th {
  background-color: #374151;
}
`;

if (!document.getElementById('markdown-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'markdown-styles';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}


export default Message;