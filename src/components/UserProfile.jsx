import React, { useState, useEffect } from "react";
import apiClient from "../services/api";
import "./UserProfile.css";

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/users/me");
      setUserProfile(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("Failed to load user profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatFullName = (person) => {
    if (!person) return "N/A";
    const names = [
      person.firstName,
      person.secondName,
      person.thirdName,
      person.fourthName,
    ].filter(Boolean);
    return names.join(" ") || "N/A";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatRole = (role) => {
    if (!role) return "N/A";
    return role
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const getInitials = (person) => {
    if (!person) return "U";
    const firstName = person.firstName || "";
    const secondName = person.secondName || "";
    return `${firstName.charAt(0)}${secondName.charAt(0)}`.toUpperCase() || "U";
  };

  if (loading) {
    return (
      <div className="user-profile-container">
        <div className="loading-state">
          <div className="loading-spinner">
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
          </div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-container">
        <div className="error-state">
          <div className="error-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h3>Unable to load profile</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchUserProfile}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const person =
    userProfile?.departmentHead?.person ||
    userProfile?.teacher?.person ||
    userProfile?.student?.person;
  const department =
    userProfile?.departmentHead?.department ||
    userProfile?.teacher?.department ||
    userProfile?.student?.department;

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <h1>User Profile</h1>
        <p>Manage your personal information and account settings</p>
      </div>

      <div className="profile-content">
        {/* Profile Avatar & Basic Info */}
        <div className="profile-card main-info">
          <div className="avatar-section">
            <div className="avatar">
              {person?.image ? (
                <img src={person.image} alt="Profile" />
              ) : (
                <span className="avatar-initials">{getInitials(person)}</span>
              )}
            </div>
            <div className="basic-info">
              <h2 className="full-name">{formatFullName(person)}</h2>
              <p className="role">{formatRole(userProfile?.role)}</p>
              <p className="email">{userProfile?.email}</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="profile-card personal-info">
          <div className="card-header">
            <h3>Personal Information</h3>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <label>First Name</label>
              <span>{person?.firstName || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Second Name</label>
              <span>{person?.secondName || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Third Name</label>
              <span>{person?.thirdName || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Fourth Name</label>
              <span>{person?.fourthName || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Phone Number</label>
              <span>{person?.phone || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Birth Date</label>
              <span>{formatDate(person?.birthDate)}</span>
            </div>
            <div className="info-item">
              <label>Email Address</label>
              <span>{userProfile?.email}</span>
            </div>
            <div className="info-item">
              <label>Role</label>
              <span className="role-badge">
                {formatRole(userProfile?.role)}
              </span>
            </div>
            {department && (
              <div className="info-item">
                <label>Department</label>
                <span className="department-badge">
                  {department.departmentName}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
