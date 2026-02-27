import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import './ChatPage.css';

const ChatPage = () => {
  const { userId: selectedUserId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadConversation(parseInt(selectedUserId));
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (socket) {
      socket.on('receive-message', (data) => {
        if (activeConversation && 
            (data.senderId === activeConversation.user_id || data.receiverId === activeConversation.user_id)) {
          setMessages(prev => [...prev, {
            sender_id: data.senderId,
            receiver_id: data.receiverId,
            message: data.message,
            created_at: new Date().toISOString(),
            sender_name: data.senderName
          }]);
          scrollToBottom();
        }
        // Refresh conversations to update unread counts
        fetchConversations();
      });

      return () => {
        socket.off('receive-message');
      };
    }
  }, [socket, activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/messages/conversation/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const conversationUser = conversations.find(c => c.user_id === userId);
      setActiveConversation(conversationUser || { 
        user_id: userId, 
        full_name: 'User',
        role: 'customer'
      });
      setMessages(response.data.messages || []);
      
      // Mark messages as read
      await axios.patch(`http://localhost:5000/api/messages/read/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchConversations();
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/messages', {
        receiver_id: activeConversation.user_id,
        message: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Add message to local state
      setMessages(prev => [...prev, {
        sender_id: user.id,
        receiver_id: activeConversation.user_id,
        message: newMessage,
        created_at: new Date().toISOString(),
        sender_name: user.full_name
      }]);

      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const selectConversation = (conversation) => {
    navigate(`/chat/${conversation.user_id}`);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="chat-loading">
        <div className="spinner"></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Conversations Sidebar */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h2>Messages</h2>
            <span className="conversation-count">{conversations.length}</span>
          </div>
          
          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="no-conversations">
                <p>No messages yet</p>
                <small>Start chatting with artists!</small>
              </div>
            ) : (
              conversations.map((conversation) => (
                <motion.div
                  key={conversation.user_id}
                  className={`conversation-item ${activeConversation?.user_id === conversation.user_id ? 'active' : ''}`}
                  onClick={() => selectConversation(conversation)}
                  whileHover={{ backgroundColor: '#2a2a2a' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="conversation-avatar">
                    {conversation.profile_image ? (
                      <img src={conversation.profile_image} alt={conversation.full_name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {conversation.full_name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    {conversation.role && (
                      <span className={`role-badge ${conversation.role}`}>
                        {conversation.role === 'artist' ? '🎨' : '👤'}
                      </span>
                    )}
                  </div>
                  
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <h4>{conversation.full_name}</h4>
                      <span className="message-time">
                        {formatTime(conversation.last_message_time)}
                      </span>
                    </div>
                    <div className="conversation-preview">
                      <p className={conversation.unread_count > 0 ? 'unread' : ''}>
                        {conversation.last_message}
                      </p>
                      {conversation.unread_count > 0 && (
                        <span className="unread-badge">{conversation.unread_count}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="chat-main">
          {activeConversation ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="chat-avatar">
                    {activeConversation.profile_image ? (
                      <img src={activeConversation.profile_image} alt={activeConversation.full_name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {activeConversation.full_name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3>{activeConversation.full_name}</h3>
                    <span className="user-role">{activeConversation.role}</span>
                  </div>
                </div>
              </div>

              <div className="messages-container">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      className={`message ${msg.sender_id === user.id ? 'sent' : 'received'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="message-content">
                        <p>{msg.message}</p>
                        <span className="message-timestamp">
                          {new Date(msg.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                />
                <button type="submit" disabled={sending || !newMessage.trim()}>
                  {sending ? '⏳' : '📤'}
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="empty-state">
                <span className="empty-icon">💬</span>
                <h3>No conversation selected</h3>
                <p>Select a conversation from the sidebar to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
