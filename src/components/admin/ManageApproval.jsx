import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ManageApproval() {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch pending approvals
  const fetchPendingUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/pending-approvals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingUsers(res.data);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to fetch pending users");
    }
  };

  // Approve user
  const handleApprove = async (id) => {
    try {
      await axios.put(
        `${API_URL}/auth/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingUsers(pendingUsers.filter((u) => u._id !== id));
      alert("✅ User approved successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to approve user");
    }
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setShowModal(false);
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <div>
      <h2>🟢 Pending User Approvals</h2>

      {pendingUsers.length === 0 ? (
        <p>No users waiting for approval.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>👤 Username</th>
              <th>📧 Email</th>
              <th>📅 Registered</th>
              <th>⚙️ Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{new Date(user.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleView(user)}>👁️ View</button>{" "}
                  <button
                    onClick={() => handleApprove(user._id)}
                    className="approve-btn"
                  >
                    ✅ Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* MODAL */}
      {showModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>👤 {selectedUser.username}'s Registration Info</h3>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p>
              <strong>Registered:</strong>{" "}
              {new Date(selectedUser.createdAt).toLocaleString()}
            </p>

            {selectedUser.loadsheet ? (
              <>
                <p><strong>Loadsheet:</strong></p>
                <a
                href={`${API_URL.replace(/\/api$/, "")}/${selectedUser.loadsheet.replace(/^\/+/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                >
                <img
                    src={`${API_URL.replace(/\/api$/, "")}/${selectedUser.loadsheet.replace(/^\/+/, "")}`}
                    alt="User Loadsheet"
                    style={{
                    width: "100%",
                    maxWidth: "400px",
                    borderRadius: "8px",
                    marginTop: "10px",
                    cursor: "pointer",
                    transition: "transform 0.2s ease-in-out",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
                </a>
              </>
            ) : (
              <p>❌ No loadsheet uploaded.</p>
            )}

            <button
              onClick={handleCloseModal}
              className="close-modal-btn"
              style={{ marginTop: "10px" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
