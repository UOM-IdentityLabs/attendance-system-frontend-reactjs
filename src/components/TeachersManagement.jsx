import React, { useState, useEffect } from "react";
import apiClient from "../services/api";
import "./TeachersManagement.css";

const TeachersManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    secondName: "",
    thirdName: "",
    fourthName: "",
    specialization: "",
    image: "",
    phone: "",
    birthDate: "",
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  const limit = 100;

  useEffect(() => {
    fetchTeachers();
  }, [currentPage]);

  const fetchTeachers = async (searchValue = searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      const offset = (currentPage - 1) * limit;
      let url = `/teachers?limit=${limit}&offset=${offset}`;

      if (searchValue && searchValue.trim()) {
        url += `&search=${encodeURIComponent(searchValue.trim())}`;
      }

      const response = await apiClient.get(url);
      setTeachers(response.data.teachers || []);
      setTotalTeachers(response.data.total || 0);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setError("Failed to load teachers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (!value || !value.trim()) {
      fetchTeachers("");
      return;
    }

    const newTimeout = setTimeout(() => {
      fetchTeachers(value);
    }, 500);

    setSearchTimeout(newTimeout);
  };

  const validateForm = (data) => {
    const errors = {};

    if (!data.firstName || !data.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(data.firstName.trim())) {
      errors.firstName = "First name must contain only letters and spaces";
    } else if (data.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters long";
    }

    if (!data.secondName || !data.secondName.trim()) {
      errors.secondName = "Second name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(data.secondName.trim())) {
      errors.secondName = "Second name must contain only letters and spaces";
    }

    if (!data.thirdName || !data.thirdName.trim()) {
      errors.thirdName = "Third name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(data.thirdName.trim())) {
      errors.thirdName = "Third name must contain only letters and spaces";
    }

    if (!data.fourthName || !data.fourthName.trim()) {
      errors.fourthName = "Fourth name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(data.fourthName.trim())) {
      errors.fourthName = "Fourth name must contain only letters and spaces";
    }

    if (!data.specialization || !data.specialization.trim()) {
      errors.specialization = "Specialization is required";
    } else if (data.specialization.trim().length < 2) {
      errors.specialization =
        "Specialization must be at least 2 characters long";
    } else if (data.specialization.trim().length > 100) {
      errors.specialization = "Specialization must not exceed 100 characters";
    }

    if (!data.phone || !data.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{8,15}$/.test(data.phone.trim())) {
      errors.phone = "Phone number must be 8-15 digits";
    }

    if (!data.birthDate) {
      errors.birthDate = "Birth date is required";
    } else {
      const birthDate = new Date(data.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 22 || age > 70) {
        errors.birthDate = "Age must be between 22 and 70 years";
      }
    }

    if (!data.email || !data.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!selectedTeacher && (!data.password || data.password.length < 6)) {
      errors.password = "Password must be at least 6 characters long";
    }

    return errors;
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post("/teachers", {
        firstName: formData.firstName.trim(),
        secondName: formData.secondName.trim(),
        thirdName: formData.thirdName.trim(),
        fourthName: formData.fourthName.trim(),
        specialization: formData.specialization.trim(),
        image: formData.image.trim() || null,
        phone: formData.phone.trim(),
        birthDate: formData.birthDate,
        email: formData.email.trim(),
        password: formData.password,
      });

      setShowAddModal(false);
      setFormData({
        firstName: "",
        secondName: "",
        thirdName: "",
        fourthName: "",
        specialization: "",
        image: "",
        phone: "",
        birthDate: "",
        email: "",
        password: "",
      });
      setFormErrors({});
      await fetchTeachers();
    } catch (err) {
      console.error("Error creating teacher:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to create teacher. Please try again.";
      setFormErrors({ submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTeacher = async (e) => {
    e.preventDefault();

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      const updateData = {
        firstName: formData.firstName.trim(),
        secondName: formData.secondName.trim(),
        thirdName: formData.thirdName.trim(),
        fourthName: formData.fourthName.trim(),
        specialization: formData.specialization.trim(),
        image: formData.image.trim() || null,
        phone: formData.phone.trim(),
        birthDate: formData.birthDate,
        email: formData.email.trim(),
      };

      if (formData.password && formData.password.trim()) {
        updateData.password = formData.password;
      }

      await apiClient.patch(`/teachers/${selectedTeacher.id}`, updateData);

      setShowEditModal(false);
      setSelectedTeacher(null);
      setFormData({
        firstName: "",
        secondName: "",
        thirdName: "",
        fourthName: "",
        specialization: "",
        image: "",
        phone: "",
        birthDate: "",
        email: "",
        password: "",
      });
      setFormErrors({});
      await fetchTeachers();
    } catch (err) {
      console.error("Error updating teacher:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to update teacher. Please try again.";
      setFormErrors({ submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeacher = async () => {
    try {
      setSubmitting(true);
      await apiClient.delete(`/teachers/${selectedTeacher.id}`);

      setShowDeleteModal(false);
      setSelectedTeacher(null);
      await fetchTeachers();
    } catch (err) {
      console.error("Error deleting teacher:", err);
      setError("Failed to delete teacher. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      firstName: teacher.person.firstName,
      secondName: teacher.person.secondName,
      thirdName: teacher.person.thirdName,
      fourthName: teacher.person.fourthName,
      specialization: teacher.specialization,
      image: teacher.person.image || "",
      phone: teacher.person.phone,
      birthDate: teacher.person.birthDate.split("T")[0],
      email: teacher.user.email,
      password: "",
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const openDeleteModal = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteModal(true);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    fetchTeachers("");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFullName = (person) => {
    return `${person.firstName} ${person.secondName} ${person.thirdName} ${person.fourthName}`.trim();
  };

  const totalPages = Math.ceil(totalTeachers / limit);

  if (loading && teachers.length === 0) {
    return (
      <div className="teachers-management-container">
        <div className="loading-state">
          <div className="loading-spinner">
            <svg className="spinner" fill="none" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                opacity="0.25"
              />
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p>Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teachers-management-container">
      <div className="page-header">
        <div className="header-content">
          <h1>Teachers Management</h1>
          <p>Manage teaching staff and faculty information</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <svg className="search-icon" fill="none" viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search teachers by name, email, phone, or specialization..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={clearSearch}>
              <svg fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setFormData({
              firstName: "",
              secondName: "",
              thirdName: "",
              fourthName: "",
              specialization: "",
              image: "",
              phone: "",
              birthDate: "",
              email: "",
              password: "",
            });
            setFormErrors({});
            setShowAddModal(true);
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Teacher
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Teachers Table */}
      <div className="table-container">
        <table className="teachers-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Specialization</th>
              <th>Birth Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="loading-cell">
                  <div className="table-loading">
                    <div className="loading-spinner">
                      <svg className="spinner" fill="none" viewBox="0 0 24 24">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          opacity="0.25"
                        />
                        <path
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </div>
                    <span>Loading teachers...</span>
                  </div>
                </td>
              </tr>
            ) : teachers.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  <div className="empty-content">
                    <svg className="empty-icon" fill="none" viewBox="0 0 24 24">
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                      />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <p>No teachers found</p>
                    {searchTerm && (
                      <button
                        className="clear-search-link"
                        onClick={clearSearch}
                      >
                        Clear search to view all teachers
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>
                    <div className="teacher-name">
                      {getFullName(teacher.person)}
                    </div>
                  </td>
                  <td>{teacher.user.email}</td>
                  <td>{teacher.person.phone}</td>
                  <td>{teacher.specialization}</td>
                  <td>{formatDate(teacher.person.birthDate)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => openEditModal(teacher)}
                        title="Edit teacher"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => openDeleteModal(teacher)}
                        title="Delete teacher"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3,6 5,6 21,6"></polyline>
                          <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2,2h4a2,2,0,0,1,2,2V6"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          <button
            className="pagination-btn"
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Teacher</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowAddModal(false);
                  setFormErrors({});
                }}
              >
                <svg fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddTeacher} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className={formErrors.firstName ? "error" : ""}
                    placeholder="Enter first name"
                  />
                  {formErrors.firstName && (
                    <span className="error-message">
                      {formErrors.firstName}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="secondName">Second Name *</label>
                  <input
                    type="text"
                    id="secondName"
                    value={formData.secondName}
                    onChange={(e) =>
                      setFormData({ ...formData, secondName: e.target.value })
                    }
                    className={formErrors.secondName ? "error" : ""}
                    placeholder="Enter second name"
                  />
                  {formErrors.secondName && (
                    <span className="error-message">
                      {formErrors.secondName}
                    </span>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="thirdName">Third Name *</label>
                  <input
                    type="text"
                    id="thirdName"
                    value={formData.thirdName}
                    onChange={(e) =>
                      setFormData({ ...formData, thirdName: e.target.value })
                    }
                    className={formErrors.thirdName ? "error" : ""}
                    placeholder="Enter third name"
                  />
                  {formErrors.thirdName && (
                    <span className="error-message">
                      {formErrors.thirdName}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="fourthName">Fourth Name *</label>
                  <input
                    type="text"
                    id="fourthName"
                    value={formData.fourthName}
                    onChange={(e) =>
                      setFormData({ ...formData, fourthName: e.target.value })
                    }
                    className={formErrors.fourthName ? "error" : ""}
                    placeholder="Enter fourth name"
                  />
                  {formErrors.fourthName && (
                    <span className="error-message">
                      {formErrors.fourthName}
                    </span>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={formErrors.email ? "error" : ""}
                    placeholder="Enter email address"
                  />
                  {formErrors.email && (
                    <span className="error-message">{formErrors.email}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone *</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={formErrors.phone ? "error" : ""}
                    placeholder="Enter phone number"
                  />
                  {formErrors.phone && (
                    <span className="error-message">{formErrors.phone}</span>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="specialization">Specialization *</label>
                  <input
                    type="text"
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialization: e.target.value,
                      })
                    }
                    className={formErrors.specialization ? "error" : ""}
                    placeholder="Enter specialization (e.g., Computer Science, Mathematics)"
                  />
                  {formErrors.specialization && (
                    <span className="error-message">
                      {formErrors.specialization}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="birthDate">Birth Date *</label>
                  <input
                    type="date"
                    id="birthDate"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                    className={formErrors.birthDate ? "error" : ""}
                  />
                  {formErrors.birthDate && (
                    <span className="error-message">
                      {formErrors.birthDate}
                    </span>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={formErrors.password ? "error" : ""}
                    placeholder="Enter password"
                  />
                  {formErrors.password && (
                    <span className="error-message">{formErrors.password}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="image">Image URL (Optional)</label>
                  <input
                    type="url"
                    id="image"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="Enter image URL"
                  />
                </div>
              </div>
              {formErrors.submit && (
                <div className="form-error">{formErrors.submit}</div>
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormErrors({});
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Teacher</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTeacher(null);
                  setFormErrors({});
                }}
              >
                <svg fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditTeacher} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className={formErrors.firstName ? "error" : ""}
                    placeholder="Enter first name"
                  />
                  {formErrors.firstName && (
                    <span className="error-message">
                      {formErrors.firstName}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="secondName">Second Name *</label>
                  <input
                    type="text"
                    id="secondName"
                    value={formData.secondName}
                    onChange={(e) =>
                      setFormData({ ...formData, secondName: e.target.value })
                    }
                    className={formErrors.secondName ? "error" : ""}
                    placeholder="Enter second name"
                  />
                  {formErrors.secondName && (
                    <span className="error-message">
                      {formErrors.secondName}
                    </span>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="thirdName">Third Name *</label>
                  <input
                    type="text"
                    id="thirdName"
                    value={formData.thirdName}
                    onChange={(e) =>
                      setFormData({ ...formData, thirdName: e.target.value })
                    }
                    className={formErrors.thirdName ? "error" : ""}
                    placeholder="Enter third name"
                  />
                  {formErrors.thirdName && (
                    <span className="error-message">
                      {formErrors.thirdName}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="fourthName">Fourth Name *</label>
                  <input
                    type="text"
                    id="fourthName"
                    value={formData.fourthName}
                    onChange={(e) =>
                      setFormData({ ...formData, fourthName: e.target.value })
                    }
                    className={formErrors.fourthName ? "error" : ""}
                    placeholder="Enter fourth name"
                  />
                  {formErrors.fourthName && (
                    <span className="error-message">
                      {formErrors.fourthName}
                    </span>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={formErrors.email ? "error" : ""}
                    placeholder="Enter email address"
                  />
                  {formErrors.email && (
                    <span className="error-message">{formErrors.email}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone *</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={formErrors.phone ? "error" : ""}
                    placeholder="Enter phone number"
                  />
                  {formErrors.phone && (
                    <span className="error-message">{formErrors.phone}</span>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="specialization">Specialization *</label>
                  <input
                    type="text"
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialization: e.target.value,
                      })
                    }
                    className={formErrors.specialization ? "error" : ""}
                    placeholder="Enter specialization"
                  />
                  {formErrors.specialization && (
                    <span className="error-message">
                      {formErrors.specialization}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="birthDate">Birth Date *</label>
                  <input
                    type="date"
                    id="birthDate"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                    className={formErrors.birthDate ? "error" : ""}
                  />
                  {formErrors.birthDate && (
                    <span className="error-message">
                      {formErrors.birthDate}
                    </span>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">
                    Password (Leave empty to keep current)
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={formErrors.password ? "error" : ""}
                    placeholder="Enter new password"
                  />
                  {formErrors.password && (
                    <span className="error-message">{formErrors.password}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="image">Image URL (Optional)</label>
                  <input
                    type="url"
                    id="image"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="Enter image URL"
                  />
                </div>
              </div>
              {formErrors.submit && (
                <div className="form-error">{formErrors.submit}</div>
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedTeacher(null);
                    setFormErrors({});
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting ? "Updating..." : "Update Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal modal-sm">
            <div className="modal-header">
              <h2>Delete Teacher</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTeacher(null);
                }}
              >
                <svg fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete{" "}
                <strong>
                  {selectedTeacher ? getFullName(selectedTeacher.person) : ""}
                </strong>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTeacher(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-btn"
                onClick={handleDeleteTeacher}
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersManagement;
