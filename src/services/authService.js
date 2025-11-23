import apiClient from "./api";

export const authService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem("authToken");
    return !!token;
  },

  // Get current token
  getToken: () => {
    return localStorage.getItem("authToken");
  },

  // Get current user
  getUser: () => {
    const userString = localStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  },

  // Get user role
  getUserRole: () => {
    const user = authService.getUser();
    return user ? user.role : null;
  },
};

export default authService;
