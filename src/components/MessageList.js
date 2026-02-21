import React from "react";

const MessageList = ({ messages, user }) => {
  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message ${
            msg.sender === user.username ? "sent" : "received"
          }`}
        >
          <strong>{msg.sender}: </strong>
          {msg.message}

          {/* Timestamp */}
          <div style={{ fontSize: "10px", opacity: 0.6 }}>
            {msg.createdAt &&
              new Date(msg.createdAt).toLocaleTimeString()}
          </div>

          {/* Read Receipts (only for sender messages) */}
          {msg.sender === user.username && (
            <span style={{ marginLeft: "5px" }}>
              {msg.status === "sent" && "✔"}
              {msg.status === "delivered" && "✔✔"}
              {msg.status === "read" && (
                <span style={{ color: "blue" }}>✔✔</span>
              )}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageList;