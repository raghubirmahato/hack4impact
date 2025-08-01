// Client-side Chat Service for Good Health AI
// This service handles messaging between patients and doctors

import { User, Doctor } from './clientDatabaseService';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  senderName?: string;
  receiverName?: string;
}

class ClientChatService {
  // Get all messages for the current user
  async getMessages(otherUserId?: string): Promise<Message[]> {
    try {
      const token = localStorage.getItem('goodhealth_token');
      const userData = localStorage.getItem('goodhealth_user');
      
      if (!token || !userData) {
        throw new Error('Authentication required');
      }
      
      const user = JSON.parse(userData);
      let url = `/api/messages/${user.id}`;
      
      if (otherUserId) {
        url = `${url}?with=${otherUserId}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch messages');
      }
      
      const messages = await response.json();
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }
  
  // Send a new message
  async sendMessage(receiverId: string, content: string): Promise<Message | null> {
    try {
      const token = localStorage.getItem('goodhealth_token');
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId,
          content
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
      
      const newMessage = await response.json();
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }
  
  // Mark a message as read
  async markMessageAsRead(messageId: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('goodhealth_token');
      
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark message as read');
      }
      
      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }
  
  // Get unread message count
  async getUnreadMessageCount(): Promise<number> {
    try {
      const token = localStorage.getItem('goodhealth_token');
      
      const response = await fetch('/api/messages/unread/count', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch unread message count');
      }
      
      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('Error fetching unread message count:', error);
      return 0;
    }
  }
}

const clientChatService = new ClientChatService();
export default clientChatService;