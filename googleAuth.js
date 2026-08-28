const STORAGE_KEY = 'aura_google_client_id'

export function getGoogleClientId() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return saved.trim()
  } catch {}
  return (import.meta.env?.VITE_GOOGLE_CLIENT_ID || '').trim()
}

export function saveGoogleClientId(id) {
  localStorage.setItem(STORAGE_KEY, (id || '').trim())
}

function decodeJwt(credential) {
  const part = credential.split('.')[1]
  const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'))
  return JSON.parse(json)
}

function loadGis() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve(window.google)
    const existing = document.querySelector('script[data-gis]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google))
      existing.addEventListener('error', reject)
      return
    }
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.dataset.gis = '1'
    s.onload = () => resolve(window.google)
    s.onerror = () => reject(new Error('Could not load Google Identity'))
    document.head.appendChild(s)
  })
}

export async function startGoogleSignIn({ onSuccess, onError }) {
  const clientId = getGoogleClientId()
  if (!clientId) {
    onError?.('Add a Google Client ID first.')
    return
  }
  try {
    const google = await loadGis()
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (res) => {
        try {
          const p = decodeJwt(res.credential)
          onSuccess({
            name: p.name || p.given_name || 'Aura user',
            email: p.email,
            picture: p.picture,
            googleId: p.sub,
          })
        } catch (e) {
          onError?.(e.message || 'Could not read Google profile.')
        }
      },
      auto_select: false,
      ux_mode: 'popup',
    })
    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const host = document.getElementById('google-btn-host')
        if (host) {
          host.innerHTML = ''
          google.accounts.id.renderButton(host, {
            theme: 'filled_black',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'pill',
          })
        }
      }
    })
  } catch (e) {
    onError?.(e.message || 'Google sign-in failed.')
  }
}
