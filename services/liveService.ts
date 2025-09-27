
// FIX: Removed LiveSession, ErrorEvent, CloseEvent as they are not exported from @google/genai.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Live service will not function.");
}

const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

// --- Audio Encoding/Decoding Helpers (Manual Implementation) ---

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- Live Service Class ---

export type LiveServiceCallbacks = {
    onMessage: (message: LiveServerMessage) => void;
    onError: (e: ErrorEvent) => void;
    onClose: (e: CloseEvent) => void;
};

class LiveService {
    // FIX: Replaced Promise<LiveSession> with Promise<any> as LiveSession is not an exported type.
    private sessionPromise: Promise<any> | null = null;
    private mediaStream: MediaStream | null = null;
    private inputAudioContext: AudioContext | null = null;
    private scriptProcessor: ScriptProcessorNode | null = null;
    private mediaStreamSource: MediaStreamAudioSourceNode | null = null;

    async connect(callbacks: LiveServiceCallbacks) {
        if (!ai) {
            throw new Error("Gemini API not initialized. Check API_KEY.");
        }
        if (this.sessionPromise) {
            console.warn("Session already exists. Disconnect first.");
            return;
        }

        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            this.sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        console.log("Live session opened.");
                        this.startMicrophoneStreaming();
                    },
                    onmessage: callbacks.onMessage,
                    onerror: callbacks.onError,
                    onclose: (e) => {
                        this.disconnect();
                        callbacks.onClose(e);
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                    },
                },
            });
        } catch (error) {
            console.error("Failed to start live session:", error);
            throw error;
        }
    }

    private startMicrophoneStreaming() {
        if (!this.mediaStream) return;

        // FIX: Cast window to `any` to allow access to `webkitAudioContext` for older browsers without a TS error.
        this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        this.mediaStreamSource = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
        this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
        
        this.scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            this.sessionPromise?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
            });
        };
        
        this.mediaStreamSource.connect(this.scriptProcessor);
        this.scriptProcessor.connect(this.inputAudioContext.destination);
    }

    disconnect() {
        // Stop microphone stream and release tracks
        this.mediaStream?.getTracks().forEach(track => track.stop());
        this.mediaStream = null;

        // Disconnect audio nodes
        this.mediaStreamSource?.disconnect();
        this.scriptProcessor?.disconnect();
        this.inputAudioContext?.close();

        // Close Gemini session
        this.sessionPromise?.then(session => {
            session.close();
            console.log("Live session closed.");
        });
        
        this.sessionPromise = null;
        this.inputAudioContext = null;
        this.scriptProcessor = null;
        this.mediaStreamSource = null;
    }

    helpers = {
        decode,
        decodeAudioData
    }
}

export const liveService = new LiveService();
