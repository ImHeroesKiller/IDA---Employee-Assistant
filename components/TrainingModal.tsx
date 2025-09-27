
import React, { useState, useRef } from 'react';
import { XIcon, UploadCloudIcon, FileTextIcon, GoogleDriveIcon, GlobeIcon } from './icons/Icons';
import type { DocumentSource, TrainingLog } from '../types';

interface TrainingModalProps {
  onClose: () => void;
  onAddDocument: (fileName: string, source: DocumentSource) => void;
  onAddLog: (log: Omit<TrainingLog, 'id' | 'timestamp'>) => void;
}

const TrainingModal: React.FC<TrainingModalProps> = ({ onClose, onAddDocument, onAddLog }) => {
  const [sourceType, setSourceType] = useState<DocumentSource>('file');
  const [isTraining, setIsTraining] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [showGDrivePicker, setShowGDrivePicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      setFileName(file.name);
      setIsTraining(true);
      // Simulate cloud training process
      setTimeout(() => {
        onAddDocument(file.name, 'file');
        onAddLog({ name: file.name, source: 'file', status: 'success' });
        setIsTraining(false);
        onClose();
      }, 2000);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !url.match(/^https?:\/\/.+/)) {
        setError('Please enter a valid URL (e.g., https://example.com).');
        return;
    }
    setError(null);
    setFileName(`Fetching content from ${url}`);
    setIsTraining(true);
    // Simulate training
    setTimeout(() => {
        if (url.includes('fail.com')) {
            const errorMsg = 'Failed to fetch content. The URL may be invalid or the server is not responding.';
            setError(errorMsg);
            onAddLog({ name: url, source: 'web', status: 'failure', details: errorMsg });
            setIsTraining(false);
            setFileName(null);
        } else {
            const trainingName = new URL(url).hostname;
            onAddDocument(trainingName, 'web');
            onAddLog({ name: url, source: 'web', status: 'success', details: `Trained from ${trainingName}` });
            setIsTraining(false);
            onClose();
        }
    }, 2000);
  };

  const handleGoogleDriveConnect = () => {
      setError(null);
      setFileName("Connecting to Google Drive...");
      setIsTraining(true);
      // Simulate connection
      setTimeout(() => {
          setIsTraining(false);
          setFileName(null);
          setShowGDrivePicker(true);
      }, 1000);
  };
  
  const handleGDriveFileSelect = (selectedFile: string) => {
    setShowGDrivePicker(false);
    setFileName(`Training "${selectedFile}"...`);
    setIsTraining(true);
    // Simulate training
    setTimeout(() => {
        onAddDocument(selectedFile, 'gdrive');
        onAddLog({ name: selectedFile, source: 'gdrive', status: 'success' });
        setIsTraining(false);
        onClose();
    }, 1500);
  };
  
  const mockGDriveFiles = ["Q3 Sales Report.gsheet", "Project Phoenix Proposal.gdoc", "Marketing Budget.gsheet", "Team Offsite Photos.gslides"];

  const GDrivePicker = () => (
    <div className="absolute inset-0 bg-white dark:bg-[#242f3d] z-10 p-4 flex flex-col rounded-2xl">
      <h3 className="font-bold text-lg mb-2 flex-shrink-0">Select a file from Google Drive</h3>
      <div className="flex-grow overflow-y-auto border-t border-b border-gray-200 dark:border-gray-700 -mx-4">
          <div className="p-4 space-y-2">
            {mockGDriveFiles.map(file => (
                <div key={file} onClick={() => handleGDriveFileSelect(file)} className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2c3a4a] cursor-pointer transition-colors">
                    <GoogleDriveIcon className="w-6 h-6 mr-3 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium">{file}</span>
                </div>
            ))}
          </div>
      </div>
      <div className="pt-4 text-right flex-shrink-0">
          <button onClick={() => setShowGDrivePicker(false)} className="bg-gray-200 dark:bg-[#17212b] text-black dark:text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-[#0e1621] transition-colors">
            Cancel
          </button>
      </div>
    </div>
  );


  const renderSourceContent = () => {
    if (isTraining) {
        return (
             <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <div className="flex justify-center items-center mb-4">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="font-semibold truncate">{fileName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Please wait, this may take a moment.</p>
            </div>
        )
    }

    switch (sourceType) {
        case 'file':
            return (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2c3a4a] transition-colors"
                >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.txt,.docx,.csv"
                      disabled={isTraining}
                    />
                    <UploadCloudIcon className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="font-semibold text-blue-500 dark:text-blue-400">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">PDF, TXT, DOCX, CSV</p>
                </div>
            );
        case 'gdrive':
            return (
                <div className="text-center p-8 border-2 border-transparent rounded-lg">
                    <GoogleDriveIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <p className="font-semibold mb-2">Connect Google Drive</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Train IDA with your documents, spreadsheets, and presentations from Google Drive.</p>
                    <button onClick={handleGoogleDriveConnect} className="w-full flex items-center justify-center p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 font-semibold">
                       Connect & Select File
                    </button>
                </div>
            );
        case 'web':
            return (
                <div className="p-4">
                     <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Enter a public URL to a webpage, and IDA will learn from its content. Try a URL with "fail.com" to test error handling.</p>
                     <form onSubmit={handleUrlSubmit} className="flex space-x-2">
                        <input 
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/page"
                            className="flex-grow bg-gray-100 dark:bg-[#17212b] text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                            Train
                        </button>
                     </form>
                </div>
            )
    }
  };

  const tabs: {id: DocumentSource, name: string, icon: React.FC<any>}[] = [
      { id: 'file', name: 'File Upload', icon: FileTextIcon },
      { id: 'gdrive', name: 'Google Drive', icon: GoogleDriveIcon },
      { id: 'web', name: 'Web Page', icon: GlobeIcon },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-[#242f3d] rounded-2xl shadow-2xl w-full max-w-md text-black dark:text-white relative flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold">Add to Knowledge Base</h2>
            <button onClick={onClose} className="p-1 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white rounded-full">
                <XIcon className="w-6 h-6" />
            </button>
        </header>

        <div className="p-4">
             <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-[#17212b] rounded-lg mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => !isTraining && setSourceType(tab.id)}
                        disabled={isTraining}
                        className={`flex items-center justify-center space-x-2 text-sm font-semibold py-2 px-3 rounded-md transition-colors ${sourceType === tab.id ? 'bg-white dark:bg-[#2b5278] text-black dark:text-white shadow' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2c3a4a]'}`}
                    >
                        <tab.icon className="w-5 h-5" />
                        <span>{tab.name}</span>
                    </button>
                ))}
            </div>

            {renderSourceContent()}
            {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        </div>
        
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 text-right">
            <button
                onClick={onClose}
                disabled={isTraining}
                className="bg-gray-200 dark:bg-[#17212b] text-black dark:text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-[#0e1621] transition-colors disabled:opacity-50"
            >
                Cancel
            </button>
        </footer>

        {showGDrivePicker && sourceType === 'gdrive' && <GDrivePicker />}

      </div>
    </div>
  );
};

const styles = `
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fade-in 0.2s ease-out forwards;
}
`;

if (!document.getElementById('training-modal-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'training-modal-styles';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

export default TrainingModal;
