import { createSignal, Show, onMount } from 'solid-js'
import { useNavigate } from 'solid-app-router'
import * as s from './auth.css'
import { auth } from '~/firebase/firebase'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth'

const AuthPage = () => {
  const navigate = useNavigate()
  const [mode, setMode] = createSignal<'login' | 'signup' | 'forgot'>('login')
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const [message, setMessage] = createSignal<string | null>(null)

  // Redirect if already logged in
  onMount(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) navigate('/library/tracks', { replace: true })
    })
  })

  // Handle form submission
  const onSubmit = async (e: Event) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (mode() === 'login') {
        await signInWithEmailAndPassword(auth, email(), password())
      } else if (mode() === 'signup') {
        await createUserWithEmailAndPassword(auth, email(), password())
      } else if (mode() === 'forgot') {
        if (!email()) return setMessage('Enter your email first')
        await sendPasswordResetEmail(auth, email())
        setMessage('Password reset email sent!')
        return
      }
    } catch (err: any) {
      setMessage(err?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  // UI
  return (
    <div class={s.page}>
      <form class={s.card} onSubmit={onSubmit}>
        {/* Brand Section */}
        <div class={s.brandRow}>
          <div style={{ 'font-size': '28px' }}>🎵</div>
          <div class={s.brand}>Music Access</div>
        </div>
        <div class={s.subtitle}>
          {mode() === 'login' && 'Sign in to continue'}
          {mode() === 'signup' && 'Create a new account'}
          {mode() === 'forgot' && 'Reset your password'}
        </div>

        {/* Email Input */}
        <input
          class={s.input}
          type="email"
          placeholder="Email"
          value={email()}
          onInput={(e) => setEmail(e.currentTarget.value)}
          required
        />

        {/* Password only for Login/Signup */}
        <Show when={mode() !== 'forgot'}>
          <input
            class={s.input}
            type="password"
            placeholder="Password"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            required
          />
        </Show>

        {/* Action Button */}
        <button class={s.button} type="submit" disabled={loading()}>
          {loading() ? 'Please wait...' : 
            mode() === 'login' ? 'Login' : 
            mode() === 'signup' ? 'Sign Up' : 
            'Send Reset Link'}
        </button>

        {/* Message Section */}
        <Show when={message()}>
          <div class={s.messageBox}>{message()}</div>
        </Show>

        {/* Links Section */}
        <div class={s.switchRow}>
          {mode() === 'login' && (
            <>
              <button type="button" class={s.ghostLink} onClick={() => setMode('signup')}>Sign Up</button>
              <button type="button" class={s.ghostLink} onClick={() => setMode('forgot')}>Forgot Password?</button>
            </>
          )}

          {mode() === 'signup' && (
            <button type="button" class={s.ghostLink} onClick={() => setMode('login')}>Back to Login</button>
          )}

          {mode() === 'forgot' && (
            <button type="button" class={s.ghostLink} onClick={() => setMode('login')}>Back to Login</button>
          )}
        </div>
      </form>
    </div>
  )
}

export default AuthPage
