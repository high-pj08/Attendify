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

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/login", {
        email,
        password,
      });

      const user = response.data.user;

      if (!user) {
        alert("Login failed: user information not received");
        return;
      }

      // Save logged-in user
      localStorage.setItem("user", JSON.stringify(user));

      // Save user ID
      localStorage.setItem("userId", user.id);

      alert(response.data.message || "Login successful");

      // Redirect based on role
      if (user.role === "hr") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

    } catch (error) {
      console.error("Login error:", error);

      alert(
        error.response?.data?.message ||
        "Login failed"
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

        <h1>Welcome to Attendify</h1>

        <p className="login-subtitle">
          Employee Attendance Management System
        </p>

        <form onSubmit={handleLogin}>

          <p style={{ marginTop: "20px", textAlign: "center" }}>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Register
            </button>
          </p>
          
          
          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;