import React, { useState, useEffect } from "react";
import apiClient from "../services/api";
import "./YearsManagement.css";

const YearsManagement = () => {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalYears, setTotalYears] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [formData, setFormData] = useState({ yearName: "" });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const limit = 100;

  useEffect(() => {
    fetchYears();
  }, [currentPage]);

  const fetchYears = async () => {
    try {
      setLoading(true);
      setError(null);
      const offset = (currentPage - 1) * limit;
      const response = await apiClient.get(
        `/college-years?limit=${limit}&offset=${offset}`
      );
      setYears(response.data.collegeYears);
      setTotalYears(response.data.total);
    } catch (err) {
      console.error("Error fetching years:", err);
      setError("Failed to load college years. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateYearName = (name) => {
    const errors = {};

    if (!name || !name.trim()) {
      errors.yearName = "Year name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      errors.yearName = "Year name must contain only letters and spaces";
    } else if (name.trim().length < 2) {
      errors.yearName = "Year name must be at least 2 characters long";
    } else if (name.trim().length > 50) {
      errors.yearName = "Year name must not exceed 50 characters";
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { value } = e.target;
    setFormData({ yearName: value });

    // Clear errors when user starts typing
    if (formErrors.yearName) {
      setFormErrors({});
    }
  };

  const handleAddYear = async (e) => {
    e.preventDefault();

    const errors = validateYearName(formData.yearName);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post("/college-years", {
        yearName: formData.yearName.trim(),
      });

      setShowAddModal(false);
      setFormData({ yearName: "" });
      setFormErrors({});
      await fetchYears();
    } catch (err) {
      console.error("Error adding year:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to add college year. Please try again.";
      setFormErrors({ submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditYear = async (e) => {
    e.preventDefault();

    const errors = validateYearName(formData.yearName);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.patch(`/college-years/${selectedYear.id}`, {
        yearName: formData.yearName.trim(),
      });

      setShowEditModal(false);
      setSelectedYear(null);
      setFormData({ yearName: "" });
      setFormErrors({});
      await fetchYears();
    } catch (err) {
      console.error("Error updating year:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to update college year. Please try again.";
      setFormErrors({ submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteYear = async () => {
    try {
      setSubmitting(true);
      await apiClient.delete(`/college-years/${selectedYear.id}`);

      setShowDeleteModal(false);
      setSelectedYear(null);
      await fetchYears();
    } catch (err) {
      console.error("Error deleting year:", err);
      setError("Failed to delete college year. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setFormData({ yearName: "" });
    setFormErrors({});
    setShowAddModal(true);
  };

  const openEditModal = (year) => {
    setSelectedYear(year);
    setFormData({ yearName: year.yearName });
    setFormErrors({});
    setShowEditModal(true);
  };

  const openDeleteModal = (year) => {
    setSelectedYear(year);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedYear(null);
    setFormData({ yearName: "" });
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

  const totalPages = Math.ceil(totalYears / limit);

  if (loading) {
    return (
      <div className="years-management-container">
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
          <p>Loading college years...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="years-management-container">
      <div className="page-header">
        <div className="header-content">
          <h1>College Years Management</h1>
          <p>Manage academic years for your institution</p>
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
          Add New Year
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
          <table className="years-table">
            <thead>
              <tr>
                <th>Year Name</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {years.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-state">
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
                    <p>No college years found</p>
                    <button className="btn-primary" onClick={openAddModal}>
                      Add First Year
                    </button>
                  </td>
                </tr>
              ) : (
                years.map((year) => (
                  <tr key={year.id}>
                    <td>
                      <span className="year-name">{year.yearName}</span>
                    </td>
                    <td>{formatDate(year.createdAt)}</td>
                    <td>{formatDate(year.updatedAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => openEditModal(year)}
                          title="Edit year"
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
                          onClick={() => openDeleteModal(year)}
                          title="Delete year"
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
              Page {currentPage} of {totalPages} • {totalYears} total years
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
              <h3>Add New College Year</h3>
              <button className="modal-close" onClick={closeModals}>
                ×
              </button>
            </div>
            <form onSubmit={handleAddYear} className="modal-form">
              <div className="form-group">
                <label htmlFor="yearName">Year Name *</label>
                <input
                  id="yearName"
                  type="text"
                  value={formData.yearName}
                  onChange={handleInputChange}
                  placeholder="e.g., First, Second, Third..."
                  className={formErrors.yearName ? "error" : ""}
                  maxLength="50"
                />
                {formErrors.yearName && (
                  <span className="error-message">{formErrors.yearName}</span>
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
                  {submitting ? "Adding..." : "Add Year"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedYear && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit College Year</h3>
              <button className="modal-close" onClick={closeModals}>
                ×
              </button>
            </div>
            <form onSubmit={handleEditYear} className="modal-form">
              <div className="form-group">
                <label htmlFor="editYearName">Year Name *</label>
                <input
                  id="editYearName"
                  type="text"
                  value={formData.yearName}
                  onChange={handleInputChange}
                  placeholder="e.g., First, Second, Third..."
                  className={formErrors.yearName ? "error" : ""}
                  maxLength="50"
                />
                {formErrors.yearName && (
                  <span className="error-message">{formErrors.yearName}</span>
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
                  {submitting ? "Updating..." : "Update Year"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedYear && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete College Year</h3>
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
                  Are you sure you want to delete the year{" "}
                  <strong>"{selectedYear.yearName}"</strong>?
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
                onClick={handleDeleteYear}
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Delete Year"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YearsManagement;
