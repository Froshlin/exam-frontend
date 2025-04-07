// student/dashboard/page.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "../../utils/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  BookOpen,
  GraduationCap,
  Star,
  ClipboardList,
  BookmarkCheck,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import "../../../styles/StudentDashboard.css";

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [user, setUser] = useState(null);
  const [grades, setGrades] = useState([]);
  const [timeLeft, setTimeLeft] = useState(35 * 60);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar toggle
  const router = useRouter();

  // Fetch user details, courses, and grades on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get("/auth/me");
        console.log("Fetched user:", response.data);
        setUser(response.data);

        // Fetch grades for the student
        const gradesResponse = await axiosInstance.get(`/grades/student/${response.data.id}`);
        console.log("Fetched grades:", gradesResponse.data);
        setGrades(gradesResponse.data);
      } catch (error) {
        console.error("Fetch user error:", error);
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        router.push("/login");
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("/courses");
        console.log("Fetched courses:", response.data);
        setCourses(response.data);
      } catch (error) {
        console.error(
          "Courses fetch error:",
          error.response ? error.response.data : error.message
        );
        toast.error(`Failed to fetch courses: ${error.message}`);
      }
    };

    fetchUser();
    fetchCourses();
  }, [router]);

  // Timer logic
  useEffect(() => {
    if (examQuestions.length === 0 || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examQuestions, timeLeft]);

  const startExam = async (courseId) => {
    try {
      const response = await axiosInstance.get(`/questions/${courseId}`);
      if (response.data.length === 0) {
        toast.error("No questions available for this course");
        return;
      }
      console.log("Fetched questions for courseId:", courseId, response.data);
      setExamQuestions(response.data);
      setSelectedCourse(courseId);
      setAnswers({});
      setTimeLeft(35 * 60);
      setIsSidebarOpen(false); // Close sidebar when starting an exam
    } catch (error) {
      console.error(
        "Error fetching exam questions:",
        error.response ? error.response.data : error.message
      );
      toast.error("Failed to fetch exam questions");
    }
  };

  const submitExam = async () => {
    console.log("Submitting answers:", answers);

    try {
      const response = await axiosInstance.post(`/exam/${selectedCourse}/submit`, { answers });
      console.log("Submission response:", response.data);

      // Refetch grades after submission
      const gradesResponse = await axiosInstance.get(`/grades/student/${user.id}`);
      console.log("Fetched grades after submission:", gradesResponse.data);
      setGrades(gradesResponse.data);

      setExamQuestions([]);
      setSelectedCourse(null);
      setTimeLeft(0);
    } catch (error) {
      console.error("Submission error:", {
        message: error.message,
        response: error.response ? error.response.data : null,
        status: error.response ? error.response.status : null,
      });
      toast.error("Failed to submit exam");
    }
  };

  const handleAnswerSelect = (questionId, selectedOption) => {
    setAnswers({ ...answers, [questionId]: selectedOption });
    console.log("Selected answer:", { questionId, selectedOption });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully!");
    router.push("/login");
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="student-dashboard">
      {/* Hamburger Menu for Mobile */}
      <div className="hamburger-menu">
        <button onClick={toggleSidebar} className="hamburger-button">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <h2>
          <GraduationCap size={24} /> Courses
        </h2>
        {courses.map((course) => (
          <div key={course._id} className="sidebar-item">
            <button onClick={() => startExam(course._id)}>
              <BookOpen size={18} /> {course.name}
            </button>
          </div>
        ))}
        <div className="grades-section">
          <h3>
            <Star size={20} /> My Grades
          </h3>
          {grades.length > 0 ? (
            grades.map((grade) => (
              <div key={grade._id} className="grade-item">
                <span>
                  <ClipboardList size={16} /> {grade.courseId.name}
                </span>
                <span>
                  <BookmarkCheck size={16} /> {grade.score.toFixed(2)}%
                </span>
              </div>
            ))
          ) : (
            <p>No grades available yet.</p>
          )}
        </div>
        <div className="sidebar-item logout-section">
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {examQuestions.length > 0 ? (
          <div className="exam-container">
            <h2>Exam: {courses.find((c) => c._id === selectedCourse)?.name}</h2>
            <div className="countdown-timer">
              <span className={timeLeft <= 300 ? "countdown-warning" : ""}>
                Time Left: {formatTime(timeLeft)}
              </span>
            </div>

            {examQuestions.map((question, index) => (
              <div key={question._id} className="question-card">
                <p>{question.text}</p>
                {question.options.map((option, optIndex) => (
                  <label key={optIndex} className="option-label">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={String.fromCharCode(65 + optIndex)}
                      checked={
                        answers[question._id] ===
                        String.fromCharCode(65 + optIndex)
                      }
                      onChange={() =>
                        handleAnswerSelect(
                          question._id,
                          String.fromCharCode(65 + optIndex)
                        )
                      }
                    />
                    {String.fromCharCode(65 + optIndex)}. {option}
                  </label>
                ))}
              </div>
            ))}
            <button onClick={submitExam} disabled={timeLeft <= 0}>
              Submit Exam
            </button>
          </div>
        ) : (
          <div className="grades-container">
            {grades.length > 0 ? (
              <>
                <h2>Your Exam Results</h2>
                <div className="grades-grid">
                  {grades.map((grade) => (
                    <div key={grade._id} className="grade-card">
                      <h3>{grade.courseId.name}</h3>
                      <div className="circular-progress">
                        <CircularProgressbar
                          value={grade.score}
                          text={`${grade.score.toFixed(2)}%`}
                          styles={buildStyles({
                            pathColor: grade.score >= 70 ? "#4caf50" : grade.score >= 50 ? "#ffca28" : "#f44336",
                            textColor: "#333",
                            trailColor: "#d6d6d6",
                            textSize: "18px",
                            pathTransitionDuration: 0.5,
                          })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="welcome-message">
                <h2>
                  Welcome to Student Dashboard, {user?.matricNumber || "Student"}
                </h2>
                <p>Select a course from the sidebar to start an exam</p>
              </div>
            )}
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}