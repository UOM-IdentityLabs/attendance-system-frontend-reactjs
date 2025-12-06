import React, { useState, useEffect } from "react";
import apiClient from "../services/api";
import "./GroupsManagement.css";

const GroupsManagement = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalGroups, setTotalGroups] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({ groupName: "" });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  const limit = 100;

  useEffect(() => {
    fetchGroups();
  }, [currentPage]);

  const fetchGroups = async (searchValue = searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      const offset = (currentPage - 1) * limit;
      let url = `/groups?limit=${limit}&offset=${offset}`;

      if (searchValue && searchValue.trim()) {
        url += `&search=${encodeURIComponent(searchValue.trim())}`;
      }

      const response = await apiClient.get(url);
      setGroups(response.data.groups);
      setTotalGroups(response.data.total);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setError("Failed to load groups. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateGroupName = (name) => {
    const errors = {};

    if (!name || !name.trim()) {
      errors.groupName = "Group name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      errors.groupName = "Group name must contain only letters and spaces";
    } else if (name.trim().length < 1) {
      errors.groupName = "Group name must be at least 1 character long";
    } else if (name.trim().length > 50) {
      errors.groupName = "Group name must not exceed 50 characters";
    }

    return errors;
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
      fetchGroups(""); // Pass empty string explicitly
      return;
    }

    // Set new timeout for debounced search
    const newTimeout = setTimeout(() => {
      fetchGroups(value); // Pass the current value
    }, 500);

    setSearchTimeout(newTimeout);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    // Pass empty string explicitly to fetch all groups
    fetchGroups("");
  };

  const handleInputChange = (e) => {
    const { value } = e.target;
    setFormData({ groupName: value });

    // Clear errors when user starts typing
    if (formErrors.groupName) {
      setFormErrors({});
    }
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();

    const errors = validateGroupName(formData.groupName);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post("/groups", {
        groupName: formData.groupName.trim(),
      });

      setShowAddModal(false);
      setFormData({ groupName: "" });
      setFormErrors({});
      await fetchGroups();
    } catch (err) {
      console.error("Error adding group:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to add group. Please try again.";
      setFormErrors({ submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditGroup = async (e) => {
    e.preventDefault();

    const errors = validateGroupName(formData.groupName);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.patch(`/groups/${selectedGroup.id}`, {
        groupName: formData.groupName.trim(),
      });

      setShowEditModal(false);
      setSelectedGroup(null);
      setFormData({ groupName: "" });
      setFormErrors({});
      await fetchGroups();
    } catch (err) {
      console.error("Error updating group:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to update group. Please try again.";
      setFormErrors({ submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      setSubmitting(true);
      await apiClient.delete(`/groups/${selectedGroup.id}`);

      setShowDeleteModal(false);
      setSelectedGroup(null);
      await fetchGroups();
    } catch (err) {
      console.error("Error deleting group:", err);
      setError("Failed to delete group. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setFormData({ groupName: "" });
    setFormErrors({});
    setShowAddModal(true);
  };

  const openEditModal = (group) => {
    setSelectedGroup(group);
    setFormData({ groupName: group.groupName });
    setFormErrors({});
    setShowEditModal(true);
  };

  const openDeleteModal = (group) => {
    setSelectedGroup(group);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedGroup(null);
    setFormData({ groupName: "" });
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

  const totalPages = Math.ceil(totalGroups / limit);

  if (loading) {
    return (
      <div className="groups-management-container">
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
          <p>Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="groups-management-container">
      <div className="page-header">
        <div className="header-content">
          <h1>Groups Management</h1>
          <p>Manage student groups and class sections</p>
        </div>
      </div>

      {/* Search Bar and Add Button */}
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
            placeholder="Search groups..."
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
          Add New Group
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
          <table className="groups-table">
            <thead>
              <tr>
                <th>Group Name</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 ? (
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
                    <p>
                      {searchTerm
                        ? `No groups found for "${searchTerm}"`
                        : "No groups found"}
                    </p>
                    {!searchTerm && (
                      <button className="btn-primary" onClick={openAddModal}>
                        Add First Group
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                groups.map((group) => (
                  <tr key={group.id}>
                    <td>
                      <span className="group-name">{group.groupName}</span>
                    </td>
                    <td>{formatDate(group.createdAt)}</td>
                    <td>{formatDate(group.updatedAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => openEditModal(group)}
                          title="Edit group"
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
                          onClick={() => openDeleteModal(group)}
                          title="Delete group"
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
              Page {currentPage} of {totalPages} • {totalGroups} total groups
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
              <h3>Add New Group</h3>
              <button className="modal-close" onClick={closeModals}>
                ×
              </button>
            </div>
            <form onSubmit={handleAddGroup} className="modal-form">
              <div className="form-group">
                <label htmlFor="groupName">Group Name *</label>
                <input
                  id="groupName"
                  type="text"
                  value={formData.groupName}
                  onChange={handleInputChange}
                  placeholder="e.g., A, B, C..."
                  className={formErrors.groupName ? "error" : ""}
                  maxLength="50"
                />
                {formErrors.groupName && (
                  <span className="error-message">{formErrors.groupName}</span>
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
                  {submitting ? "Adding..." : "Add Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedGroup && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Group</h3>
              <button className="modal-close" onClick={closeModals}>
                ×
              </button>
            </div>
            <form onSubmit={handleEditGroup} className="modal-form">
              <div className="form-group">
                <label htmlFor="editGroupName">Group Name *</label>
                <input
                  id="editGroupName"
                  type="text"
                  value={formData.groupName}
                  onChange={handleInputChange}
                  placeholder="e.g., A, B, C..."
                  className={formErrors.groupName ? "error" : ""}
                  maxLength="50"
                />
                {formErrors.groupName && (
                  <span className="error-message">{formErrors.groupName}</span>
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
                  {submitting ? "Updating..." : "Update Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedGroup && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Group</h3>
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
                  Are you sure you want to delete the group{" "}
                  <strong>"{selectedGroup.groupName}"</strong>?
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
                onClick={handleDeleteGroup}
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Delete Group"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsManagement;
