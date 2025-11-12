import { useMemo, useState } from 'react'
import './App.css'

type Level = {
  pattern: string[]
  missingIndex: number
  choices: string[]
  theme: string
}

type Theme = {
  name: string
  emojis: string[]
}

type PatternRecipe = {
  id: string
  tier: 'easy' | 'medium' | 'hard'
  minLength: number
  maxLength: number
  symbols: number
  seed: (symbols: string[]) => string[]
}

const LEVEL_COUNT = 12
const placeholder = '⬜️'

const themes: Theme[] = [
  { name: 'Forest Friends', emojis: ['🦊', '🦌', '🐻', '🦉', '🌲', '🍄'] },
  { name: 'Ocean Buddies', emojis: ['🐠', '🐡', '🐟', '🐬', '🐙', '🪼'] },
  { name: 'Sweet Treats', emojis: ['🍉', '🍓', '🍋', '🍑', '🍰', '🍭'] },
  { name: 'Cozy Winter', emojis: ['⛄️', '❄️', '🎄', '🧤', '🧣', '🛷'] },
  { name: 'Sky Shine', emojis: ['☁️', '🌤️', '🌈', '⭐️', '🌙', '☀️'] },
  { name: 'Zoom Crew', emojis: ['🚗', '🛴', '🚲', '🚁', '✈️', '🛸'] },
]

const patternRecipes: PatternRecipe[] = [
  {
    id: 'AB',
    tier: 'easy',
    minLength: 4,
    maxLength: 6,
    symbols: 2,
    seed: ([a, b]) => [a, b],
  },
  {
    id: 'AAB',
    tier: 'easy',
    minLength: 5,
    maxLength: 7,
    symbols: 2,
    seed: ([a, b]) => [a, a, b],
  },
  {
    id: 'ABB',
    tier: 'medium',
    minLength: 5,
    maxLength: 8,
    symbols: 2,
    seed: ([a, b]) => [a, b, b],
  },
  {
    id: 'ABC',
    tier: 'medium',
    minLength: 6,
    maxLength: 9,
    symbols: 3,
    seed: ([a, b, c]) => [a, b, c],
  },
  {
    id: 'ABBC',
    tier: 'hard',
    minLength: 6,
    maxLength: 9,
    symbols: 3,
    seed: ([a, b, c]) => [a, b, b, c],
  },
  {
    id: 'AABC',
    tier: 'hard',
    minLength: 6,
    maxLength: 9,
    symbols: 3,
    seed: ([a, b, c]) => [a, a, b, c],
  },
]

const tierByIndex: Array<'easy' | 'medium' | 'hard'> = ['easy', 'easy', 'easy', 'easy', 'medium', 'medium', 'medium', 'medium', 'hard', 'hard', 'hard', 'hard']

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const randomItem = <T,>(items: T[]) => items[randomInt(0, items.length - 1)]

const shuffle = <T,>(items: T[]) => {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const repeatSeed = (seed: string[], length: number) => {
  const pattern: string[] = []
  for (let i = 0; i < length; i += 1) {
    pattern.push(seed[i % seed.length])
  }
  return pattern
}

const buildChoices = (answer: string, theme: Theme) => {
  const pool = shuffle(theme.emojis.filter((emoji) => emoji !== answer))
  const choices: string[] = [answer]
  while (choices.length < 3) {
    const next = pool.shift()
    choices.push(next ?? answer)
  }
  return shuffle(choices)
}

const generateLevels = (count: number): Level[] =>
  Array.from({ length: count }, (_, index) => {
    const tier = tierByIndex[index] ?? 'hard'
    const recipePool =
      tier === 'easy'
        ? patternRecipes.filter((recipe) => recipe.tier === 'easy')
        : tier === 'medium'
          ? patternRecipes.filter((recipe) => recipe.tier !== 'hard')
          : patternRecipes
    const recipe = randomItem(recipePool)
    const theme = randomItem(themes)
    const palette = shuffle(theme.emojis).slice(0, Math.min(theme.emojis.length, recipe.symbols + 3))
    const baseSymbols = palette.slice(0, recipe.symbols)
    const length = randomInt(recipe.minLength, recipe.maxLength)
    const pattern = repeatSeed(recipe.seed(baseSymbols), length)
    const missingIndex = randomInt(0, pattern.length - 1)
    const choices = buildChoices(pattern[missingIndex], theme)

    return { pattern, missingIndex, choices, theme: theme.name }
  })

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
  const [levels, setLevels] = useState<Level[]>(() => generateLevels(LEVEL_COUNT))
  const [levelIndex, setLevelIndex] = useState(0)
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [locked, setLocked] = useState(false)
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [madeMistake, setMadeMistake] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  const activeLevel = levels[levelIndex]
  const totalLevels = levels.length
  const displayPattern = useMemo(
    () =>
      activeLevel
        ? activeLevel.pattern.map((emoji, idx) => (idx === activeLevel.missingIndex && !showAnswer ? placeholder : emoji))
        : [],
    [activeLevel, showAnswer],
  )
  const answer = activeLevel?.pattern[activeLevel.missingIndex] ?? ''
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
    setShowAnswer(false)
    if (nextIndex === 0) {
      setRound((value) => value + 1)
      setLevels(generateLevels(LEVEL_COUNT))
    }
  }

  const handlePick = (choice: string) => {
    if (locked || !activeLevel) return
    if (choice === answer) {
      setFeedback('correct')
      setLocked(true)
      setShowAnswer(true)
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
    setShowAnswer(false)
    setLevels(generateLevels(LEVEL_COUNT))
  }

  if (!activeLevel) return null

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
        <div className="stats__item">
          <span className="stats__label">Theme</span>
          <span className="stats__value">{activeLevel.theme}</span>
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
            <span key={`${emoji}-${idx}`} className={idx === activeLevel.missingIndex && !showAnswer ? 'blank' : ''}>
              {emoji}
            </span>
          ))}
        </div>

        <p className="prompt">
          Pick the missing emoji
          <span className="prompt-tag">{activeLevel.theme}</span>
        </p>

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
