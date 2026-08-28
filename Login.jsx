import { useState } from 'react'
import { useStore } from './store'
import { Logo } from './ui'

const GOOGLE_ACCOUNTS = [
  { name: 'Ahmed Rahman', email: 'ahmed.rahman@gmail.com', picture: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Ahmed&backgroundColor=1e1b4b' },
  { name: 'Sarah Chen', email: 'sarah.chen@gmail.com', picture: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Sarah&backgroundColor=312e81' },
  { name: 'You', email: 'you.aura@gmail.com', picture: 'https://api.dicebear.com/9.x/adventurer/svg?seed=You&backgroundColor=4c1d95' },
]

export function Login({ onCreate }) {
  const { loginDemo, loginWithGoogle } = useStore()
  const [pick, setPick] = useState(false)
  return (
    <div className="screen no-nav">
      <div className="onboard">
        <Logo size={72} />
        <p className="sub" style={{ letterSpacing: '.16em', marginTop: 16 }}>AURA</p>
        <h1>Give good energy. Get recognized.</h1>
        <p className="sub">Sign in with Google, then add people like Snapchat — search, request, accept.</p>
        {!pick ? (
          <>
            <button className="google-btn" onClick={() => setPick(true)}>
              <span className="g-mark">G</span> Continue with Google
            </button>
            <button className="primary" style={{ marginTop: 10 }} onClick={onCreate}>Create account</button>
            <button style={{ marginTop: 14 }} className="linkish" onClick={loginDemo}>Skip · enter demo as Ahmed</button>
          </>
        ) : (
          <div className="glass" style={{ padding: 12, marginTop: 18 }}>
            <p className="sub" style={{ marginBottom: 8 }}>Choose a Google account</p>
            {GOOGLE_ACCOUNTS.map((g) => (
              <button key={g.email} className="user-row" onClick={() => loginWithGoogle(g)}>
                <img className="av" src={g.picture} alt="" />
                <div className="meta"><strong>{g.name}</strong><span>{g.email}</span></div>
              </button>
            ))}
            <p className="sub" style={{ marginTop: 8, fontSize: 11 }}>Demo Google on this device. Live Google OAuth needs a Cloud Client ID.</p>
            <button className="linkish" style={{ marginTop: 8 }} onClick={() => setPick(false)}>Back</button>
          </div>
        )}
      </div>
    </div>
  )
}
