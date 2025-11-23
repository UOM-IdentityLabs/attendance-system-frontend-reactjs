import React from "react";
import authService from "../services/authService";
import "./Header.css";

const Header = ({ user, onLogout }) => {
  const handleLogout = () => {
    authService.logout();
    if (onLogout) {
      onLogout();
    }
    // Reload the page to trigger re-authentication check
    window.location.reload();
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h2>Student Attendance System</h2>
        </div>
        <div className="header-right">
          <span className="user-info">
            Welcome, {user?.name || user?.email || "User"} (
            {user?.role?.replace("_", " ")})
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
