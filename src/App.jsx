import { useState } from "react";
import "./App.css";
import "./profile.css";
import vocabularyByLevel from "./data/vocabulary";
import Nav from "./components/Nav";
import Profile from "./components/Profile";

const HISTORY_KEY = "jvq_quiz_history";
const PROFILE_KEY = "jvq_profile";

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore storage errors (e.g. private browsing)
  }
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : { name: "", email: "" };
  } catch {
    return { name: "", email: "" };
  }
}

function saveProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // ignore storage errors
  }
}

function splitIntoSubTests(levelVocabulary, numTests = 5) {
  const total = levelVocabulary.length;
  const baseSize = Math.floor(total / numTests);
  const remainder = total % numTests;

  const tests = [];
  let start = 0;

  for (let i = 0; i < numTests; i++) {
    const size = baseSize + (i < remainder ? 1 : 0);
    const chunk = levelVocabulary.slice(start, start + size);
    start += size;

    if (chunk.length > 0) {
      tests.push({
        testNumber: i + 1,
        words: chunk,
      });
    }
  }

  return tests;
}

function App() {
  // screen: "levelSelect" | "testSelect" | "quiz" | "result" | "profile"
  const [screen, setScreen] = useState("levelSelect");

  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedTestNumber, setSelectedTestNumber] = useState(null);
  const [quizLength, setQuizLength] = useState(0);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const [options, setOptions] = useState([]);

  // Quiz history + profile (persisted to localStorage; no backend/auth exists yet)
  const [history, setHistory] = useState(loadHistory());
  const [profile, setProfile] = useState(loadProfile());

  const levels = [
    ["N5", "Beginner", "Basic Japanese"],
    ["N4", "Elementary", "Elementary Japanese"],
    ["N3", "Intermediate", "Intermediate Japanese"],
    ["N2", "Upper Intermediate", "Advanced Japanese"],
    ["N1", "Advanced", "Advanced Vocabulary"],
  ];

  const createOptions = (question, levelVocabulary) => {
    const sameCategory = shuffleArray(
      levelVocabulary.filter(
        (word) => word.id !== question.id && word.category === question.category
      )
    );

    const otherCategory = shuffleArray(
      levelVocabulary.filter(
        (word) => word.id !== question.id && word.category !== question.category
      )
    );

    const wrongAnswers = [...sameCategory, ...otherCategory].slice(0, 2);

    return shuffleArray([question, ...wrongAnswers]);
  };

  const openLevel = (level) => {
    setSelectedLevel(level);
    setScreen("testSelect");
  };

  const startSubTest = (level, testNumber, words) => {
    const shuffledQuestions = shuffleArray(words);

    setSelectedLevel(level);
    setSelectedTestNumber(testNumber);
    setQuestions(shuffledQuestions);
    setQuizLength(shuffledQuestions.length);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setOptions(createOptions(shuffledQuestions[0], vocabularyByLevel[level]));
    setScreen("quiz");
  };

  const handleAnswer = (answer) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);

    if (answer.id === questions[currentIndex].id) {
      setScore((prev) => prev + 1);
    }
  };

  const recordQuizResult = (finalScore) => {
    const entry = {
      id: Date.now(),
      level: selectedLevel,
      testNumber: selectedTestNumber,
      score: finalScore,
      total: quizLength,
      date: new Date().toISOString(),
    };

    const updatedHistory = [...history, entry];
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      recordQuizResult(score);
      setScreen("result");
      return;
    }

    const nextQuestion = questions[currentIndex + 1];

    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setOptions(createOptions(nextQuestion, vocabularyByLevel[selectedLevel]));
  };

  const retrySameTest = () => {
    const subTests = splitIntoSubTests(vocabularyByLevel[selectedLevel]);
    const currentTest = subTests.find((t) => t.testNumber === selectedTestNumber);
    startSubTest(selectedLevel, selectedTestNumber, currentTest.words);
  };

  const goToTestList = () => {
    setSelectedAnswer(null);
    setScreen("testSelect");
  };

  const goToLevelList = () => {
    setSelectedAnswer(null);
    setScreen("levelSelect");
  };

  const openProfile = () => {
    setSelectedAnswer(null);
    setScreen("profile");
  };

  const handleSaveProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
  };

  // ================= PROFILE SCREEN =================
  if (screen === "profile") {
    return (
      <>
        <Nav currentScreen={screen} onHome={goToLevelList} onProfile={openProfile} />
        <Profile
          profile={profile}
          onSaveProfile={handleSaveProfile}
          history={history}
        />
      </>
    );
  }

  // ================= LEVEL SELECT SCREEN =================
  if (screen === "levelSelect") {
    return (
      <>
        <Nav currentScreen={screen} onHome={goToLevelList} onProfile={openProfile} />
        <div className="app home-screen">
          <div className="welcome-card">
            <div className="logo-circle">🇯🇵</div>

            <p className="small-title">JAPANESE LEARNING</p>

            <h1>Japanese Vocabulary </h1>

            <p className="subtitle">
              Choose your JLPT level
              <br />
              and start learning
            </p>

            <div className="level-buttons">
              {levels.map(([level, title, description]) => (
                <button key={level} onClick={() => openLevel(level)}>
                  <span className="level-name">{level}</span>
                  <span className="level-copy">
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </span>
                  <span className="level-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ================= TEST SELECT SCREEN =================
  if (screen === "testSelect") {
    const subTests = splitIntoSubTests(vocabularyByLevel[selectedLevel]);

    return (
      <>
        <Nav currentScreen={screen} onHome={goToLevelList} onProfile={openProfile} />
        <div className="app home-screen">
          <div className="welcome-card">
            <div className="logo-circle">🇯🇵</div>

            <p className="small-title">{selectedLevel} VOCABULARY</p>

            <h1>Choose a Test</h1>

            <p className="subtitle">
              {subTests.length} tests available for {selectedLevel}
              <br />
              each with different words
            </p>

            <div className="level-buttons">
              {subTests.map((test) => (
                <button
                  key={test.testNumber}
                  onClick={() =>
                    startSubTest(selectedLevel, test.testNumber, test.words)
                  }
                >
                  <span className="level-name">
                    {selectedLevel} #{test.testNumber}
                  </span>
                  <span className="level-copy">
                    <strong>Test {test.testNumber}</strong>
                    <small>{test.words.length} questions</small>
                  </span>
                  <span className="level-arrow">→</span>
                </button>
              ))}
            </div>

            <button className="home-button" onClick={goToLevelList}>
              ← Back to Levels
            </button>
          </div>
        </div>
      </>
    );
  }

  // ================= RESULT SCREEN =================
  if (screen === "result") {
    return (
      <div className="app">
        <div className="result-card">
          <div className="result-icon">🎉</div>

          <p className="small-title">QUIZ FINISHED</p>

          <h1>Great Job!</h1>

          <p className="result-text">
            {selectedLevel} Test {selectedTestNumber} — your score
          </p>

          <div className="final-score">
            {score}
            <span> / {quizLength}</span>
          </div>

          <div className="percentage">
            {Math.round((score / quizLength) * 100)}%
          </div>

          <div className="result-buttons">
            <button className="restart-button" onClick={retrySameTest}>
              🔄 Try Again
            </button>

            <button className="home-button" onClick={goToTestList}>
              📋 Choose Another Test
            </button>

            <button className="home-button" onClick={goToLevelList}>
              🏠 Home
            </button>

            <button className="home-button" onClick={openProfile}>
              👤 View Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= QUIZ SCREEN =================
  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedAnswer && selectedAnswer.id === currentQuestion.id;

  return (
    <div className="app">
      <div className="quiz-container">
        {/* HEADER */}
        <header className="quiz-header">
          <div className="brand">
            <div className="brand-icon">🇯🇵</div>

            <div>
              <h1>
                {selectedLevel} Test {selectedTestNumber}
              </h1>
              <p>Japanese • Practice • Master</p>
            </div>
          </div>

          <button className="stop-button" onClick={goToTestList}>
            ← Back to Tests
          </button>
        </header>

        {/* PROGRESS */}
        <div className="progress-card">
          <div className="question-number">
            <span>Question</span>
            <strong>
              {currentIndex + 1} / {quizLength}
            </strong>
          </div>

          <div className="progress-center">
            <div className="progress-message">
              ✨ Keep going! You're doing great!
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${((currentIndex + 1) / quizLength) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="score-display">
            <span>Score</span>
            <strong>🏆 {score}</strong>
          </div>
        </div>

        {/* QUESTION */}
        <div className="question-card">
          <div className="question-label">What does this word mean?</div>

          <h2 className="japanese-word">{currentQuestion.japanese}</h2>

          <div className="sakura-divider">
            <span></span>
            🌸
            <span></span>
          </div>

          {/* OPTIONS */}
          <div className="options">
            {options.map((option) => {
              let optionClass = "option-button";

              if (selectedAnswer) {
                if (option.id === currentQuestion.id) {
                  optionClass += " correct";
                }

                if (
                  selectedAnswer.id === option.id &&
                  option.id !== currentQuestion.id
                ) {
                  optionClass += " wrong";
                }
              }

              return (
                <button
                  key={option.id}
                  className={optionClass}
                  onClick={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null}
                >
                  <span className="option-letter">
                    {String.fromCharCode(65 + options.indexOf(option))}
                  </span>
                  <span>{option.english}</span>
                </button>
              );
            })}
          </div>

          {/* FEEDBACK */}
          {selectedAnswer && (
            <div
              className={
                isCorrect ? "feedback correct-feedback" : "feedback wrong-feedback"
              }
            >
              {isCorrect ? (
                <>
                  <span>✓</span>
                  Correct! Great work!
                </>
              ) : (
                <>
                  <span>✗</span>
                  Correct answer: <strong>{currentQuestion.english}</strong>
                </>
              )}
            </div>
          )}

          {/* NEXT BUTTON */}
          {selectedAnswer && (
            <button className="next-button" onClick={handleNextQuestion}>
              {currentIndex + 1 === quizLength ? "View Result" : "Next Question"}
              <span>→</span>
            </button>
          )}

          {!selectedAnswer && (
            <div className="hint">💡 Choose the correct English meaning</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;