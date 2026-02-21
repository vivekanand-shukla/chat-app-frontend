import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MessageList from "./MessageList";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";


const socket = io("https://chat-app-backend-qszh.onrender.com");

export const Chat = ({ user ,setUser }) => {
const [showEmoji, setShowEmoji] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    // Fetch all users excluding the current user
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("https://chat-app-backend-qszh.onrender.com/users", {
          params: { currentUser: user.username },
        });
        setUsers(data?.users);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };

    fetchUsers();

    // Listen for incoming messages
    socket.on("receive_message", (data) => {
      if (data.sender === currentChat || data.receiver === currentChat) {
        setMessages((prev) => [...prev, data]);
      }
    });


    socket.on("user_typing", (data) => {
  if (data.sender === currentChat) {
    setTypingUser(data.sender);
    setTimeout(() => setTypingUser(null), 1500);
  }
});

    return () => {
      socket.off("receive_message");
    };
  }, [currentChat]);

  const fetchMessages = async (receiver) => {
    try {
      const { data } = await axios.get("https://chat-app-backend-qszh.onrender.com/messages", {
        params: { sender: user.username, receiver },
      });

      socket.emit("message_read", { sender: currentChat, receiver: user.username });
      setMessages(data?.messages);
      setCurrentChat(receiver);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  const sendMessage = () => {
    const messageData = {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage,
    };
    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, messageData]);
    setCurrentMessage("");
  };

 return (
  <div className="chat-container">

    <div className="top-bar">
      <h2>Welcome, {user.username}</h2>
      <button
        className="btn btn-danger"
        onClick={() => {
          localStorage.removeItem("chatUser");
          window.location.reload();
        }}
      >
        Logout
      </button>
    </div>

    <div className="chat-layout">

      {/* User List */}
      <div className="chat-list">
        <h3>Chats</h3>
        {users.map((u) => (
          <div
            key={u._id}
            className={`chat-user ${
              currentChat === u.username ? "active" : ""
            }`}
            onClick={() => fetchMessages(u.username)}
          >
            {u.username}
          </div>
        ))}
      </div>

      {/* Chat Window */}
      {currentChat && (
        <div className="chat-window">
          <h5>You are chatting with {currentChat}</h5>

          <div className="messages-area">
            <MessageList messages={messages} user={user} />
            {typingUser && <p>{typingUser} is typing...</p>}
          </div>

          <div className="message-field">
            <button onClick={() => setShowEmoji(!showEmoji)}>😊</button>

            {showEmoji && (
              <EmojiPicker
                onEmojiClick={(emojiData) =>
                  setCurrentMessage((prev) => prev + emojiData.emoji)
                }
              />
            )}

            <input
              type="text"
              placeholder="Type a message..."
              value={currentMessage}
              onChange={(e) => {
                setCurrentMessage(e.target.value);
                socket.emit("typing", {
                  sender: user.username,
                  receiver: currentChat,
                });
              }}
            />

            <button className="btn-prime" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      )}

    </div>
  </div>
);
};
