import "./MessageBubble.css";

function MessageBubble({ msg, username }) {
  return (
    <div
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
  );
}

export default MessageBubble;