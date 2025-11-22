import React from "react";

const StudentAttendanceLogin = () => {
  return (
    <>
      {/* Inline CSS */}
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        body {
          background-color: #f5f7fb;
        }

        .login-page {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: stretch;
          justify-content: center;
          background-color: #f5f7fb;
        }

        .login-left {
          flex: 1;
          background-image: url("src/assets/sedan.jpg");
          background-size: cover;
          background-position: center;
        }

        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f5f7fb;
        }

        .login-card {
          width: 60%;
          max-width: 520px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          padding: 40px 50px;
        }

        .logo-row {
          display: flex;
          align-items: center;
          margin-bottom: 24px;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          margin-right: 10px;
        }

        .logo-text-main {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .logo-text-sub {
          font-size: 11px;
          color: #6b7280;
        }

        .welcome-text {
          margin-bottom: 32px;
        }

        .welcome-text p {
          font-size: 13px;
          color: #6b7280;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }

        .required {
          color: #ef4444;
        }

        .form-input-wrapper {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 4px;
          border: 1px solid #d1d5db;
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .form-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.2);
        }

        .login-button {
          width: 100%;
          margin-top: 10px;
          padding: 10px 0;
          border: none;
          border-radius: 4px;
          background-color: #1f2933;
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.15s ease, transform 0.05s ease;
        }

        .login-button:hover {
          background-color: #111827;
        }

        .login-button:active {
          transform: translateY(1px);
        }

        @media (max-width: 900px) {
          .login-page {
            flex-direction: column;
          }

          .login-left {
            display: none;
          }

          .login-right {
            flex: none;
            height: 100vh;
          }

          .login-card {
            width: 90%;
            padding: 30px 24px;
          }
        }
      `}</style>

      <div className="login-page">
        {/* Left image side */}
        <div className="login-left" />

        {/* Right form side */}
        <div className="login-right">
          <div className="login-card">
            {/* Logo + title */}
            <div className="logo-row">
              <svg
                className="logo-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 4L12 2L20 4V11C20 16 16.4183 20 12 22C7.58172 20 4 16 4 11V4Z"
                  fill="#1f2937"
                  opacity="0.9"
                />
                <path
                  d="M9 10L11.5 6L14 10H12.8L11.5 7.9L10.2 10H9Z"
                  fill="white"
                />
              </svg>
              <div>
                <div className="logo-text-main">Student Attendance</div>
                <div className="logo-text-sub">Dashboard Login</div>
              </div>
            </div>

            {/* Welcome text */}
            <div className="welcome-text">
              <p>Welcome back, please enter your information.</p>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">
                Email<span className="required">*</span>
              </label>
              <div className="form-input-wrapper">
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter Email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">
                Password<span className="required">*</span>
              </label>
              <div className="form-input-wrapper">
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter Password"
                />
              </div>
            </div>

            {/* Login button */}
            <button className="login-button">Login</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentAttendanceLogin;
