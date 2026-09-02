import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      console.log("Sending login request...");

      const response = await API.post("/auth/login", {
        email: email.trim(),
        password: password,
      });

      console.log("Login response:", response.data);

      const user = response.data.user;

      if (!user) {
        alert("Login failed: user information not received");
        return;
      }

      // Save complete user
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // Save user ID
      localStorage.setItem(
        "userId",
        user.id || user._id
      );

      alert(
        response.data.message ||
        "Login successful"
      );

      // Redirect according to role
      if (user.role === "hr") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      console.log(
        "Backend response:",
        error.response?.data
      );

      console.log(
        "Status:",
        error.response?.status
      );

      alert(
        error.response?.data?.message ||
        "Login failed. Please check your email and password."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">
          EA
        </div>

        <h1>
          Welcome to Attendify
        </h1>

        <p className="login-subtitle">
          Employee Attendance Management System
        </p>

        <form onSubmit={handleLogin}>

          <label>
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;