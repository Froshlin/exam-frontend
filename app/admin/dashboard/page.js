"use client";

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import QuestionForm from './QuestionForm';
// import CourseManagement from './CourseManagement';
// import UserManagement from './UserManagement';
// import Analytics from './Analytics';
import './admin-dashboard.css';

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState('questions');

  const renderPage = () => {
    switch(activePage) {
      case 'questions':
        return <QuestionForm />;
      case 'courses':
        return <CourseManagement />;
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <Analytics />;
      default:
        return <QuestionForm />;
    }
  };

  return (
    <div className="admin-dashboard-container">
      <Sidebar 
        activePage={activePage} 
        onPageChange={setActivePage} 
      />
      <main className="admin-main-content">
        {renderPage()}
      </main>
    </div>
  );
}