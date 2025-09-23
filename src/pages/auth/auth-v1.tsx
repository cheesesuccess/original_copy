import { createSignal, Show } from 'solid-js'
import * as s from './auth.css'
import { auth-v1 } from '~/firebase/firebase'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth-v1'
import { useNavigate } from 'solid-app-router'

const AuthPage-v1 = () => {
  const navigate = useNavigate()
  const [mode, setMode] = createSignal<'login'|'signup'>('login')
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const [message, setMessage] = createSignal<string | null>(null)

  onAuthStateChanged(auth, (u) => {
    if (u) navigate('/library/albums', { replace: true })
  })

  const onSubmit = async (e: Event) => {
    e.preventDefault()
    setLoading(true); setMessage(null)
    try {
      if (mode() === 'login') {
        await signInWithEmailAndPassword(auth, email(), password())
      } else {
        await createUserWithEmailAndPassword(auth, email(), password())
      }
      // navigate happens in onAuthStateChanged
    } catch (err: any) {
      setMessage(err?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const onForgot = async () => {
    if (!email()) { setMessage('Enter your email first'); return }
    try {
      await sendPasswordResetEmail(auth, email())
      setMessage('Password reset email sent.')
    } catch (err: any) {
      setMessage(err?.message ?? 'Failed to send reset email')
    }
  }

  return (
    <div class={s.page}>
      <form class={s.card} onSubmit={onSubmit}>
        <div class={s.brandRow}>
          <div style={{'font-size': '28px'}}>🍎</div>
          <div class={s.brand}>Music</div>
        </div>
        <div class={s.subtitle}>An all‑access experience</div>

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
          <div style={{'margin-top':'8px','font-size':'12px','color':'#444'}}>{message()}</div>
        </Show>

        <div class={s.switchRow}>
          <Show when={mode()==='login'} fallback={<span>Already have an account? <button type='button' class={s.ghostLink} onClick={() => setMode('login')}>Sign In</button></span>}>
            <span>Don't have an account? <button type='button' class={s.ghostLink} onClick={() => setMode('signup')}>Sign Up</button></span>
          </Show>
        </div>
      </form>
    </div>
  )
}
export default AuthPage-v1
