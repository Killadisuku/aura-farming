import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  BADGE_DEFS, SEED_FOLLOWS, SEED_NOTIFS, SEED_TX, SEED_USERS,
  categoryById, challengeForToday, getLevel, todayKey,
} from './data'

const KEY = 'aura_state_v1'
const Store = createContext(null)
function emptyBreakdown() {
  return { kindness: 0, helpfulness: 0, coolness: 0, charisma: 0, confidence: 0, humor: 0, intelligence: 0, courage: 0, leadership: 0, style: 0 }
}
function hydrate() {
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw) } catch {}
  return {
    users: SEED_USERS, follows: SEED_FOLLOWS, txs: SEED_TX, notifs: SEED_NOTIFS,
    currentUserId: null, onboarded: false, googleSession: null,
    friendRequests: [
      { id: 'fr_1', fromId: 'u_sarah', toId: 'u_ahmed', status: 'pending', ts: Date.now() - 3600000 },
      { id: 'fr_2', fromId: 'u_mike', toId: 'u_ahmed', status: 'pending', ts: Date.now() - 7200000 },
    ],
    blocked: {}, reports: [], daily: { date: todayKey(), challenge: challengeForToday(), completedBy: [] }, hiddenTx: {},
  }
}
export function StoreProvider({ children }) {
  const [state, setState] = useState(hydrate)
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(state)) }, [state])
  useEffect(() => {
    const today = todayKey()
    setState((s) => s.daily?.date === today ? s : { ...s, daily: { date: today, challenge: challengeForToday(), completedBy: [] } })
  }, [])
  const api = useMemo(() => {
    const me = () => state.users.find((u) => u.id === state.currentUserId) || null
    const user = (id) => state.users.find((u) => u.id === id)
    const isBlocked = (a, b) => !!(state.blocked[a]?.includes(b) || state.blocked[b]?.includes(a))
    function patchUser(id, fn) { setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? fn(u) : u)) })) }
    function loginDemo() { setState((s) => ({ ...s, currentUserId: 'u_ahmed', onboarded: true, googleSession: { email: 'ahmed.demo@gmail.com', provider: 'demo' } })) }
    function loginWithGoogle({ name, email, picture }) {
      const mail = (email || '').trim().toLowerCase()
      if (!mail) return { ok: false }
      setState((s) => {
        const existing = s.users.find((u) => u.googleEmail === mail || u.username === mail.split('@')[0].replace(/[^a-z0-9_]/g, ''))
        if (existing) return { ...s, currentUserId: existing.id, onboarded: true, googleSession: { email: mail, name, picture, provider: 'google' } }
        const username = mail.split('@')[0].replace(/[^a-z0-9_]/g, '').slice(0, 16) || 'aura'
        const id = 'u_' + username + '_' + Date.now().toString(36)
        const nu = { id, name: (name || username).trim(), username, googleEmail: mail, bio: 'Just entered the Aura.', avatar: picture || `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(username)}&backgroundColor=1e1b4b`, interests: [], auraReceived: 0, auraGiven: 0, breakdown: emptyBreakdown(), streak: 1, lastActiveDay: todayKey(), privacy: { hideActivity: false, privateProfile: false, locationOn: false }, location: '', createdAt: Date.now() }
        return { ...s, users: [nu, ...s.users], follows: { ...s.follows, [id]: ['u_sarah', 'u_alex', 'u_emma'] }, currentUserId: id, onboarded: true, googleSession: { email: mail, name, picture, provider: 'google' } }
      })
      return { ok: true }
    }
    function sendFriendRequest(toId) {
      const mid = state.currentUserId
      if (!mid || toId === mid) return { ok: false }
      const exists = (state.friendRequests || []).find((r) => r.status !== 'ignored' && ((r.fromId === mid && r.toId === toId) || (r.fromId === toId && r.toId === mid)))
      if (exists) return { ok: false }
      const from = user(mid)
      setState((s) => ({ ...s, friendRequests: [{ id: 'fr_' + Date.now(), fromId: mid, toId, status: 'pending', ts: Date.now() }, ...(s.friendRequests || [])], notifs: [{ id: 'n_fr_' + Date.now(), userId: toId, type: 'friend', text: `${from.name} wants to add you`, sub: 'Accept to connect.', fromId: mid, read: false, ts: Date.now() }, ...s.notifs] }))
      return { ok: true }
    }
    function respondFriend(reqId, accept) {
      const mid = state.currentUserId
      setState((s) => {
        const req = (s.friendRequests || []).find((r) => r.id === reqId)
        if (!req || req.toId !== mid) return s
        const nextReqs = s.friendRequests.map((r) => r.id === reqId ? { ...r, status: accept ? 'accepted' : 'ignored' } : r)
        if (!accept) return { ...s, friendRequests: nextReqs }
        const a = s.follows[req.fromId] || []; const b = s.follows[req.toId] || []
        return { ...s, friendRequests: nextReqs, follows: { ...s.follows, [req.fromId]: a.includes(req.toId) ? a : [...a, req.toId], [req.toId]: b.includes(req.fromId) ? b : [...b, req.fromId] } }
      })
    }
    function friendStatus(otherId) {
      const mid = state.currentUserId; const reqs = state.friendRequests || []
      if (reqs.find((r) => r.status === 'accepted' && ((r.fromId === mid && r.toId === otherId) || (r.fromId === otherId && r.toId === mid)))) return 'friends'
      if ((state.follows[mid] || []).includes(otherId) && (state.follows[otherId] || []).includes(mid)) return 'friends'
      if (reqs.find((r) => r.status === 'pending' && r.fromId === mid && r.toId === otherId)) return 'pending-out'
      if (reqs.find((r) => r.status === 'pending' && r.fromId === otherId && r.toId === mid)) return 'pending-in'
      return 'none'
    }
    function incomingRequests() { return (state.friendRequests || []).filter((r) => r.toId === state.currentUserId && r.status === 'pending') }
    function completeOnboarding({ name, username, avatar, interests }) {
      const id = 'u_' + username.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now().toString(36)
      const nu = { id, name: name.trim() || 'New Aura', username: username.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user', bio: 'Just entered the Aura.', avatar: avatar || `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(username)}&backgroundColor=1e1b4b`, interests: interests || [], auraReceived: 0, auraGiven: 0, breakdown: emptyBreakdown(), streak: 1, lastActiveDay: todayKey(), privacy: { hideActivity: false, privateProfile: false, locationOn: false }, location: '', createdAt: Date.now() }
      setState((s) => ({ ...s, users: [nu, ...s.users], follows: { ...s.follows, [id]: ['u_sarah', 'u_alex', 'u_emma'] }, currentUserId: id, onboarded: true }))
    }
    function logout() { setState((s) => ({ ...s, currentUserId: null, onboarded: false, googleSession: null })) }
    function resetDemo() { localStorage.removeItem(KEY); setState({ users: SEED_USERS, follows: SEED_FOLLOWS, txs: SEED_TX, notifs: SEED_NOTIFS, currentUserId: null, onboarded: false, googleSession: null, friendRequests: [], blocked: {}, reports: [], daily: { date: todayKey(), challenge: challengeForToday(), completedBy: [] }, hiddenTx: {} }) }
    function follow(id) { const mid = state.currentUserId; if (!mid || id === mid) return; setState((s) => { const list = s.follows[mid] || []; const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id]; return { ...s, follows: { ...s.follows, [mid]: next } } }) }
    function givenTodayTo(fromId, toId) { const start = new Date(); start.setHours(0,0,0,0); return state.txs.filter((t) => t.fromId === fromId && t.toId === toId && t.ts >= start.getTime()) }
    function givenTodayTotal(fromId) { const start = new Date(); start.setHours(0,0,0,0); return state.txs.filter((t) => t.fromId === fromId && t.ts >= start.getTime()) }
    function canGive(fromId, toId, amount) {
      if (fromId === toId) return { ok: false, reason: 'You cannot give Aura to yourself.' }
      if (isBlocked(fromId, toId)) return { ok: false, reason: 'You cannot interact with this person.' }
      const same = givenTodayTo(fromId, toId)
      if (same.length >= 3) return { ok: false, reason: 'Daily limit reached for this person (3 gifts).' }
      if (same.reduce((a,t)=>a+t.amount,0) + amount > 100) return { ok: false, reason: 'Max +100 Aura to the same person per day.' }
      const all = givenTodayTotal(fromId)
      if (all.length >= 20) return { ok: false, reason: 'Daily give limit reached. Come back tomorrow.' }
      if (all.reduce((a,t)=>a+t.amount,0) + amount > 250) return { ok: false, reason: 'Daily Aura budget is 250.' }
      if (state.txs.filter((t) => t.fromId === fromId && Date.now() - t.ts < 20000).length >= 4) return { ok: false, reason: 'Slow down.' }
      return { ok: true }
    }
    function touchStreak() {
      const mid = state.currentUserId; const today = todayKey()
      setState((s) => ({ ...s, users: s.users.map((u) => {
        if (u.id !== mid || u.lastActiveDay === today) return u
        const y = new Date(); y.setDate(y.getDate()-1)
        return { ...u, streak: u.lastActiveDay === y.toISOString().slice(0,10) ? u.streak + 1 : 1, lastActiveDay: today }
      }) }))
    }
    function giveAura({ toId, amount, category, message }) {
      const fromId = state.currentUserId; const check = canGive(fromId, toId, amount); if (!check.ok) return check
      const from = user(fromId); const to = user(toId); const cat = categoryById(category)
      const prevLevel = getLevel(to.auraReceived).current.name; const nextReceived = to.auraReceived + amount; const nextLevel = getLevel(nextReceived).current.name
      const tx = { id: 't_' + Date.now(), fromId, toId, amount, category, message: (message||'').trim(), ts: Date.now(), likes: [] }
      const notifs = [{ id: 'n_' + Date.now(), userId: toId, type: 'received', text: `You received +${amount} Aura!`, sub: `${from.name} gave you ${cat.label} Aura.`, fromId, amount, read: false, ts: Date.now() }]
      if (nextLevel !== prevLevel) notifs.push({ id: 'n_lv_' + Date.now(), userId: toId, type: 'level', text: `You reached Aura Level: ${nextLevel}.`, sub: 'Your energy just leveled up.', read: false, ts: Date.now() + 1 })
      setState((s) => ({ ...s, txs: [tx, ...s.txs], notifs: [...notifs, ...s.notifs], users: s.users.map((u) => {
        if (u.id === fromId) return { ...u, auraGiven: u.auraGiven + amount, lastActiveDay: todayKey() }
        if (u.id === toId) return { ...u, auraReceived: u.auraReceived + amount, breakdown: { ...u.breakdown, [category]: (u.breakdown[category] || 0) + amount } }
        return u
      }) }))
      touchStreak(); return { ok: true, tx }
    }
    function likeTx(id) { const mid = state.currentUserId; setState((s) => ({ ...s, txs: s.txs.map((t) => t.id !== id ? t : { ...t, likes: t.likes.includes(mid) ? t.likes.filter((x) => x !== mid) : [...t.likes, mid] }) })) }
    function hideTx(id) { setState((s) => ({ ...s, hiddenTx: { ...s.hiddenTx, [id]: true } })) }
    function blockUser(id) { const mid = state.currentUserId; setState((s) => ({ ...s, blocked: { ...s.blocked, [mid]: (s.blocked[mid] || []).includes(id) ? s.blocked[mid] : [...(s.blocked[mid]||[]), id] }, follows: { ...s.follows, [mid]: (s.follows[mid] || []).filter((x) => x !== id) } })) }
    function unblockUser(id) { const mid = state.currentUserId; setState((s) => ({ ...s, blocked: { ...s.blocked, [mid]: (s.blocked[mid] || []).filter((x) => x !== id) } })) }
    function reportUser(id, reason) { setState((s) => ({ ...s, reports: [...s.reports, { id: 'r_' + Date.now(), fromId: s.currentUserId, toId: id, reason, ts: Date.now() }] })) }
    function updatePrivacy(patch) { patchUser(state.currentUserId, (u) => ({ ...u, privacy: { ...u.privacy, ...patch } })) }
    function updateProfile(patch) { patchUser(state.currentUserId, (u) => ({ ...u, ...patch })) }
    function markNotifsRead() { const mid = state.currentUserId; setState((s) => ({ ...s, notifs: s.notifs.map((n) => n.userId === mid ? { ...n, read: true } : n) })) }
    function completeChallenge() {
      const mid = state.currentUserId; if (!mid || state.daily.completedBy.includes(mid)) return { ok: false }
      setState((s) => ({ ...s, daily: { ...s.daily, completedBy: [...s.daily.completedBy, mid] }, users: s.users.map((u) => u.id === mid ? { ...u, auraReceived: u.auraReceived + 10, breakdown: { ...u.breakdown, kindness: (u.breakdown.kindness || 0) + 10 } } : u), notifs: [{ id: 'n_ch_' + Date.now(), userId: mid, type: 'challenge', text: 'Aura of the Day complete.', sub: '+10 Aura for showing up.', amount: 10, read: false, ts: Date.now() }, ...s.notifs] }))
      touchStreak(); return { ok: true, amount: 10 }
    }
    function badgesFor(u) { return u ? BADGE_DEFS.filter((b) => b.check(u, state.txs)) : [] }
    return { state, me, user, isBlocked, loginDemo, loginWithGoogle, completeOnboarding, logout, sendFriendRequest, respondFriend, friendStatus, incomingRequests, resetDemo, follow, canGive, giveAura, likeTx, hideTx, blockUser, unblockUser, reportUser, updatePrivacy, updateProfile, markNotifsRead, completeChallenge, badgesFor }
  }, [state])
  return <Store.Provider value={api}>{children}</Store.Provider>
}
export function useStore() { return useContext(Store) }
