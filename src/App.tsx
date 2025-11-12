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
  { pattern: ['🌈', '☁️', '🌈', '☁️', '🌈', '☁️'], missingIndex: 1, choices: ['☁️', '🌧️', '⭐️'] },
  { pattern: ['🐙', '🐙', '🐢', '🐙', '🐙', '🐢', '🐙'], missingIndex: 6, choices: ['🐢', '🐙', '🐳'] },
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

  const activeLevel = levels[levelIndex]
  const displayPattern = useMemo(
    () => activeLevel.pattern.map((emoji, idx) => (idx === activeLevel.missingIndex ? placeholder : emoji)),
    [activeLevel],
  )
  const answer = activeLevel.pattern[activeLevel.missingIndex]
  const nextIndex = (levelIndex + 1) % levels.length
  const progressPips = levels.map((_, idx) => {
    if (idx < levelIndex) return '⭐️'
    if (idx === levelIndex) return feedback === 'correct' ? '✅' : '✨'
    return '⚪️'
  })

  const advance = () => {
    setLevelIndex(nextIndex)
    setFeedback('idle')
    setLocked(false)
    if (nextIndex === 0) setRound((value) => value + 1)
  }

  const handlePick = (choice: string) => {
    if (locked) return
    if (choice === answer) {
      setFeedback('correct')
      setLocked(true)
      setTimeout(advance, 1000)
    } else {
      setFeedback('wrong')
      setTimeout(() => setFeedback('idle'), 450)
    }
  }

  const restart = () => {
    setLevelIndex(0)
    setFeedback('idle')
    setLocked(false)
    setRound(1)
  }

  return (
    <main className="game">
      <div className="game__header">
        <span className="badge">🧩 Pattern Path</span>
        <button className="ghost-button" onClick={restart} aria-label="Restart patterns">
          ▶️
        </button>
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
