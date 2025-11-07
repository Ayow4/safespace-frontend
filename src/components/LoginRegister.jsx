import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Auth.css";

export default function LoginRegister({ isLogin: defaultIsLogin = true }) {
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // --- LOGIN ---
        const res = await axios.post(`${API_URL}/auth/login`, {
          email: form.email,
          password: form.password,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        setMessage("✅ Login successful! Redirecting...");
        setIsError(false);

        const redirectPath =
          res.data.user?.role === "admin" ? "/admin" : "/chatroom";
        setTimeout(() => navigate(redirectPath), 1000);
      } else {
        // --- REGISTER with image ---
        const formData = new FormData();
        formData.append("username", form.username);
        formData.append("email", form.email);
        formData.append("password", form.password);
        if (file) formData.append("loadsheet", file);

        await axios.post(`${API_URL}/auth/register`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setMessage("✅ Registered successfully! Check email for verification.");
        setIsError(false);
        navigate("/verify", { state: { email: form.email } });
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "❌ Something went wrong.";
      setMessage(errorMsg);
      setIsError(true);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? "Welcome Back 👋" : "Join SafeSpace ✨"}</h2>
        <p className="subtitle">
          {isLogin
            ? "Login to continue your anonymous journey"
            : "Create an account to start your SafeSpace"}
        </p>

        {message && (
          <div
            className={`alert-box ${isError ? "error" : "success"}`}
            role="alert"
          >
            {message}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Loadsheet (School ID / Document)</label>
                <input type="file" name="loadsheet" onChange={handleFileChange} />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-btn">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="switch-text">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Register here" : "Login here"}
          </span>
        </p>
      </div>
    </div>
  );
}
