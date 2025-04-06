"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/auth.css";

export default function StudentLogin() {
  const [credentials, setCredentials] = useState({
    matricNumber: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate inputs before sending
    if (!credentials.matricNumber) {
      setError("Matric Number is required");
      toast.error("Matric Number is required");
      return;
    }
    
    if (!credentials.password) {
      setError("Password is required");
      toast.error("Password is required");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/auth/login", {
        role: "student",
        matricNumber: credentials.matricNumber,
        password: credentials.password,
      });

      setSuccess("Login successful! Redirecting...");
      toast.success("Login successful! Redirecting...");

      // Store the token
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", "student");
      }

      setTimeout(() => {
        router.push("/student/dashboard");
      }, 2000);
    } catch (err) {
      console.error('Login error:', err.response?.data);
      const errorMessage = err.response?.data?.message || "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Student Login</h2>
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="matricNumber"
            placeholder="Matric Number"
            value={credentials.matricNumber}
            onChange={handleChange}
            className="form-input"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={credentials.password}
            onChange={handleChange}
            className="form-input"
          />

          <button type="submit" className="submit-button">
            Login
          </button>
          
          <div className="auth-links">
            <Link href="/register">Don't have an account? Register</Link>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}