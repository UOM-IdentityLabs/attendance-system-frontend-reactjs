import React, { useState, useEffect } from "react";
import apiClient from "../services/api";
import "./AttendanceManagement.css";
import jsPDF from "jspdf";

const AttendanceManagement = () => {
  const [activeTab, setActiveTab] = useState("view");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isTakingAttendance, setIsTakingAttendance] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [attendanceMessageType, setAttendanceMessageType] = useState(""); // "success" or "error"

  // Clear attendance records when class selection changes
  useEffect(() => {
    setAttendanceRecords([]);
    setAttendanceMessage("");
    setAttendanceMessageType("");
  }, [selectedCourseId]);

  useEffect(() => {
    // Set default date range to current week
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(
      today.setDate(today.getDate() - today.getDay() + 6),
    );

    setDateRange({
      startDate: weekStart.toISOString().split("T")[0],
      endDate: weekEnd.toISOString().split("T")[0],
    });

    // Fetch teacher courses on component mount
    fetchTeacherCourses();
  }, []);

  const fetchTeacherCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const response = await apiClient.get("/teacher-courses/courses");
      setTeacherCourses(response.data || []);
    } catch (error) {
      console.error("Error fetching teacher courses:", error);
      // Keep empty array on error
      setTeacherCourses([]);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    if (!selectedCourseId) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.get(
        `/attendance?course=${selectedCourseId}`,
      );
      const attendanceData = response.data.attendances || [];

      // Transform the API response to match the component's expected format
      const transformedData = attendanceData.map((attendance) => {
        const person = attendance.student.person;
        const fullName =
          `${person.firstName} ${person.secondName || ""} ${person.thirdName || ""} ${person.fourthName || ""}`.trim();

        return {
          id: attendance.id,
          studentName: fullName,
          status: attendance.status,
          date: attendance.attendanceDate,
          studentId: attendance.student.id,
        };
      });

      setAttendanceRecords(transformedData);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      setAttendanceRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToPDF = async () => {
    if (!selectedClass || attendanceRecords.length === 0) {
      return;
    }

    setIsExporting(true);
    try {
      // Create new PDF document
      const pdf = new jsPDF();

      // Set up the document title and header
      const pageWidth = pdf.internal.pageSize.width;
      const title = `Attendance Records for ${selectedClass}`;

      // Add title
      pdf.setFontSize(18);
      pdf.setFont(undefined, "bold");
      pdf.text(title, pageWidth / 2, 30, { align: "center" });

      let yPosition = 70;
      const leftMargin = 20;
      const tableWidth = pageWidth - 2 * leftMargin; // Full width minus margins
      const columnWidths = [
        tableWidth * 0.5, // Student name: 50% of table width
        tableWidth * 0.25, // Date: 25% of table width
        tableWidth * 0.25, // Status: 25% of table width
      ];
      const rowHeight = 12;

      // Table headers with proper alignment
      pdf.setFontSize(12);
      pdf.setFont(undefined, "bold");
      pdf.setFillColor(52, 152, 219); // Blue header
      pdf.setTextColor(255, 255, 255); // White text

      // Draw header background
      pdf.rect(leftMargin, yPosition - 9, tableWidth, rowHeight, "F");

      // Header text with proper positioning
      pdf.text("Student Name", leftMargin + 5, yPosition);
      pdf.text(
        "Date",
        leftMargin + columnWidths[0] + columnWidths[1] / 2,
        yPosition,
        { align: "center" },
      );
      pdf.text(
        "Status",
        leftMargin + columnWidths[0] + columnWidths[1] + columnWidths[2] / 2,
        yPosition,
        { align: "center" },
      );

      yPosition += rowHeight;

      // Table rows with better alignment
      pdf.setFont(undefined, "normal");
      pdf.setTextColor(0, 0, 0); // Black text

      attendanceRecords.forEach((record, index) => {
        // Alternate row colors
        if (index % 2 === 0) {
          pdf.setFillColor(245, 245, 245); // Light gray
          pdf.rect(leftMargin, yPosition - 9, tableWidth, rowHeight, "F");
        }

        // Draw row borders for better structure
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.1);

        // Vertical lines for columns
        pdf.line(leftMargin, yPosition - 9, leftMargin, yPosition + 3);
        pdf.line(
          leftMargin + columnWidths[0],
          yPosition - 9,
          leftMargin + columnWidths[0],
          yPosition + 3,
        );
        pdf.line(
          leftMargin + columnWidths[0] + columnWidths[1],
          yPosition - 9,
          leftMargin + columnWidths[0] + columnWidths[1],
          yPosition + 3,
        );
        pdf.line(
          leftMargin + tableWidth,
          yPosition - 9,
          leftMargin + tableWidth,
          yPosition + 3,
        );

        // Horizontal line
        pdf.line(
          leftMargin,
          yPosition + 3,
          leftMargin + tableWidth,
          yPosition + 3,
        );

        // Student name (left-aligned with padding)
        const studentName =
          record.studentName.length > 35
            ? record.studentName.substring(0, 32) + "..."
            : record.studentName;
        pdf.text(studentName, leftMargin + 5, yPosition);

        // Date (center-aligned)
        const formattedDate = record.date.split("-").reverse().join("-");
        pdf.text(
          formattedDate,
          leftMargin + columnWidths[0] + columnWidths[1] / 2,
          yPosition,
          { align: "center" },
        );

        // Status (center-aligned)
        const status = record.status === "attended" ? "Present" : record.status;
        pdf.text(
          status,
          leftMargin + columnWidths[0] + columnWidths[1] + columnWidths[2] / 2,
          yPosition,
          { align: "center" },
        );

        yPosition += rowHeight;

        // Add new page if needed
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 30;
        }
      });

      // Add summary at the bottom with better formatting
      yPosition += 20;
      const totalStudents = attendanceRecords.length;
      const presentCount = attendanceRecords.filter(
        (r) => r.status === "attended",
      ).length;
      const absentCount = totalStudents - presentCount;

      // Add a separator line
      pdf.setDrawColor(52, 152, 219);
      pdf.setLineWidth(0.5);
      pdf.line(leftMargin, yPosition, leftMargin + tableWidth, yPosition);

      yPosition += 15;

      pdf.setFontSize(14);
      pdf.setFont(undefined, "bold");
      pdf.text(`Summary`, leftMargin, yPosition);

      pdf.setFontSize(11);
      pdf.setFont(undefined, "normal");

      // Create a summary table without total records
      const summaryY = yPosition + 10;

      pdf.text(`Present:`, leftMargin + 10, summaryY);
      pdf.text(`${presentCount}`, leftMargin + 60, summaryY);

      pdf.text(`Absent:`, leftMargin + 10, summaryY + 10);
      pdf.text(`${absentCount}`, leftMargin + 60, summaryY + 10);

      // Calculate percentage
      const presentPercentage =
        totalStudents > 0
          ? ((presentCount / totalStudents) * 100).toFixed(1)
          : 0;
      pdf.text(`Attendance Rate:`, leftMargin + 10, summaryY + 20);
      pdf.text(`${presentPercentage}%`, leftMargin + 60, summaryY + 20);

      // Generate filename
      const filename = `attendance-report-${selectedClass.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`;

      // Save the PDF
      pdf.save(filename);

      // Show success message instead of alert
      setAttendanceMessage("Attendance report exported successfully!");
      setAttendanceMessageType("success");

      // Clear message after 3 seconds
      setTimeout(() => {
        setAttendanceMessage("");
        setAttendanceMessageType("");
      }, 3000);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      setAttendanceMessage("Error exporting report. Please try again.");
      setAttendanceMessageType("error");

      // Clear error message after 5 seconds
      setTimeout(() => {
        setAttendanceMessage("");
        setAttendanceMessageType("");
      }, 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleTakeAttendance = async () => {
    if (!selectedClass || !selectedCourseId) {
      setAttendanceMessage("Please select a class first.");
      setAttendanceMessageType("error");
      return;
    }

    setIsTakingAttendance(true);
    setAttendanceMessage("");
    setAttendanceMessageType("");

    try {
      const attendanceData = {
        status: "attended",
        attendanceDate: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
        teacherCourseId: selectedCourseId,
      };

      const response = await apiClient.post("/attendance", attendanceData);

      if (response.status === 201) {
        setAttendanceMessage(
          `Attendance taking completed for ${selectedClass}. `,
        );
        setAttendanceMessageType("success");
      }
    } catch (error) {
      console.error("Error taking attendance:", error);

      let errorMessage = "Error initiating attendance. Please try again.";

      if (error.response) {
        const status = error.response.status;
        switch (status) {
          case 400:
            errorMessage =
              "Invalid request. Please check your input and try again.";
            break;
          case 404:
            errorMessage = "Course not found. Please select a valid class.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = `Error ${status}: ${error.response.data?.message || "Failed to initiate attendance"}`;
        }
      }

      setAttendanceMessage(errorMessage);
      setAttendanceMessageType("error");
    } finally {
      setIsTakingAttendance(false);
    }
  };

  return (
    <div className="attendance-management">
      <div className="attendance-header">
        <h1>Attendance Management</h1>
        <p>Track student attendance, take attendance, and export reports</p>
      </div>

      <div className="attendance-tabs">
        <button
          className={`tab-btn ${activeTab === "view" ? "active" : ""}`}
          onClick={() => setActiveTab("view")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          View Attendance
        </button>
        <button
          className={`tab-btn ${activeTab === "take" ? "active" : ""}`}
          onClick={() => setActiveTab("take")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 11l3 3l8-8" />
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9s4.03-9 9-9c1.51 0 2.93 0.37 4.18 1.03" />
          </svg>
          Take Attendance
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "view" && (
          <div className="view-attendance-tab">
            <div className="filters-section">
              <div className="filter-group">
                <label htmlFor="class-select">Select Class:</label>
                <select
                  id="class-select"
                  value={selectedClass}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    setSelectedClass(selectedValue);
                    // Find the corresponding course ID
                    const selectedCourse = teacherCourses.find(
                      (course) =>
                        course.course.courseName + " - " + course.courseType ===
                        selectedValue,
                    );
                    setSelectedCourseId(
                      selectedCourse ? selectedCourse.id : "",
                    );
                  }}
                  disabled={isLoadingCourses}
                >
                  <option value="">
                    {isLoadingCourses ? "Loading courses..." : "Select Class"}
                  </option>
                  {teacherCourses.map((course) => (
                    <option
                      key={course.id}
                      value={
                        course.course.courseName + " - " + course.courseType
                      }
                    >
                      {course.course.courseName + " - " + course.courseType}
                    </option>
                  ))}
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
                onClick={fetchAttendanceRecords}
                disabled={isLoading || !selectedCourseId}
              >
                {isLoading ? "Loading..." : "Get Records"}
              </button>

              <button
                className="export-btn"
                onClick={handleExportToPDF}
                disabled={isExporting || attendanceRecords.length === 0}
              >
                {isExporting ? "Exporting..." : "Export PDF"}
              </button>
            </div>

            {attendanceMessage && activeTab === "view" && (
              <div className={`attendance-message ${attendanceMessageType}`}>
                {attendanceMessage}
              </div>
            )}

            <div className="attendance-records">
              {attendanceRecords.length === 0 ? (
                <div className="no-records">
                  <p>No attendance records found for the selected criteria.</p>
                  <p>
                    {!selectedCourseId
                      ? "Please select a class and click 'Get Records' to fetch data."
                      : "Click 'Get Records' to fetch data or adjust your filters."}
                  </p>
                </div>
              ) : (
                <div className="attendance-list">
                  <h3>Attendance Records for {selectedClass}</h3>
                  <div className="attendance-table-container">
                    <table className="attendance-table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceRecords.map((record) => (
                          <tr key={record.id}>
                            <td className="student-name-cell">
                              {record.studentName}
                            </td>
                            <td className="date-cell">
                              {record.date.split("-").reverse().join("-")}
                            </td>
                            <td className="status-cell">
                              <span className={`status-badge ${record.status}`}>
                                {record.status === "attended"
                                  ? "Present"
                                  : record.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "take" && (
          <div className="take-attendance-tab">
            <div className="take-attendance-section">
              <h2>Take New Attendance</h2>
              <p>Select a class and initiate attendance taking.</p>

              <div className="class-selection">
                <label htmlFor="take-class-select">Select Class:</label>
                <select
                  id="take-class-select"
                  value={selectedClass}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    setSelectedClass(selectedValue);
                    // Find the corresponding course ID
                    const selectedCourse = teacherCourses.find(
                      (course) =>
                        course.course.courseName + " - " + course.courseType ===
                        selectedValue,
                    );
                    setSelectedCourseId(
                      selectedCourse ? selectedCourse.id : "",
                    );
                    // Clear previous messages when selection changes
                    setAttendanceMessage("");
                    setAttendanceMessageType("");
                  }}
                  disabled={isLoadingCourses}
                >
                  <option value="">
                    {isLoadingCourses
                      ? "Loading courses..."
                      : "Choose a class..."}
                  </option>
                  {teacherCourses.map((course) => (
                    <option
                      key={course.id}
                      value={
                        course.course.courseName + " - " + course.courseType
                      }
                    >
                      {course.course.courseName + " - " + course.courseType}
                    </option>
                  ))}
                </select>
              </div>

              {attendanceMessage && (
                <div className={`attendance-message ${attendanceMessageType}`}>
                  {attendanceMessage}
                </div>
              )}

              <button
                className="take-attendance-btn"
                onClick={handleTakeAttendance}
                disabled={
                  !selectedClass || !selectedCourseId || isTakingAttendance
                }
              >
                {isTakingAttendance ? "Initiating..." : "Take Attendance"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement;
