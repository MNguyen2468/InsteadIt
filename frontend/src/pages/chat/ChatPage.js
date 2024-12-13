// src/pages/chat/Chat.jsx

import React, { useState, useContext, useEffect, useRef } from 'react';
import './ChatPage.css'; // Import a combined stylesheet
import { AuthContext } from '../../context/authContext';
import { DarkModeContext } from '../../context/darkModeContext';
import { useNavigate } from 'react-router-dom';
import { SendOutlined, AddPhotoAlternateOutlined } from '@mui/icons-material';

// Main Chat Component
const Chat = () => {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();

  const [chats, setChats] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Fetch the auth token and determine the logged-in user
  const authToken = localStorage.getItem('accessToken');
  const loggedInUsername = localStorage.getItem('username');
  const currentUserApi = `http://3.140.132.61/api/user/${loggedInUsername}/`;

  // Fetch user data based on the username
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(currentUserApi);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserData();
  }, [currentUserApi]);

  const userId = userData?.userID;

  useEffect(() => {
    const fetchUserDetails = async (followerID) => {
      const response = await fetch(`http://3.140.132.61/api/userid/${followerID}/`);
      if (!response.ok) {
        throw new Error(`Error fetching user details for ID ${followerID}`);
      }
      return response.json();
    };

    const fetchMutualFollowers = async () => {
      if (!userData || !userData.userID) {
        return; // Exit if userData is not ready
      }

      try {
        const response = await fetch(`http://3.140.132.61/api/mutual-followers/${userData?.userID}/`);
        const mutualFollowers = await response.json();

        // Create an array of promises to fetch user details
        const userPromises = mutualFollowers.map(async (user) => {
          const userDetails = await fetchUserDetails(user.followerID);
          return {
            followerID: user.followerID,
            username: userDetails.username,
            displayName: userDetails.displayName,
            avatar: userDetails.avatar || '',
          };
        });

        // Wait for all promises to resolve
        const followersWithDetails = await Promise.all(userPromises);

        const formattedChats = followersWithDetails.reduce((acc, contact) => {
          acc[contact.followerID] = {
            id: contact.followerID,
            title: `Chat with ${contact.displayName || 'Unknown'}`,
            people: [
              { person: { username: userData.displayName, avatar: userData.avatar } },
              { person: { username: contact.displayName, avatar: contact.avatar } },
            ],
          };
          return acc;
        }, {});

        setChats(formattedChats);
      } catch (error) {
        console.error('Error fetching mutual followers:', error);
      }
    };

    fetchMutualFollowers();
  }, [userData]);

  const fetchMessages = async (chatId) => {
    if (!chatId || !userData?.userID) return;

    setLoadingMessages(true);

    try {
      const response = await fetch(`http://3.140.132.61/api/messages/${userData.userID}/${chatId}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();

      // Update messages state
      setMessages((prevMessages) => ({
        ...prevMessages,
        [chatId]: data.messages,
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Fetch messages for the active chat whenever it changes
  useEffect(() => {
    fetchMessages(activeChat);
  }, [activeChat, userData]);

  const updateMessagesForChat = (chatId, newMessages) => {
    setMessages((prevMessages) => ({
      ...prevMessages,
      [chatId]: newMessages,
    }));
  };

  return (
    <div className={`chat-page theme-${darkMode ? 'dark' : 'light'}`}>
      {/* Minimal Header */}
      <header className="chat-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          &larr; Back
        </button>
        <h1>Chat</h1>
        <button className="home-button" onClick={() => navigate('/')}>
          Home
        </button>
      </header>

      {/* Chat Content */}
      <div className="chat-content">
        {/* Chat List Sidebar */}
        <ChatList
          chats={chats}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
        />

        {/* Chat Feed */}
        <ChatFeed
          chats={chats}
          activeChat={activeChat}
          userId={userData?.userID}
          messages={messages[activeChat] || []}
          updateMessagesForChat={updateMessagesForChat}
          fetchMessages={fetchMessages}
          loadingMessages={loadingMessages}
        />
      </div>
    </div>
  );
};

// ChatList Component
const ChatList = ({ chats, activeChat, setActiveChat }) => {
  const renderChats = () => {
    return Object.values(chats).map((chat) => (
      <div
        key={chat.id}
        className={`chat-list-item ${chat.id === activeChat ? 'active' : ''}`}
        onClick={() => {
          setActiveChat(chat.id);
        }}
      >
        <div className="chat-list-title">{chat.title}</div>
        <div className="chat-list-subtitle">
          {chat.people.map((person) => person.person.username).join(', ')}
        </div>
      </div>
    ));
  };

  return <div className="chat-list">{renderChats()}</div>;
};

// ChatFeed Component
const ChatFeed = ({ chats, activeChat, userId, messages, fetchMessages, loadingMessages }) => {
  const chat = chats && chats[activeChat];

  // Ref to the chat messages container
  const chatMessagesEndRef = useRef(null);

  // Function to scroll to the bottom when messages are loaded
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeChat]);  // Trigger when messages or activeChat change

  const renderMessages = () => {
    if (!messages) return null;

    return messages.map((message, index) => {
      const lastMessage = index === 0 ? null : messages[index - 1];
      const isMyMessage = message.senderID === userId;

      return (
        <div key={`msg_${message.messageID}`} style={{ width: '100%' }}>
          <div className="message-block">
            {isMyMessage ? (
              <MyMessage message={message} />
            ) : (
              <TheirMessage message={message} lastMessage={lastMessage} />
            )}
          </div>
        </div>
      );
    });
  };

  if (!chat) return <div />;

  return (
    <div className="chat-feed">
      {loadingMessages ? (
        <div className="loading-messages">Loading messages...</div>
      ) : (
        <>
          <div className="chat-messages">
            {renderMessages()}
            {/* This spacer element ensures we scroll to the bottom */}
            <div ref={chatMessagesEndRef} style={{ height: '32px' }} /> {/* Spacer */}
          </div>
          <MessageForm
            userName={chat?.people[0]?.person?.username}
            userId={userId}
            chatId={activeChat}
            messages={messages}
            fetchMessages={fetchMessages}
          />
        </>
      )}
    </div>
  );
};

// MessageForm Component
const MessageForm = ({ userName, userId, chatId, messages, fetchMessages }) => {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const text = value.trim();
    if (text.length > 0) {
      const newMessage = {
        text,
        senderID: userId,
        receiverID: chatId,
      };

      try {
        // Send the message data to the backend API
        const response = await fetch('http://3.140.132.61/api/create-message/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newMessage),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const result = await response.json();
        //console.log(result.message); // Log success message

        // Re-fetch messages for the current chat
        await fetchMessages(chatId);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
    setIsSubmitting(false);
    setValue('');
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleUpload = async (event) => {
    // Handle file uploads if needed
  };

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <input
        className="message-input"
        placeholder="Send a message..."
        value={value}
        onChange={handleChange}
      />
      <label htmlFor="upload-button">
        <span className="image-button">
          <AddPhotoAlternateOutlined className="picture-icon" />
        </span>
      </label>
      <input
        type="file"
        multiple={false}
        id="upload-button"
        style={{ display: 'none' }}
        onChange={handleUpload}
      />
      <button type="submit" className="send-button">
        <SendOutlined className="send-icon" />
      </button>
    </form>
  );
};

// MyMessage Component
const MyMessage = ({ message }) => {
  if (message.attachments && message.attachments.length > 0) {
    return (
      <img
        src={message.attachments[0].file}
        alt="message-attachment"
        className="message-image"
      />
    );
  }

  return <div className="mymessage">{message.text}</div>;
};

// TheirMessage Component
const TheirMessage = ({ lastMessage, message }) => {
  const isFirstMessageByUser =
    !lastMessage || lastMessage.senderID !== message.senderID;

  return (
    <div className="message-row">
      {isFirstMessageByUser && message.sender && message.sender.username && (
        <div className="message-avatar">
          {message.sender.username.charAt(0).toUpperCase()}
        </div>
      )}
      {message.attachments && message.attachments.length > 0 ? (
        <img
          src={message.attachments[0].file}
          alt="message-attachment"
          className="message-image"
        />
      ) : (
        <div className="theirmessage">{message.text}</div>
      )}
    </div>
  );
};

export default Chat;

