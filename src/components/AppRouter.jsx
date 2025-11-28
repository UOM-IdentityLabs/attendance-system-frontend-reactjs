import React, { useState, useEffect } from "react";
import authService from "../services/authService";
import { Login, DepartmentHead, Teacher, Student } from "../pages";

const AppRouter = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on component mount
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      const user = authService.getUser();

      setIsAuthenticated(authenticated);
      setCurrentUser(user);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (for login/logout across tabs)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#6b7280",
        }}
      >
        Loading...
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return (
      <Login
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  // Route based on user role
  const renderRoleBasedPage = () => {
    if (!currentUser || !currentUser.role) {
      // If no role is found, logout and redirect to login
      authService.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
      return <Login />;
    }

    switch (currentUser.role) {
      case "department_head":
      case "departmentHead":
        return <DepartmentHead user={currentUser} />;
      case "teacher":
        return <Teacher user={currentUser} />;
      case "student":
        return <Student user={currentUser} />;
      default:
        // Unknown role, logout and redirect
        authService.logout();
        setIsAuthenticated(false);
        setCurrentUser(null);
        return <Login />;
    }
  };

  return renderRoleBasedPage();
};

export default AppRouter;
