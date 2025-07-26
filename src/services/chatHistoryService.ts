import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatHistoryRecord {
  id: string;
  user_id: string;
  symbol?: string;
  chat_title: string;
  messages: ChatMessage[];
  pdf_document_id?: string;
  created_at: string;
  updated_at: string;
}

export class ChatHistoryService {
  // Save a new chat session
  static async saveChatHistory(
    chatTitle: string,
    messages: ChatMessage[],
    symbol?: string,
    pdfDocumentId?: string
  ): Promise<ChatHistoryRecord> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('chat_history')
        .insert({
          user_id: user.id,
          symbol: symbol?.toUpperCase(),
          chat_title: chatTitle,
          messages: messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString()
          })),
          pdf_document_id: pdfDocumentId
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving chat history:', error);
        throw error;
      }

      return {
        ...data,
        messages: data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      };
    } catch (error) {
      console.error('Error in saveChatHistory:', error);
      throw error;
    }
  }

  // Update existing chat session
  static async updateChatHistory(
    chatId: string,
    messages: ChatMessage[],
    chatTitle?: string
  ): Promise<ChatHistoryRecord> {
    try {
      const updateData: any = {
        messages: messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        }))
      };

      if (chatTitle) {
        updateData.chat_title = chatTitle;
      }

      const { data, error } = await supabase
        .from('chat_history')
        .update(updateData)
        .eq('id', chatId)
        .select()
        .single();

      if (error) {
        console.error('Error updating chat history:', error);
        throw error;
      }

      return {
        ...data,
        messages: data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      };
    } catch (error) {
      console.error('Error in updateChatHistory:', error);
      throw error;
    }
  }

  // Get user's chat history
  static async getUserChatHistory(): Promise<ChatHistoryRecord[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error getting chat history:', error);
        throw error;
      }

      return (data || []).map(record => ({
        ...record,
        messages: record.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error in getUserChatHistory:', error);
      return [];
    }
  }

  // Get specific chat session
  static async getChatById(chatId: string): Promise<ChatHistoryRecord | null> {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('id', chatId)
        .single();

      if (error) {
        console.error('Error getting chat by ID:', error);
        throw error;
      }

      return {
        ...data,
        messages: data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      };
    } catch (error) {
      console.error('Error in getChatById:', error);
      return null;
    }
  }

  // Delete chat session
  static async deleteChatHistory(chatId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('id', chatId);

      if (error) {
        console.error('Error deleting chat history:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteChatHistory:', error);
      throw error;
    }
  }

  // Get chat history by symbol
  static async getChatsBySymbol(symbol: string): Promise<ChatHistoryRecord[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('symbol', symbol.toUpperCase())
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error getting chats by symbol:', error);
        throw error;
      }

      return (data || []).map(record => ({
        ...record,
        messages: record.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error in getChatsBySymbol:', error);
      return [];
    }
  }
}