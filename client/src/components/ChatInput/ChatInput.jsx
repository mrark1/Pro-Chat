import "./ChatInput.css";

function ChatInput({
  message,
  setMessage,
  sendMessage,
  socket,
  room,
  username,
}) {
  return (
    <div className="input-area">
      <input
        value={message}
        placeholder="Type a message..."
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
      />

      <button onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}

export default ChatInput;