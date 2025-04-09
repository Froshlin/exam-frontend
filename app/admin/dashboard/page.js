// admin/dashboard/page.js
"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import QuestionForm from "./QuestionForm";
import ManageQuestions from "./ManageQuestions";
import CourseManagement from "./CourseManagement";
import UserManagement from "./UserManagement";
import Analytics from "./Analytics";
import { Menu, X } from "lucide-react";
import "./admin-dashboard.css";

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState("questions");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar toggle

  const renderPage = () => {
    switch (activePage) {
      case "questions":
        return <QuestionForm />;
      case "manage-questions":
        return <ManageQuestions />;
      case "courses":
        return <CourseManagement />;
      case "users":
        return <UserManagement />;
      case "analytics":
        return <Analytics />;
      default:
        return <QuestionForm />;
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="admin-dashboard-container">
      {/* Hamburger Menu for Mobile */}
      <div className="hamburger-menu">
        <button onClick={toggleSidebar} className="hamburger-button">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`admin-sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <Sidebar activePage={activePage} onPageChange={setActivePage} />
      </div>

      {/* Main Content */}
      <main className="admin-main-content">{renderPage()}</main>
    </div>
  );
}