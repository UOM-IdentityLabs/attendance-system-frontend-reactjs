import React from "react";
import Header from "../../components/Header";
import "./DepartmentHead.css";

const DepartmentHead = ({ user }) => {
  return (
    <div className="department-head-page">
      <Header user={user} />
      <main className="dashboard-content">
        <h1>Department Head Dashboard</h1>
      </main>
    </div>
  );
};

export default DepartmentHead;
