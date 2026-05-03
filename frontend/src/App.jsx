import { useState, useRef } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = 'http://localhost:8000'

const EXAMPLES = [
  {
    label: 'Sensational Headline',
    text: 'SHOCKING: Scientists EXPOSE hidden truth about vaccines that governments don\'t want you to know! This EXPLOSIVE revelation will change everything you thought you knew about modern medicine. Share before it gets deleted!'
  },
  {
    label: 'Neutral Reporting',
    text: 'The Federal Reserve announced a 0.25% interest rate increase on Wednesday, citing ongoing concerns about inflation. Fed Chair Jerome Powell stated that the decision was unanimous among board members and that further adjustments would depend on incoming economic data over the coming months.'
  },
  {
    label: 'Political Right Bias',
    text: 'The radical left-wing agenda continues its assault on American values as Democrats push yet another massive government spending bill that will burden hardworking taxpayers for generations to come. Conservative lawmakers are fighting back against this socialist overreach.'
  }
]

const SENSATIONAL_WORDS = [
  'shocking', 'exposed', 'breaking', 'explosive', 'secret', 'hidden',
  'bombshell', 'urgent', 'must see', 'share before', 'deleted', 'censored',
  'radical', 'destroy', 'crisis', 'invasion', 'threat', 'alarming',
  'leaked', 'conspiracy', 'cover-up', 'whistleblower', 'suppressed'
]

// ─── Utility ──────────────────────────────────────────────────────────────────

function highlightText(text) {
  const parts = text.split(/(\s+)/)
  return parts.map((part, i) => {
    const clean = part.toLowerCase().replace(/[^a-z\s]/g, '')
    const flagged = SENSATIONAL_WORDS.some(sw => clean.includes(sw))
    if (flagged) {
      return (
        <mark key={i} style={{
          background: 'var(--accent-red-bg)',
          color: 'var(--accent-red)',
          borderRadius: '3px',
          padding: '0 2px',
          fontWeight: 500
        }}>{part}</mark>
      )
    }
    return part
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GaugeRing({ value, color }) {
  const r = 34
  const circ = 2 * Math.PI * r
  const pct = Math.min(100, Math.max(0, value))
  const dash = (pct / 100) * circ
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx="44" cy="44" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
      <circle
        cx="44" cy="44" r={r} fill="none" stroke={color}
        strokeWidth="6" strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round" transform="rotate(-90 44 44)"
        style={{ transition: 'stroke-dasharray 1s cubic-bezier(.4,0,.2,1)' }}
      />
      <text x="44" y="49" textAnchor="middle" fontSize="15"
        fontWeight="500" fill="var(--text-primary)" fontFamily="var(--font-sans)">{pct}%</text>
    </svg>
  )
}

function BiasBar({ bias }) {
  const map = { Left: 5, 'Center-Left': 28, Neutral: 50, 'Center-Right': 72, Right: 95 }
  const pct = map[bias] ?? 50
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ position: 'relative', height: 8, borderRadius: 4, overflow: 'visible',
        background: 'linear-gradient(to right, var(--accent-blue), var(--text-tertiary), var(--accent-red))',
        marginBottom: 8 }}>
        <div style={{
          position: 'absolute', top: -5, left: `calc(${pct}% - 9px)`,
          width: 18, height: 18, borderRadius: '50%',
          background: 'var(--bg-surface)', border: '2.5px solid var(--text-primary)',
          transition: 'left 0.9s cubic-bezier(.4,0,.2,1)'
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        fontSize: 11, color: 'var(--text-tertiary)' }}>
        <span>Left</span><span>Neutral</span><span>Right</span>
      </div>
    </div>
  )
}

function ToneBadge({ tone }) {
  const cfg = {
    Positive:  { color: 'var(--accent-green)',  bg: 'var(--accent-green-bg)',  sym: '↑' },
    Negative:  { color: 'var(--accent-red)',    bg: 'var(--accent-red-bg)',    sym: '↓' },
    Neutral:   { color: 'var(--text-secondary)', bg: 'var(--bg-surface-2)',    sym: '→' },
    Mixed:     { color: 'var(--accent-amber)',  bg: 'var(--accent-amber-bg)',  sym: '~' },
  }
  const c = cfg[tone] || cfg.Neutral
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '7px 16px', borderRadius: 'var(--radius-md)',
      background: c.bg, color: c.color,
      fontSize: 15, fontWeight: 500
    }}>
      <span style={{ fontSize: 17 }}>{c.sym}</span> {tone}
    </span>
  )
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      padding: '20px 22px',
      ...style
    }}>
      {children}
    </div>
  )
}

