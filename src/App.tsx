import { useMemo, useState } from 'react'
import './App.css'

type Level = {
  pattern: string[]
  missingIndex: number
  choices: string[]
}

const levels: Level[] = [
  { pattern: ['🦊', '🌕', '🦊', '🌕', '🦊'], missingIndex: 4, choices: ['🦊', '🌕', '⭐️'] },
  { pattern: ['🍓', '🍓', '🍋', '🍓', '🍓', '🍋'], missingIndex: 2, choices: ['🍇', '🍋', '🍓'] },
  { pattern: ['🚗', '🚕', '🚕', '🚗', '🚕', '🚕'], missingIndex: 3, choices: ['🚗', '🚕', '🚌'] },
  { pattern: ['🐚', '🐠', '🐬', '🐚', '🐠', '🐬'], missingIndex: 5, choices: ['🐬', '🐠', '🐳'] },
  { pattern: ['🌈', '☁️', '☀️', '🌈', '☁️', '☀️'], missingIndex: 4, choices: ['☀️', '🌈', '☁️'] },
  { pattern: ['🐙', '🐙', '🐢', '🐙', '🐙', '🐢', '🐙'], missingIndex: 6, choices: ['🐢', '🐙', '🐳'] },
  { pattern: ['🍉', '🍍', '🍉', '🍍', '🍉', '🍍', '🍉'], missingIndex: 6, choices: ['🍉', '🍍', '🍒'] },
  { pattern: ['🚲', '🛴', '🚲', '🛴', '🚲', '🛴', '🚲'], missingIndex: 6, choices: ['🛴', '🚲', '🚗'] },
  { pattern: ['🐞', '🐞', '🪲', '🐞', '🐞', '🪲', '🐞', '🐞'], missingIndex: 7, choices: ['🪲', '🐞', '🕷️'] },
  { pattern: ['⛄️', '❄️', '🎄', '⛄️', '❄️', '🎄', '⛄️'], missingIndex: 6, choices: ['🎄', '⛄️', '❄️'] },
  { pattern: ['🚌', '🚲', '✈️', '🚌', '🚲', '✈️', '🚌', '🚲'], missingIndex: 7, choices: ['✈️', '🚲', '🛰️'] },
  { pattern: ['⭐️', '⭐️', '🌙', '⭐️', '⭐️', '🌙', '⭐️', '⭐️', '🌙'], missingIndex: 8, choices: ['🌙', '⭐️', '☀️'] },
]

const placeholder = '⬜️'

const Confetti = ({ show }: { show: boolean }) =>
  show ? (
    <div className="confetti" aria-hidden="true">
      {['🎉', '✨', '🎊', '💫', '🌟'].map((emoji, index) => (
        <span key={emoji + index} style={{ left: `${10 + index * 15}%`, animationDelay: `${index * 0.08}s` }}>
          {emoji}
        </span>
      ))}
    </div>
  ) : null

function App() {
  const [levelIndex, setLevelIndex] = useState(0)
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [locked, setLocked] = useState(false)
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [madeMistake, setMadeMistake] = useState(false)

  const activeLevel = levels[levelIndex]
  const totalLevels = levels.length
  const displayPattern = useMemo(
    () => activeLevel.pattern.map((emoji, idx) => (idx === activeLevel.missingIndex ? placeholder : emoji)),
    [activeLevel],
  )
  const answer = activeLevel.pattern[activeLevel.missingIndex]
  const nextIndex = (levelIndex + 1) % totalLevels
  const progressPips = levels.map((_, idx) => {
    if (idx < levelIndex) return '⭐️'
    if (idx === levelIndex) return feedback === 'correct' ? '✅' : '✨'
    return '⚪️'
  })
  const difficulty = levelIndex < 4 ? 'Sprout' : levelIndex < 8 ? 'Explorer' : 'Trailblazer'

  const advance = () => {
    setLevelIndex(nextIndex)
    setFeedback('idle')
    setLocked(false)
    setMadeMistake(false)
    if (nextIndex === 0) setRound((value) => value + 1)
  }

  const handlePick = (choice: string) => {
    if (locked) return
    if (choice === answer) {
      setFeedback('correct')
      setLocked(true)
      const earned = madeMistake ? 1 : 2
      setScore((value) => value + earned)
      setTimeout(advance, 1000)
    } else {
      setFeedback('wrong')
      setMadeMistake(true)
      setTimeout(() => setFeedback('idle'), 450)
    }
  }

  const restart = () => {
    setLevelIndex(0)
    setFeedback('idle')
    setLocked(false)
    setRound(1)
    setScore(0)
    setMadeMistake(false)
  }

  return (
    <main className="game">
      <div className="game__header">
        <span className="badge">🧩 Pattern Path</span>
        <button className="ghost-button" onClick={restart} aria-label="Restart patterns">
          ▶️
        </button>
      </div>

      <div className="stats" aria-live="polite">
        <div className="stats__item">
          <span className="stats__label">Level</span>
          <span className="stats__value">
            {levelIndex + 1}/{totalLevels}
          </span>
        </div>
        <div className="stats__item">
          <span className="stats__label">Score</span>
          <span className="stats__value">{score} ⭐</span>
        </div>
        <div className="stats__item">
          <span className="stats__label">Rank</span>
          <span className="stats__value">{difficulty}</span>
        </div>
      </div>

      <section className={`board board--${feedback}`}>
        <div className="progress" aria-label="Progress">
          {progressPips.map((emoji, idx) => (
            <span key={idx}>{emoji}</span>
          ))}
        </div>

        <div className="pattern" aria-live="polite">
          {displayPattern.map((emoji, idx) => (
            <span key={`${emoji}-${idx}`} className={idx === activeLevel.missingIndex ? 'blank' : ''}>
              {emoji}
            </span>
          ))}
        </div>

        <p className="prompt">Pick the missing emoji</p>

        <div className="choices">
          {activeLevel.choices.map((emoji) => (
            <button
              key={emoji}
              className="choice"
              onClick={() => handlePick(emoji)}
              disabled={locked}
              aria-label={`Use ${emoji} to complete the pattern`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <Confetti show={feedback === 'correct'} />
      </section>

      <footer className="footer">Trail {round}</footer>
    </main>
  )
}

export default App
