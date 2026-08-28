import { useState } from 'react'
import { useStore } from './store'
import { formatNum } from './data'

export function FriendsDiscover({ openProfile }) {
  const { state, me, sendFriendRequest, respondFriend, friendStatus, incomingRequests } = useStore()
  const [q, setQ] = useState('')
  const mid = me().id
  const incoming = incomingRequests()
  const myCode = 'AURA-' + (me().username || 'user').toUpperCase().slice(0, 10)
  const rising = [...state.users].filter((u) => u.id !== mid)
  const search = state.users.filter((u) => q && (u.name + u.username).toLowerCase().includes(q.toLowerCase()))

  function AddBtn({ u }) {
    const st = friendStatus(u.id)
    if (u.id === mid) return null
    if (st === 'friends') return <button className="ghost" style={{ width: 'auto', height: 36, padding: '0 12px' }}>Friends</button>
    if (st === 'pending-out') return <button className="ghost" style={{ width: 'auto', height: 36, padding: '0 12px' }}>Requested</button>
    if (st === 'pending-in') {
      const req = incoming.find((r) => r.fromId === u.id)
      return <button className="primary" style={{ width: 'auto', height: 36, padding: '0 12px' }} onClick={() => req && respondFriend(req.id, true)}>Accept</button>
    }
    return <button className="primary" style={{ width: 'auto', height: 36, padding: '0 12px' }} onClick={() => sendFriendRequest(u.id)}>Add</button>
  }

  return (
    <div className="screen">
      <header className="topbar"><div className="h-title" style={{ fontSize: 24 }}>Add Friends</div></header>
      <div className="glass" style={{ padding: 14, marginBottom: 14, textAlign: 'center' }}>
        <div className="sub">Your Aura code</div>
        <div style={{ fontFamily: 'Syne, Outfit, sans-serif', fontWeight: 800, fontSize: 22, letterSpacing: '.08em', margin: '6px 0' }}>{myCode}</div>
        <p className="sub">Share like a Snapcode. Friends add @{me().username}</p>
      </div>
      {incoming.length > 0 && (
        <>
          <div className="section-label">Friend requests</div>
          {incoming.map((r) => {
            const u = state.users.find((x) => x.id === r.fromId)
            if (!u) return null
            return (
              <div key={r.id} className="user-row glass" style={{ padding: 10, marginBottom: 8 }}>
                <button onClick={() => openProfile(u.id)} style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, textAlign: 'left' }}>
                  <img className="av" src={u.avatar} alt="" />
                  <div className="meta"><strong>{u.name}</strong><span>@{u.username} wants to add you</span></div>
                </button>
                <button className="primary" style={{ width: 'auto', height: 36, padding: '0 12px' }} onClick={() => respondFriend(r.id, true)}>Accept</button>
                <button className="ghost" style={{ width: 'auto', height: 36, padding: '0 10px' }} onClick={() => respondFriend(r.id, false)}>Ignore</button>
              </div>
            )
          })}
        </>
      )}
      <input className="search" placeholder="Add by name or @username" value={q} onChange={(e) => setQ(e.target.value)} />
      {q && (
        <div style={{ marginTop: 12 }}>
          {search.length === 0 && <div className="empty">No one by that name.</div>}
          {search.map((u) => (
            <div key={u.id} className="user-row" style={{ padding: '10px 0' }}>
              <button onClick={() => openProfile(u.id)} style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, textAlign: 'left' }}>
                <img className="av" src={u.avatar} alt="" />
                <div className="meta"><strong>{u.name}</strong><span>@{u.username} · {formatNum(u.auraReceived)}</span></div>
              </button>
              <AddBtn u={u} />
            </div>
          ))}
        </div>
      )}
      {!q && (
        <>
          <div className="section-label">Quick Add</div>
          {rising.slice(0, 8).map((u) => (
            <div key={u.id} className="user-row" style={{ padding: '8px 0' }}>
              <button onClick={() => openProfile(u.id)} style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, textAlign: 'left' }}>
                <img className="av" src={u.avatar} alt="" />
                <div className="meta"><strong>{u.name}</strong><span>@{u.username}</span></div>
              </button>
              <AddBtn u={u} />
            </div>
          ))}
        </>
      )}
    </div>
  )
}
