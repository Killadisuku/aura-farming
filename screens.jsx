import { useEffect, useMemo, useState } from 'react'
import { useStore } from './store'
import { BADGE_DEFS, CATEGORIES, INTERESTS, categoryById, formatNum, getLevel, timeAgo } from './data'
import { FeedCard, IconBell, Logo } from './ui'

export function Onboarding() {
  const { loginDemo, completeOnboarding } = useStore()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [interests, setInterests] = useState([])
  const slides = [
    { kicker: 'WELCOME TO AURA ✨', title: 'Recognize the people who make life better.', body: 'Aura is social appreciation — a glow you give when someone shows up well.' },
    { kicker: 'Give Aura', title: 'Reward the moment.', body: 'Kindness, confidence, charisma, humor, coolness. Say it with points and a note.' },
    { kicker: 'Build Your Aura', title: 'See how the room sees you.', body: 'Your Aura is a living score of how people experience you. Not money. Not clout for sale.' },
  ]
  if (step < 3) {
    const s = slides[step]
    return (
      <div className="screen no-nav">
        <div className="onboard">
          <Logo size={72} />
          <p className="sub" style={{ letterSpacing: '.16em', marginTop: 16 }}>{s.kicker}</p>
          <h1>{s.title}</h1>
          <p className="sub">{s.body}</p>
          <div className="dots">{slides.map((_, i) => <i key={i} className={i === step ? 'on' : ''} />)}</div>
          <button className="primary" onClick={() => setStep(step + 1)}>{step === 2 ? 'Create your Aura' : 'Next'}</button>
          <button style={{ marginTop: 14 }} className="linkish" onClick={loginDemo}>Enter as Ahmed (demo)</button>
        </div>
      </div>
    )
  }
  return (
    <div className="screen no-nav">
      <div className="onboard">
        <p className="sub" style={{ letterSpacing: '.16em' }}>YOUR AURA</p>
        <h1 style={{ fontSize: 32 }}>Make it yours.</h1>
        <input className="search" style={{ marginTop: 16 }} placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="search" style={{ marginTop: 10 }} placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <div className="section-label">Interests</div>
        <div className="interest-wrap">
          {INTERESTS.map((it) => (
            <button key={it} className={`chip ${interests.includes(it) ? 'on' : ''}`} onClick={() => setInterests((xs) => xs.includes(it) ? xs.filter((x) => x !== it) : [...xs, it])}>{it}</button>
          ))}
        </div>
        <button className="primary" style={{ marginTop: 20 }} disabled={!name.trim() || !username.trim()} onClick={() => completeOnboarding({ name, username, interests })}>ENTER THE AURA ✨</button>
        <button style={{ marginTop: 14 }} className="linkish" onClick={loginDemo}>Skip · enter demo as Ahmed</button>
      </div>
    </div>
  )
}

