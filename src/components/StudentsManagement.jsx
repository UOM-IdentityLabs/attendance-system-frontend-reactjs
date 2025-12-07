import React, { useState, useEffect } from "react";
import apiClient from "../services/api";
import "./StudentsManagement.css";

const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [collegeYears, setCollegeYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    secondName: "",
    thirdName: "",
    fourthName: "",
    image: "",
    phone: "",
    birthDate: "",
    email: "",
    password: "",
    groupId: "",
    collegeYearId: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  const limit = 100;

  useEffect(() => {
    fetchStudents();
    fetchGroups();
    fetchCollegeYears();
  }, [currentPage]);

  const fetchStudents = async (searchValue = searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      const offset = (currentPage - 1) * limit;
      let url = `/students?limit=${limit}&offset=${offset}`;

      if (searchValue && searchValue.trim()) {
        url += `&search=${encodeURIComponent(searchValue.trim())}`;
      }

      const response = await apiClient.get(url);
      setStudents(response.data.students);
      setTotalStudents(response.data.total);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to load students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await apiClient.get("/groups?limit=1000");
      setGroups(response.data.groups || []);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  const fetchCollegeYears = async () => {
    try {
      const response = await apiClient.get("/college-years?limit=1000");
      setCollegeYears(response.data.collegeYears || []);
    } catch (err) {
      console.error("Error fetching college years:", err);
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
      fetchStudents("");
      return;
    }

    const newTimeout = setTimeout(() => {
      fetchStudents(value);
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
      if (age < 16 || age > 60) {
        errors.birthDate = "Age must be between 16 and 60 years";
      }
    }

    if (!data.email || !data.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!data.groupId) {
      errors.groupId = "Group is required";
    }

    if (!data.collegeYearId) {
      errors.collegeYearId = "College year is required";
    }

    if (!selectedStudent && (!data.password || data.password.length < 6)) {
      errors.password = "Password must be at least 6 characters long";
    }

    return errors;
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post("/students", {
        firstName: formData.firstName.trim(),
        secondName: formData.secondName.trim(),
        thirdName: formData.thirdName.trim(),
        fourthName: formData.fourthName.trim(),
        image: formData.image.trim() || null,
        phone: formData.phone.trim(),
        birthDate: formData.birthDate,
        email: formData.email.trim(),
        password: formData.password,
        groupId: formData.groupId,
        collegeYearId: formData.collegeYearId,
      });

      setShowAddModal(false);
      setFormData({
        firstName: "",
        secondName: "",
        thirdName: "",
        fourthName: "",
        image: "",
        phone: "",
        birthDate: "",
        email: "",
        password: "",
        groupId: "",
        collegeYearId: "",
      });
      setFormErrors({});
      await fetchStudents();
    } catch (err) {
      console.error("Error creating student:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to create student. Please try again.";
      setFormErrors({ submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStudent = async (e) => {
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
        image: formData.image.trim() || null,
        phone: formData.phone.trim(),
        birthDate: formData.birthDate,
        email: formData.email.trim(),
        groupId: formData.groupId,
        collegeYearId: formData.collegeYearId,
      };

      if (formData.password && formData.password.trim()) {
        updateData.password = formData.password;
      }

      await apiClient.patch(`/students/${selectedStudent.id}`, updateData);

      setShowEditModal(false);
      setSelectedStudent(null);
      setFormData({
        firstName: "",
        secondName: "",
        thirdName: "",
        fourthName: "",
        image: "",
        phone: "",
        birthDate: "",
        email: "",
        password: "",
        groupId: "",
        collegeYearId: "",
      });
      setFormErrors({});
      await fetchStudents();
    } catch (err) {
      console.error("Error updating student:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to update student. Please try again.";
      setFormErrors({ submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async () => {
    try {
      setSubmitting(true);
      await apiClient.delete(`/students/${selectedStudent.id}`);

      setShowDeleteModal(false);
      setSelectedStudent(null);
      await fetchStudents();
    } catch (err) {
      console.error("Error deleting student:", err);
      setError("Failed to delete student. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      firstName: student.person.firstName,
      secondName: student.person.secondName,
      thirdName: student.person.thirdName,
      fourthName: student.person.fourthName,
      image: student.person.image || "",
      phone: student.person.phone || "",
      birthDate: student.person.birthDate.split("T")[0],
      email: student.user.email,
      password: "",
      groupId: student.group.id,
      collegeYearId: student.collegeYear.id,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const openDeleteModal = (student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    fetchStudents("");
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

  const totalPages = Math.ceil(totalStudents / limit);

  if (loading && students.length === 0) {
    return (
      <div className="students-management-container">
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
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="students-management-container">
      <div className="page-header">
        <div className="header-content">
          <h1>Students Management</h1>
          <p>Manage student records and academic information</p>
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
            placeholder="Search students by name, email, or phone..."
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
              image: "",
              phone: "",
              birthDate: "",
              email: "",
              password: "",
              groupId: "",
              collegeYearId: "",
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
          Add New Student
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Students Table */}
      <div className="table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Group</th>
              <th>College Year</th>
              <th>Department</th>
              <th>Birth Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="loading-cell">
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
                    <span>Loading students...</span>
                  </div>
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">
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
                    <p>No students found</p>
                    {searchTerm && (
                      <button
                        className="clear-search-link"
                        onClick={clearSearch}
                      >
                        Clear search to view all students
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="student-name">
                      {getFullName(student.person)}
                    </div>
                  </td>
                  <td>{student.user.email}</td>
                  <td>{student.person.phone || "N/A"}</td>
                  <td>{student.group?.groupName || "N/A"}</td>
                  <td>{student.collegeYear?.yearName || "N/A"}</td>
                  <td>{student.department?.departmentName || "N/A"}</td>
                  <td>{formatDate(student.person.birthDate)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => openEditModal(student)}
                        title="Edit student"
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
                        onClick={() => openDeleteModal(student)}
                        title="Delete student"
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
              <h2>Add New Student</h2>
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
            <form onSubmit={handleAddStudent} className="modal-form">
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
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="groupId">Group *</label>
                  <select
                    id="groupId"
                    value={formData.groupId}
                    onChange={(e) =>
                      setFormData({ ...formData, groupId: e.target.value })
                    }
                    className={formErrors.groupId ? "error" : ""}
                  >
                    <option value="">Select group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.groupName}
                      </option>
                    ))}
                  </select>
                  {formErrors.groupId && (
                    <span className="error-message">{formErrors.groupId}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="collegeYearId">College Year *</label>
                  <select
                    id="collegeYearId"
                    value={formData.collegeYearId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        collegeYearId: e.target.value,
                      })
                    }
                    className={formErrors.collegeYearId ? "error" : ""}
                  >
                    <option value="">Select college year</option>
                    {collegeYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.yearName}
                      </option>
                    ))}
                  </select>
                  {formErrors.collegeYearId && (
                    <span className="error-message">
                      {formErrors.collegeYearId}
                    </span>
                  )}
                </div>
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
                  {submitting ? "Creating..." : "Create Student"}
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
              <h2>Edit Student</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStudent(null);
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
            <form onSubmit={handleEditStudent} className="modal-form">
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
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="groupId">Group *</label>
                  <select
                    id="groupId"
                    value={formData.groupId}
                    onChange={(e) =>
                      setFormData({ ...formData, groupId: e.target.value })
                    }
                    className={formErrors.groupId ? "error" : ""}
                  >
                    <option value="">Select group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.groupName}
                      </option>
                    ))}
                  </select>
                  {formErrors.groupId && (
                    <span className="error-message">{formErrors.groupId}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="collegeYearId">College Year *</label>
                  <select
                    id="collegeYearId"
                    value={formData.collegeYearId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        collegeYearId: e.target.value,
                      })
                    }
                    className={formErrors.collegeYearId ? "error" : ""}
                  >
                    <option value="">Select college year</option>
                    {collegeYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.yearName}
                      </option>
                    ))}
                  </select>
                  {formErrors.collegeYearId && (
                    <span className="error-message">
                      {formErrors.collegeYearId}
                    </span>
                  )}
                </div>
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
              {formErrors.submit && (
                <div className="form-error">{formErrors.submit}</div>
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedStudent(null);
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
                  {submitting ? "Updating..." : "Update Student"}
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
              <h2>Delete Student</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedStudent(null);
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
                  {selectedStudent ? getFullName(selectedStudent.person) : ""}
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
                  setSelectedStudent(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-btn"
                onClick={handleDeleteStudent}
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

export default StudentsManagement;
