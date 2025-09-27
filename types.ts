
export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline: boolean;
  telegramId?: string;
}

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  sender: 'user' | 'ai';
  imageUrl?: string;
  imageMimeType?: string;
  toolInfo?: {
      name: string;
      status: 'pending' | 'success';
  }
}

export interface ChatSession {
  id: string;
  user: User;
  messages: Message[];
  source: 'app' | 'telegram';
  isLoading?: boolean;
  capabilities?: {
    tools?: boolean;
    image?: boolean;
    voice?: boolean;
  }
}

export type DocumentSource = 'file' | 'gdrive' | 'web';

export interface TrainedDocument {
  id: string;
  name: string;
  status: 'trained' | 'training';
  trainedAt: string;
  source: DocumentSource;
}

export type TrainingLogStatus = 'success' | 'failure';

export interface TrainingLog {
  id: string;
  timestamp: string;
  source: DocumentSource;
  name: string;
  status: TrainingLogStatus;
  details?: string;
}

export interface Employee {
  id: string;
  name: string;
  telegramId: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'failed';