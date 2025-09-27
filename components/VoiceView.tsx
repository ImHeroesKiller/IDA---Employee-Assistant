
import React, { useState, useEffect, useRef } from 'react';
import { liveService } from '../services/liveService';
import { StopCircleIcon, SoundWaveIcon } from './icons/Icons';
import type { LiveServerMessage } from '@google/genai';

interface VoiceViewProps {
  onClose: () => void;
  onSessionEnd: (transcript: Array<{ sender: 'user' | 'ai', text: string }>) => void;
}

const VoiceView: React.FC<VoiceViewProps> = ({ onClose, onSessionEnd }) => {
  const [status, setStatus] = useState('Connecting...');
  const [userTranscription, setUserTranscription] = useState('');
  const [modelTranscription, setModelTranscription] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const transcriptRef = useRef<Array<{ sender: 'user' | 'ai', text: string }>>([]);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const nextStartTimeRef = useRef(0);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // FIX: Cast window to `any` to allow access to `webkitAudioContext` for older browsers without a TS error.
    outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    const callbacks = {
        onMessage: (message: LiveServerMessage) => handleServerMessage(message),
        onError: (e: ErrorEvent) => {
            console.error('Live session error:', e);
            setStatus('Error. Please try again.');
        },
        onClose: (e: CloseEvent) => {
            console.log('Live session closed.');
        }
    };
    
    liveService.connect(callbacks).then(() => {
        setStatus('Listening...');
    }).catch(err => {
        console.error(err);
        setStatus('Microphone access denied.');
    });

    return () => {
        liveService.disconnect();
        outputAudioContextRef.current?.close();
        onSessionEnd(transcriptRef.current);
    };
  }, []);
  
   useEffect(() => {
    // Scroll to bottom of transcript
    if (transcriptContainerRef.current) {
        transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
   }, [userTranscription, modelTranscription]);

  const handleServerMessage = async (message: LiveServerMessage) => {
      if (message.serverContent?.inputTranscription) {
          setUserTranscription(prev => prev + message.serverContent.inputTranscription.text);
      }
      if (message.serverContent?.outputTranscription) {
          setModelTranscription(prev => prev + message.serverContent.outputTranscription.text);
      }
      if (message.serverContent?.turnComplete) {
          transcriptRef.current.push({ sender: 'user', text: userTranscription });
          transcriptRef.current.push({ sender: 'ai', text: modelTranscription });
          setUserTranscription('');
          setModelTranscription('');
      }

      const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
      if (audioData && outputAudioContextRef.current) {
          const decodedData = liveService.helpers.decode(audioData);
          const audioBuffer = await liveService.helpers.decodeAudioData(decodedData, outputAudioContextRef.current, 24000, 1);
          playAudio(audioBuffer);
      }
  };
  
  const playAudio = (audioBuffer: AudioBuffer) => {
    const ctx = outputAudioContextRef.current;
    if (!ctx) return;
    
    setIsSpeaking(true);
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    
    const now = ctx.currentTime;
    const startTime = Math.max(now, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + audioBuffer.duration;
    
    source.onended = () => {
        // A simple check to see if this was the last item in the queue
        if (nextStartTimeRef.current <= ctx.currentTime) {
             setIsSpeaking(false);
        }
    };
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex flex-col items-center justify-center animate-fade-in">
        <div className="flex-grow w-full max-w-2xl flex flex-col justify-end p-6 text-white text-3xl font-light">
             <div ref={transcriptContainerRef} className="overflow-y-auto max-h-[60vh]">
                {transcriptRef.current.map((item, index) => (
                    <p key={index} className={item.sender === 'user' ? 'text-gray-400' : 'text-white'}>{item.text}</p>
                ))}
                <p className="text-gray-400">{userTranscription}</p>
                <p className="text-white font-normal">{modelTranscription}</p>
            </div>
        </div>

        <div className="flex-shrink-0 flex flex-col items-center justify-center h-1/3 w-full">
            <div className="w-24 h-24 flex items-center justify-center">
                 {isSpeaking && <SoundWaveIcon />}
            </div>
            <p className="text-gray-300 my-4">{status}</p>
            <button onClick={onClose} className="text-white hover:text-red-500 transition-colors">
                <StopCircleIcon className="w-20 h-20"/>
            </button>
        </div>
    </div>
  );
};

const styles = `
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
@keyframes waving-line {
    0%, 100% { height: 25%; }
    50% { height: 100%; }
}
.animate-waving-line {
    animation: waving-line 1.2s infinite ease-in-out;
}
`;

if (!document.getElementById('voice-view-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'voice-view-styles';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}


export default VoiceView;
