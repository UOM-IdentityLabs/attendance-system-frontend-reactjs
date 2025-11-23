import React from "react";
import Header from "../../components/Header";
import "./Teacher.css";

const Teacher = ({ user }) => {
  return (
    <div className="teacher-page">
      <Header user={user} />
      <main className="dashboard-content">
        <h1>Teacher Dashboard</h1>
      </main>
    </div>
  );
};

export default Teacher;
