import { useStore } from './store'
import { categoryById, formatNum, timeAgo } from './data'

export function Logo({ size = 64 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs>
        <radialGradient id="ag" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7d8b99" />
          <stop offset="55%" stopColor="#c4c0b4" />
          <stop offset="100%" stopColor="#b08a4a" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill="none" stroke="url(#ag)" strokeWidth="2.4" />
      <circle cx="32" cy="32" r="23" fill="none" stroke="url(#ag)" strokeWidth="1.2" opacity="0.35" />
      <text x="32" y="42" textAnchor="middle" fontFamily="Cinzel, Syne, serif" fontWeight="700" fontSize="28" fill="url(#ag)">A</text>
    </svg>
  )
}

export function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
    </svg>
  )
}
export function IconCompass() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="m10 14 5-6-6 5z" fill="currentColor" stroke="none" />
    </svg>
  )
}
export function IconTrophy() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 5h8v4a4 4 0 0 1-8 0z" />
      <path d="M8 7H5a3 3 0 0 0 3 3M16 7h3a3 3 0 0 1-3 3M12 13v3M9 20h6" />
    </svg>
  )
}
export function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19c1.2-3 3.4-4.5 7-4.5s5.8 1.5 7 4.5" />
    </svg>
  )
}
export function IconBell() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
      <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </svg>
  )
}

export function Nav({ tab, setTab, onGive }) {
  return (
    <nav className="bottom-nav">
      <button className={`nav-item ${tab === 'home' ? 'active' : ''}`} onClick={() => setTab('home')}><IconHome />Home</button>
      <button className={`nav-item ${tab === 'discover' ? 'active' : ''}`} onClick={() => setTab('discover')}><IconCompass />Discover</button>
      <button className="give-fab" onClick={onGive} aria-label="Give Aura"><span>✨</span></button>
      <button className={`nav-item ${tab === 'board' ? 'active' : ''}`} onClick={() => setTab('board')}><IconTrophy />Board</button>
      <button className={`nav-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}><IconUser />Profile</button>
    </nav>
  )
}

export function FeedCard({ tx, onOpen }) {
  const { user, likeTx, state, me } = useStore()
  const from = user(tx.fromId)
  const to = user(tx.toId)
  const cat = categoryById(tx.category)
  const liked = tx.likes.includes(me()?.id)
  if (!from || !to) return null
  if (to.privacy?.hideActivity || from.privacy?.hideActivity) return null
  if (state.hiddenTx[tx.id]) return null
  const neg = tx.amount < 0
  return (
    <article className="glass feed-card" style={{ '--cat': neg ? '#8b3a3a' : cat.color }} onClick={() => onOpen?.(to.id)}>
      <div className="feed-top">
        <div className="av-stack">
          <img className="av" src={from.avatar} alt="" />
          <img className="av" src={to.avatar} alt="" />
        </div>
        <div className="who">
          <strong>{from.name} → {to.name}</strong>
          <span>@{from.username} {neg ? 'marked' : 'gave'} @{to.username}</span>
        </div>
        <div className={neg ? 'amt neg' : 'amt'}>{neg ? tx.amount : '+' + tx.amount}</div>
      </div>
      <div className="cat-pill">{neg ? '⚔️' : cat.icon} {cat.label}{neg ? ' · dishonor' : ''}</div>
      {tx.message ? <p className="quote">“{tx.message}”</p> : null}
      <div className="feed-foot">
        <span>{timeAgo(tx.ts)}</span>
        <button className={`react-btn ${liked ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); likeTx(tx.id) }}>
          {liked ? '♥' : '♡'} {tx.likes.length}
        </button>
      </div>
    </article>
  )
}

export function formatNumSafe(n) { return formatNum(n) }
