import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  BADGE_DEFS,
  SEED_FOLLOWS,
  SEED_NOTIFS,
  SEED_TX,
  SEED_USERS,
  categoryById,
  challengeForToday,
  getLevel,
  todayKey,
} from './data'

const KEY = 'aura_state_v1'
const Store = createContext(null)

function emptyBreakdown() {
  return {
    kindness: 0, helpfulness: 0, coolness: 0, charisma: 0, confidence: 0,
    humor: 0, intelligence: 0, courage: 0, leadership: 0, style: 0,
  }
}

function hydrate() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {
    users: SEED_USERS,
    follows: SEED_FOLLOWS,
    txs: SEED_TX,
    notifs: SEED_NOTIFS,
    currentUserId: null,
    onboarded: false,
    googleSession: null,
    friendRequests: [
      { id: 'fr_1', fromId: 'u_sarah', toId: 'u_ahmed', status: 'pending', ts: Date.now() - 3600000 },
      { id: 'fr_2', fromId: 'u_mike', toId: 'u_ahmed', status: 'pending', ts: Date.now() - 7200000 },
    ],
    blocked: {},
    reports: [],
    daily: { date: todayKey(), challenge: challengeForToday(), completedBy: [] },
    hiddenTx: {},
  }
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(hydrate)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    const today = todayKey()
    setState((s) => {
      if (s.daily?.date === today) return s
      return { ...s, daily: { date: today, challenge: challengeForToday(), completedBy: [] } }
    })
  }, [])

  const api = useMemo(() => {
    const me = () => state.users.find((u) => u.id === state.currentUserId) || null
    const user = (id) => state.users.find((u) => u.id === id)
    const isBlocked = (a, b) => !!(state.blocked[a]?.includes(b) || state.blocked[b]?.includes(a))

    function patchUser(id, fn) {
      setState((s) => ({
        ...s,
        users: s.users.map((u) => (u.id === id ? fn(u) : u)),
      }))
    }

    function loginDemo() {
      setState((s) => ({ ...s, currentUserId: 'u_ahmed', onboarded: true, googleSession: { email: 'ahmed.demo@gmail.com', provider: 'demo' } }))
    }

    function loginWithGoogle({ name, email, picture }) {
      const mail = (email || '').trim().toLowerCase()
      if (!mail) return { ok: false, reason: 'Google email missing.' }
      setState((s) => {
        const existing = s.users.find((u) => u.googleEmail === mail || u.username === mail.split('@')[0].replace(/[^a-z0-9_]/g, ''))
        if (existing) {
          return { ...s, currentUserId: existing.id, onboarded: true, googleSession: { email: mail, name, picture, provider: 'google' } }
        }
        const username = mail.split('@')[0].replace(/[^a-z0-9_]/g, '').slice(0, 16) || 'aura'
        const id = 'u_' + username + '_' + Date.now().toString(36)
        const nu = {
          id,
          name: (name || username).trim(),
          username,
          googleEmail: mail,
          bio: 'Just entered the Aura.',
          avatar: picture || `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(username)}&backgroundColor=1e1b4b,312e81,4c1d95`,
          interests: [],
          auraReceived: 0,
          auraGiven: 0,
          breakdown: emptyBreakdown(),
          streak: 1,
          lastActiveDay: todayKey(),
          privacy: { hideActivity: false, privateProfile: false, locationOn: false },
          location: '',
          createdAt: Date.now(),
        }
        return {
          ...s,
          users: [nu, ...s.users],
          follows: { ...s.follows, [id]: ['u_sarah', 'u_alex', 'u_emma'] },
          currentUserId: id,
          onboarded: true,
          googleSession: { email: mail, name, picture, provider: 'google' },
        }
      })
      return { ok: true }
    }

    function sendFriendRequest(toId) {
      const mid = state.currentUserId
      if (!mid || toId === mid) return { ok: false }
      const exists = (state.friendRequests || []).find((r) =>
        r.status !== 'ignored' && ((r.fromId === mid && r.toId === toId) || (r.fromId === toId && r.toId === mid))
      )
      if (exists?.status === 'accepted') return { ok: false, reason: 'Already friends.' }
      if (exists?.status === 'pending') return { ok: false, reason: 'Request already sent.' }
      const req = { id: 'fr_' + Date.now(), fromId: mid, toId, status: 'pending', ts: Date.now() }
      const from = user(mid)
      setState((s) => ({
        ...s,
        friendRequests: [req, ...(s.friendRequests || [])],
        notifs: [{
          id: 'n_fr_' + Date.now(),
          userId: toId,
          type: 'friend',
          text: `${from.name} wants to add you`,
          sub: 'Like Snapchat — accept to connect.',
          fromId: mid,
          read: false,
          ts: Date.now(),
        }, ...s.notifs],
      }))
      return { ok: true }
    }

    function respondFriend(reqId, accept) {
      const mid = state.currentUserId
      setState((s) => {
        const req = (s.friendRequests || []).find((r) => r.id === reqId)
        if (!req || req.toId !== mid) return s
        const nextReqs = s.friendRequests.map((r) => r.id === reqId ? { ...r, status: accept ? 'accepted' : 'ignored' } : r)
        if (!accept) return { ...s, friendRequests: nextReqs }
        const a = s.follows[req.fromId] || []
        const b = s.follows[req.toId] || []
        return {
          ...s,
          friendRequests: nextReqs,
          follows: {
            ...s.follows,
            [req.fromId]: a.includes(req.toId) ? a : [...a, req.toId],
            [req.toId]: b.includes(req.fromId) ? b : [...b, req.fromId],
          },
        }
      })
    }

    function friendStatus(otherId) {
      const mid = state.currentUserId
      const reqs = state.friendRequests || []
      const accepted = reqs.find((r) => r.status === 'accepted' && ((r.fromId === mid && r.toId === otherId) || (r.fromId === otherId && r.toId === mid)))
      if (accepted || ((state.follows[mid] || []).includes(otherId) && (state.follows[otherId] || []).includes(mid))) return 'friends'
      const outgoing = reqs.find((r) => r.status === 'pending' && r.fromId === mid && r.toId === otherId)
      if (outgoing) return 'pending-out'
      const incoming = reqs.find((r) => r.status === 'pending' && r.fromId === otherId && r.toId === mid)
      if (incoming) return 'pending-in'
      return 'none'
    }

    function incomingRequests() {
      const mid = state.currentUserId
      return (state.friendRequests || []).filter((r) => r.toId === mid && r.status === 'pending')
    }

    function completeOnboarding({ name, username, avatar, interests }) {
      const id = 'u_' + username.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now().toString(36)
      const nu = {
        id,
        name: name.trim() || 'New Aura',
        username: username.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user',
        bio: 'Just entered the Aura.',
        avatar: avatar || `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(username)}&backgroundColor=1e1b4b,312e81,4c1d95`,
        interests: interests || [],
        auraReceived: 0,
        auraGiven: 0,
        breakdown: emptyBreakdown(),
        streak: 1,
        lastActiveDay: todayKey(),
        privacy: { hideActivity: false, privateProfile: false, locationOn: false },
        location: '',
        createdAt: Date.now(),
      }
      setState((s) => ({
        ...s,
        users: [nu, ...s.users],
        follows: { ...s.follows, [id]: ['u_sarah', 'u_alex', 'u_emma'] },
        currentUserId: id,
        onboarded: true,
      }))
    }

    function logout() {
      setState((s) => ({ ...s, currentUserId: null, onboarded: false, googleSession: null }))
    }

    function resetDemo() {
      localStorage.removeItem(KEY)
      setState({
        users: SEED_USERS,
        follows: SEED_FOLLOWS,
        txs: SEED_TX,
        notifs: SEED_NOTIFS,
        currentUserId: null,
        onboarded: false,
        googleSession: null,
        friendRequests: [],
        blocked: {},
        reports: [],
        daily: { date: todayKey(), challenge: challengeForToday(), completedBy: [] },
        hiddenTx: {},
      })
    }
