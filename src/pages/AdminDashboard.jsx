// src/pages/AdminDashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Tv, Ban, AlertTriangle, StampIcon } from "lucide-react";
import ManageUsers from "../components/admin/ManageUsers";
import ManageChannels from "../components/admin/ManageChannels";
import ManageBannedWords from "../components/admin/ManageBannedWords";
import ManageReports from "../components/admin/ManageReports";
import ManageApproval from "../components/admin/ManageApproval";
import "../styles/Admin.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2>⚙️ Admin Panel</h2>
        <ul>
          <li className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
            <Users size={18} /> Manage Users
          </li>
          <li className={activeTab === "channels" ? "active" : ""} onClick={() => setActiveTab("channels")}>
            <Tv size={18} /> Channels
          </li>
          <li className={activeTab === "banned" ? "active" : ""} onClick={() => setActiveTab("banned")}>
            <Ban size={18} /> Banned Words
          </li>
          <li className={activeTab === "approval" ? "active" : ""} onClick={() => setActiveTab("approval")}>
            <StampIcon size={18} /> Approval
          </li>
          <li className={activeTab === "reports" ? "active" : ""} onClick={() => setActiveTab("reports")}>
            <AlertTriangle size={18} /> Reports
          </li>
          
        </ul>

        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </aside>

      <main className="admin-main">
        {activeTab === "users" && <ManageUsers />}
        {activeTab === "channels" && <ManageChannels />}
        {activeTab === "banned" && <ManageBannedWords />}
        {activeTab === "reports" && <ManageReports />}
        {activeTab === "approval" && <ManageApproval />}
          
      </main>
    </div>
  );
}
