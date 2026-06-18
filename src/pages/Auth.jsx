import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { gsap } from 'gsap'

export default function Auth() {
  const [activeTab, setActiveTab] = useState('login')
  const [role, setRole] = useState('employer')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  const switchTab = (tab) => {
    setActiveTab(tab)
    setTimeout(() => {
      gsap.from('.auth-form', { opacity: 0, y: 10, duration: 0.4, ease: 'power2.out' })
    }, 10)
  }

  const handleAuth = (type) => {
    setLoading(true)
    setTimeout(() => {
      if (type === 'register') {
        const email = regEmail || 'demo@giggers.com'
        localStorage.setItem('giggers_user', JSON.stringify({ email, role }))
      } else {
        const email = loginEmail || 'demo@giggers.com'
        localStorage.setItem('giggers_user', JSON.stringify({ email, role: 'employer' }))
      }
      navigate('/app')
    }, 600)
  }

  return (
    <div className="auth-page">
      <div className="auth-container" ref={containerRef}>

        <div className="auth-logo">Giggers<span>.</span></div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab${activeTab === 'login' ? ' active' : ''}`} onClick={() => switchTab('login')}>Login</button>
          <button className={`tab${activeTab === 'register' ? ' active' : ''}`} onClick={() => switchTab('register')}>Join Now</button>
        </div>

        {/* Login Form */}
        {activeTab === 'login' && (
          <div className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="name@domain.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
            </div>
            <button className="auth-btn" onClick={() => handleAuth('login')} disabled={loading}>
              {loading ? 'Loading...' : 'Access Dashboard'}
            </button>
          </div>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <div className="auth-form">
            <div className="form-group">
              <label>Your Goal</label>
              <div className="role-selector">
                <div className={`role-option${role === 'employer' ? ' active' : ''}`} onClick={() => setRole('employer')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'inherit' }}>
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <h4>Hire Workers</h4>
                </div>
                <div className={`role-option${role === 'worker' ? ' active' : ''}`} onClick={() => setRole('worker')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'inherit' }}>
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z" />
                  </svg>
                  <h4>Find Work</h4>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-group">
                <div className="prefix">+91</div>
                <input type="tel" placeholder="98765 43210" style={{ flex: 1 }} value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="name@domain.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={regPass} onChange={(e) => setRegPass(e.target.value)} />
            </div>
            <button className="auth-btn" onClick={() => handleAuth('register')} disabled={loading}>
              {loading ? 'Loading...' : 'Create Account'}
            </button>
          </div>
        )}

        <div className="back-home">
          <Link to="/">← Back to Homepage</Link>
        </div>
      </div>
    </div>
  )
}
