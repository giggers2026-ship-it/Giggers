import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'

/* ── Mock data ── */
const MOCK_GIGS = [
  { id: 1, t: 'Buffet Servers Needed', c: 'Catering', w: 450, s: 'RECRUITING', a: 'demo@giggers.com', l: 'Bandra West', d: 'Starts in 2h' },
  { id: 2, t: 'Dadar Flyer Drop', c: 'Pamphlets', w: 300, s: 'ON SHIFT', a: 'employer@giggers.com', l: 'Dadar Station', d: 'Active Now' },
  { id: 3, t: 'Grocery Runner', c: 'Delivery', w: 250, s: 'RECRUITING', a: 'demo@giggers.com', l: 'Andheri East', d: 'Flexible' },
  { id: 4, t: 'Field Sales Exec', c: 'Sales', w: 800, s: 'RECRUITING', a: 'demo@giggers.com', l: 'Thane', d: 'Flexible' },
]

function loadState() {
  return {
    user: JSON.parse(localStorage.getItem('giggers_user')) || { email: 'guest@giggers.com', role: 'worker' },
    gigs: JSON.parse(localStorage.getItem('giggers_data_gigs')) || [...MOCK_GIGS],
    earnings: parseInt(localStorage.getItem('giggers_data_earnings')) || 7450,
    completedCount: parseInt(localStorage.getItem('giggers_data_completed')) || 18,
    bio: localStorage.getItem('giggers_data_bio') || 'Ready to work any gig!',
  }
}

function saveData(state) {
  localStorage.setItem('giggers_data_gigs', JSON.stringify(state.gigs))
  localStorage.setItem('giggers_data_earnings', state.earnings)
  localStorage.setItem('giggers_data_completed', state.completedCount)
  localStorage.setItem('giggers_data_bio', state.bio)
}

/* ── Toast ── */
function useToast() {
  const [toast, setToast] = useState({ msg: '', show: false })
  const showToast = useCallback((msg) => {
    setToast({ msg, show: true })
    setTimeout(() => setToast({ msg: '', show: false }), 3000)
  }, [])
  return { toast, showToast }
}

/* ─── Stat Card ─── */
function StatCard({ icon, val, label }) {
  return (
    <div className="stat-card">
      {icon && <div className="icon-box">{icon}</div>}
      <h4 style={{ color: 'var(--app-text)', marginBottom: 0 }}>{val}</h4>
      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--app-text-dim)' }}>{label}</p>
    </div>
  )
}

