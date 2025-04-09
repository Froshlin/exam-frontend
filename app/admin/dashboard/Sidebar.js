import React from 'react';
import './sidebar.css';

export default function Sidebar({ activePage, onPageChange }) {
  const menuItems = [
    { 
      icon: 'plus-circle', 
      label: 'Add Questions', 
      page: 'questions' 
    },
    { 
      icon: "edit",
      label: "Manage Questions", 
      page: "manage-questions" 
    },
    { 
      icon: 'book', 
      label: 'Course Management', 
      page: 'courses' 
    },
    { 
      icon: 'users', 
      label: 'User Management', 
      page: 'users' 
    },
    { 
      icon: 'bar-chart', 
      label: 'Analytics', 
      page: 'analytics' 
    }
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.page}
            onClick={() => onPageChange(item.page)}
            className={`sidebar-nav-item ${activePage === item.page ? 'active' : ''}`}
          >
            <span className={`icon icon-${item.icon}`}></span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}