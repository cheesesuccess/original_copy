import { createSignal, Show, onMount } from 'solid-js'
import * as s from './auth.css'
import { auth } from '~/firebase/firebase'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { useNavigate } from 'solid-app-router'

const AuthPage = () => {
  const navigate = useNavigate()
  const [mode, setMode] = createSignal<'login' | 'signup'>('login')
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const [message, setMessage] = createSignal<string | null>(null)
  const [logs, setLogs] = createSignal<string[]>([])  // <- For page logs

  // Helper to add logs to the page
  const addLog = (msg: string) => setLogs(l => [...l, `[${new Date().toLocaleTimeString()}] ${msg}`])

  onMount(() => {
    addLog("Page mounted: AuthPage rendering started.")
  })

  onAuthStateChanged(auth, (u) => {
    addLog("onAuthStateChanged fired.")
    if (u) {
      addLog("User authenticated. Redirecting to /library/albums")
      navigate('/library/albums', { replace: true })
    } else {
      addLog("No user logged in.")
    }
  })

  const onSubmit = async (e: Event) => {
    e.preventDefault()
    addLog(`Submit clicked. Mode: ${mode()}. Email: ${email()}`)
    setLoading(true)
    setMessage(null)
    try {
      if (mode() === 'login') {
        addLog("Attempting login...")
        await signInWithEmailAndPassword(auth, email(), password())
        addLog("Login successful, waiting for redirect...")
      } else {
        addLog("Attempting signup...")
        await createUserWithEmailAndPassword(auth, email(), password())
        addLog("Signup successful, waiting for redirect...")
      }
    } catch (err: any) {
      addLog(`Auth error: ${err?.message}`)
      setMessage(err?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
      addLog("Submit handler finished.")
    }
  }

  const onForgot = async () => {
    addLog("Forgot password clicked.")
    if (!email()) { 
      setMessage('Enter your email first')
      addLog("Forgot password failed: No email provided.")
      return 
    }
    try {
      await sendPasswordResetEmail(auth, email())
      setMessage('Password reset email sent.')
      addLog("Password reset email sent.")
    } catch (err: any) {
      addLog(`Password reset error: ${err?.message}`)
      setMessage(err?.message ?? 'Failed to send reset email')
    }
  }

  return (
    <div class={s.page}>
      <form class={s.card} onSubmit={onSubmit}>
        <div class={s.brandRow}>
          <div style={{ 'font-size': '28px' }}>🍎</div>
          <div class={s.brand}>Music</div>
        </div>
        <div class={s.subtitle}>An all-access experience</div>

        <input
          class={s.input}
          type='email'
          placeholder='Email'
          value={email()}
          onInput={(e) => setEmail(e.currentTarget.value)}
          required
        />
        <input
          class={s.input}
          type='password'
          placeholder='Password'
          value={password()}
          onInput={(e) => setPassword(e.currentTarget.value)}
          required
        />

        <div class={s.linkRow}>
          <span />
          <button type='button' class={s.ghostLink} onClick={onForgot}>
            Forgot password
          </button>
        </div>

        <button class={s.button} type='submit' disabled={loading()}>
          {mode() === 'login' ? 'LOGIN' : 'SIGN UP'}
        </button>

        <Show when={message()}>
          <div style={{ 'margin-top': '8px', 'font-size': '12px', 'color': '#444' }}>{message()}</div>
        </Show>

        <div class={s.switchRow}>
          <Show
            when={mode() === 'login'}
            fallback={<span>Already have an account? <button type='button' class={s.ghostLink} onClick={() => setMode('login')}>Sign In</button></span>}>
            <span>Don't have an account? <button type='button' class={s.ghostLink} onClick={() => setMode('signup')}>Sign Up</button></span>
          </Show>
        </div>
      </form>

      {/* LOG PANEL */}
      <div style={{ marginTop: '20px', padding: '10px', background: '#f4f4f4', borderRadius: '6px', maxHeight: '150px', overflowY: 'auto', fontSize: '12px', color: '#333' }}>
        <strong>Debug Logs:</strong>
        {logs().map(log => (
          <div>{log}</div>
        ))}
      </div>
    </div>
  )
}

export default AuthPage
