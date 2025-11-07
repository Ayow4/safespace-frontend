import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Sidebar from "../components/Sidebar";
import "../styles/Chatroom.css";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL.replace("/api", "");
let socket;

function Chatroom() {
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState("");
  const [messages, setMessages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [userStatuses, setUserStatuses] = useState({});
  const [isReady, setIsReady] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios
      .get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsername(res.data.username);
        localStorage.setItem("user", JSON.stringify(res.data)); // store full user info

        if (!socket) {
          socket = io(API_URL);
        }

        socket.emit("setUser", { userId: res.data._id, username: res.data.username });

        // 🔹 Clean old listeners before reattaching
        socket.off("channelList");
        socket.off("receiveMessage");
        socket.off("channelMessages");
        socket.off("userStatusList");
        socket.off("userStatusUpdate");


        // SOCKET LISTENERS
        socket.on("usernameUpdated", ({ oldUsername, newUsername }) => {
  setMessages((prev) =>
    prev.map((m) => (m.user === oldUsername ? { ...m, user: newUsername } : m))
  );

  // Also update userStatuses mapping keys if you use username as key
  setUserStatuses((prev) => {
    if (!prev[oldUsername]) return prev;
    const newEntry = { ...prev[oldUsername] };
    const { [oldUsername]: _, ...rest } = prev;
    return { ...rest, [newUsername]: newEntry };
  });

  // if current user updated name, update username state/localStorage
  const local = JSON.parse(localStorage.getItem("user") || "null");
  if (local && local.username === oldUsername) {
    local.username = newUsername;
    localStorage.setItem("user", JSON.stringify(local));
    setUsername(newUsername);
  }
});

        socket.on("channelList", (updatedChannels) => {
          setChannels(updatedChannels);
          if (!currentChannel && updatedChannels.length > 0) {
            setCurrentChannel(updatedChannels[0]);
            socket.emit("joinChannel", updatedChannels[0]);
          }
        });

        socket.on("receiveMessage", (message) => {
          // 🔹 No more frontend censoring, trust backend
          setMessages((prev) => [...prev, message]);
        });

        socket.on("channelMessages", (channelMessages) => {
          setMessages(channelMessages);
        });

        socket.on("userStatusList", (users) => {
          const statusMap = {};
          users.forEach((u) => {
            statusMap[u.username] = {
              isOnline: u.isOnline,
              lastSeen: u.lastSeen,
            };
          });
          setUserStatuses(statusMap);
        });

        socket.on("userStatusUpdate", (data) => {
          setUserStatuses((prev) => ({
            ...prev,
            [data.username]: {
              isOnline: data.isOnline,
              lastSeen: data.lastSeen,
            },
          }));
        });

        socket.on("forceLogout", (data) => {
        const currentUser = localStorage.getItem("user");
        if (data.username === currentUser) {
          alert("🚫 You have been banned and will be logged out.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      });

        setIsReady(true);
      })
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
  if (!newMessage.trim()) return;

  const currentUser = JSON.parse(localStorage.getItem("user"));

  socket.emit("sendMessage", {
    channel: currentChannel,
    user: currentUser.username,
    avatar: currentUser.avatar || "",
    text: newMessage,
  });

  setNewMessage("");
};

  const handleAddChannel = (name) => {
    if (!name.trim()) return;
    socket.emit("createChannel", name);
    setCurrentChannel(name);
    setMessages([]);
    socket.emit("joinChannel", name);
  };

  const handleSelectChannel = (channel) => {
    setCurrentChannel(channel);
    setMessages([]);
    socket.emit("joinChannel", channel);
    setSidebarOpen(false);
  };

  // ✅ Sync username changes (update messages + socket username)
useEffect(() => {
  const handleStorageChange = () => {
    const updatedUser = JSON.parse(localStorage.getItem("user"));
    if (updatedUser?.username && updatedUser.username !== username) {
      const newName = updatedUser.username;

      if (updatedUser?.avatar) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.user === updatedUser.username
              ? { ...msg, avatar: updatedUser.avatar }
              : msg
          )
        );
      }
      

      // ✅ Update username in state
      setUsername(newName);

      // ✅ Update socket identity
      if (socket) {
        socket.emit("setUser", {
        userId: JSON.parse(localStorage.getItem("user"))._id,
        username: newName,
      });
      }

      // ✅ Update old messages in UI
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.user === username ? { ...msg, user: newName } : msg
        )
      );
    }
  };

  

  window.addEventListener("storage", handleStorageChange);

  

  // Also handle same-tab updates immediately
  const updatedUser = JSON.parse(localStorage.getItem("user"));
  if (updatedUser?.username && updatedUser.username !== username) {
    const newName = updatedUser.username;

    setUsername(newName);
    if (socket) {
      socket.emit("setUser", {
        userId: JSON.parse(localStorage.getItem("user"))._id,
        username: newName,
      });
    }

    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.user === username ? { ...msg, user: newName } : msg
      )
    );
  }

  return () => window.removeEventListener("storage", handleStorageChange);
}, [username]);

  if (!isReady) {
    return <div className="loading">Loading chatroom...</div>;
  }

  

  return (
    <div className="chatroom-container">
      {sidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar
        channels={channels}
        onSelectChannel={handleSelectChannel}
        onAddChannel={handleAddChannel}
        isOpen={sidebarOpen}
        toggleSidebar={setSidebarOpen}
        activeChannel={currentChannel}
      />

      <div className="chatroom-content">
        <div className="chatroom-header">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h2>{currentChannel}</h2>
        </div>

        <div className="chatroom-body">
          <div className="messages">
            {messages.map((msg, idx) => {
              const isSelf = msg.user === username;
              const userStatus = userStatuses[msg.user];
              return (
                <div
                  key={msg._id || idx}
                  className={`message ${isSelf ? "self" : "other"}`}
                >
                  {isSelf && (
                        <div className="avatar">
                          {msg.avatar ? (
                            <img
                              src={
                                msg.avatar.startsWith("http")
                                  ? msg.avatar
                                  : `${API_URL}${msg.avatar}`
                              }
                              alt="avatar"
                              className="chat-avatar-img"
                            />
                          ) : (
                            msg.user[0].toUpperCase()
                          )}
                        </div>
                      )}
                  <div className="bubble">
                    {!isSelf && (
                      <div className="username">
                        {msg.user}
                        <span
                          className={`status-dot ${
                            userStatus?.isOnline ? "online" : "offline"
                          }`}
                        ></span>
                        {!userStatus?.isOnline && userStatus?.lastSeen && (
                          <span className="last-seen">
                            Last seen:{" "}
                            {new Date(userStatus.lastSeen).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text">{msg.text}</div>
                    <div className="timestamp">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {!isSelf && (
                    <div className="avatar">
                      {msg.avatar ? (
                        <img
                          src={
                            msg.avatar.startsWith("http")
                              ? msg.avatar
                              : `${API_URL}${msg.avatar}`
                          }
                          alt="avatar"
                          className="chat-avatar-img"
                        />
                      ) : (
                        msg.user[0].toUpperCase()
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>➤</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatroom;
