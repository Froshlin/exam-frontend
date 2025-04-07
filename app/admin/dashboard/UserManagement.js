// admin/dashboard/UserManagement.js
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./user-management.css";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", email: "", role: "student" });
  const [editingUser, setEditingUser] = useState(null);
  const [editUserData, setEditUserData] = useState({ username: "", email: "", role: "" });

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("https://exam-backend.up.railway.app/api/users");
        setUsers(response.data);
      } catch (error) {
        toast.error("Failed to fetch users", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };
    fetchUsers();
  }, []);

  // Add a new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.username.trim() || !newUser.email.trim()) return;

    try {
      const response = await axios.post("https://exam-backend.up.railway.app/api/users", newUser);
      setUsers([...users, response.data]);
      setNewUser({ username: "", email: "", role: "student" });
      toast.success("User added successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Failed to add user", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Start editing a user
  const handleEditUser = (user) => {
    setEditingUser(user._id);
    setEditUserData({ username: user.username, email: user.email, role: user.role });
  };

  // Save edited user
  const handleSaveEdit = async (userId) => {
    try {
      const response = await axios.put(
        `https://exam-backend.up.railway.app/api/users/${userId}`,
        editUserData
      );
      setUsers(
        users.map((user) => (user._id === userId ? response.data : user))
      );
      setEditingUser(null);
      setEditUserData({ username: "", email: "", role: "" });
      toast.success("User updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Failed to update user", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Delete a user
  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`https://exam-backend.up.railway.app/api/users/${userId}`);
      setUsers(users.filter((user) => user._id !== userId));
      toast.success("User deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Failed to delete user", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="user-management-container">
      <h2>User Management</h2>

      {/* Add User Form */}
      <form onSubmit={handleAddUser} className="add-user-form">
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            placeholder="Enter username"
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            placeholder="Enter email"
            required
          />
        </div>
        <div className="form-group">
          <label>Role:</label>
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit">Add User</button>
      </form>

      {/* User List */}
      <div className="user-list">
        <h3>Existing Users</h3>
        {users.length === 0 ? (
          <p>No users available.</p>
        ) : (
          <ul>
            {users.map((user) => (
              <li key={user._id} className="user-item">
                {editingUser === user._id ? (
                  <>
                    <input
                      type="text"
                      value={editUserData.username}
                      onChange={(e) =>
                        setEditUserData({ ...editUserData, username: e.target.value })
                      }
                    />
                    <input
                      type="email"
                      value={editUserData.email}
                      onChange={(e) =>
                        setEditUserData({ ...editUserData, email: e.target.value })
                      }
                    />
                    <select
                      value={editUserData.role}
                      onChange={(e) =>
                        setEditUserData({ ...editUserData, role: e.target.value })
                      }
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button onClick={() => handleSaveEdit(user._id)}>Save</button>
                    <button onClick={() => setEditingUser(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span>
                      {user.username} ({user.email}) - {user.role}
                    </span>
                    <div className="user-actions">
                      <button onClick={() => handleEditUser(user)}>Edit</button>
                      <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}