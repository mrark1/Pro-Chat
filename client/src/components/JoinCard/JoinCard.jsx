import { useEffect, useRef, useState } from "react";
import socket from "../socket/socket";
import "./Chat.css";
import Footer from "../components/Footer";

function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [room, setRoom] = useState("General");
  const [darkMode, setDarkMode] = useState(false);

  // Dummy online users
  const [onlineUsers] = useState([
    "Arpit",
    "Rahul",
    "Alex",
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!joined) return;

    socket.connect();

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
      time: new Date().toLocaleTimeString(),
    });

    socket.emit("stop_typing", room);

    setMessage("");
  };

  // =============================
  // JOIN SCREEN
  // =============================

  if (!joined) {
    return (
      <div
        style={{
          display: "grid",
          placeItems: "center",
          height: "100vh",
          background: "#f4f4f4",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "12px",
            width: "320px",
            textAlign: "center",
            boxShadow: "0 10px 25px rgba(0,0,0,.15)",
          }}
        >
          <h2>🚀 Join ProChat</h2>

          <select
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "20px",
              marginBottom: "15px",
            }}
          >
            <option value="General">🏠 General</option>
            <option value="Developers">💻 Developers</option>
            <option value="Gaming">🎮 Gaming</option>
          </select>

          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
            }}
          />

          <button
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

  // =============================
  // CHAT SCREEN
  // =============================

  return (
    <div className={`chat-page ${darkMode ? "dark" : ""}`}>
      <div className="chat-container">

        {/* Sidebar */}

        <div className="sidebar">
          <h2>💬 ProChat</h2>

          <p><strong>User</strong></p>
          <p>👤 {username}</p>

          <br />

          <p><strong>Room</strong></p>
          <p>🏠 {room}</p>

          <br />

          <p><strong>Online Users</strong></p>

          {onlineUsers.map((user) => (
            <p key={user}>🟢 {user}</p>
          ))}
        </div>

        {/* Chat */}

        <div className="chat-section">

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

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${
                  msg.username === username
                    ? "my-message"
                    : "other-message"
                }`}
              >
                <strong>{msg.username}</strong>

                <p>{msg.text}</p>

                <small>{msg.time}</small>
              </div>
            ))}

            <div ref={messagesEndRef}></div>

          </div>

          {typingUser && (
            <div className="typing">
              {typingUser}
            </div>
          )}

          <div className="input-area">

            <input
              value={message}
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
              placeholder="Type your message..."
            />

            <button onClick={sendMessage}>
              Send
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Chat;