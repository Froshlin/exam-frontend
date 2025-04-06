"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../../../services/api"; // Adjusted path
import "../../../styles/admin.css"; // Your custom admin styles

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!credentials.email || !credentials.password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.loginAdmin(
        credentials.email,
        credentials.password
      );

      // Save token and redirect
      localStorage.setItem("token", response.token);
      router.push("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Admin Login</h2>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Admin Email"
            value={credentials.email}
            onChange={handleChange}
            className="form-input"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={credentials.password}
            onChange={handleChange}
            className="form-input"
            required
          />

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-text">Logging in...</span>
                <div className="loading-spinner"></div>
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
