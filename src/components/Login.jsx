import React, { useState } from "react";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // The backend expects "username" and "password"
          // We'll use the email from the form as the username
          username: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // A successful login returns a token
        const token = data.token;
        // Store the token in local storage for future authenticated requests
        localStorage.setItem("token", token);
        setMessage("Login successful! Redirecting...");
        // You would typically redirect the user to a dashboard here
        // window.location.href = "/dashboard";
      } else {
        // If the server returns an error message
        setMessage(data.msg || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setMessage("Failed to connect to the server. Please try again later.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>
      {message && <p className="login-message">{message}</p>}
    </div>
  );
}