import { Eye, EyeOff, ArrowUpRight, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { setAccessToken, saveUser } from '../auth'
import { api } from '../services/api'

type AuthPageProps = { mode: 'signin' | 'signup' | 'forgot'; navigate: (path: string) => void }

export default function AuthPages({ mode, navigate }: AuthPageProps) {
  const destination = sessionStorage.getItem('genra-auth-destination') || '/dashboard'
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fullName, setFullName] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [googleOpen, setGoogleOpen] = useState(false)
  const [accountType, setAccountType] = useState<'Creator' | 'Brand'>('Creator')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      setResetToken(token)
    }
  }, [])

  const complete = (name: string, address: string, token: string, provider: 'demo' | 'google' = 'demo', type: 'Creator' | 'Brand' = accountType) => {
    saveUser({ name, email: address, provider, accountType: type })
    setAccessToken(token)
    sessionStorage.removeItem('genra-auth-destination')
    navigate(destination)
  }

  const submitSignIn = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!email.trim()) return setError('Please enter your email or username.')
    if (!password) return setError('Please enter your password.')

    setBusy(true)
    try {
      const res = await api.auth.login({ email: email.trim(), password })
      const user = res.user
      const roleType = user.role === 'brand' ? 'Brand' : 'Creator'
      complete(user.name, user.email, res.accessToken, 'demo', roleType)
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setBusy(false)
    }
  }

  const submitSignUp = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!fullName.trim() || !username.trim() || !email.trim() || !password || !confirm) {
      return setError('Please complete every required field.')
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Please enter a valid email address.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords must match.')

    setBusy(true)
    try {
      const res = await api.auth.register({
        name: fullName.trim(),
        email: email.trim(),
        password,
        role: accountType.toLowerCase()
      })
      const user = res.user
      complete(user.name, user.email, res.accessToken, 'demo', accountType)
    } catch (err: any) {
      setError(err.message || 'Failed to create account.')
    } finally {
      setBusy(false)
    }
  }

  const submitForgot = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Please enter a valid email address.')

    setBusy(true)
    try {
      const res = await api.auth.forgotPassword(email.trim())
      setSuccess(true)
      setSuccessMessage(res.message || 'If an account exists, a reset link has been dispatched.')
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link.')
    } finally {
      setBusy(false)
    }
  }

  const submitReset = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!password || !confirm) return setError('Please enter and confirm your new password.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords must match.')

    setBusy(true)
    try {
      const res = await api.auth.resetPassword({ token: resetToken, newPassword: password })
      setSuccess(true)
      setSuccessMessage(res.message)
    } catch (err: any) {
      setError(err.message || 'Password reset failed.')
    } finally {
      setBusy(false)
    }
  }

  const google = () => setGoogleOpen(true)
  const continueGoogle = async () => {
    setGoogleOpen(false)
    setBusy(true)
    try {
      // Simulate Google OAuth token payload for local prototype
      const payloadMock = btoa(JSON.stringify({
        sub: 'google-' + Date.now(),
        email: accountType === 'Brand' ? 'brand@gmail.com' : 'creator@gmail.com',
        name: accountType === 'Brand' ? 'Demo Brand' : 'Demo Google Creator'
      }))
      const idToken = `header.${payloadMock}.signature`
      const res = await api.auth.google({ idToken, role: accountType.toLowerCase() })
      const user = res.user
      complete(user.name, user.email, res.accessToken, 'google', accountType)
    } catch (err: any) {
      setError(err.message || 'Google sign in failed.')
    } finally {
      setBusy(false)
    }
  }

  const googleStep = googleOpen ? (
    <div className="google-step">
      <span className="google-step-mark">G</span>
      <strong>Choose an account</strong>
      <span>{accountType === 'Brand' ? 'Demo Brand' : 'Demo Creator'}</span>
      <small>{accountType === 'Brand' ? 'brand@gmail.com' : 'creator@gmail.com'}</small>
      <button className="auth-submit" type="button" onClick={continueGoogle} disabled={busy}>
        {busy ? 'Connecting...' : <>Continue <ArrowUpRight size={14} /></>}
      </button>
      <button className="auth-link-button" type="button" onClick={() => setGoogleOpen(false)}>
        Cancel
      </button>
    </div>
  ) : null

  if (mode === 'forgot') {
    return (
      <AuthLayout>
        <span className="auth-kicker">GENRA / ACCOUNT RECOVERY</span>
        <h1>{resetToken ? 'Reset your password' : 'Forgot your password?'}</h1>
        {success ? (
          <div className="auth-success">
            <Check size={18} />
            <p>{successMessage || 'If this account exists, check the server console in development for the active reset URL.'}</p>
            <button className="auth-link-button" onClick={() => navigate('/signin')}>
              Back to Sign In <ArrowUpRight size={14} />
            </button>
          </div>
        ) : resetToken ? (
          <form onSubmit={submitReset}>
            <p>Enter your new password below to regain access.</p>
            <label>
              New Password
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Show or hide password"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </label>
            <label>
              Confirm New Password
              <input
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder="Re-enter password"
              />
            </label>
            {error && <span className="auth-error">{error}</span>}
            <button className="auth-submit" type="submit" disabled={busy}>
              {busy ? 'Updating...' : <>Update Password <ArrowUpRight size={15} /></>}
            </button>
            <button className="auth-link-button" type="button" onClick={() => navigate('/signin')}>
              Back to Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={submitForgot}>
            <p>Enter your email and we'll help you reset your password.</p>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
              />
            </label>
            {error && <span className="auth-error">{error}</span>}
            <button className="auth-submit" type="submit" disabled={busy}>
              {busy ? 'Sending link...' : <>Send Reset Link <ArrowUpRight size={15} /></>}
            </button>
            <button className="auth-link-button" type="button" onClick={() => navigate('/signin')}>
              Back to Sign In
            </button>
          </form>
        )}
      </AuthLayout>
    )
  }

  if (mode === 'signup') {
    return (
      <AuthLayout>
        <span className="auth-kicker">GENRA / CREATE ACCOUNT</span>
        <h1>Create Account</h1>
        <p>Build your place in the AI-native creative network.</p>
        <form onSubmit={submitSignUp}>
          <label>
            Full Name
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Alex Mercer" />
          </label>
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="@alexmercer" />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="alex@studio.ai" />
          </label>
          <div className="auth-account-type">
            <span>Account type</span>
            <div>
              <button
                type="button"
                className={accountType === 'Creator' ? 'selected' : ''}
                onClick={() => setAccountType('Creator')}
              >
                Creator
              </button>
              <button
                type="button"
                className={accountType === 'Brand' ? 'selected' : ''}
                onClick={() => setAccountType('Brand')}
              >
                Brand
              </button>
            </div>
          </div>
          <label>
            Password
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
            />
            <button
              className="password-toggle"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Show or hide password"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </label>
          <label>
            Confirm Password
            <input
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="Confirm password"
            />
          </label>
          {error && <span className="auth-error">{error}</span>}
          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? 'Creating account...' : <>Create Account <ArrowUpRight size={15} /></>}
          </button>
          {googleOpen ? googleStep : (
            <button className="auth-google" type="button" onClick={google} disabled={busy}>
              Continue with Google
            </button>
          )}
        </form>
        <p className="auth-foot">
          Already have an account?{' '}
          <button className="auth-inline-link" onClick={() => navigate('/signin')}>
            Sign In
          </button>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <span className="auth-kicker">GENRA / SECURE ACCESS</span>
      <h1>Welcome back</h1>
      <p>Sign in to continue to Genra.</p>
      <form onSubmit={submitSignIn}>
        <label>
          Email or Username
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="demo@genra.ai"
          />
        </label>
        <label>
          Password
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Genra123"
          />
          <button
            className="password-toggle"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Show or hide password"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </label>
        {error && <span className="auth-error">{error}</span>}
        <button className="auth-submit" type="submit" disabled={busy}>
          {busy ? 'Signing in...' : <>Sign In <ArrowUpRight size={15} /></>}
        </button>
        {googleOpen ? googleStep : (
          <button className="auth-google" type="button" onClick={google} disabled={busy}>
            Continue with Google
          </button>
        )}
      </form>
      <button className="auth-link-button" onClick={() => navigate('/forgot-password')}>
        Forgot password?
      </button>
      <p className="auth-foot">
        Don't have an account?{' '}
        <button className="auth-inline-link" onClick={() => navigate('/create-account')}>
          Create Account
        </button>
      </p>
    </AuthLayout>
  )
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <button
          className="auth-logo"
          onClick={() => {
            window.history.pushState({}, '', '/')
            window.dispatchEvent(new PopStateEvent('popstate'))
          }}
        >
          GENRA
        </button>
        {children}
      </div>
    </div>
  )
}
