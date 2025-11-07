import React, { useState, useEffect } from "react";
import axios from "axios"; // add this at the top if not already imported
import "../styles/Sidebar.css";

function Sidebar({
  channels,
  onSelectChannel,
  onAddChannel,
  isOpen,
  toggleSidebar,
  activeChannel,
}) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [user, setUser] = useState(null);
  const [editData, setEditData] = useState({
    username: "",
    email: "",
    password: "",
    avatar: null,
  });
  const [preview, setPreview] = useState(null);

  

  useEffect(() => {
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setEditData({
        username: parsedUser.username || "",
        email: parsedUser.email || "",
        password: "",
        avatar: parsedUser.avatar || null,
      });

      // ✅ Build correct avatar URL (avoid double /api and missing /uploads)
        const baseUrl = API_URL.replace("/api", "");
        const avatarUrl = parsedUser.avatar
          ? parsedUser.avatar.startsWith("http")
            ? parsedUser.avatar
            : `${baseUrl}${parsedUser.avatar.startsWith("/uploads") ? "" : "/uploads"}${parsedUser.avatar}`
          : null;

        setPreview(avatarUrl);
            }
  } catch (error) {
    console.error("Error parsing user data:", error);
  }
}, []);

  const handleAddChannel = () => {
    if (newChannelName.trim()) {
      onAddChannel(newChannelName.trim());
      setNewChannelName("");
      setShowModal(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditData((prev) => ({ ...prev, avatar: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

const handleSave = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("❌ You must be logged in to update your profile.");
      return;
    }

    const formData = new FormData();
    formData.append("username", editData.username);
    if (editData.avatar instanceof File) {
      formData.append("avatar", editData.avatar);
    }

    const res = await axios.put(`${API_URL}/auth/update`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (res.data.user) {
        const updatedUser = res.data.user;

        // ✅ Fix: ensure correct full URL (remove /api before appending /uploads)
        const baseUrl = API_URL.replace("/api", "");
        const avatarUrl = updatedUser.avatar?.startsWith("http")
          ? updatedUser.avatar
          : `${baseUrl}${updatedUser.avatar}`;

        updatedUser.avatar = avatarUrl;
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // ✅ Trigger storage event manually so Chatroom can detect change
        window.dispatchEvent(new Event("storage"));

        setUser(updatedUser);
        setPreview(avatarUrl);
        setShowEditModal(false);
        alert("✅ Profile updated successfully!");
      } else {
        alert("❌ Failed to update profile.");
      }
  } catch (err) {
    console.error("Update error:", err);
    alert("❌ Error updating profile. Please try again.");
  }
};

  return (
    <>
      {/* Mobile toggle */}
      <button className="sidebar-toggle" onClick={() => toggleSidebar(!isOpen)}>
        ☰
      </button>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* ✅ User Info Section */}
        <div className="user-profile">
          <img
            src={preview || "/default-avatar.png"}
            alt="avatar"
            className="user-avatar"
          />
          <h3 className="username">{user?.username || "Anonymous"}</h3>
        </div>

        <div className="sidebar-header">
          <h2 className="sidebar-title">🌐 Channels</h2>
        </div>

        <button className="add-channel-btn" onClick={() => setShowModal(true)}>
          + Add
        </button>

        <ul className="channel-list">
          {channels.map((channel, idx) => (
            <li
              key={idx}
              className={`sidebar-link ${
                activeChannel === channel ? "active" : ""
              }`}
              onClick={() => {
                onSelectChannel(channel);
                toggleSidebar(false);
              }}
            >
              #{channel}
            </li>
          ))}
        </ul>

        {/* ✅ Sidebar footer */}
        <div className="sidebar-footer">
          <button
            className="edit-btn"
            onClick={() => setShowEditModal(true)}
          >
            ✏️ Edit Info
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Create Channel Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Channel</h3>
            <input
              type="text"
              placeholder="Channel name..."
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
            />
            <div className="modal-buttons">
              <button
                className="modal-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="modal-add" onClick={handleAddChannel}>
                Add Channel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Edit Info Modal */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Profile</h3>
            <div className="edit-profile-form">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={editData.username}
                onChange={handleEditChange}
              />

              <label>Avatar</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />

              {preview && (
                <img src={preview} alt="preview" className="avatar-preview" />
              )}

              <div className="modal-buttons">
                <button
                  className="modal-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button className="modal-add" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
