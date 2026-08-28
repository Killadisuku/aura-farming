import { useEffect, useState } from 'react'
import { useStore } from './store'
import { CATEGORIES, categoryById, formatNum } from './data'

export default function GiveAura({ open, onClose, prefill }) {
  const { state, me, giveAura, canGive, isBlocked } = useStore()
  const [step, setStep] = useState(1)
  const [q, setQ] = useState('')
  const [to, setTo] = useState(null)
  const [cat, setCat] = useState(null)
  const [polar, setPolar] = useState('honor')
  const [amt, setAmt] = useState(25)
  const [custom, setCustom] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [burst, setBurst] = useState(false)

  useEffect(() => {
    if (!open) return
    setQ(''); setCat(null); setPolar('honor'); setAmt(25); setCustom(''); setMsg(''); setErr(''); setBurst(false)
    if (prefill) { setTo(prefill); setStep(2) }
    else { setTo(null); setStep(1) }
  }, [open, prefill])

  if (!open) return null
  const mid = me()?.id
  const friends = (state.follows[mid] || []).map((id) => state.users.find((u) => u.id === id)).filter(Boolean)
  const results = state.users.filter((u) => {
    if (u.id === mid) return false
    if (isBlocked(mid, u.id)) return false
    const s = (u.name + u.username).toLowerCase()
    return !q || s.includes(q.toLowerCase())
  })
  const raw = custom ? Math.max(1, Math.min(100, Number(custom) || 0)) : amt
  const amount = polar === 'shadow' ? -raw : raw

  function submit() {
    const check = canGive(mid, to.id, amount)
    if (!check.ok) { setErr(check.reason); return }
    if (!cat) { setErr('Pick a reason.'); return }
    const res = giveAura({ toId: to.id, amount, category: cat, message: msg })
    if (!res.ok) { setErr(res.reason); return }
    setBurst(true)
    setTimeout(onClose, 1400)
  }

  const particles = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2
    const d = 120 + (i % 5) * 28
    return { x: Math.cos(a) * d + 'px', y: Math.sin(a) * d + 'px', color: polar === 'shadow' ? ['#8b3a3a', '#6b3a32', '#b08a4a', '#2a2d31'][i % 4] : ['#7d8b99', '#c4c0b4', '#b08a4a', '#9aa3ab'][i % 4] }
  })

  return (
    <div className="modal-layer">
      {burst && (
        <div className="burst-layer">
          {particles.map((p, i) => (
            <i key={i} className="particle" style={{ '--x': p.x, '--y': p.y, background: p.color, left: '50%', top: '50%' }} />
          ))}
          <div className="burst-copy">
            <div style={{ fontSize: 42 }}>{amount < 0 ? '⚔️' : '✨'}</div>
            <h2>{amount > 0 ? '+' : ''}{amount} Aura</h2>
            <p className="sub">{amount < 0 ? 'dishonor marked on' : 'sent to'} {to?.name}</p>
          </div>
        </div>
      )}
      <div className="sheet">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="ghost" style={{ width: 'auto', padding: '0 14px', height: 36 }} onClick={onClose}>Close</button>
          <strong>{polar === 'shadow' ? 'Mark Dishonor' : 'Give Aura'}</strong>
          <span style={{ width: 64 }} />
        </div>
        <div className="step-dots">{[1, 2, 3, 4].map((s) => <i key={s} className={step >= s ? 'on' : ''} />)}</div>

        {step === 1 && (
          <>
            <h2 className="h-title" style={{ fontSize: 24 }}>Who is this for?</h2>
            <p className="sub" style={{ margin: '6px 0 14px' }}>Honor or mark a score against them.</p>
            <input className="search" placeholder="Search name or @username" value={q} onChange={(e) => setQ(e.target.value)} />
            {!q && <div className="section-label">Friends</div>}
            {(q ? results : friends).slice(0, 16).map((u) => (
              <button key={u.id} className="user-row" onClick={() => { setTo(u); setStep(2) }}>
                <img className="av" src={u.avatar} alt="" />
                <div className="meta"><strong>{u.name}</strong><span>@{u.username} · {formatNum(u.auraReceived)} Aura</span></div>
              </button>
            ))}
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="h-title" style={{ fontSize: 24 }}>What kind of score?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '10px 0 16px' }}>
              <button className={`cat-card ${polar === 'honor' ? 'on' : ''}`} style={{ '--c': '#b08a4a' }} onClick={() => setPolar('honor')}>
                <span className="ic">✨</span><b>Honor +</b>
              </button>
              <button className={`cat-card ${polar === 'shadow' ? 'on' : ''}`} style={{ '--c': '#8b3a3a' }} onClick={() => setPolar('shadow')}>
                <span className="ic">⚔️</span><b>Dishonor −</b>
              </button>
            </div>
            <p className="sub" style={{ margin: '0 0 14px' }}>{polar === 'shadow' ? 'Why are you marking them down?' : 'Why are you giving Aura?'}</p>
            <div className="cat-grid">
              {CATEGORIES.map((c) => (
                <button key={c.id} className={`cat-card ${cat === c.id ? 'on' : ''}`} style={{ '--c': c.color }} onClick={() => { setCat(c.id); setStep(3) }}>
                  <span className="ic">{c.icon}</span><b>{c.label}</b>
                </button>
              ))}
            </div>
            <button className="ghost" style={{ marginTop: 14 }} onClick={() => setStep(1)}>Back</button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="h-title" style={{ fontSize: 24 }}>{polar === 'shadow' ? 'How much to take?' : 'How much Aura?'}</h2>
            <p className="sub" style={{ margin: '6px 0 14px' }}>{polar === 'shadow' ? 'Negative score. They cannot go below 0.' : 'Appreciation, not a transaction.'}</p>
            <div className="amt-grid">
              {[5, 10, 25, 50, 100].map((n) => (
                <button key={n} className={`amt-btn ${!custom && amt === n ? 'on' : ''}`} onClick={() => { setAmt(n); setCustom('') }}>{polar === 'shadow' ? '−' : '+'}{n}</button>
              ))}
            </div>
            <input className="search" style={{ marginTop: 12 }} placeholder="Custom amount (1–100)" value={custom} onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ''))} />
            <button className="primary" style={{ marginTop: 16 }} onClick={() => setStep(4)}>Continue</button>
            <button className="ghost" style={{ marginTop: 8 }} onClick={() => setStep(2)}>Back</button>
          </>
        )}

        {step === 4 && to && (
          <>
            <h2 className="h-title" style={{ fontSize: 24 }}>Add a message</h2>
            <p className="sub" style={{ margin: '6px 0 14px' }}>{amount > 0 ? '+' : ''}{amount} {categoryById(cat)?.icon} {categoryById(cat)?.label} → {to.name}</p>
            <textarea className="search" rows={4} placeholder={polar === 'shadow' ? 'Why this mark…' : 'Tell them why they deserve it…'} value={msg} onChange={(e) => setMsg(e.target.value)} />
            {err && <p className="warn">{err}</p>}
            <button className="primary" style={{ marginTop: 16 }} onClick={submit}>{amount < 0 ? 'MARK DISHONOR' : 'GIVE AURA ✨'}</button>
            <button className="ghost" style={{ marginTop: 8 }} onClick={() => setStep(3)}>Back</button>
          </>
        )}
      </div>
    </div>
  )
}
