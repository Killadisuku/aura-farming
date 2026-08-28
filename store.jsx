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
      setState((s) => ({ ...s, currentUserId: 'u_ahmed', onboarded: true }))
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
      setState((s) => ({ ...s, currentUserId: null }))
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
        blocked: {},
        reports: [],
        daily: { date: todayKey(), challenge: challengeForToday(), completedBy: [] },
        hiddenTx: {},
      })
    }

    function follow(id) {
      const mid = state.currentUserId
      if (!mid || id === mid) return
      setState((s) => {
        const list = s.follows[mid] || []
        const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
        return { ...s, follows: { ...s.follows, [mid]: next } }
      })
    }

    function givenTodayTo(fromId, toId) {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      return state.txs.filter((t) => t.fromId === fromId && t.toId === toId && t.ts >= start.getTime())
    }

    function givenTodayTotal(fromId) {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      return state.txs.filter((t) => t.fromId === fromId && t.ts >= start.getTime())
    }

    function canGive(fromId, toId, amount) {
      if (fromId === toId) return { ok: false, reason: 'You cannot give Aura to yourself.' }
      if (isBlocked(fromId, toId)) return { ok: false, reason: 'You cannot interact with this person.' }
      const same = givenTodayTo(fromId, toId)
      if (same.length >= 3) return { ok: false, reason: 'Daily limit reached for this person (3 gifts).' }
      const sameAmt = same.reduce((a, t) => a + t.amount, 0)
      if (sameAmt + amount > 100) return { ok: false, reason: 'Max +100 Aura to the same person per day.' }
      const all = givenTodayTotal(fromId)
      const total = all.reduce((a, t) => a + t.amount, 0)
      if (all.length >= 20) return { ok: false, reason: 'Daily give limit reached. Come back tomorrow.' }
      if (total + amount > 250) return { ok: false, reason: 'Daily Aura budget is 250. Spread it around.' }
      const recent = state.txs.filter((t) => t.fromId === fromId && Date.now() - t.ts < 20000)
      if (recent.length >= 4) return { ok: false, reason: 'Slow down — anti-spam protection kicked in.' }
      return { ok: true }
    }

    function giveAura({ toId, amount, category, message }) {
      const fromId = state.currentUserId
      const check = canGive(fromId, toId, amount)
      if (!check.ok) return check
      const id = 't_' + Date.now()
      const tx = { id, fromId, toId, amount, category, message: message.trim(), ts: Date.now(), likes: [] }
      const from = user(fromId)
      const to = user(toId)
      const cat = categoryById(category)
      const prevLevel = getLevel(to.auraReceived).current.name
      const nextReceived = to.auraReceived + amount
      const nextLevel = getLevel(nextReceived).current.name

      const notifs = [
        {
          id: 'n_' + Date.now(),
          userId: toId,
          type: 'received',
          text: `You received +${amount} Aura!`,
          sub: `${from.name} gave you ${cat.label} Aura.`,
          fromId,
          amount,
          read: false,
          ts: Date.now(),
        },
      ]
      if (nextLevel !== prevLevel) {
        notifs.push({
          id: 'n_lv_' + Date.now(),
          userId: toId,
          type: 'level',
          text: `You reached Aura Level: ${nextLevel}.`,
          sub: 'Your energy just leveled up.',
          read: false,
          ts: Date.now() + 1,
        })
      }

      setState((s) => ({
        ...s,
        txs: [tx, ...s.txs],
        notifs: [...notifs, ...s.notifs],
        users: s.users.map((u) => {
          if (u.id === fromId) {
            return { ...u, auraGiven: u.auraGiven + amount, lastActiveDay: todayKey() }
          }
          if (u.id === toId) {
            return {
              ...u,
              auraReceived: u.auraReceived + amount,
              breakdown: { ...u.breakdown, [category]: (u.breakdown[category] || 0) + amount },
            }
          }
          return u
        }),
      }))
      touchStreak()
      return { ok: true, tx }
    }

    function likeTx(id) {
      const mid = state.currentUserId
      setState((s) => ({
        ...s,
        txs: s.txs.map((t) => {
          if (t.id !== id) return t
          const likes = t.likes.includes(mid) ? t.likes.filter((x) => x !== mid) : [...t.likes, mid]
          return { ...t, likes }
        }),
      }))
    }

    function hideTx(id) {
      setState((s) => ({ ...s, hiddenTx: { ...s.hiddenTx, [id]: true } }))
    }

    function blockUser(id) {
      const mid = state.currentUserId
      setState((s) => {
        const list = s.blocked[mid] || []
        return {
          ...s,
          blocked: { ...s.blocked, [mid]: list.includes(id) ? list : [...list, id] },
          follows: {
            ...s.follows,
            [mid]: (s.follows[mid] || []).filter((x) => x !== id),
          },
        }
      })
    }

    function unblockUser(id) {
      const mid = state.currentUserId
      setState((s) => ({
        ...s,
        blocked: { ...s.blocked, [mid]: (s.blocked[mid] || []).filter((x) => x !== id) },
      }))
    }

    function reportUser(id, reason) {
      setState((s) => ({
        ...s,
        reports: [...s.reports, { id: 'r_' + Date.now(), fromId: s.currentUserId, toId: id, reason, ts: Date.now() }],
      }))
    }

    function updatePrivacy(patch) {
      patchUser(state.currentUserId, (u) => ({ ...u, privacy: { ...u.privacy, ...patch } }))
    }

    function updateProfile(patch) {
      patchUser(state.currentUserId, (u) => ({ ...u, ...patch }))
    }

    function markNotifsRead() {
      const mid = state.currentUserId
      setState((s) => ({
        ...s,
        notifs: s.notifs.map((n) => (n.userId === mid ? { ...n, read: true } : n)),
      }))
    }

    function completeChallenge() {
      const mid = state.currentUserId
      if (!mid) return { ok: false }
      if (state.daily.completedBy.includes(mid)) return { ok: false, reason: 'Already completed today.' }
      const amount = 10
      setState((s) => ({
        ...s,
        daily: { ...s.daily, completedBy: [...s.daily.completedBy, mid] },
        users: s.users.map((u) =>
          u.id === mid
            ? {
                ...u,
                auraReceived: u.auraReceived + amount,
                breakdown: { ...u.breakdown, kindness: (u.breakdown.kindness || 0) + amount },
              }
            : u
        ),
        notifs: [
          {
            id: 'n_ch_' + Date.now(),
            userId: mid,
            type: 'challenge',
            text: 'Aura of the Day complete.',
            sub: `+${amount} Aura for showing up.`,
            amount,
            read: false,
            ts: Date.now(),
          },
          ...s.notifs,
        ],
      }))
      touchStreak()
      return { ok: true, amount }
    }

    function touchStreak() {
      const mid = state.currentUserId
      const today = todayKey()
      setState((s) => ({
        ...s,
        users: s.users.map((u) => {
          if (u.id !== mid) return u
          if (u.lastActiveDay === today) return u
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const y = yesterday.toISOString().slice(0, 10)
          const streak = u.lastActiveDay === y ? u.streak + 1 : 1
          return { ...u, streak, lastActiveDay: today }
        }),
      }))
    }

    function badgesFor(u) {
      if (!u) return []
      return BADGE_DEFS.filter((b) => b.check(u, state.txs))
    }

    return {
      state,
      me,
      user,
      isBlocked,
      loginDemo,
      completeOnboarding,
      logout,
      resetDemo,
      follow,
      canGive,
      giveAura,
      likeTx,
      hideTx,
      blockUser,
      unblockUser,
      reportUser,
      updatePrivacy,
      updateProfile,
      markNotifsRead,
      completeChallenge,
      badgesFor,
    }
  }, [state])

  return <Store.Provider value={api}>{children}</Store.Provider>
}

export function useStore() {
  return useContext(Store)
}
