// admin/dashboard/Analytics.js
"use client";

import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance"; // Import axiosInstance
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./analytics.css";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Analytics() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalQuestions: 0,
    questionsPerCourse: [],
  });

  // Fetch analytics data on component mount
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [usersRes, coursesRes, questionsRes] = await Promise.all([
          axiosInstance.get("/users"), // Use axiosInstance
          axiosInstance.get("/courses"), // Use axiosInstance
          axiosInstance.get("/questions"), // Use axiosInstance
        ]);

        const users = usersRes.data;
        const courses = coursesRes.data;
        const questions = questionsRes.data;

        // Calculate questions per course
        const questionsPerCourse = courses.map((course) => ({
          courseName: course.name,
          questionCount: questions.filter((q) => q.courseId === course._id).length,
        }));

        setStats({
          totalUsers: users.length,
          totalCourses: courses.length,
          totalQuestions: questions.length,
          questionsPerCourse,
        });
      } catch (error) {
        toast.error("Failed to fetch analytics data", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };
    fetchAnalytics();
  }, []);

  // Prepare data for the pie chart
  const pieChartData = {
    labels: stats.questionsPerCourse.map((item) => item.courseName),
    datasets: [
      {
        label: "Questions per Course",
        data: stats.questionsPerCourse.map((item) => item.questionCount),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        hoverOffset: 4,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow the chart to adjust its aspect ratio
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14, // Increase font size for legend
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} questions (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="analytics-container">
      <h2>Analytics</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Courses</h3>
          <p>{stats.totalCourses}</p>
        </div>
        <div className="stat-card">
          <h3>Total Questions</h3>
          <p>{stats.totalQuestions}</p>
        </div>
      </div>

      <div className="questions-per-course">
        <h3>Questions Per Course</h3>
        {stats.questionsPerCourse.length === 0 ? (
          <p>No data available.</p>
        ) : (
          <>
            {/* Pie Chart */}
            <div className="pie-chart-container">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>

            {/* List View */}
            <ul>
              {stats.questionsPerCourse.map((item, index) => (
                <li key={index}>
                  {item.courseName}: {item.questionCount} questions
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}