import { useState } from "react";

const LEVELS = ["N5", "N4", "N3", "N2", "N1"];
const TESTS_PER_LEVEL = 5;
const PASS_THRESHOLD = 0.6; // 60% or higher on a sub-test counts as "passed" for progress

function Profile({ profile, onSaveProfile, history }) {
  const [editing, setEditing] = useState(!profile.name && !profile.email);
  const [nameInput, setNameInput] = useState(profile.name || "");
  const [emailInput, setEmailInput] = useState(profile.email || "");

  const handleSave = () => {
    onSaveProfile({
      name: nameInput.trim() || "Learner",
      email: emailInput.trim() || "not set",
    });
    setEditing(false);
  };

  // ---------- Stats ----------
  const totalQuizzes = history.length;

  const questionsAnswered = history.reduce((sum, h) => sum + h.total, 0);

  const percentages = history.map((h) => Math.round((h.score / h.total) * 100));

  const averageScore =
    totalQuizzes > 0
      ? Math.round(percentages.reduce((a, b) => a + b, 0) / totalQuizzes)
      : 0;

  const bestScore = totalQuizzes > 0 ? Math.max(...percentages) : 0;

  // ---------- Level progress ----------
  // For each level, progress = (number of distinct sub-tests 1-5 passed at
  // least once with score >= 60%) / 5 total sub-tests * 100
  const levelProgress = LEVELS.map((level) => {
    const passedTests = new Set(
      history
        .filter(
          (h) => h.level === level && h.score / h.total >= PASS_THRESHOLD
        )
        .map((h) => h.testNumber)
    );

    const percent = Math.round((passedTests.size / TESTS_PER_LEVEL) * 100);

    return { level, percent, passed: passedTests.size };
  });

  const initials = (profile.name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="app home-screen">
      <div className="profile-page">
        {/* USER PROFILE CARD */}
        <div className="profile-card">
          <div className="avatar-circle">{initials || "👤"}</div>

          {!editing ? (
            <>
              <h2 className="profile-name">{profile.name}</h2>
              <p className="profile-email">{profile.email}</p>
              <button
                className="edit-profile-btn"
                onClick={() => setEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            </>
          ) : (
            <div className="profile-edit-form">
              <input
                type="text"
                placeholder="Your name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
              <input
                type="email"
                placeholder="Your email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <button className="edit-profile-btn" onClick={handleSave}>
                💾 Save
              </button>
            </div>
          )}
        </div>

        {/* QUIZ STATISTICS CARD */}
        <div className="profile-card">
          <h3 className="profile-section-title">📊 Quiz Statistics</h3>

          {totalQuizzes === 0 ? (
            <p className="empty-state">
              No quizzes taken yet — finish a test to see your stats here!
            </p>
          ) : (
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-value">{totalQuizzes}</span>
                <span className="stat-label">Total Quizzes</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{questionsAnswered}</span>
                <span className="stat-label">Questions Answered</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{averageScore}%</span>
                <span className="stat-label">Average Score</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{bestScore}%</span>
                <span className="stat-label">Best Score</span>
              </div>
            </div>
          )}
        </div>

        {/* LEVEL PROGRESS CARD */}
        <div className="profile-card">
          <h3 className="profile-section-title">🎯 JLPT Level Progress</h3>

          <div className="level-progress-list">
            {levelProgress.map(({ level, percent, passed }) => (
              <div className="level-row" key={level}>
                <span className={`level-badge level-badge-${level}`}>
                  {level}
                </span>

                <div className="level-bar-track">
                  <div
                    className="level-bar-fill"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <span className="level-percent">{percent}%</span>
                <span className="level-sub-note">
                  {passed}/{TESTS_PER_LEVEL} tests passed
                </span>
              </div>
            ))}
          </div>

          <p className="progress-note">
            A sub-test counts as "passed" once you score 60% or higher on it.
            Progress = (passed sub-tests ÷ 5) × 100 for each level.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;