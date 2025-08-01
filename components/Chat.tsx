import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import clientChatService, { Message } from '../services/clientChatService';
import clientDatabaseService, { User, Doctor } from '../services/clientDatabaseService';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ChatProps {
  otherUserId?: string;
  isFullPage?: boolean;
}

const Chat: React.FC<ChatProps> = ({ otherUserId, isFullPage = false }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<User | Doctor | null>(null);
  const [contacts, setContacts] = useState<(User | Doctor)[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | undefined>(otherUserId);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Fetch contacts based on user role
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        if (!currentUser) return;
        
        if (currentUser.role === 'patient') {
          // Patients can chat with doctors
          const doctors = await clientDatabaseService.getAllDoctors();
          setContacts(doctors);
        } else if (currentUser.role === 'doctor') {
          // Doctors can chat with their patients
          // Get appointments to find patients
          const appointments = await clientDatabaseService.getAppointmentsByDoctor(currentUser.id);
          const patientIds = [...new Set(appointments.map(app => app.patientId))];
          
          const patients = await Promise.all(
            patientIds.map(id => clientDatabaseService.getUserById(id))
          );
          
          setContacts(patients.filter(Boolean) as User[]);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };
    
    fetchContacts();
  }, [currentUser]);
  
  // Fetch messages when selected contact changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact) return;
      
      setLoading(true);
      try {
        const fetchedMessages = await clientChatService.getMessages(selectedContact);
        setMessages(fetchedMessages);
        
        // Mark messages from this contact as read
        const unreadMessages = fetchedMessages.filter(
          msg => msg.senderId === selectedContact && !msg.isRead
        );
        
        for (const msg of unreadMessages) {
          await clientChatService.markMessageAsRead(msg.id);
        }
        
        // Update unread counts
        fetchUnreadCounts();
        
        // Fetch other user details
        if (currentUser?.role === 'patient') {
          const doctor = await clientDatabaseService.getDoctorById(selectedContact);
          setOtherUser(doctor);
        } else {
          const patient = await clientDatabaseService.getUserById(selectedContact);
          setOtherUser(patient);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Set up polling for new messages
    const intervalId = setInterval(fetchMessages, 10000); // Poll every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [selectedContact, currentUser]);
  
  // Fetch unread message counts for all contacts
  const fetchUnreadCounts = async () => {
    try {
      const allMessages = await clientChatService.getMessages();
      
      // Group unread messages by sender
      const counts: Record<string, number> = {};
      
      allMessages.forEach(msg => {
        if (msg.senderId !== currentUser?.id && !msg.isRead) {
          counts[msg.senderId] = (counts[msg.senderId] || 0) + 1;
        }
      });
      
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };
  
  // Initial fetch of unread counts
  useEffect(() => {
    fetchUnreadCounts();
    
    // Poll for unread counts
    const intervalId = setInterval(fetchUnreadCounts, 30000); // Every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedContact || !currentUser) return;
    
    try {
      const sentMessage = await clientChatService.sendMessage(selectedContact, newMessage);
      
      if (sentMessage) {
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };
  
  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Please log in to use the chat feature</p>
      </div>
    );
  }
  
  return (
    <div className={`flex ${isFullPage ? 'h-[calc(100vh-64px)]' : 'h-[500px]'} bg-white rounded-lg shadow-lg`}>
      {/* Contacts sidebar */}
      <div className="w-1/4 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Conversations</h2>
        </div>
        
        <div className="overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {currentUser.role === 'patient' 
                ? 'No doctors available for chat' 
                : 'No patients available for chat'}
            </div>
          ) : (
            contacts.map(contact => (
              <div 
                key={contact.id}
                className={`p-3 border-b border-gray-100 flex items-center cursor-pointer hover:bg-gray-50 ${selectedContact === contact.id ? 'bg-blue-50' : ''}`}
                onClick={() => setSelectedContact(contact.id)}
              >
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-3">
                  {contact.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{contact.name}</h3>
                    {unreadCounts[contact.id] > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {unreadCounts[contact.id]}
                      </span>
                    )}
                  </div>
                  {'specialization' in contact && (
                    <p className="text-sm text-gray-500">{contact.specialization}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        {selectedContact ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center">
              {otherUser ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-3">
                    {otherUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium">{otherUser.name}</h3>
                    {'specialization' in otherUser && (
                      <p className="text-sm text-gray-500">{otherUser.specialization}</p>
                    )}
                  </div>
                </>
              ) : (
                <LoadingSpinner size="small" />
              )}
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <LoadingSpinner />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full text-gray-500">
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                <div>
                  {messages.map((message, index) => {
                    const isCurrentUser = message.senderId === currentUser.id;
                    const showDate = index === 0 || 
                      formatDate(messages[index-1].timestamp) !== formatDate(message.timestamp);
                    
                    return (
                      <React.Fragment key={message.id}>
                        {showDate && (
                          <div className="text-center my-2">
                            <span className="text-xs bg-gray-200 rounded-full px-2 py-1">
                              {formatDate(message.timestamp)}
                            </span>
                          </div>
                        )}
                        <div 
                          className={`flex mb-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[70%] rounded-lg p-3 ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Message input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="submit" 
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!newMessage.trim()}
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            <p>Select a contact to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;