import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Tv, Ban, AlertTriangle, StampIcon, X, Menu } from "lucide-react";
import ManageUsers from "../components/admin/ManageUsers";
import ManageChannels from "../components/admin/ManageChannels";
import ManageBannedWords from "../components/admin/ManageBannedWords";
import ManageReports from "../components/admin/ManageReports";
import ManageApproval from "../components/admin/ManageApproval";
import "../styles/Admin.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="admin-container">
      {/* Mobile Menu Button */}
      <button
        className="menu-toggle"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Close Button for mobile */}
        <button className="close-sidebar-btn" onClick={() => setSidebarOpen(false)}>
          <X size={20} />
        </button>

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

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main" onClick={() => sidebarOpen && setSidebarOpen(false)}>
        {activeTab === "users" && <ManageUsers />}
        {activeTab === "channels" && <ManageChannels />}
        {activeTab === "banned" && <ManageBannedWords />}
        {activeTab === "reports" && <ManageReports />}
        {activeTab === "approval" && <ManageApproval />}
      </main>
    </div>
  );
}
