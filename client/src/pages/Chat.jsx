import { useEffect, useRef, useState } from "react";
import socket from "../socket/socket";
import "./Chat.css";
import Footer from "../components/Footer";

function Chat() {
  const [message, setMessage] =useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [room, setRoom] = useState("General");
  const [darkMode, setDarkMode] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!joined) return;

    socket.connect();

    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
      setTypingUser("");
    });

    socket.on("user_typing", (name) => {
      setTypingUser(`${name} is typing...`);
    });

    socket.on("user_stop_typing", () => {
      setTypingUser("");
    });

    return () => {
      socket.off("online_users");
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
      socket.disconnect();
    };
  }, [joined]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send_message", {
      room,
      username,
      text: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    socket.emit("stop_typing", room);
    setMessage("");
  };

  // ==========================
  // JOIN PAGE
  // ==========================

  if (!joined) {
    return (
      <div className="join-page">
        <div className="join-card">
          <h1>💬 ProChat</h1>

          <p className="join-subtitle">
            Real-Time Chat with Socket.IO
          </p>

          <div className="join-group">
            <label>Choose Room</label>

            <select
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            >
              <option value="General">🏠 General</option>
              <option value="Developers">💻 Developers</option>
              <option value="Gaming">🎮 Gaming</option>
            </select>
          </div>

          <div className="join-group">
            <label>Username</label>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <button
            className="join-btn"
            onClick={() => {
              if (!username.trim()) return;

              socket.connect();

              socket.emit("join_room", {
                room,
                username,
              });

              setJoined(true);
            }}
          >
            🚀 Join Chat
          </button>
        </div>
      </div>
    );
  }

  // ==========================
  // CHAT PAGE
  // ==========================

  return (
    <div className={`chat-page ${darkMode ? "dark" : ""}`}>
      <div className="chat-container">

        {/* Sidebar */}

        <aside className="sidebar">

          <h2>💬 ProChat</h2>

          <div className="sidebar-section">
            <strong>User</strong>
            <p>👤 {username}</p>
          </div>

          <div className="sidebar-section">
            <strong>Room</strong>
            <p>🏠 {room}</p>
          </div>

          <div className="sidebar-section">
            <strong>Online Users</strong>

            {onlineUsers.length === 0 ? (
              <p>No users online</p>
            ) : (
              <div className="online-list">
                {onlineUsers.map((user) => (
                  <div className="online-user" key={user}>
                    <span className="online-dot"></span>
                    {user}
                  </div>
                ))}
              </div>
            )}
          </div>

        </aside>

        {/* Chat */}

        <main className="chat-section">

          <div className="chat-header">

            <div>
              <h3>{room}</h3>
              <small>{messages.length} Messages</small>
            </div>

            <button
              className="theme-btn"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>

          </div>

          <div className="messages">

            {messages.length === 0 ? (
              <div className="empty-chat">
                <h3>💬 No Messages Yet</h3>
                <p>Start the conversation!</p>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (

                  <div
                    key={index}
                    className={
                      msg.system
                        ? "system-message"
                        : `message ${
                            msg.username === username
                              ? "my-message"
                              : "other-message"
                          }`
                    }
                  >

                    {!msg.system && (

                      <div className="message-user">

                        <div className="avatar">
                          {msg.username.charAt(0).toUpperCase()}
                        </div>

                        <strong>{msg.username}</strong>

                      </div>

                    )}

                    <p>{msg.text}</p>

                    <small>{msg.time}</small>

                  </div>

                ))}

                <div ref={messagesEndRef}></div>

              </>
            )}

          </div>

          {typingUser && (
            <div className="typing">
              {typingUser}
            </div>
          )}

          <div className="input-area">

            <input
              value={message}
              placeholder="Type your message..."
              onChange={(e) => {

                setMessage(e.target.value);

                if (e.target.value) {
                  socket.emit("typing", {
                    room,
                    username,
                  });
                } else {
                  socket.emit("stop_typing", room);
                }

              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button onClick={sendMessage}>
              Send
            </button>

          </div>

        </main>

      </div>
      <Footer />
    </div>
  );
}

export default Chat;