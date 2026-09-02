function VocabularyCard({
  vocabulary,
  showAnswer,
  onShowAnswer,
  onKnow,
  onDontKnow
}) {
  return (
    <div className="vocabulary-card">

      <div className="japanese-word">
        {vocabulary.japanese}
      </div>

      <div className="romaji">
        {vocabulary.romaji}
      </div>

      {!showAnswer ? (
        <button
          className="show-button"
          onClick={onShowAnswer}
        >
          Show Answer
        </button>
      ) : (
        <div className="answer">
          <p>English Meaning</p>
          <h2>{vocabulary.english}</h2>
        </div>
      )}

      {showAnswer && (
        <div className="answer-buttons">

          <button
            className="know-button"
            onClick={onKnow}
          >
            ✓ I Know
          </button>

          <button
            className="dont-know-button"
            onClick={onDontKnow}
          >
            ✗ Don't Know
          </button>

        </div>
      )}

    </div>
  );
}

export default VocabularyCard;