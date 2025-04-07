"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import "../../../styles/StudentDashboard.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BookOpen,
  GraduationCap,
  Star,
  ClipboardList,
  BookmarkCheck,
  LogOut,
} from "lucide-react";

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [user, setUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(35 * 60); // 35 minutes in seconds
  const router = useRouter();

  // Fetch user details and courses on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "https://exam-backend.up.railway.app/api/auth/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Fetched user:", response.data);
        setUser(response.data);
      } catch (error) {
        console.error("Fetch user error:", error);
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        router.push("/login");
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          "https://exam-backend.up.railway.app/api/courses",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
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
          submitExam(); // Auto-submit when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examQuestions, timeLeft]);

  const startExam = async (courseId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `https://exam-backend.up.railway.app/api/questions/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Fetched questions for courseId:", courseId, response.data);
      setExamQuestions(response.data);
      setSelectedCourse(courseId);
      setAnswers({});
      setTimeLeft(35 * 60); // Reset timer to 35 minutes
    } catch (error) {
      console.error(
        "Error fetching exam questions:",
        error.response ? error.response.data : error.message
      );
      toast.error("Failed to fetch exam questions");
    }
  };

  const submitExam = async () => {
    const token = localStorage.getItem("token");
    console.log("Submitting answers:", answers);

    try {
      const response = await axios.post(
        `https://exam-backend.up.railway.app/api/exam/${selectedCourse}/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Submission response:", response.data);

      // Refetch user data to get updated grades
      const userResponse = await axios.get(
        "https://exam-backend.up.railway.app/api/auth/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Fetched user after submission:", userResponse.data);
      setUser(userResponse.data);

      setExamQuestions([]);
      setSelectedCourse(null);
      setTimeLeft(0); // Reset timer
      toast.success(
        `Exam completed! Score: ${response.data.score.toFixed(2)}%`
      );
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

  // Logout function
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          "https://exam-backend.up.railway.app/api/auth/logout",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out on the server. Logging out locally.");
    } finally {
      localStorage.removeItem("token");
      toast.success("Logged out successfully!");
      router.push("/login");
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="student-dashboard">
      <div className="sidebar">
        <h2>
          <GraduationCap size={24} /> Courses
        </h2>
        {courses.map((course) => (
          <div key={course._id} className="sidebar-item">
            <button onClick={() => startExam(course._id)}>
              <BookOpen size={18} /> {course.name} ({course._id})
            </button>
          </div>
        ))}
        <div className="grades-section">
          <h3>
            <Star size={20} /> My Grades
          </h3>
          {user?.grades?.length > 0 ? (
            user.grades.map((grade) => {
              const courseName = courses.find(
                (c) => c._id === grade.courseId
              )?.name;
              return (
                <div key={grade.courseId} className="grade-item">
                  <span>
                    <ClipboardList size={16} /> {courseName || "Unknown Course"}
                  </span>
                  <span>
                    <BookmarkCheck size={16} /> {grade.score.toFixed(2)}%
                  </span>
                </div>
              );
            })
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

      <div className="main-content">
        {examQuestions.length > 0 ? (
          <div className="exam-container">
            <h2>Exam: {selectedCourse}</h2>
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
          <div className="welcome-message">
            <h2>
              Welcome to Student Dashboard, {user?.matricNumber || "Student"}
            </h2>
            <p>Select a course from the sidebar to start an exam</p>
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}