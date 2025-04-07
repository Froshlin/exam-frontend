// admin/dashboard/CourseManagement.js
"use client";

import { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance"; // Import axiosInstance
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./course-management.css";

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);
  const [editCourseName, setEditCourseName] = useState("");

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("/courses"); // Use axiosInstance
        setCourses(response.data);
      } catch (error) {
        toast.error("Failed to fetch courses", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };
    fetchCourses();
  }, []);

  // Add a new course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.trim()) return;

    try {
      const response = await axiosInstance.post("/courses", { name: newCourse }); // Use axiosInstance
      setCourses([...courses, response.data]);
      setNewCourse("");
      toast.success("Course added successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Failed to add course", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Start editing a course
  const handleEditCourse = (course) => {
    setEditingCourse(course._id);
    setEditCourseName(course.name);
  };

  // Save edited course
  const handleSaveEdit = async (courseId) => {
    try {
      const response = await axiosInstance.put(`/courses/${courseId}`, { name: editCourseName }); // Use axiosInstance
      setCourses(courses.map((course) => (course._id === courseId ? response.data : course)));
      setEditingCourse(null);
      setEditCourseName("");
      toast.success("Course updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Failed to update course", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Delete a course
  const handleDeleteCourse = async (courseId) => {
    try {
      await axiosInstance.delete(`/courses/${courseId}`); // Use axiosInstance
      setCourses(courses.filter((course) => course._id !== courseId));
      toast.success("Course deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Failed to delete course", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="course-management-container">
      <h2>Course Management</h2>

      {/* Add Course Form */}
      <form onSubmit={handleAddCourse} className="add-course-form">
        <div className="form-group">
          <label>Add New Course:</label>
          <input
            type="text"
            value={newCourse}
            onChange={(e) => setNewCourse(e.target.value)}
            placeholder="Enter course name"
            required
          />
        </div>
        <button type="submit">Add Course</button>
      </form>

      {/* Course List */}
      <div className="course-list">
        <h3>Existing Courses</h3>
        {courses.length === 0 ? (
          <p>No courses available.</p>
        ) : (
          <ul>
            {courses.map((course) => (
              <li key={course._id} className="course-item">
                {editingCourse === course._id ? (
                  <>
                    <input
                      type="text"
                      value={editCourseName}
                      onChange={(e) => setEditCourseName(e.target.value)}
                    />
                    <button onClick={() => handleSaveEdit(course._id)}>Save</button>
                    <button onClick={() => setEditingCourse(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span>{course.name}</span>
                    <div className="course-actions">
                      <button onClick={() => handleEditCourse(course)}>Edit</button>
                      <button onClick={() => handleDeleteCourse(course._id)}>Delete</button>
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