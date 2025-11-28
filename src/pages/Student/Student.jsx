import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import "./Student.css";

const Student = ({ user }) => {
  return <DashboardLayout user={user} />;
};

export default Student;
