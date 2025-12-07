import React, { useState } from "react";
import Sidebar from "./Sidebar";
import UserProfile from "./UserProfile";
import YearsManagement from "./YearsManagement";
import GroupsManagement from "./GroupsManagement";
import CoursesManagement from "./CoursesManagement";
import AdminsManagement from "./AdminsManagement";
import "./DashboardLayout.css";

const DashboardLayout = ({ user, children }) => {
  const [selectedMenu, setSelectedMenu] = useState("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleMenuSelect = (menuId) => {
    setSelectedMenu(menuId);
    setIsMobileSidebarOpen(false); // Close mobile sidebar when item is selected
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const renderMainContent = () => {
    // Debug: Log user role to see what we're getting
    console.log("User role:", user?.role);

    switch (selectedMenu) {
      case "overview":
        return (
          <div className="content-page">
            <div className="welcome-section">
              <h1>
                {user?.role === "department_head" ||
                user?.role === "departmentHead"
                  ? "Department Head Dashboard"
                  : user?.role === "teacher"
                  ? "Teacher Dashboard"
                  : "Student Dashboard"}
              </h1>
              <p>
                Welcome, {user?.name || user?.email}!{" "}
                {user?.role === "department_head" ||
                user?.role === "departmentHead"
                  ? "Manage your department's attendance and academic activities."
                  : user?.role === "teacher"
                  ? "Manage your classes and track student attendance."
                  : "Track your attendance and academic progress."}
              </p>
            </div>

            <div className="stats-grid">
              {(user?.role === "department_head" ||
                user?.role === "departmentHead") && (
                <>
                  <div className="stat-card">
                    <div className="stat-label">TOTAL STUDENTS</div>
                    <div className="stat-value">1,247</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">TOTAL TEACHERS</div>
                    <div className="stat-value">89</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">ACTIVE COURSES</div>
                    <div className="stat-value">42</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">ATTENDANCE RATE</div>
                    <div className="stat-value">94.2%</div>
                  </div>
                </>
              )}

              {user?.role === "teacher" && (
                <>
                  <div className="stat-card">
                    <div className="stat-label">MY CLASSES</div>
                    <div className="stat-value">6</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">TOTAL STUDENTS</div>
                    <div className="stat-value">156</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">TODAY'S ATTENDANCE</div>
                    <div className="stat-value">92%</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">PENDING REVIEWS</div>
                    <div className="stat-value">8</div>
                  </div>
                </>
              )}

              {user?.role === "student" && (
                <>
                  <div className="stat-card">
                    <div className="stat-label">ENROLLED COURSES</div>
                    <div className="stat-value">8</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">ATTENDANCE RATE</div>
                    <div className="stat-value">96%</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">CLASSES TODAY</div>
                    <div className="stat-value">4</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">MISSED CLASSES</div>
                    <div className="stat-value">3</div>
                  </div>
                </>
              )}
            </div>

            <div className="content-card">
              <div className="content-header">
                <h2 className="content-title">
                  {user?.role === "department_head" ||
                  user?.role === "departmentHead"
                    ? "Department Overview"
                    : user?.role === "teacher"
                    ? "My Teaching Activities"
                    : "My Academic Progress"}
                </h2>
              </div>
              <p>
                {user?.role === "department_head" ||
                user?.role === "departmentHead"
                  ? "Access comprehensive tools to manage your department's academic operations, monitor attendance rates, and oversee faculty activities."
                  : user?.role === "teacher"
                  ? "Track attendance, manage class schedules, and monitor student performance across all your assigned courses."
                  : "View your attendance records, upcoming classes, and academic performance across all enrolled courses."}
              </p>
            </div>
          </div>
        );
      case "students":
        return (
          <div className="content-page">
            <h1>Students</h1>
            <p>Manage student records and attendance.</p>
          </div>
        );
      case "teachers":
        return (
          <div className="content-page">
            <h1>Teachers</h1>
            <p>Manage teacher profiles and assignments.</p>
          </div>
        );
      case "admins":
        return <AdminsManagement />;
      case "courses":
        return <CoursesManagement />;
      case "groups":
        return <GroupsManagement />;
      case "years":
        return <YearsManagement />;
      case "userProfile":
        return <UserProfile />;
      default:
        return (
          <div className="content-page">
            <h1>Welcome</h1>
            <p>Select a menu item to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={toggleMobileSidebar}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Sidebar */}
      <Sidebar
        user={user}
        onMenuSelect={handleMenuSelect}
        selectedMenu={selectedMenu}
        className={isMobileSidebarOpen ? "mobile-open" : ""}
      />

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-content">{children || renderMainContent()}</main>
    </div>
  );
};

export default DashboardLayout;
