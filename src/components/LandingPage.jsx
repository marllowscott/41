import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1>Mood Tracker App</h1>
        <nav>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </nav>
      </header>
      <main className="landing-main">
        <h2>Track your mood, improve your life</h2>
        <p>
          Our app helps you monitor your emotions over time, discover patterns,
          and take steps toward a healthier mindset.
        </p>
        <Link to="/signup" className="cta-button">Get Started</Link>
      </main>
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} Mood Tracker Team. All rights reserved.</p>
      </footer>
    </div>
  );
}