/* ─── Overview: Employer ─── */
function OverviewEmployer({ onSwitchView }) {
  return (
    <>
      <div className="search-container">
        <div className="search-inner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="Find workers near you..." />
        </div>
      </div>

      <div className="section-header"><h3 style={{ color: 'var(--app-text)', marginBottom: 0 }}>Agency Dashboard</h3></div>
      <div className="stats-grid-row">
        <StatCard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><circle cx="19" cy="11" r="2"/></svg>} val="1,450" label="Active Workers" />
        <StatCard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>} val="88" label="New Orders" />
        <StatCard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} val="₹28,400" label="Revenue Today" />
        <StatCard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>} val="12" label="Pending Payments" />
      </div>

      <div className="section-header">
        <h3 style={{ color: 'var(--app-text)', marginBottom: 0 }}>Recent Job Orders</h3>
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchView('jobs') }}>See All</a>
      </div>
      <div className="order-list">
        <div className="order-item">
          <div className="icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className="details">
            <h4 style={{ color: 'var(--app-text)', marginBottom: 2 }}>Catering Helpers</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--app-text-dim)', fontWeight: 650 }}>Andheri, 4 Boys • 12 Oct</p>
          </div>
          <div className="action">Order &gt;</div>
        </div>
      </div>

      <div className="section-header" style={{ marginTop: 25 }}>
        <h3 style={{ color: 'var(--app-text)', marginBottom: 0 }}>Active Workers Nearby</h3>
      </div>
      <div className="nearby-scroll">
        {[{ seed: 'Felix', name: 'Amit S.', role: 'Loaders / Movers', rating: '4.8' },
          { seed: 'Aneka', name: 'Rajesh K.', role: 'Catering Staff', rating: '4.7' }].map((w) => (
          <div className="worker-card-mini" key={w.name}>
            <div className="avatar">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${w.seed}`} width="100%" alt={w.name} />
            </div>
            <h4 style={{ color: 'var(--app-text)', marginBottom: 2 }}>{w.name}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--app-text-dim)', fontWeight: 700, marginBottom: 8 }}>{w.role}</p>
            <div className="rating">⭐ {w.rating}</div>
          </div>
        ))}
      </div>
    </>
  )
}

/* ─── Worker Job Mini Card ─── */
function WorkerJobCard({ gig, onApply, showToast }) {
  const [grabbed, setGrabbed] = useState(false)
  return (
    <div className="worker-card-mini" style={{ width: 200, textAlign: 'left' }}>
      <h4 style={{ fontSize: '1rem', color: 'var(--app-text)', marginBottom: 4 }}>{gig.t}</h4>
      <p style={{ fontSize: '0.75rem', color: 'var(--app-text-dim)', marginBottom: 8 }}>📍 {gig.l}</p>
      <div style={{ fontWeight: 900, color: 'var(--app-text)', marginBottom: 12 }}>₹{gig.w}/day</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="app-btn app-btn-primary" style={{ padding: '8px 12px', fontSize: '0.75rem', flex: 1, borderRadius: 100, opacity: grabbed ? 0.6 : 1 }} onClick={() => { setGrabbed(true); onApply(gig.id); showToast('Gig Mission Started!') }} disabled={grabbed}>
          {grabbed ? 'Grabbed!' : 'Accept'}
        </button>
        <button className="app-btn" style={{ padding: '8px 12px', fontSize: '0.75rem', background: '#f1f3f4', flex: 1, borderRadius: 100 }} onClick={() => showToast('Rejected')}>Reject</button>
      </div>
    </div>
  )
}

/* ─── Overview: Worker ─── */
function OverviewWorker({ gigs, user, onApply, showToast }) {
  const uName = user.email.split('@')[0]
  const displayName = uName.charAt(0).toUpperCase() + uName.slice(1)
  const recruiting = gigs.filter((g) => g.s === 'RECRUITING')
  return (
    <>
      <div className="section-header" style={{ marginBottom: 5 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--app-text)', marginBottom: 0 }}>Welcome, {displayName}!</h2>
      </div>
      <p style={{ color: 'var(--app-text-dim)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 25 }}>Worker ID: DW{Math.floor(Math.random() * 900) + 100}</p>
      <div className="stats-grid-row">
        <div className="stat-card" style={{ alignItems: 'center', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--app-text-dim)' }}>Today's Earnings</p>
          <h4 style={{ color: 'var(--app-text)', marginBottom: 0 }}>₹372</h4>
        </div>
        <div className="stat-card" style={{ alignItems: 'center', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--app-text-dim)' }}>Jobs Completed</p>
          <h4 style={{ color: 'var(--app-text)', marginBottom: 0 }}>18</h4>
        </div>
      </div>
      <div className="section-header"><h3 style={{ color: 'var(--app-text)', marginBottom: 0 }}>Nearby Jobs Available</h3></div>
      <div className="nearby-scroll">
        {recruiting.map((g) => <WorkerJobCard key={g.id} gig={g} onApply={onApply} showToast={showToast} />)}
      </div>
      <div className="section-header" style={{ marginTop: 25 }}><h3 style={{ color: 'var(--app-text)', marginBottom: 0 }}>Work Categories</h3></div>
      <div className="categories-grid">
        {[{ emoji: '👨‍🍳', label: 'Catering Staff' }, { emoji: '📢', label: 'Pamphlet Distr.' }, { emoji: '🤝', label: 'Field Sales' }, { emoji: '🧹', label: 'Cleaning Staff' }, { emoji: '📦', label: 'Loaders / Movers' }, { emoji: '🛵', label: 'Delivery Partner' }].map((cat) => (
          <div className="category-tile" key={cat.label}>
            <span className="tile-icon">{cat.emoji}</span>
            <span className="tile-label">{cat.label}</span>
          </div>
        ))}
      </div>
    </>
  )
}

/* ─── Jobs View ─── */
function JobsView({ gigs, user, onApply, onManage, showToast }) {
  const [search, setSearch] = useState('')
  const isEmp = user.role === 'employer'
  const [done, setDone] = useState({})
  const list = isEmp ? gigs.filter((g) => g.a === user.email) : gigs.filter((g) => g.s === 'RECRUITING')
  const matches = list.filter((g) => g.t.toLowerCase().includes(search.toLowerCase()) || g.c.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <div className="search-container">
        <div className="search-inner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder={isEmp ? 'Search my listings...' : 'Search available jobs...'} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="section-header"><h3 style={{ color: 'var(--app-text)', marginBottom: 0 }}>{isEmp ? 'My Job Postings' : 'Available Gig Missions'}</h3></div>
      <div className="order-list">
        {matches.length ? matches.map((g) => (
          <div key={g.id} className="order-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 15 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                <div className="icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="24" height="24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--app-text)', marginBottom: 2 }}>{g.t}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--app-text-dim)', fontWeight: 650 }}>{g.c} • 📍 {g.l}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 900, color: 'var(--app-primary)', fontSize: '1.2rem' }}>₹{g.w}</div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--app-text-dim)' }}>{g.s}</span>
              </div>
            </div>
            <div style={{ width: '100%', display: 'flex', gap: 10 }}>
              {!isEmp ? (
                <button className="app-btn app-btn-primary" style={{ flex: 1, padding: 10, borderRadius: 12, opacity: done[g.id] ? 0.7 : 1 }} disabled={done[g.id]} onClick={() => { setDone(d => ({ ...d, [g.id]: true })); onApply(g.id); showToast('Gig Mission Started!') }}>
                  {done[g.id] ? 'Accepted!' : 'Accept Job Mission'}
                </button>
              ) : (
                <button className="app-btn" style={{ flex: 1, background: '#f1f3f4', padding: 10, borderRadius: 12 }} onClick={() => onManage(g.id)}>Manage Recruitment</button>
              )}
            </div>
          </div>
        )) : (
          <p style={{ textAlign: 'center', padding: 50, fontWeight: 700, opacity: 0.5, color: 'var(--app-text-dim)' }}>No jobs found matching your search.</p>
        )}
      </div>
    </>
  )
}

/* ─── Wallet View ─── */
function WalletView({ earnings, showToast }) {
  return (
    <>
      <div className="section-header"><h3 style={{ color: 'var(--app-text)', marginBottom: 0 }}>My Wallet</h3></div>
      <div className="stat-card" style={{ marginBottom: 25, padding: 30, textAlign: 'center', background: 'linear-gradient(135deg, #1a73e8, #1557b0)', color: 'white' }}>
        <p style={{ color: '#c5d8fa', fontWeight: 700, fontSize: '0.9rem' }}>Total Balance</p>
        <h2 style={{ fontSize: '2.5rem', margin: '10px 0', color: 'white', fontWeight: 900 }}>₹{earnings}</h2>
        <p style={{ color: '#c5d8fa', fontSize: '0.85rem' }}>Last synced just now</p>
        <div style={{ display: 'flex', gap: 15, marginTop: 20 }}>
          <button className="app-btn" style={{ flex: 1, background: 'white', color: '#1a73e8', borderRadius: 100 }} onClick={() => showToast('Withdrawal initiated to bank account.')}>Withdraw to Bank</button>
        </div>
      </div>
      <div className="section-header"><h3 style={{ color: 'var(--app-text)', marginBottom: 0 }}>Recent Transactions</h3></div>
      <div className="order-list">
        {[
          { label: 'Catering Gig Completion', date: '21 Apr, 4:00 PM', amount: '+₹450', color: '#4caf50', bg: '#e8f5e9', arrow: 'right' },
          { label: 'Withdrawal to HDFC Bank', date: '19 Apr, 10:00 AM', amount: '-₹2000', color: '#e91e63', bg: '#fce4ec', arrow: 'left' },
          { label: 'Pamphlet Drop Gig', date: '18 Apr, 6:00 PM', amount: '+₹300', color: '#4caf50', bg: '#e8f5e9', arrow: 'right' },
        ].map((tx) => (
          <div className="order-item" key={tx.label}>
            <div className="icon" style={{ background: tx.bg, color: tx.color }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14"/>
                {tx.arrow === 'right' ? <path d="m12 5 7 7-7 7"/> : <path d="m12 19 7-7-7-7"/>}
              </svg>
            </div>
            <div className="details">
              <h4 style={{ color: 'var(--app-text)', marginBottom: 2 }}>{tx.label}</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--app-text-dim)' }}>{tx.date}</p>
            </div>
            <div className="action" style={{ color: tx.color }}>{tx.amount}</div>
          </div>
        ))}
      </div>
    </>
  )
}

/* ─── Messages View ─── */
function MessagesView({ showToast }) {
  return (
    <>
      <div className="section-header"><h3 style={{ color: 'var(--app-text)', marginBottom: 0 }}>Messages</h3></div>
      <div className="order-list">
        {[
          { initial: 'M', name: 'Manish (Employer)', msg: 'Are you reaching the venue?', badge: true },
          { initial: 'R', name: 'Rahul (Coordinator)', msg: 'Shift has been completed. Thanks!', badge: false },
        ].map((c) => (
          <div key={c.name} className="order-item" style={{ cursor: 'pointer' }} onClick={() => showToast('Chat opening...')}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--app-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 900, color: 'var(--app-primary)', flexShrink: 0 }}>{c.initial}</div>
            <div className="details">
              <h4 style={{ color: 'var(--app-text)', marginBottom: 2 }}>{c.name}</h4>
              <p style={{ fontSize: '0.8rem', color: c.badge ? 'var(--app-text)' : 'var(--app-text-dim)', fontWeight: c.badge ? 700 : 600 }}>{c.msg}</p>
            </div>
            <div className="action">
              {c.badge ? <span style={{ background: 'red', color: 'white', borderRadius: 10, fontSize: '0.7rem', padding: '2px 6px' }}>New</span> : <span style={{ color: 'var(--app-text-dim)', fontWeight: 600 }}>Yesterday</span>}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

/* ─── Profile View ─── */
function ProfileView({ user, bio, onUpdateBio, onLogout }) {
  return (
    <>
      <div className="section-header"><h3 style={{ color: 'var(--app-text)', marginBottom: 0 }}>My Profile</h3></div>
      <div className="stat-card" style={{ marginBottom: 25, padding: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 25, marginBottom: 25 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--app-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, color: 'var(--app-primary)' }}>
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 style={{ fontSize: '1.4rem', color: 'var(--app-text)', marginBottom: 4 }}>{user.email.split('@')[0].toUpperCase()}</h4>
            <p style={{ color: 'var(--app-text-dim)', fontWeight: 700, fontSize: '0.9rem' }}>{user.role.toUpperCase()}</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label className="app-label">Member Bio</label>
            <p style={{ padding: 15, background: '#f8f9fa', borderRadius: 12, fontWeight: 600, color: 'var(--app-text)', fontSize: '0.9rem' }}>{bio}</p>
          </div>
          <div>
            <label className="app-label">Registered Email</label>
            <input className="app-input" type="text" value={user.email} readOnly onChange={() => {}} />
          </div>
          <button className="app-btn app-btn-primary" style={{ borderRadius: 100 }} onClick={onUpdateBio}>Update Profile Details</button>
        </div>
      </div>
      <button className="app-btn" style={{ width: '100%', background: 'white', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: 100 }} onClick={onLogout}>Sign Out of Account</button>
    </>
  )
}

/* ─── Post Gig Modal ─── */
function PostGigModal({ onClose, onPublish }) {
  const [title, setTitle] = useState('')
  const [count, setCount] = useState('1 Worker')
  const [type, setType] = useState('Catering')
  const [wage, setWage] = useState(650)

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <h3 style={{ color: 'var(--app-text)' }}>Post a New Job</h3>
        <div className="modal-form">
          <div>
            <label className="app-label">Job Title</label>
            <input className="app-input" type="text" placeholder="e.g. Catering Staff for Event" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="modal-grid">
            <div>
              <label className="app-label">No. of Workers</label>
              <select className="app-select" value={count} onChange={(e) => setCount(e.target.value)}>
                <option>1 Worker</option><option>2 Workers</option><option>3 Workers</option><option>5+ Workers</option>
              </select>
            </div>
            <div>
              <label className="app-label">Work Type</label>
              <select className="app-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option>Catering</option><option>Maintenance</option><option>Logistics</option><option>Security</option>
              </select>
            </div>
          </div>
          <div>
            <label className="app-label">Wage per Worker (₹)</label>
            <input className="app-input" type="number" value={wage} onChange={(e) => setWage(e.target.value)} />
          </div>
          <button className="app-btn app-btn-primary" style={{ width: '100%', padding: 18, marginTop: 10, borderRadius: 100 }} onClick={() => { if (!title) return; onPublish({ title, count, type, wage: parseInt(wage) }); onClose() }}>
            Confirm &amp; Post Job
          </button>
          <p onClick={onClose} style={{ textAlign: 'center', cursor: 'pointer', color: 'var(--app-text-dim)', fontWeight: 700, fontSize: '0.9rem', marginTop: 10 }}>Cancel</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Bottom Nav Items ─── */
const NAV_ITEMS = [
  { id: 'overview', label: 'Home', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { id: 'jobs', label: 'Jobs', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
  { id: 'wallet', label: 'Wallet', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
  { id: 'messages', label: 'Messages', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { id: 'profile', label: 'Profile', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
]

/* ─────────────────── Main Dashboard ─────────────────── */
export default function Dashboard() {
  const navigate = useNavigate()
  const [appState, setAppState] = useState(loadState)
  const [view, setView] = useState('overview')
  const [showModal, setShowModal] = useState(false)
  const { toast, showToast } = useToast()
  const scrollRef = useRef(null)

  const isEmp = appState.user.role === 'employer'

  // Header entrance (once)
  useEffect(() => {
    gsap.fromTo('.page-header', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' })
  }, [])

  // View change animation — delay so DOM is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        const children = scrollRef.current.querySelectorAll('section > *')
        if (children.length) {
          gsap.fromTo(children, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out' })
        }
      }
    }, 30)
    return () => clearTimeout(timer)
  }, [view])

  const switchView = (v) => { setView(v); window.scrollTo(0, 0) }

  const applyGig = (id) => {
    setAppState((prev) => {
      const gigs = prev.gigs.map((g) => g.id === id ? { ...g, s: 'ON SHIFT' } : g)
      const next = { ...prev, gigs }
      saveData(next)
      return next
    })
  }

  const manageGig = (id) => {
    const gig = appState.gigs.find((g) => g.id === id)
    showToast(`Recruiting for: ${gig.t}... (3 Applicants found)`)
  }

  const publishGig = ({ title, count, type, wage }) => {
    setAppState((prev) => {
      const newGig = { id: Date.now(), t: title, c: type, w: wage, s: 'RECRUITING', a: prev.user.email, l: 'Current Location', d: 'Just Now' }
      const gigs = [newGig, ...prev.gigs]
      const next = { ...prev, gigs }
      saveData(next)
      return next
    })
    showToast('Gig Published Successfully!')
  }

  const updateBio = () => {
    const n = prompt('Enter your new bio:', appState.bio)
    if (n) {
      setAppState((prev) => { const next = { ...prev, bio: n }; saveData(next); return next })
      showToast('Bio Updated!')
    }
  }

  const logout = () => { localStorage.removeItem('giggers_user'); navigate('/') }

  return (
    <div className="app-body">

      {/* Header */}
      <header className="page-header">
        <div className="logo-area">
          <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 800, marginBottom: 2 }}>Giggers<span style={{ color: 'rgba(255,255,255,0.5)' }}>.</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 600 }}>📍 Mumbai, IN</p>
        </div>
        <div className="user-meta">
          <div className="user-avatar-top">{appState.user.email.charAt(0).toUpperCase()}</div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="main-scroll" ref={scrollRef}>
        <section>
          {view === 'overview' && isEmp && <OverviewEmployer onSwitchView={switchView} />}
          {view === 'overview' && !isEmp && <OverviewWorker gigs={appState.gigs} user={appState.user} onApply={applyGig} showToast={showToast} />}
          {view === 'jobs' && <JobsView gigs={appState.gigs} user={appState.user} onApply={applyGig} onManage={manageGig} showToast={showToast} />}
          {view === 'wallet' && <WalletView earnings={appState.earnings} showToast={showToast} />}
          {view === 'messages' && <MessagesView showToast={showToast} />}
          {view === 'profile' && <ProfileView user={appState.user} bio={appState.bio} onUpdateBio={updateBio} onLogout={logout} />}
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <button key={item.id} className={`nav-link${view === item.id ? ' active' : ''}`} onClick={() => switchView(item.id)}>
            {item.icon}
            <span style={{ position: 'relative' }}>
              {item.label}
              {item.id === 'messages' && (
                <span style={{ position: 'absolute', top: -5, right: -10, background: 'red', color: 'white', fontSize: 10, padding: '2px 4px', borderRadius: 10, lineHeight: 1 }}>2</span>
              )}
            </span>
          </button>
        ))}
      </nav>

      {/* FAB — Employers only */}
      {isEmp && (
        <button className="fab-modern" onClick={() => setShowModal(true)} title="Post a Gig">+</button>
      )}

      {/* Post Gig Modal */}
      {showModal && <PostGigModal onClose={() => setShowModal(false)} onPublish={publishGig} />}

      {/* Toast */}
      <div className={`toast${toast.show ? ' show' : ''}`}>{toast.msg}</div>
    </div>
  )
}
