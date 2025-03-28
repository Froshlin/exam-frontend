"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../../../styles/StudentDashboard.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  BookOpen, 
  GraduationCap, 
  Star, 
  ClipboardList, 
  BookmarkCheck 
} from 'lucide-react';

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [grades, setGrades] = useState({});

  useEffect(() => {
    const fetchCourses = async () => {
        try {
            const response = await axios.get("https://exam-backend.up.railway.app/api/courses");
            setCourses(response.data);
          } catch (error) {
            console.error("Courses fetch error:", error.response ? error.response.data : error.message);
            toast.error(`Failed to fetch courses: ${error.message}`);
          }
    };
    fetchCourses();
  }, []);

  const startExam = async (courseId) => {
    try {
      const response = await axios.get(`https://exam-backend.up.railway.app/api/questions/${courseId}`);
      setExamQuestions(response.data);
      setSelectedCourse(courseId);
      setAnswers({});
    } catch (error) {
      toast.error("Failed to fetch exam questions");
    }
  };

  const submitExam = async () => {
    try {
      const response = await axios.post(`https://exam-backend.up.railway.app/api/exam/${selectedCourse}/submit`, { answers });
      const newGrades = {...grades};
      newGrades[selectedCourse] = response.data.score;
      setGrades(newGrades);
      setExamQuestions([]);
      setSelectedCourse(null);
      toast.success(`Exam completed! Score: ${response.data.score.toFixed(2)}%`);
    } catch (error) {
      toast.error("Failed to submit exam");
    }
  };

  const handleAnswerSelect = (questionId, selectedOption) => {
    setAnswers({...answers, [questionId]: selectedOption});
  };

  return (
    <div className="student-dashboard">
      <div className="sidebar">
        <h2><GraduationCap size={24} /> Courses</h2>
        {courses.map(course => (
          <div key={course._id} className="sidebar-item">
            <button onClick={() => startExam(course._id)}>
              <BookOpen size={18} /> {course.name} ({course._id})
            </button>
          </div>
        ))}
        <div className="grades-section">
          <h3><Star size={20} /> My Grades</h3>
          {Object.entries(grades).map(([courseId, grade]) => {
            const courseName = courses.find(c => c._id === courseId)?.name;
            return (
              <div key={courseId} className="grade-item">
                <span><ClipboardList size={16} /> {courseName}</span>
                <span><BookmarkCheck size={16} /> {grade.toFixed(2)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="main-content">
        {examQuestions.length > 0 ? (
          <div className="exam-container">
            <h2>Exam: {selectedCourse}</h2>
            {examQuestions.map((question, index) => (
              <div key={question._id} className="question-card">
                <p>{question.text}</p>
                {question.options.map((option, optIndex) => (
                  <label key={optIndex} className="option-label">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={String.fromCharCode(65 + optIndex)}
                      checked={answers[question._id] === String.fromCharCode(65 + optIndex)}
                      onChange={() => handleAnswerSelect(question._id, String.fromCharCode(65 + optIndex))}
                    />
                    {String.fromCharCode(65 + optIndex)}. {option}
                  </label>
                ))}
              </div>
            ))}
            <button onClick={submitExam}>Submit Exam</button>
          </div>
        ) : (
          <div className="welcome-message">
            <h2>Welcome to Student Dashboard</h2>
            <p>Select a course from the sidebar to start an exam</p>
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}