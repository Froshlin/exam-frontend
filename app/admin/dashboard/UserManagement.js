// admin/dashboard/UserManagement.js
"use client";

import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance"; // Import axiosInstance
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./user-management.css";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: "", matricNumber: "", role: "student", password: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [editUserData, setEditUserData] = useState({ email: "", matricNumber: "", role: "", password: "" });

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/users"); // Use axiosInstance
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
    const { email, matricNumber, role, password } = newUser;

    if (!role || !password) {
      toast.error("Role and password are required", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (role === "student" && !matricNumber) {
      toast.error("Matric number is required for students", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (role === "admin" && !email) {
      toast.error("Email is required for admins", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await axiosInstance.post("/users", newUser); // Use axiosInstance
      setUsers([...users, response.data]);
      setNewUser({ email: "", matricNumber: "", role: "student", password: "" });
      toast.success("User added successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Failed to add user: " + (error.response?.data?.message || error.message), {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Start editing a user
  const handleEditUser = (user) => {
    setEditingUser(user._id);
    setEditUserData({
      email: user.email || "",
      matricNumber: user.matricNumber || "",
      role: user.role,
      password: "", // Don't prefill password for security
    });
  };

  // Save edited user
  const handleSaveEdit = async (userId) => {
    try {
      const response = await axiosInstance.put(`/users/${userId}`, editUserData); // Use axiosInstance
      setUsers(users.map((user) => (user._id === userId ? response.data : user)));
      setEditingUser(null);
      setEditUserData({ email: "", matricNumber: "", role: "", password: "" });
      toast.success("User updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Failed to update user: " + (error.response?.data?.message || error.message), {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Delete a user
  const handleDeleteUser = async (userId) => {
    try {
      await axiosInstance.delete(`/users/${userId}`); // Use axiosInstance
      setUsers(users.filter((user) => user._id !== userId));
      toast.success("User deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Failed to delete user: " + (error.response?.data?.message || error.message), {
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
          <label>Role:</label>
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {newUser.role === "student" && (
          <div className="form-group">
            <label>Matric Number:</label>
            <input
              type="text"
              value={newUser.matricNumber}
              onChange={(e) => setNewUser({ ...newUser, matricNumber: e.target.value })}
              placeholder="Enter matric number"
              required={newUser.role === "student"}
            />
          </div>
        )}
        {newUser.role === "admin" && (
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Enter email"
              required={newUser.role === "admin"}
            />
          </div>
        )}
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            placeholder="Enter password"
            required
          />
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
                    <select
                      value={editUserData.role}
                      onChange={(e) =>
                        setEditUserData({ ...editUserData, role: e.target.value })
                      }
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                    {editUserData.role === "student" && (
                      <input
                        type="text"
                        value={editUserData.matricNumber}
                        onChange={(e) =>
                          setEditUserData({ ...editUserData, matricNumber: e.target.value })
                        }
                        placeholder="Matric Number"
                      />
                    )}
                    {editUserData.role === "admin" && (
                      <input
                        type="email"
                        value={editUserData.email}
                        onChange={(e) =>
                          setEditUserData({ ...editUserData, email: e.target.value })
                        }
                        placeholder="Email"
                      />
                    )}
                    <input
                      type="password"
                      value={editUserData.password}
                      onChange={(e) =>
                        setEditUserData({ ...editUserData, password: e.target.value })
                      }
                      placeholder="New Password (optional)"
                    />
                    <button onClick={() => handleSaveEdit(user._id)}>Save</button>
                    <button onClick={() => setEditingUser(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span>
                      {user.role === "student" ? user.matricNumber : user.email} - {user.role}
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