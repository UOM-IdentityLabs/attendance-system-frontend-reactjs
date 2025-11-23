import React, { useState } from "react";
import authService from "../../services/authService";
import "./Login.css";

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(
        formData.email,
        formData.password
      );

      // Handle successful login
      console.log("Login successful:", response);

      // Store token if provided
      if (response.token) {
        localStorage.setItem("authToken", response.token);
      }

      // Store user information in localStorage
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      // Clear form
      setFormData({ email: "", password: "" });

      // Success feedback
      console.log("Login successful! Redirecting to dashboard...");

      // Call the success callback to update parent component
      if (onLoginSuccess && response.user) {
        onLoginSuccess(response.user);
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle different error scenarios
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          "Login failed";

        if (status === 401) {
          setErrors({
            general: "Invalid email or password. Please try again.",
          });
        } else if (status === 429) {
          setErrors({
            general: "Too many login attempts. Please try again later.",
          });
        } else {
          setErrors({ general: errorMessage });
        }
      } else if (error.request) {
        // Network error
        setErrors({
          general:
            "Unable to connect to server. Please check your internet connection.",
        });
      } else {
        // Other error
        setErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
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

          {/* General error message */}
          {errors.general && (
            <div className="error-message general-error">{errors.general}</div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} noValidate>
            {/* Email */}
            <div className="form-group">
              <label className="form-label">
                Email<span className="required">*</span>
              </label>
              <div className="form-input-wrapper">
                <input
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? "error" : ""}`}
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <div className="error-message field-error">{errors.email}</div>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">
                Password<span className="required">*</span>
              </label>
              <div className="form-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`form-input ${errors.password ? "error" : ""}`}
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // Eye slash icon (hide password)
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    // Eye icon (show password)
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="error-message field-error">
                  {errors.password}
                </div>
              )}
            </div>

            {/* Login button */}
            <button
              type="submit"
              className={`login-button ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner">
                  <svg className="spinner" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray="31.416"
                      strokeDashoffset="31.416"
                    />
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
