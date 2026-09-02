function Nav({ currentScreen, onHome, onProfile }) {
  return (
    <div className="app-nav">
      <div className="app-nav-inner">
        <div className="app-nav-brand">🇯🇵 Vocab Quiz</div>

        <div className="app-nav-links">
          <button
            className={
              "app-nav-link" +
              (currentScreen === "levelSelect" || currentScreen === "testSelect"
                ? " active"
                : "")
            }
            onClick={onHome}
          >
            🏠 Home
          </button>

          <button
            className={
              "app-nav-link" + (currentScreen === "profile" ? " active" : "")
            }
            onClick={onProfile}
          >
            👤 Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default Nav;