function Label({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 500, letterSpacing: '0.07em',
      textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10
    }}>{children}</div>
  )
}

function Results({ data }) {
  const isFake = data.verdict === 'Fake'
  const verdictColor = isFake ? 'var(--accent-red)' : 'var(--accent-green)'
  const verdictBg = isFake ? 'var(--accent-red-bg)' : 'var(--accent-green-bg)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14,
      animation: 'fadeUp 0.45s ease' }}>

      {/* Row 1: Verdict + Confidence */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card style={{ background: verdictBg }}>
          <Label>Verdict</Label>
          <div style={{ fontSize: 30, fontWeight: 500, color: verdictColor }}>{data.verdict}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {isFake ? 'Likely misinformation' : 'Appears credible'}
          </div>
        </Card>
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Label>Confidence</Label>
          <GaugeRing value={data.confidence} color={isFake ? 'var(--accent-red)' : 'var(--accent-green)'} />
        </Card>
      </div>

      {/* Row 2: Bias */}
      <Card>
        <Label>Political Bias</Label>
        <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 12 }}>{data.bias}</div>
        <BiasBar bias={data.bias} />
      </Card>

      {/* Row 3: Tone */}
      <Card>
        <Label>Tone Analysis</Label>
        <ToneBadge tone={data.tone} />
        {data.toneReason && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.6 }}>
            {data.toneReason}
          </div>
        )}
      </Card>

      {/* Flagged Keywords */}
      {data.keywords?.length > 0 && (
        <Card>
          <Label>Flagged Keywords</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.keywords.map((kw, i) => (
              <span key={i} style={{
                background: 'var(--accent-red-bg)', color: 'var(--accent-red)',
                padding: '4px 12px', borderRadius: 'var(--radius-sm)',
                fontSize: 13, fontWeight: 500
              }}>{kw}</span>
            ))}
          </div>
        </Card>
      )}

      {/* Explanation */}
      <Card>
        <Label>Analysis Explanation</Label>
        <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-primary)' }}>
          {data.explanation}
        </p>
      </Card>

      {/* Highlighted Text */}
      <Card style={{ background: 'var(--bg-surface-2)' }}>
        <Label>Highlighted Text</Label>
        <div style={{ fontSize: 14, lineHeight: 1.85 }}>
          {highlightText(data.inputText)}
        </div>
      </Card>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [activeExample, setActiveExample] = useState(null)
  const resultsRef = useRef(null)

  async function analyze() {
    if (!text.trim()) { setError('Please enter some text to analyze.'); return }
    if (text.trim().length < 20) { setError('Please enter at least 20 characters for accurate analysis.'); return }
    setError(''); setLoading(true); setResult(null)

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Analysis failed')
      }
      const data = await res.json()
      setResult({ ...data, inputText: text })
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (e) {
      setError(e.message || 'Failed to connect to the backend. Make sure it\'s running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  function loadExample(ex, i) {
    setText(ex.text)
    setActiveExample(i)
    setResult(null)
    setError('')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'var(--accent-red-bg)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-red)', fontWeight: 700, fontSize: 16
          }}>!</div>
          <div>
            <div style={{ fontWeight: 500, fontSize: 15 }}>TruthLens</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Fake News & Bias Detector</div>
          </div>
        </div>
        <div style={{
          fontSize: 12, color: 'var(--text-tertiary)',
          background: 'var(--bg-surface-2)', padding: '4px 12px',
          borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)'
        }}>AI-Powered</div>
      </nav>

      {/* Sidebar layout */}
      <div style={{
        display: 'grid', gridTemplateColumns: '280px 1fr',
        maxWidth: 1200, margin: '0 auto', padding: '32px 24px',
        gap: 28, alignItems: 'start'
      }}>

        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 8 }}>About TruthLens</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              An AI-powered tool that analyzes news text for credibility, political bias, and emotional tone using NLP models.
            </p>
          </Card>
          <Card>
            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 12 }}>What we detect</div>
            {[
              ['◈', 'Fake vs Real', 'With confidence score'],
              ['◑', 'Political Bias', 'Left to Right spectrum'],
              ['◉', 'Emotional Tone', 'Positive / Negative'],
              ['◐', 'Sensational Words', 'Highlighted in text'],
            ].map(([sym, title, desc]) => (
              <div key={title} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 16, color: 'var(--text-tertiary)', flexShrink: 0 }}>{sym}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10 }}>Tip</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              For best results, paste the full article text rather than just the headline. Longer text gives more accurate analysis.
            </p>
          </Card>
        </aside>

        {/* Main */}
        <main>
          {/* Hero */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 34, fontWeight: 400, lineHeight: 1.2, marginBottom: 10 }}>
              Analyze news<br /><strong style={{ fontWeight: 500 }}>in seconds</strong>
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Paste any news article, headline, or social media post to detect misinformation, political bias, and manipulative language.
            </p>
          </div>

          {/* Examples */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase',
              color: 'var(--text-tertiary)', marginBottom: 10 }}>Try an example</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => loadExample(ex, i)} style={{
                  padding: '6px 14px', fontSize: 13,
                  borderRadius: 'var(--radius-sm)',
                  border: activeExample === i
                    ? '1.5px solid var(--accent-blue)' : '1px solid var(--border)',
                  background: activeExample === i ? 'var(--accent-blue-bg)' : 'var(--bg-surface)',
                  color: activeExample === i ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: activeExample === i ? 500 : 400,
                  transition: 'all 0.15s'
                }}>{ex.label}</button>
              ))}
            </div>
          </div>

          {/* Input */}
          <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 10 }}>
            <textarea
              value={text}
              onChange={e => { setText(e.target.value); setError(''); setActiveExample(null) }}
              onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') analyze() }}
              placeholder="Paste your news article, headline, or social media post here..."
              style={{
                width: '100%', minHeight: 160, padding: '18px 20px',
                fontSize: 15, lineHeight: 1.7, resize: 'vertical',
                border: 'none', outline: 'none', background: 'transparent',
                color: 'var(--text-primary)', fontFamily: 'var(--font-sans)',
                boxSizing: 'border-box'
              }}
            />
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 18px', borderTop: '1px solid var(--border)',
              background: 'var(--bg-surface-2)'
            }}>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {text.length} chars · Ctrl+Enter to analyze
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                {text && (
                  <button onClick={() => { setText(''); setResult(null); setError(''); setActiveExample(null) }}
                    style={{
                      padding: '7px 15px', fontSize: 13,
                      borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                      background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer'
                    }}>Clear</button>
                )}
                <button onClick={analyze} disabled={loading} style={{
                  padding: '7px 22px', fontSize: 13, fontWeight: 500,
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                  background: loading ? 'var(--bg-surface-2)' : 'var(--text-primary)',
                  color: loading ? 'var(--text-tertiary)' : 'var(--bg-base)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s'
                }}>
                  {loading && (
                    <span style={{
                      width: 13, height: 13, border: '2px solid currentColor',
                      borderTopColor: 'transparent', borderRadius: '50%',
                      animation: 'spin 0.65s linear infinite', display: 'inline-block'
                    }} />
                  )}
                  {loading ? 'Analyzing...' : 'Analyze →'}
                </button>
              </div>
            </div>
          </Card>

          {error && (
            <div style={{
              background: 'var(--accent-red-bg)', color: 'var(--accent-red)',
              padding: '10px 16px', borderRadius: 'var(--radius-md)',
              fontSize: 14, marginBottom: 16, border: '1px solid var(--border)'
            }}>{error}</div>
          )}

          {result && (
            <div ref={resultsRef} style={{ marginTop: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 14 }}>
                Analysis Results
              </div>
              <Results data={result} />
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 700px) {
          div[style*="grid-template-columns: 280px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
