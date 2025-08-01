import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Chat from '../components/Chat';

const Messages: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !currentUser) {
      navigate('/login', { state: { from: '/messages' } });
    }
  }, [currentUser, loading, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (!currentUser) {
    return null; // Will redirect to login
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <Chat isFullPage={true} />
        </div>
      </div>
    </div>
  );
};

export default Messages;