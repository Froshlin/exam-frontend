"use client";

import { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./question-form.css";

export default function QuestionForm() {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    courseId: "",
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("/courses");
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/questions", formData);
      toast.success("Question added successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setFormData({
        courseId: "",
        text: "",
        options: ["", "", "", ""],
        correctAnswer: "",
      });
    } catch (error) {
      toast.error("Failed to add question: " + (error.response?.data?.message || "Unknown error"), {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="question-form-container">
      <h2>Add Questions</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Course:</label>
          <select
            name="courseId"
            value={formData.courseId}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Question:</label>
          <textarea
            name="text"
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
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + index)}`}
              required
            />
          ))}
        </div>

        <div className="form-group">
          <label>Correct Answer:</label>
          <select
            name="correctAnswer"
            value={formData.correctAnswer}
            onChange={handleInputChange}
            required
          >
            <option value="">Select correct answer</option>
            {formData.options.map((option, index) => (
              <option key={index} value={String.fromCharCode(65 + index)}>
                {String.fromCharCode(65 + index)}. {option || "Empty"}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Add Question</button>
      </form>
      <ToastContainer />
    </div>
  );
}