import React, { useState, useEffect } from "react";
import apiClient from "../services/api";
import "./AttendanceManagement.css"; // Reusing the same CSS styles
import "./MyAttendance.css"; // Additional styles for MyAttendance

const MyAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [studentCourses, setStudentCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [attendanceMessageType, setAttendanceMessageType] = useState(""); // "success" or "error"

  // Clear attendance records when class selection changes
  useEffect(() => {
    setAttendanceRecords([]);
    setAttendanceMessage("");
    setAttendanceMessageType("");
  }, [selectedCourseId]);

  useEffect(() => {
    // Set default date range to current month
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setDateRange({
      startDate: monthStart.toISOString().split("T")[0],
      endDate: monthEnd.toISOString().split("T")[0],
    });

    // Fetch student courses on component mount
    fetchStudentCourses();
  }, []);

  const fetchStudentCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const response = await apiClient.get("/teacher-courses/student/courses");

      // Handle the response structure from teacher-courses endpoint
      let courses = [];
      if (Array.isArray(response.data)) {
        courses = response.data;
      } else if (response.data && Array.isArray(response.data.courses)) {
        courses = response.data.courses;
      } else if (response.data && Array.isArray(response.data.data)) {
        courses = response.data.data;
      } else if (response.data && typeof response.data === "object") {
        // If it's an object, try to extract an array from common property names
        courses = response.data.items || [];
      }

      setStudentCourses(courses);
    } catch (error) {
      console.error("Error fetching student courses:", error);
      // Keep empty array on error
      setStudentCourses([]);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchMyAttendance = async () => {
    setIsLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedCourseId) {
        params.append("course", selectedCourseId);
      }
      if (dateRange.startDate) {
        params.append("startDate", dateRange.startDate);
      }
      if (dateRange.endDate) {
        params.append("endDate", dateRange.endDate);
      }

      const queryString = params.toString();
      const url = `/attendance/me${queryString ? `?${queryString}` : ""}`;

      const response = await apiClient.get(url);
      const attendanceData = response.data.attendances || [];

      const transformedData = attendanceData.map((attendance) => {
        const courseInfo = attendance.teacherCourse?.course;
        const courseName = courseInfo?.courseName || "Course";
        const courseType = attendance.teacherCourse?.courseType || "N/A";
        const semester = courseInfo?.semester || "N/A";

        return {
          id: attendance.id,
          courseName: courseName,
          courseType: courseType,
          semester: semester,
          status: attendance.status,
          date: attendance.attendanceDate,
        };
      });

      setAttendanceRecords(transformedData);

      if (transformedData.length === 0) {
        setAttendanceMessage(
          "No attendance records found for the selected criteria.",
        );
        setAttendanceMessageType("info");
      } else {
        setAttendanceMessage("");
        setAttendanceMessageType("");
      }
    } catch (error) {
      console.error("Error fetching my attendance:", error);
      setAttendanceRecords([]);
      setAttendanceMessage(
        "Error fetching attendance records. Please try again.",
      );
      setAttendanceMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate attendance statistics
  const getAttendanceStats = () => {
    if (attendanceRecords.length === 0) {
      return { total: 0, present: 0, absent: 0, rate: 0 };
    }

    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(
      (record) => record.status === "attended",
    ).length;
    const absent = total - present;
    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return { total, present, absent, rate };
  };

  const stats = getAttendanceStats();

  return (
    <div className="attendance-management">
      <div className="attendance-container">
        <div className="attendance-header">
          <h1>My Attendance</h1>
          <p>View your attendance records across all courses</p>
        </div>

        <div className="view-attendance-tab">
          <div className="filters-section">
            <div className="filter-group">
              <label htmlFor="course-select">Course:</label>
              <select
                id="course-select"
                value={selectedClass}
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  setSelectedClass(selectedValue);
                  // Find the corresponding teacher course ID
                  let selectedTeacherCourse;
                  if (selectedValue === "") {
                    setSelectedCourseId("");
                    return;
                  }

                  selectedTeacherCourse = Array.isArray(studentCourses)
                    ? studentCourses.find((teacherCourse) => {
                        // Handle teacher course objects from GET /teacher-courses/student/courses
                        const courseName = teacherCourse.course?.courseName;
                        const courseType = teacherCourse.courseType;
                        const displayName = `${courseName} (${courseType})`;
                        return displayName === selectedValue;
                      })
                    : null;
                  setSelectedCourseId(
                    selectedTeacherCourse
                      ? selectedTeacherCourse.course.id
                      : "",
                  );
                }}
                disabled={isLoadingCourses}
              >
                <option value="">
                  {isLoadingCourses
                    ? "Loading courses..."
                    : !Array.isArray(studentCourses) ||
                        studentCourses.length === 0
                      ? "No courses available"
                      : "Select a Course"}
                </option>
                {Array.isArray(studentCourses) &&
                  studentCourses.map((teacherCourse) => {
                    // Handle teacher course objects from GET /teacher-courses/student/courses
                    const courseName = teacherCourse.course?.courseName;
                    const courseType = teacherCourse.courseType;
                    const teacherCourseId = teacherCourse.id;
                    const displayName = `${courseName} (${courseType})`;

                    return (
                      <option key={teacherCourseId} value={displayName}>
                        {displayName}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="start-date">Start Date:</label>
              <input
                type="date"
                id="start-date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>

            <div className="filter-group">
              <label htmlFor="end-date">End Date:</label>
              <input
                type="date"
                id="end-date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
              />
            </div>

            <button
              className="fetch-btn"
              onClick={fetchMyAttendance}
              disabled={isLoading || !selectedCourseId}
              title={!selectedCourseId ? "Please select a course first" : ""}
            >
              {isLoading ? "Loading..." : "Get My Attendance"}
            </button>
          </div>

          {attendanceMessage && (
            <div className={`attendance-message ${attendanceMessageType}`}>
              {attendanceMessage}
            </div>
          )}

          {/* Show message if no courses are available */}
          {!isLoadingCourses &&
            (!Array.isArray(studentCourses) || studentCourses.length === 0) && (
              <div className="attendance-message info">
                No courses found. Please contact your administrator to ensure
                you are enrolled in courses.
              </div>
            )}

          {/* Attendance Statistics */}
          {attendanceRecords.length > 0 && (
            <div className="attendance-stats">
              <h3>Attendance Summary</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Classes:</span>
                  <span className="stat-value">{stats.total}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Present:</span>
                  <span className="stat-value present">{stats.present}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Absent:</span>
                  <span className="stat-value absent">{stats.absent}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Attendance Rate:</span>
                  <span
                    className={`stat-value rate ${stats.rate >= 75 ? "good" : "warning"}`}
                  >
                    {stats.rate}%
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="attendance-records">
            {attendanceRecords.length === 0 && !isLoading ? (
              <div className="no-records">
                <p>
                  {!selectedCourseId
                    ? "Please select a course to view your attendance records."
                    : "No attendance records found for the selected criteria."}
                </p>
                <p>
                  {selectedCourseId &&
                    "Click 'Get My Attendance' to fetch data or adjust your filters."}
                </p>
              </div>
            ) : attendanceRecords.length > 0 ? (
              <div className="attendance-list">
                <h3>
                  My Attendance Records
                  {selectedClass && ` - ${selectedClass}`}
                </h3>
                <div className="attendance-table-container">
                  <table className="attendance-table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Semester</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map((record) => (
                        <tr key={record.id}>
                          <td className="course-cell">
                            {record.courseName} ({record.courseType})
                          </td>
                          <td className="semester-cell">{record.semester}</td>
                          <td className="date-cell">
                            {new Date(record.date).toLocaleDateString("en-GB")}
                          </td>
                          <td className="status-cell">
                            <span className={`status-badge ${record.status}`}>
                              {record.status === "attended"
                                ? "Present"
                                : record.status === "absent"
                                  ? "Absent"
                                  : record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;
