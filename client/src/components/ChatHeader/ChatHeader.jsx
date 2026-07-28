import "./ChatHeader.css";

function ChatHeader({ room, darkMode, setDarkMode }) {
  return (
    <div className="chat-header">
      <h2>{room}</h2>

      <button
        className="theme-btn"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>
    </div>
  );
}

export default ChatHeader;