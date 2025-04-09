// admin/dashboard/ManageQuestions.js
"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./manage-questions.css";

export default function ManageQuestions() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("/courses");
        setCourses(response.data);
      } catch (error) {
        toast.error("Failed to fetch courses");
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // Fetch questions when a course is selected
  useEffect(() => {
    if (selectedCourse) {
      const fetchQuestions = async () => {
        setIsLoading(true);
        try {
          const response = await axiosInstance.get(`/questions?courseId=${selectedCourse}`);
          console.log("Fetched questions for course", selectedCourse, ":", response.data); // Debug log
          setQuestions(response.data.filter(q => q.courseId === selectedCourse)); // Ensure frontend filtering
        } catch (error) {
          toast.error("Failed to fetch questions");
          console.error("Error fetching questions:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchQuestions();
    } else {
      setQuestions([]); // Clear questions when no course is selected
    }
  }, [selectedCourse]);

  // Handle course selection
  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
    setEditingQuestion(null); // Reset editing state when course changes
    setQuestions([]); // Clear questions when changing course
  };

  // Handle edit button click
  const handleEdit = (question) => {
    console.log("Editing question:", question); // Debug log
    setEditingQuestion(question);
    setFormData({
      text: question.text || "", // Ensure question is not undefined
      options: question.options || ["", "", "", ""],
      correctAnswer: question.correctAnswer || "",
    });
  };

  // Handle form input changes
  const handleInputChange = (e, index = null) => {
    if (index !== null) {
      const newOptions = [...formData.options];
      newOptions[index] = e.target.value;
      setFormData({ ...formData, options: newOptions });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Handle form submission for editing
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.text || formData.options.some(opt => !opt) || !formData.correctAnswer) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await axiosInstance.put(`/questions/${editingQuestion._id}`, {
        courseId: selectedCourse,
        text: formData.text,
        options: formData.options,
        correctAnswer: formData.correctAnswer,
      });
      toast.success("Question updated successfully");
      setEditingQuestion(null);
      // Refresh questions
      const response = await axiosInstance.get(`/questions?courseId=${selectedCourse}`);
      setQuestions(response.data.filter(q => q.courseId === selectedCourse));
    } catch (error) {
      toast.error("Failed to update question");
      console.error("Error updating question:", error);
    }
  };

  // Handle delete button click
  const handleDelete = async (questionId) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      await axiosInstance.delete(`/questions/${questionId}`);
      toast.success("Question deleted successfully");
      setQuestions(questions.filter(q => q._id !== questionId));
    } catch (error) {
      toast.error("Failed to delete question");
      console.error("Error deleting question:", error);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setFormData({
      text: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    });
  };

  return (
    <div className="manage-questions-container">
      <h2>Manage Questions</h2>

      {/* Course Selection */}
      <div className="course-selection">
        <label htmlFor="course">Course:</label>
        <select
          id="course"
          value={selectedCourse}
          onChange={handleCourseChange}
          className="course-dropdown"
        >
          <option value="">Select a course</option>
          {courses.map(course => (
            <option key={course._id} value={course._id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      {/* Questions List or Edit Form */}
      {editingQuestion ? (
        <form onSubmit={handleSubmit} className="edit-question-form">
          <div className="form-group">
            <label htmlFor="question">Question:</label>
            <textarea
              id="question"
              name="question"
              value={formData.text}
              onChange={handleInputChange}
              placeholder="Enter question"
              required
            />
          </div>

          <div className="form-group">
            <label>Options:</label>
            {formData.options.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => handleInputChange(e, index)}
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                required
              />
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="correctAnswer">Correct Answer:</label>
            <select
              id="correctAnswer"
              name="correctAnswer"
              value={formData.correctAnswer}
              onChange={handleInputChange}
              required
            >
              <option value="">Select correct answer</option>
              {formData.options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-button">
              Save Changes
            </button>
            <button type="button" className="cancel-button" onClick={handleCancelEdit}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="questions-list">
          {isLoading ? (
            <p>Loading questions...</p>
          ) : selectedCourse && questions.length > 0 ? (
            questions.map(question => (
              <div key={question._id} className="question-item">
                <div className="question-content">
                  <h4>{question.question}</h4>
                  <ul>
                    {question.options.map((option, index) => (
                      <li key={index} className={option === question.correctAnswer ? "correct" : ""}>
                        {String.fromCharCode(65 + index)}. {option}
                        {option === question.correctAnswer && " (Correct)"}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="question-actions">
                  <button className="edit-button" onClick={() => handleEdit(question)}>
                    Edit
                  </button>
                  <button className="delete-button" onClick={() => handleDelete(question._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : selectedCourse ? (
            <p>No questions found for this course.</p>
          ) : (
            <p>Please select a course to view questions.</p>
          )}
        </div>
      )}

      <ToastContainer />
    </div>
  );
}