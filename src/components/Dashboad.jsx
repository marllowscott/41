import React, { useState, useEffect } from "react";
import { FiBarChart2, FiCalendar, FiPlus, FiX, FiChevronRight, FiTrendingUp, FiActivity } from "react-icons/fi";

const Dashboard = () => {
  const [moodData, setMoodData] = useState([]);
  const [mood, setMood] = useState("happy");
  const [activities, setActivities] = useState("");
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Mood configuration
  const moods = {
    happy: { color: "#4CAF50", name: "Happy" },
    neutral: { color: "#2196F3", name: "Neutral" },
    sad: { color: "#F44336", name: "Sad" },
  };

  // Load data from localStorage
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("moodData")) || [];
    setMoodData(storedData);
  }, []);

  // Save mood entry
  const addMoodEntry = () => {
    if (!mood) return;

    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      mood,
      activities: activities.split(",").map(a => a.trim()).filter(a => a),
      notes,
    };

    const updatedData = [...moodData, newEntry];
    setMoodData(updatedData);
    localStorage.setItem("moodData", JSON.stringify(updatedData));
    setActivities("");
    setNotes("");
    setActiveTab("dashboard");
  };

  // Delete entry
  const deleteEntry = (id) => {
    const updatedData = moodData.filter(entry => entry.id !== id);
    setMoodData(updatedData);
    localStorage.setItem("moodData", JSON.stringify(updatedData));
    setSelectedEntry(null);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate statistics
  const totalEntries = moodData.length;
  const moodCounts = moodData.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {});

  const happyPercentage = totalEntries ? Math.round((moodCounts.happy || 0) / totalEntries * 100) : 0;
  const streakCount = calculateStreak(moodData);

  // Calculate current streak
  function calculateStreak(entries) {
    if (entries.length === 0) return 0;
    
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    let prevDate = new Date();
    
    // Check if today has an entry
    const today = new Date().toISOString().split('T')[0];
    const hasToday = sortedEntries.some(e => e.date.split('T')[0] === today);
    
    if (!hasToday) return 0;
    
    streak = 1;
    
    for (let i = 1; i < sortedEntries.length; i++) {
      const currentDate = new Date(sortedEntries[i].date);
      const diffTime = prevDate - currentDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays > 1) break;
      if (diffDays === 1) streak++;
      
      prevDate = currentDate;
    }
    
    return streak;
  }

  // Generate weekly data
  const getWeeklyData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = moodData.find(e => e.date.split('T')[0] === dateStr);
      days.push({
        date: dateStr,
        mood: entry ? entry.mood : null,
        weekday: date.toLocaleDateString(undefined, { weekday: 'short' })
      });
    }
    return days;
  };

  // Generate monthly data
  const getMonthlyData = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    // Add empty slots for days before the 1st
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add actual days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i).toISOString().split('T')[0];
      const entry = moodData.find(e => e.date.split('T')[0] === currentDate);
      days.push({
        date: currentDate,
        mood: entry ? entry.mood : null,
        day: i
      });
    }
    
    return days;
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="app-title">MoodFlow</h1>
          <button className="close-menu" onClick={() => setIsMenuOpen(false)}>
            <FiX size={24} />
          </button>
        </div>
        
        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('dashboard');
              setIsMenuOpen(false);
            }}
          >
            <FiBarChart2 className="nav-icon" />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'entries' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('entries');
              setIsMenuOpen(false);
            }}
          >
            <FiCalendar className="nav-icon" />
            <span>All Entries</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('new');
              setIsMenuOpen(false);
            }}
          >
            <FiPlus className="nav-icon" />
            <span>New Entry</span>
          </button>
        </nav>
        
        <div className="user-info">
          <div className="user-avatar">👤</div>
          <div className="user-name">User Profile</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Mobile Header */}
        <div className="mobile-header">
          <button className="menu-button" onClick={() => setIsMenuOpen(true)}>
            ☰
          </button>
          <h1 className="app-title">MoodFlow</h1>
        </div>

        {activeTab === 'dashboard' && (
          <div className="dashboard-container">
            {/* Stats Overview */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{totalEntries}</div>
                <div className="stat-label">Total Entries</div>
                <div className="stat-trend">
                  <FiTrendingUp />
                  <span>+12%</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{streakCount}</div>
                <div className="stat-label">Day Streak</div>
                <div className="stat-icon"></div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{happyPercentage}%</div>
                <div className="stat-label">Happiness</div>
                <div className="stat-icon"></div>
              </div>
            </div>

            {/* Weekly Mood Chart */}
            <div className="chart-card">
              <div className="card-header">
                <h2>Weekly Mood</h2>
                <button className="view-all">View Details <FiChevronRight /></button>
              </div>
              <div className="weekly-chart">
                {getWeeklyData().map((day, index) => (
                  <div key={index} className="chart-column">
                    <div className="chart-bar-container">
                      <div 
                        className="chart-bar" 
                        style={{
                          height: day.mood ? '100%' : '20%',
                          backgroundColor: day.mood ? moods[day.mood].color : '#e0e0e0'
                        }}
                      ></div>
                    </div>
                    <div className="chart-label">{day.weekday}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood Distribution */}
            <div className="chart-card">
              <div className="card-header">
                <h2>Mood Distribution</h2>
              </div>
              <div className="mood-distribution">
                {Object.entries(moods).map(([key, moodConfig]) => (
                  <div key={key} className="mood-dist-item">
                    <div className="mood-emoji">{moodConfig.emoji}</div>
                    <div className="mood-info">
                      <div className="mood-name">{moodConfig.name}</div>
                      <div className="mood-bar-container">
                        <div 
                          className="mood-bar" 
                          style={{
                            width: `${(moodCounts[key] || 0) / totalEntries * 100}%`,
                            backgroundColor: moodConfig.color
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="mood-count">{moodCounts[key] || 0}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Calendar */}
            <div className="calendar-card">
              <div className="card-header">
                <h2>Monthly Overview</h2>
                <div className="month-name">
                  {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div className="calendar-grid">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                  <div key={day} className="calendar-weekday">{day}</div>
                ))}
                
                {getMonthlyData().map((day, index) => (
                  <div 
                    key={index} 
                    className={`calendar-day ${day ? '' : 'empty'}`}
                    style={{
                      backgroundColor: day?.mood ? moods[day.mood].color : 'transparent',
                      color: day?.mood ? 'white' : '#333'
                    }}
                  >
                    {day?.day || ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'entries' && (
          <div className="entries-container">
            <div className="card-header">
              <h2>Your Mood Entries</h2>
              <div className="entries-count">{moodData.length} entries</div>
            </div>
            
            {moodData.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"></div>
                <h3>No entries yet</h3>
                <p>Start tracking your mood to see data here</p>
                <button 
                  className="primary-button"
                  onClick={() => setActiveTab('new')}
                >
                  Add First Entry
                </button>
              </div>
            ) : (
              <div className="entries-list">
                {[...moodData].reverse().map(entry => (
                  <div 
                    key={entry.id} 
                    className="entry-card"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <div className="entry-mood" style={{ color: moods[entry.mood].color }}>
                      {moods[entry.mood].emoji}
                    </div>
                    <div className="entry-details">
                      <div className="entry-date">{formatDate(entry.date)}</div>
                      <div className="entry-mood-name">{moods[entry.mood].name}</div>
                      {entry.activities.length > 0 && (
                        <div className="entry-tags">
                          {entry.activities.map((activity, i) => (
                            <span key={i} className="activity-tag">{activity}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="entry-arrow">
                      <FiChevronRight />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'new' && (
          <div className="new-entry-container">
            <div className="card-header">
              <h2>New Mood Entry</h2>
            </div>
            
            <div className="form-group">
              <label>How are you feeling today?</label>
              <div className="mood-selector">
                {Object.entries(moods).map(([key, moodConfig]) => (
                  <button
                    key={key}
                    className={`mood-option ${mood === key ? 'selected' : ''}`}
                    style={{
                      borderColor: mood === key ? moodConfig.color : '#e0e0e0',
                      backgroundColor: mood === key ? `${moodConfig.color}20` : 'white'
                    }}
                    onClick={() => setMood(key)}
                  >
                    <span className="mood-emoji">{moodConfig.emoji}</span>
                    <span className="mood-name">{moodConfig.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>What activities did you do today? (comma separated)</label>
              <input
                type="text"
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                placeholder="e.g. exercise, reading, meeting friends"
              />
            </div>
            
            <div className="form-group">
              <label>Any notes about your day?</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe what contributed to your mood..."
                rows={4}
              />
            </div>
            
            <div className="form-actions">
              <button 
                className="primary-button"
                onClick={addMoodEntry}
                disabled={!mood}
              >
                Save Entry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Mood Entry Details</h2>
              <button className="close-modal" onClick={() => setSelectedEntry(null)}>
                <FiX size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="entry-header">
                <div 
                  className="entry-mood-large"
                  style={{ color: moods[selectedEntry.mood].color }}
                >
                  {moods[selectedEntry.mood].emoji}
                </div>
                <div>
                  <div className="entry-date-large">
                    {formatDate(selectedEntry.date)}
                  </div>
                  <div className="entry-mood-name-large">
                    {moods[selectedEntry.mood].name}
                  </div>
                </div>
              </div>
              
              {selectedEntry.activities.length > 0 && (
                <div className="modal-section">
                  <h3>Activities</h3>
                  <div className="activity-tags">
                    {selectedEntry.activities.map((activity, i) => (
                      <span key={i} className="activity-tag">{activity}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedEntry.notes && (
                <div className="modal-section">
                  <h3>Notes</h3>
                  <div className="entry-notes">
                    {selectedEntry.notes}
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="danger-button"
                onClick={() => {
                  deleteEntry(selectedEntry.id);
                }}
              >
                Delete Entry
              </button>
              <button 
                className="secondary-button"
                onClick={() => setSelectedEntry(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Styles */}
      <style jsx>{`
        :root {
          --primary-color: #2563eb;
          --primary-light: #dbeafe;
          --text-color: #1e293b;
          --text-light: #64748b;
          --border-color: #e2e8f0;
          --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: var(--text-color);
          background-color: #f8fafc;
        }
        
        .app-container {
          display: flex;
          min-height: 100vh;
        }
        
        /* Sidebar Styles */
        .sidebar {
          width: 280px;
          background-color: white;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          transition: transform 0.3s ease;
          position: fixed;
          height: 100vh;
          z-index: 100;
        }
        
        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .app-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-color);
        }
        
        .close-menu {
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          display: none;
        }
        
        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-light);
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .nav-item:hover {
          background-color: var(--primary-light);
          color: var(--primary-color);
        }
        
        .nav-item.active {
          background-color: var(--primary-light);
          color: var(--primary-color);
          font-weight: 600;
        }
        
        .nav-icon {
          font-size: 1.25rem;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 0;
          margin-top: auto;
          border-top: 1px solid var(--border-color);
        }
        
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: var(--primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-color);
          font-size: 1.25rem;
        }
        
        .user-name {
          font-weight: 500;
        }
        
        /* Main Content Styles */
        .main-content {
          flex: 1;
          padding: 2rem;
          margin-left: 280px;
          background-color: #f8fafc;
        }
        
        .mobile-header {
          display: none;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .menu-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-color);
        }
        
        /* Dashboard Styles */
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        
        .stat-card {
          background-color: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: var(--card-shadow);
          position: relative;
          overflow: hidden;
        }
        
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        
        .stat-label {
          color: var(--text-light);
          font-size: 0.875rem;
        }
        
        .stat-trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #10b981;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
        
        .stat-icon {
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 1.5rem;
          opacity: 0.2;
        }
        
        .chart-card, .calendar-card {
          background-color: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: var(--card-shadow);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .card-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .view-all {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: none;
          border: none;
          color: var(--primary-color);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
        }
        
        .weekly-chart {
          display: flex;
          justify-content: space-between;
          height: 200px;
          align-items: flex-end;
        }
        
        .chart-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          max-width: 40px;
        }
        
        .chart-bar-container {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: flex-end;
        }
        
        .chart-bar {
          width: 100%;
          border-radius: 6px 6px 0 0;
          transition: height 0.5s ease;
        }
        
        .chart-label {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-light);
        }
        
        .mood-distribution {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .mood-dist-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .mood-emoji {
          font-size: 1.5rem;
        }
        
        .mood-info {
          flex: 1;
        }
        
        .mood-name {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        
        .mood-bar-container {
          height: 8px;
          background-color: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .mood-bar {
          height: 100%;
          border-radius: 4px;
        }
        
        .mood-count {
          font-weight: 600;
          min-width: 20px;
          text-align: right;
        }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
        }
        
        .calendar-weekday {
          text-align: center;
          font-size: 0.75rem;
          color: var(--text-light);
          font-weight: 500;
          padding: 0.5rem 0;
        }
        
        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .calendar-day.empty {
          visibility: hidden;
        }
        
        .month-name {
          color: var(--text-light);
          font-size: 0.875rem;
        }
        
        /* Entries List Styles */
        .entries-container {
          background-color: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: var(--card-shadow);
        }
        
        .entries-count {
          color: var(--text-light);
          font-size: 0.875rem;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 0;
          text-align: center;
        }
        
        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        
        .empty-state h3 {
          margin-bottom: 0.5rem;
        }
        
        .empty-state p {
          color: var(--text-light);
          margin-bottom: 1.5rem;
        }
        
        .entries-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .entry-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .entry-card:hover {
          background-color: #f1f5f9;
        }
        
        .entry-mood {
          font-size: 1.5rem;
        }
        
        .entry-details {
          flex: 1;
        }
        
        .entry-date {
          font-size: 0.75rem;
          color: var(--text-light);
          margin-bottom: 0.25rem;
        }
        
        .entry-mood-name {
          font-weight: 500;
        }
        
        .entry-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          margin-top: 0.5rem;
        }
        
        .activity-tag {
          background-color: #e2e8f0;
          color: #334155;
          padding: 0.25rem 0.5rem;
          border-radius: 999px;
          font-size: 0.75rem;
        }
        
        .entry-arrow {
          color: var(--text-light);
        }
        
        /* New Entry Form Styles */
        .new-entry-container {
          background-color: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: var(--card-shadow);
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .form-group input, .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-family: inherit;
          font-size: 1rem;
          transition: border 0.2s;
        }
        
        .form-group input:focus, .form-group textarea:focus {
          outline: none;
          border-color: var(--primary-color);
        }
        
        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }
        
        .mood-selector {
          display: flex;
          gap: 0.75rem;
        }
        
        .mood-option {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border: 2px solid;
          border-radius: 8px;
          background: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .mood-option.selected {
          font-weight: 600;
        }
        
        .mood-emoji {
          font-size: 2rem;
        }
        
        .mood-name {
          font-size: 0.875rem;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
        }
        
        /* Button Styles */
        .primary-button {
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .primary-button:hover {
          background-color: #1d4ed8;
        }
        
        .primary-button:disabled {
          background-color: #cbd5e1;
          cursor: not-allowed;
        }
        
        .secondary-button {
          background-color: white;
          color: var(--primary-color);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .secondary-button:hover {
          background-color: #f1f5f9;
        }
        
        .danger-button {
          background-color: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .danger-button:hover {
          background-color: #fecaca;
        }
        
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        
        .modal-content {
          background-color: white;
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .close-modal {
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
        }
        
        .modal-body {
          padding: 1.5rem;
        }
        
        .entry-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .entry-mood-large {
          font-size: 3rem;
        }
        
        .entry-date-large {
          color: var(--text-light);
          font-size: 0.875rem;
        }
        
        .entry-mood-name-large {
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .modal-section {
          margin-bottom: 1.5rem;
        }
        
        .modal-section h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }
        
        .entry-notes {
          white-space: pre-wrap;
          line-height: 1.6;
        }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--border-color);
        }
        
        /* Responsive Styles */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          
          .sidebar.open {
            transform: translateX(0);
          }
          
          .close-menu {
            display: block;
          }
          
          .main-content {
            margin-left: 0;
          }
          
          .mobile-header {
            display: flex;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .mood-selector {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;