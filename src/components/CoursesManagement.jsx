import React, { useState, useEffect } from "react";
import apiClient from "../services/api";
import "./CoursesManagement.css";

const CoursesManagement = () => {
  const [courses, setCourses] = useState([]);
  const [collegeYears, setCollegeYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    courseName: "",
    semester: "",
    collegeYearId: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  const limit = 100;
  const semesterOptions = [
    { value: "first", label: "First Semester" },
    { value: "second", label: "Second Semester" },
  ];

  useEffect(() => {
    fetchCourses();
    fetchCollegeYears();
  }, [currentPage]);

  const fetchCourses = async (searchValue = searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      const offset = (currentPage - 1) * limit;
      let url = `/courses?limit=${limit}&offset=${offset}`;

      if (searchValue && searchValue.trim()) {
        url += `&search=${encodeURIComponent(searchValue.trim())}`;
      }

      const response = await apiClient.get(url);
      setCourses(response.data.courses);
      setTotalCourses(response.data.total);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const fetchCollegeYears = async () => {
    try {
      const response = await apiClient.get("/college-years?limit=1000");
      setCollegeYears(response.data.collegeYears);
    } catch (err) {
      console.error("Error fetching college years:", err);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // If search is empty, fetch immediately without debounce
    if (!value || !value.trim()) {
      fetchCourses(""); // Pass empty string explicitly
      return;
    }

    // Set new timeout for debounced search
    const newTimeout = setTimeout(() => {
      fetchCourses(value); // Pass the current value
    }, 500);

    setSearchTimeout(newTimeout);
  };
  const validateForm = (data) => {
    const errors = {};

    if (!data.courseName || !data.courseName.trim()) {
      errors.courseName = "Course name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(data.courseName.trim())) {
      errors.courseName = "Course name must contain only letters and spaces";
    } else if (data.courseName.trim().length < 2) {
      errors.courseName = "Course name must be at least 2 characters long";
    } else if (data.courseName.trim().length > 100) {
      errors.courseName = "Course name must not exceed 100 characters";
    }

    if (!data.semester) {
      errors.semester = "Semester is required";
    }

    if (!data.collegeYearId) {
      errors.collegeYearId = "College year is required";
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post("/courses", {
        courseName: formData.courseName.trim(),
        semester: formData.semester,
        collegeYearId: formData.collegeYearId,
      });

      setShowAddModal(false);
      setFormData({ courseName: "", semester: "", collegeYearId: "" });
      setFormErrors({});
      await fetchCourses();
    } catch (err) {
      console.error("Error adding course:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to add course. Please try again.";
      setFormErrors({ submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.patch(`/courses/${selectedCourse.id}`, {
        courseName: formData.courseName.trim(),
        semester: formData.semester,
        collegeYearId: formData.collegeYearId,
      });

      setShowEditModal(false);
      setSelectedCourse(null);
      setFormData({ courseName: "", semester: "", collegeYearId: "" });
      setFormErrors({});
      await fetchCourses();
    } catch (err) {
      console.error("Error updating course:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to update course. Please try again.";
      setFormErrors({ submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      setSubmitting(true);
      await apiClient.delete(`/courses/${selectedCourse.id}`);

      setShowDeleteModal(false);
      setSelectedCourse(null);
      await fetchCourses();
    } catch (err) {
      console.error("Error deleting course:", err);
      setError("Failed to delete course. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setFormData({ courseName: "", semester: "", collegeYearId: "" });
    setFormErrors({});
    setShowAddModal(true);
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setFormData({
      courseName: course.courseName,
      semester: course.semester,
      collegeYearId: course.collegeYear.id,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const openDeleteModal = (course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedCourse(null);
    setFormData({ courseName: "", semester: "", collegeYearId: "" });
    setFormErrors({});
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSemester = (semester) => {
    return semester.charAt(0).toUpperCase() + semester.slice(1) + " Semester";
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    // Pass empty string explicitly to fetch all courses
    fetchCourses("");
  };

  const totalPages = Math.ceil(totalCourses / limit);

  if (loading && courses.length === 0) {
    return (
      <div className="courses-management-container">
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
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-management-container">
      <div className="page-header">
        <div className="header-content">
          <h1>Courses Management</h1>
          <p>Manage academic courses and curricula</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <svg
            className="search-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchTerm && (
            <button className="search-clear" onClick={clearSearch}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
        <button className="btn-primary" onClick={openAddModal}>
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
          Add New Course
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="table-container">
        <div className="table-wrapper">
          <table className="courses-table">
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Semester</th>
                <th>College Year</th>
                <th>Department</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
                      <line x1="9" y1="9" x2="9.01" y2="9"></line>
                      <line x1="15" y1="9" x2="15.01" y2="9"></line>
                    </svg>
                    <p>
                      {searchTerm
                        ? `No courses found for "${searchTerm}"`
                        : "No courses found"}
                    </p>
                    {!searchTerm && (
                      <button className="btn-primary" onClick={openAddModal}>
                        Add First Course
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <span className="course-name">{course.courseName}</span>
                    </td>
                    <td>
                      <span className="semester-badge">
                        {formatSemester(course.semester)}
                      </span>
                    </td>
                    <td>{course.collegeYear.yearName}</td>
                    <td>{course.department.departmentName}</td>
                    <td>{formatDate(course.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => openEditModal(course)}
                          title="Edit course"
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
                          onClick={() => openDeleteModal(course)}
                          title="Delete course"
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
                            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
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

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
              Previous
            </button>

            <span className="pagination-info">
              Page {currentPage} of {totalPages} • {totalCourses} total courses
            </span>

            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Course</h3>
              <button className="modal-close" onClick={closeModals}>
                ×
              </button>
            </div>
            <form onSubmit={handleAddCourse} className="modal-form">
              <div className="form-group">
                <label htmlFor="courseName">Course Name *</label>
                <input
                  id="courseName"
                  name="courseName"
                  type="text"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  placeholder="e.g., Mathematics, Physics..."
                  className={formErrors.courseName ? "error" : ""}
                  maxLength="100"
                />
                {formErrors.courseName && (
                  <span className="error-message">{formErrors.courseName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="semester">Semester *</label>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className={formErrors.semester ? "error" : ""}
                >
                  <option value="">Select semester</option>
                  {semesterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {formErrors.semester && (
                  <span className="error-message">{formErrors.semester}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="collegeYearId">College Year *</label>
                <select
                  id="collegeYearId"
                  name="collegeYearId"
                  value={formData.collegeYearId}
                  onChange={handleInputChange}
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

              {formErrors.submit && (
                <div className="error-message">{formErrors.submit}</div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModals}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Adding..." : "Add Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCourse && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Course</h3>
              <button className="modal-close" onClick={closeModals}>
                ×
              </button>
            </div>
            <form onSubmit={handleEditCourse} className="modal-form">
              <div className="form-group">
                <label htmlFor="editCourseName">Course Name *</label>
                <input
                  id="editCourseName"
                  name="courseName"
                  type="text"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  placeholder="e.g., Mathematics, Physics..."
                  className={formErrors.courseName ? "error" : ""}
                  maxLength="100"
                />
                {formErrors.courseName && (
                  <span className="error-message">{formErrors.courseName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="editSemester">Semester *</label>
                <select
                  id="editSemester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className={formErrors.semester ? "error" : ""}
                >
                  <option value="">Select semester</option>
                  {semesterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {formErrors.semester && (
                  <span className="error-message">{formErrors.semester}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="editCollegeYearId">College Year *</label>
                <select
                  id="editCollegeYearId"
                  name="collegeYearId"
                  value={formData.collegeYearId}
                  onChange={handleInputChange}
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

              {formErrors.submit && (
                <div className="error-message">{formErrors.submit}</div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModals}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Updating..." : "Update Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedCourse && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Course</h3>
              <button className="modal-close" onClick={closeModals}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <p>
                  Are you sure you want to delete the course{" "}
                  <strong>"{selectedCourse.courseName}"</strong>?
                </p>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={closeModals}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDeleteCourse}
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Delete Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesManagement;
