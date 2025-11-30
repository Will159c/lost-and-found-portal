import { useContext, useState } from 'react'
import api from '../api/axios.js'
import { AuthContext } from '../context/AuthContext.jsx'

export default function EmailVerifyBanner() {
  const { user } = useContext(AuthContext)
  const [msg, setMsg] = useState('')

  if (!user || user.emailVerified) return null

  const resend = async () => {
    setMsg('')
    try {
      await api.post('/api/auth/resend-verification')
      setMsg('Verification email sent.')
    } catch (e) {
      setMsg(e?.response?.data?.message || 'Failed to send email.')
    }
  }

  return (
    <div style={{
      background: '#fff3cd',
      borderBottom: '2px solid #ffc107',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      fontFamily: "'Helvetica Neue', sans-serif",
      fontSize: '14px',
      color: '#856404',
    }}>
      <span style={{ fontWeight: '600' }}>
        ⚠️ Please verify your email to enable messaging.
      </span>
      <button
        onClick={resend}
        style={{
          background: '#2c3e50',
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '13px',
          fontFamily: "'Helvetica Neue', sans-serif",
        }}
        onMouseOver={(e) => (e.target.style.background = '#1a252f')}
        onMouseOut={(e) => (e.target.style.background = '#2c3e50')}
      >
        Resend Link
      </button>
      {msg && (
        <span style={{ 
          fontWeight: '600', 
          color: msg.includes('sent') ? '#155724' : '#721c24' 
        }}>
          {msg}
        </span>
      )}
    </div>
  )
}
