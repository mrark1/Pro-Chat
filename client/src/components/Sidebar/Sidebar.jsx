import "./Sidebar.css";

function Sidebar({ username, room, onlineUsers }) {
  return (
    <div className="sidebar">
      <h2>💬 ProChat</h2>

      <div className="section">
        <h4>User</h4>
        <p>👤 {username}</p>
      </div>

      <div className="section">
        <h4>Room</h4>
        <p>🏠 {room}</p>
      </div>

      <div className="section">
        <h4>Online</h4>

        <div className="online-list">
  {onlineUsers.map((user) => (
    <div className="online-user" key={user}>
      <span className="online-dot"></span>
      {user}
    </div>
  ))}
</div>
      </div>
    </div>
  );
}

export default Sidebar;