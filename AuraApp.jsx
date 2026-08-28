import { useState } from 'react'
import { StoreProvider, useStore } from './store'
import { Nav } from './ui'
import GiveAura from './GiveAura'
import { Home, Leaderboard, Notifications, Onboarding, ProfileView, Settings, ShareSheet } from './screens'
import { Login } from './Login'
import { FriendsDiscover } from './Friends'

function LoginGate() {
  const [create, setCreate] = useState(false)
  if (create) return <Onboarding />
  return <Login onCreate={() => setCreate(true)} />
}

function Shell() {
  const { me, state } = useStore()
  const [tab, setTab] = useState('home')
  const [giveOpen, setGiveOpen] = useState(false)
  const [givePrefill, setGivePrefill] = useState(null)
  const [viewUser, setViewUser] = useState(null)
  const [overlay, setOverlay] = useState(null)
  const [shareUser, setShareUser] = useState(null)

  if (!state.onboarded || !me()) return <LoginGate />

  const unread = state.notifs.filter((n) => n.userId === me().id && !n.read).length

  return (
    <>
      {overlay === 'notifs' && <Notifications onBack={() => setOverlay(null)} />}
      {overlay === 'settings' && <Settings onBack={() => setOverlay(null)} />}
      {!overlay && viewUser && (
        <ProfileView userId={viewUser} onBack={() => setViewUser(null)} openGive={(u) => { setGivePrefill(u); setGiveOpen(true) }} openShare={(u) => setShareUser(u)} />
      )}
      {!overlay && !viewUser && tab === 'home' && (
        <Home setTab={setTab} openProfile={setViewUser} onNotifs={() => setOverlay('notifs')} unread={unread} />
      )}
      {!overlay && !viewUser && tab === 'discover' && <FriendsDiscover openProfile={setViewUser} />}
      {!overlay && !viewUser && tab === 'board' && <Leaderboard openProfile={setViewUser} />}
      {!overlay && !viewUser && tab === 'profile' && (
        <ProfileView userId={me().id} openGive={() => setGiveOpen(true)} openShare={setShareUser} onSettings={() => setOverlay('settings')} />
      )}
      {!overlay && <Nav tab={tab} setTab={(t) => { setViewUser(null); setTab(t) }} onGive={() => { setGivePrefill(null); setGiveOpen(true) }} />}
      <GiveAura open={giveOpen} onClose={() => { setGiveOpen(false); setGivePrefill(null) }} prefill={givePrefill} />
      {shareUser && <ShareSheet user={shareUser} onClose={() => setShareUser(null)} />}
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <div className="app-shell">
        <div className="orb a" />
        <div className="orb b" />
        <div className="orb c" />
        <Shell />
      </div>
    </StoreProvider>
  )
}