export function Home({ setTab, openProfile, onNotifs, unread }) {
  const { me, state, completeChallenge } = useStore()
  const u = me()
  const [doneFlash, setDoneFlash] = useState('')
  const challengeDone = state.daily.completedBy.includes(u.id)
  const feed = state.txs.filter((t) => !state.hiddenTx[t.id])
  return (
    <div className="screen">
      <header className="topbar">
        <div className="brand-row"><Logo size={36} /><div className="logo-word">AURA</div></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="icon-btn" onClick={onNotifs} aria-label="Notifications" style={{ position: 'relative' }}>
            <IconBell />
            {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#e879f9', width: 16, height: 16, borderRadius: 99, fontSize: 10, display: 'grid', placeItems: 'center' }}>{unread}</span>}
          </button>
          <button className="aura-chip" onClick={() => setTab('profile')}>
            <img src={u.avatar} alt="" />🔥 {formatNum(u.auraReceived)} AURA
          </button>
        </div>
      </header>
      <section className="glass challenge">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>⚡ Aura of the Day</h3>
          <span className="sub">🔥 {u.streak} day streak</span>
        </div>
        <p style={{ margin: '8px 0 12px', fontSize: 16 }}>{state.daily.challenge}</p>
        <button className={challengeDone ? 'ghost' : 'primary'} disabled={challengeDone} onClick={() => { const r = completeChallenge(); if (r.ok) setDoneFlash(`+${r.amount} Aura — keep spreading good energy.`) }}>
          {challengeDone ? 'Completed today' : 'I did it · +10 Aura'}
        </button>
        {doneFlash && <p className="sub" style={{ marginTop: 8 }}>{doneFlash}</p>}
      </section>
      <div className="section-label">Recent Aura</div>
      {feed.map((tx) => <FeedCard key={tx.id} tx={tx} onOpen={openProfile} />)}
    </div>
  )
}

export function Discover({ openProfile }) {
  const { state, me, follow } = useStore()
  const [q, setQ] = useState('')
  const [near, setNear] = useState(false)
  const mid = me().id
  const following = state.follows[mid] || []
  const rising = [...state.users].filter((u) => u.id !== mid).sort((a, b) => {
    const rec = (id) => state.txs.filter((t) => t.toId === id && Date.now() - t.ts < 48 * 3600000).reduce((s, t) => s + t.amount, 0)
    return rec(b.id) - rec(a.id)
  })
  const search = state.users.filter((u) => q && (u.name + u.username).toLowerCase().includes(q.toLowerCase()))
  const topCat = (id) => [...state.users].sort((a, b) => (b.breakdown[id] || 0) - (a.breakdown[id] || 0)).slice(0, 6)
  return (
    <div className="screen">
      <header className="topbar"><div className="h-title" style={{ fontSize: 24 }}>Discover</div></header>
      <input className="search" placeholder="Search people or @username" value={q} onChange={(e) => setQ(e.target.value)} />
      {q && (
        <div style={{ marginTop: 12 }}>
          {search.length === 0 && <div className="empty">No one by that name.</div>}
          {search.map((u) => (
            <div key={u.id} className="user-row" style={{ padding: '10px 0' }}>
              <button onClick={() => openProfile(u.id)} style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, textAlign: 'left' }}>
                <img className="av" src={u.avatar} alt="" />
                <div className="meta"><strong>{u.name}</strong><span>@{u.username} · {formatNum(u.auraReceived)}</span></div>
              </button>
              {u.id !== mid && <button className="ghost" style={{ width: 'auto', height: 36, padding: '0 12px' }} onClick={() => follow(u.id)}>{following.includes(u.id) ? 'Following' : 'Follow'}</button>}
            </div>
          ))}
        </div>
      )}
      {!q && (
        <>
          <div className="section-label">Trending Aura</div>
          <div className="trending">
            {rising.slice(0, 8).map((u) => (
              <button key={u.id} className="glass trend-card" onClick={() => openProfile(u.id)}>
                <img className="av" src={u.avatar} alt="" />
                <b style={{ display: 'block', marginTop: 8 }}>{u.name}</b>
                <span className="sub">🔥 {formatNum(u.auraReceived)}</span>
              </button>
            ))}
          </div>
          {[['charisma', 'Top Charisma'], ['coolness', 'Top Coolness'], ['kindness', 'Top Kindness']].map(([id, label]) => (
            <div key={id}>
              <div className="section-label">{label}</div>
              {topCat(id).map((u) => (
                <button key={u.id} className="user-row" onClick={() => openProfile(u.id)}>
                  <img className="av" src={u.avatar} alt="" />
                  <div className="meta"><strong>{u.name}</strong><span>{categoryById(id).icon} {formatNum(u.breakdown[id] || 0)}</span></div>
                </button>
              ))}
            </div>
          ))}
          <div className="section-label">People near you</div>
          <div className="glass" style={{ padding: 16 }}>
            <p className="sub">Location is off by default. AURA never tracks you unless you opt in.</p>
            <button className="ghost" style={{ marginTop: 12 }} onClick={() => setNear(!near)}>{near ? 'Hide nearby' : 'Enable nearby (demo)'}</button>
            {near && state.users.filter((u) => u.location && u.id !== mid).slice(0, 5).map((u) => (
              <button key={u.id} className="user-row" onClick={() => openProfile(u.id)}>
                <img className="av" src={u.avatar} alt="" />
                <div className="meta"><strong>{u.name}</strong><span>{u.location}</span></div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function Leaderboard({ openProfile }) {
  const { state, me } = useStore()
  const [tab, setTab] = useState('global')
  const [cat, setCat] = useState(null)
  const mid = me().id
  const friends = new Set([mid, ...(state.follows[mid] || [])])
  const weekAgo = Date.now() - 7 * 86400000
  const monthAgo = Date.now() - 30 * 86400000
  const scores = useMemo(() => {
    let list = state.users.filter((u) => !u.privacy?.privateProfile)
    if (tab === 'friends') list = list.filter((u) => friends.has(u.id))
    if (tab === 'weekly' || tab === 'monthly') {
      const since = tab === 'weekly' ? weekAgo : monthAgo
      const map = {}
      state.txs.filter((t) => t.ts >= since).forEach((t) => { map[t.toId] = (map[t.toId] || 0) + t.amount })
      list = list.map((u) => ({ ...u, _s: map[u.id] || 0 })).sort((a, b) => b._s - a._s)
    } else if (cat) list = [...list].sort((a, b) => (b.breakdown[cat] || 0) - (a.breakdown[cat] || 0))
    else list = [...list].sort((a, b) => b.auraReceived - a.auraReceived)
    return list
  }, [state, tab, cat, mid])
  const myRank = scores.findIndex((u) => u.id === mid) + 1
  function value(u) {
    if (tab === 'weekly' || tab === 'monthly') return u._s || 0
    if (cat) return u.breakdown[cat] || 0
    return u.auraReceived
  }
  const medal = ['🥇', '🥈', '🥉']
  return (
    <div className="screen">
      <header className="topbar"><div className="h-title" style={{ fontSize: 24 }}>Leaderboard</div></header>
      <div className="tabs">
        {['global', 'friends', 'weekly', 'monthly'].map((t) => (
          <button key={t} className={`tab ${tab === t && !cat ? 'on' : ''}`} onClick={() => { setTab(t); setCat(null) }}>{t[0].toUpperCase() + t.slice(1)}</button>
        ))}
      </div>
      <div className="tabs">
        {CATEGORIES.slice(0, 6).map((c) => (
          <button key={c.id} className={`tab ${cat === c.id ? 'on' : ''}`} onClick={() => setCat(c.id)}>{c.icon} {c.label}</button>
        ))}
      </div>
      <div className="glass rank-row me">
        <div className="rank">#{myRank || '—'}</div>
        <img className="av" src={me().avatar} alt="" />
        <div className="meta" style={{ flex: 1 }}><strong>You</strong><span className="sub">Keep spreading good energy</span></div>
        <b>{formatNum(value(scores.find((u) => u.id === mid) || me()))}</b>
      </div>
      {scores.slice(0, 20).map((u, i) => (
        <button key={u.id} className={`glass rank-row ${u.id === mid ? 'me' : ''}`} onClick={() => openProfile(u.id)}>
          <div className="rank">{medal[i] || i + 1}</div>
          <img className="av" src={u.avatar} alt="" />
          <div className="meta" style={{ flex: 1, textAlign: 'left' }}><strong>{u.name}</strong><span className="sub">@{u.username}</span></div>
          <b>{formatNum(value(u))}</b>
        </button>
      ))}
    </div>
  )
}

export function ProfileView({ userId, onBack, openGive, openShare, onSettings }) {
  const { user, me, follow, state, badgesFor, blockUser, reportUser, isBlocked } = useStore()
  const [menu, setMenu] = useState(false)
  const [toast, setToast] = useState('')
  const u = user(userId)
  if (!u) return null
  const self = me().id === u.id
  const following = (state.follows[me().id] || []).includes(u.id)
  const lv = getLevel(u.auraReceived)
  const badges = badgesFor(u)
  const recent = state.txs.filter((t) => t.toId === u.id).slice(0, 8)
  const blocked = isBlocked(me().id, u.id)
  const maxBreak = Math.max(1, ...Object.values(u.breakdown || { x: 1 }))
  return (
    <div className="screen">
      {toast && <div className="toast">{toast}</div>}
      <header className="topbar">
        {onBack ? <button className="icon-btn" onClick={onBack}>←</button> : <span />}
        <div className="logo-word" style={{ fontSize: 14 }}>PROFILE</div>
        <button className="icon-btn" onClick={() => setMenu(!menu)}>···</button>
      </header>
      {menu && (
        <div className="glass" style={{ padding: 8, marginBottom: 12 }}>
          {self ? (
            <>
              <button className="user-row" onClick={() => { openShare(u); setMenu(false) }}>Share profile card</button>
              {onSettings && <button className="user-row" onClick={() => { onSettings(); setMenu(false) }}>Privacy & settings</button>}
            </>
          ) : (
            <>
              <button className="user-row" onClick={() => { blockUser(u.id); setToast('Blocked. You will not see each other.'); setMenu(false) }}>Block</button>
              <button className="user-row" onClick={() => { reportUser(u.id, 'suspicious aura farming'); setToast('Report sent.'); setMenu(false) }}>Report suspicious farming</button>
            </>
          )}
        </div>
      )}
      <div className="profile-hero">
        <img className="av lg" src={u.avatar} alt="" style={{ '--glow': lv.current.glow, margin: '0 auto' }} />
        <h1>{u.name}</h1>
        <div className="handle">@{u.username}</div>
        <div className="level-chip" style={{ '--glow': lv.current.glow }}>{lv.current.name.toUpperCase()}</div>
        <div style={{ marginTop: 10, fontWeight: 800, fontSize: 22 }}>🔥 {formatNum(u.auraReceived)} AURA</div>
        <p className="sub" style={{ marginTop: 8 }}>{u.bio}</p>
        <div className="bar" style={{ maxWidth: 280, margin: '14px auto 0' }}><i style={{ width: `${Math.round(lv.progress * 100)}%` }} /></div>
        <p className="sub" style={{ marginTop: 6, fontSize: 12 }}>{lv.next ? `${formatNum(u.auraReceived)} / ${formatNum(lv.next.min)} to ${lv.next.name}` : 'Max level'}</p>
        {!self && !blocked && (
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="primary" onClick={() => openGive(u)} style={{ height: 44 }}>Give Aura ✨</button>
            <button className="ghost" style={{ height: 44 }} onClick={() => follow(u.id)}>{following ? 'Following' : 'Follow'}</button>
          </div>
        )}
        {self && <button className="ghost" style={{ marginTop: 14 }} onClick={() => openShare(u)}>Share achievement card</button>}
      </div>
      <div className="stat-row">
        <div className="glass stat"><b>{formatNum(u.auraReceived)}</b><span>Aura received</span></div>
        <div className="glass stat"><b>{formatNum(u.auraGiven)}</b><span>Aura given</span></div>
      </div>
      <div className="section-label">Aura Breakdown</div>
      <div className="glass" style={{ padding: 14 }}>
        {CATEGORIES.map((c) => (
          <div className="break-row" key={c.id}>
            <div className="lab">{c.icon} {c.label}</div>
            <div className="bar"><i style={{ width: `${Math.round(((u.breakdown[c.id] || 0) / maxBreak) * 100)}%`, background: c.color }} /></div>
            <div className="n">{formatNum(u.breakdown[c.id] || 0)}</div>
          </div>
        ))}
      </div>
      <div className="section-label">Badges</div>
      <div className="badge-grid">
        {BADGE_DEFS.map((b) => {
          const on = badges.some((x) => x.id === b.id)
          return <div key={b.id} className={`glass badge ${on ? '' : 'off'}`}><div className="ic">{b.icon}</div><b>{b.name}</b><p>{b.desc}</p></div>
        })}
      </div>
      <div className="section-label">Recent Aura</div>
      {recent.length === 0 && <div className="empty">No Aura yet. Be the first spark.</div>}
      {recent.map((t) => {
        const c = categoryById(t.category)
        const from = user(t.fromId)
        return (
          <div key={t.id} className="glass" style={{ padding: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>{c.icon} +{t.amount} {c.label} {from ? `from ${from.name}` : ''}</span>
            <span className="sub">{timeAgo(t.ts)}</span>
          </div>
        )
      })}
    </div>
  )
}

export function Notifications({ onBack }) {
  const { state, me, markNotifsRead, user } = useStore()
  useEffect(() => { markNotifsRead() }, [])
  const list = state.notifs.filter((n) => n.userId === me().id)
  return (
    <div className="screen">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack}>←</button>
        <div className="h-title" style={{ fontSize: 20 }}>Notifications</div>
        <span />
      </header>
      {list.length === 0 && <div className="empty">All quiet. Give someone Aura.</div>}
      {list.map((n) => {
        const from = n.fromId ? user(n.fromId) : null
        return (
          <div key={n.id} className={`glass notif ${n.read ? '' : 'unread'}`}>
            {from ? <img className="av" src={from.avatar} alt="" /> : <div className="av" style={{ display: 'grid', placeItems: 'center' }}>✨</div>}
            <div style={{ flex: 1 }}><strong>{n.text}</strong><p className="sub">{n.sub}</p><p className="sub">{timeAgo(n.ts)}</p></div>
            {!n.read && <i className="dot" />}
          </div>
        )
      })}
    </div>
  )
}

export function Settings({ onBack }) {
  const { me, updatePrivacy, updateProfile, logout, resetDemo, state, unblockUser } = useStore()
  const u = me()
  const blocked = state.blocked[u.id] || []
  return (
    <div className="screen">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack}>←</button>
        <div className="h-title" style={{ fontSize: 20 }}>Settings</div>
        <span />
      </header>
      <p className="sub">Aura is social recognition — not money, not crypto, not for sale.</p>
      <div className="section-label">Privacy</div>
      {[
        ['hideActivity', 'Hide my Aura activity from the public feed'],
        ['privateProfile', 'Private profile (hidden from global leaderboard)'],
        ['locationOn', 'Location for nearby (off unless you enable it)'],
      ].map(([k, label]) => (
        <div className="settings-row" key={k}>
          <span>{label}</span>
          <button className={`toggle ${u.privacy[k] ? 'on' : ''}`} onClick={() => updatePrivacy({ [k]: !u.privacy[k] })}><i /></button>
        </div>
      ))}
      <div className="section-label">Profile</div>
      <input className="search" defaultValue={u.bio} onBlur={(e) => updateProfile({ bio: e.target.value })} placeholder="Bio" />
      <div className="section-label">Blocked</div>
      {blocked.length === 0 && <p className="sub">Nobody blocked.</p>}
      {blocked.map((id) => {
        const b = state.users.find((x) => x.id === id)
        if (!b) return null
        return (
          <div key={id} className="settings-row">
            <span>{b.name}</span>
            <button className="ghost" style={{ width: 'auto', height: 36, padding: '0 12px' }} onClick={() => unblockUser(id)}>Unblock</button>
          </div>
        )
      })}
      <div className="section-label">Safety rules</div>
      <div className="glass" style={{ padding: 14 }}>
        <p className="sub">• Max 3 gifts / +100 Aura to the same person per day</p>
        <p className="sub">• Daily give budget: 250 Aura</p>
        <p className="sub">• Anti-spam cooldown on rapid gifts</p>
        <p className="sub">• No purchasing Aura. No cash value.</p>
      </div>
      <button className="ghost" style={{ marginTop: 18 }} onClick={logout}>Log out</button>
      <button className="ghost" style={{ marginTop: 8, color: 'var(--danger)' }} onClick={resetDemo}>Reset demo data</button>
    </div>
  )
}

export function ShareSheet({ user: u, onClose }) {
  const lv = getLevel(u.auraReceived)
  const [copied, setCopied] = useState(false)
  function share() {
    const text = `🔥 ${u.name} just hit ${formatNum(u.auraReceived)} Aura on AURA — ${lv.current.name}. Give good energy. Get recognized.`
    if (navigator.share) navigator.share({ title: 'AURA', text }).catch(() => {})
    else { navigator.clipboard?.writeText(text); setCopied(true) }
  }
  return (
    <div className="modal-layer">
      <div className="sheet">
        <div className="share-card">
          <Logo size={56} />
          <p className="sub" style={{ letterSpacing: '.2em', marginTop: 8 }}>AURA ACHIEVEMENT</p>
          <div className="big">{formatNum(u.auraReceived)}</div>
          <p>🔥 {u.name} · @{u.username}</p>
          <div className="level-chip" style={{ '--glow': lv.current.glow, marginTop: 12 }}>{lv.current.name.toUpperCase()}</div>
          <p className="sub" style={{ marginTop: 16 }}>Give good energy. Get recognized.</p>
        </div>
        <button className="primary" style={{ marginTop: 16 }} onClick={share}>{copied ? 'Copied' : 'Share'}</button>
        <button className="ghost" style={{ marginTop: 8 }} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
