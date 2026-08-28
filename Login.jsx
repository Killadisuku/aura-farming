import { useState } from 'react'
import { useStore } from './store'
import { Logo } from './ui'
import { getGoogleClientId, saveGoogleClientId, startGoogleSignIn } from './googleAuth'

export function Login({ onCreate }) {
  const { loginDemo, loginWithGoogle } = useStore()
  const [clientId, setClientId] = useState(getGoogleClientId())
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  function applyId() {
    saveGoogleClientId(clientId)
    setErr(clientId.trim() ? 'Client ID saved. Tap Continue with Google.' : 'Paste a Client ID from Google Cloud.')
  }

  async function realGoogle() {
    setErr('')
    if (!getGoogleClientId() && clientId.trim()) saveGoogleClientId(clientId)
    if (!getGoogleClientId()) {
      setErr('Create an OAuth Client ID in Google Cloud, then paste it below.')
      return
    }
    setBusy(true)
    await startGoogleSignIn({
      onSuccess: (profile) => {
        setBusy(false)
        loginWithGoogle(profile)
      },
      onError: (msg) => {
        setBusy(false)
        setErr(msg)
      },
    })
  }

  return (
    <div className="screen no-nav">
      <div className="onboard">
        <Logo size={72} />
        <p className="sub" style={{ letterSpacing: '.16em', marginTop: 16 }}>AURA</p>
        <h1>Give good energy. Get recognized.</h1>
        <p className="sub">Sign in with your real Google account.</p>
        <button className="google-btn" onClick={realGoogle} disabled={busy}>
          <span className="g-mark">G</span> {busy ? 'Opening Google…' : 'Continue with Google'}
        </button>
        <div id="google-btn-host" style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }} />
        {err && <p className="warn">{err}</p>}
        <div className="glass" style={{ padding: 12, marginTop: 16 }}>
          <p className="sub" style={{ fontSize: 12, marginBottom: 8 }}>
            Google Cloud → APIs & Services → Credentials → Create OAuth client → Web.
            Authorized JavaScript origins:
          </p>
          <p className="sub" style={{ fontSize: 11 }}>https://aura-farming-yasar9.vercel.app</p>
          <p className="sub" style={{ fontSize: 11 }}>http://localhost:5173</p>
          <input className="search" style={{ marginTop: 10 }} placeholder="Paste Web Client ID (.apps.googleusercontent.com)" value={clientId} onChange={(e) => setClientId(e.target.value)} />
          <button className="ghost" style={{ marginTop: 8, height: 40 }} onClick={applyId}>Save Client ID</button>
        </div>
        <button className="primary" style={{ marginTop: 12 }} onClick={onCreate}>Create account</button>
        <button style={{ marginTop: 14 }} className="linkish" onClick={loginDemo}>Skip · demo as Ahmed</button>
      </div>
    </div>
  )
}
