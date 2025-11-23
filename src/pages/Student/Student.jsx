import React from "react";
import Header from "../../components/Header";
import "./Student.css";

const Student = ({ user }) => {
  return (
    <div className="student-page">
      <Header user={user} />
      <main className="dashboard-content">
        <h1>Student Dashboard</h1>
      </main>
    </div>
  );
};

export default Student;
