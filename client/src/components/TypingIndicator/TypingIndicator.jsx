import "./TypingIndicator.css";

function TypingIndicator({ typingUser }) {
  if (!typingUser) return null;

  return (
    <div className="typing">
      {typingUser}
    </div>
  );
}

export default TypingIndicator;