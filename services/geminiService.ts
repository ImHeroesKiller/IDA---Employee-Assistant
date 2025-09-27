import { GoogleGenAI, Chat } from "@google/genai";
import type { ChatSession, TrainedDocument } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using a mock service.");
}

const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

const createMockStream = async function* (prompt: string, trainedDocuments: TrainedDocument[], image?: { data: string, mimeType: string }) {
    if (trainedDocuments.length === 0) {
        yield "My knowledge base is empty. Please go to Settings to upload a document before asking questions.";
        return;
    }
    if (image) {
      yield `I see you've uploaded an image (${image.mimeType}). I'm now analyzing it along with your prompt: "${prompt}" based on the provided documents. `;
      await new Promise(res => setTimeout(res, 500));
      yield `The mock response is now tailored based on the image content and your knowledge base.`;
      return;
    }

    const docNames = trainedDocuments.map(d => d.name).join(', ');
    yield `Based on your documents (${docNames}), I am processing your request: "${prompt}". `;
    await new Promise(res => setTimeout(res, 500));
    
    yield `This is a mock response based on your documents. If you ask about something not in the documents, I will politely decline.`;
    
};


class GeminiService {
  private chatInstances: Map<string, Chat> = new Map();

  public isConfigured(): boolean {
    return !!ai;
  }

  async testApiKey(): Promise<{ success: boolean; error?: string }> {
    if (!ai) {
      return { success: false, error: "No API key provided in .env.local file." };
    }
    try {
      // Make a simple, lightweight call to check if the key is valid.
      await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'test' });
      return { success: true };
    } catch (error: any) {
      console.error("API Key Test Failed:", error);
      if (error.message.includes('API key not valid')) {
          return { success: false, error: "Authentication failed. The API key is invalid." };
      }
      return { success: false, error: "Test failed. Could not connect to the API." };
    }
  }

  private getChatInstance(chatSession: ChatSession): Chat {
    if (this.chatInstances.has(chatSession.id) || !ai) {
      return this.chatInstances.get(chatSession.id)!;
    }

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: chatSession.messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      config: {
        systemInstruction: "You are IDA, an AI assistant for employees. Your primary and only function is to answer questions based on the context provided from the user's uploaded documents. If a user's query cannot be answered using the information in the documents, you must politely decline and state that the information is not in your knowledge base. Do not use your general knowledge to answer questions. Be concise and professional.",
      },
    });

    this.chatInstances.set(chatSession.id, chat);
    return chat;
  }

  async sendMessageStream(
    chatSession: ChatSession,
    message: string,
    trainedDocuments: TrainedDocument[],
    image?: { data: string; mimeType: string }
  ): Promise<AsyncGenerator<{type: 'text', content: string}>> {
      if (!ai) {
          const mockStream = createMockStream(message, trainedDocuments, image);
          return (async function*() {
            for await (const chunk of mockStream) {
                yield { type: 'text', content: chunk };
            }
          })();
      }
      
    try {
        const chat = this.getChatInstance(chatSession);

        // --- Handle RAG Context ---
        const documentNames = trainedDocuments.map(doc => `"${doc.name}"`).join(', ');
        const ragContext = `CONTEXT: The user has provided the following documents: [${documentNames}]. You MUST answer the user's query using ONLY the information contained in these documents. If the answer is not in the documents, you must respond with a polite message stating that you cannot find the information in the knowledge base. Do not answer from general knowledge.\n\nUSER QUERY: `;
        const messageToSend = ragContext + message;
        
        // --- Handle Image Content ---
        let contentRequest: string | any[];
        if (image) {
            const imagePart = { inlineData: { data: image.data, mimeType: image.mimeType } };
            const textPart = { text: messageToSend };
            contentRequest = [imagePart, textPart];
        } else {
            contentRequest = messageToSend;
        }
        
        const result = await chat.sendMessageStream({ message: contentRequest });
      
        const stream = (async function* () {
            for await (const chunk of result) {
                yield { type: 'text' as const, content: chunk.text };
            }
        })();

        return stream;

    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      throw new Error("Failed to get response from Gemini.");
    }
  }
}

export const geminiService = new GeminiService();