import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from "../../api/axios.js"; 
import { AuthContext } from "../../context/AuthContext.jsx";


export default function Login() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      return setError('Please enter both email and password.')
    }
    try {
      setSubmitting(true)
      const { data } = await api.post('/api/auth/login', { email, password })
      login(data.token, data.user)
      navigate('/messages', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      width: '100%',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>
      <div style={{
        background: 'white',
        padding: 'clamp(32px, 5vw, 48px)',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e0e0e0',
      }}>
        <header style={{
          textAlign: 'center',
          marginBottom: 'clamp(24px, 4vw, 32px)',
          paddingBottom: '20px',
          borderBottom: '2px solid #2c3e50',
        }}>
          <div style={{
            fontSize: 'clamp(11px, 1.5vw, 13px)',
            fontWeight: '600',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#7f8c8d',
            marginBottom: '8px',
            fontFamily: "'Helvetica Neue', sans-serif",
          }}>CSUN CAMPUS SERVICES</div>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: '700',
            color: '#2c3e50',
            margin: '8px 0 0 0',
          }}>Account Login</h2>
        </header>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'clamp(16px, 2.5vw, 20px)' }}>
          <div style={{ display: 'grid', gap: '6px' }}>
            <label style={{
              fontSize: 'clamp(13px, 2vw, 14px)',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '6px',
              fontFamily: "'Helvetica Neue', sans-serif",
            }}>Email Address</label>
            <input
              type="email"
              placeholder="your.email@csun.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: 'clamp(12px, 2vw, 14px)',
                borderRadius: '4px',
                border: '2px solid #bdc3c7',
                background: '#ffffff',
                color: '#2c3e50',
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontFamily: "'Helvetica Neue', sans-serif",
                outline: 'none',
                transition: 'border-color 0.3s',
                width: '100%',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2c3e50')}
              onBlur={(e) => (e.target.style.borderColor = '#bdc3c7')}
            />
          </div>

          <div style={{ display: 'grid', gap: '6px' }}>
            <label style={{
              fontSize: 'clamp(13px, 2vw, 14px)',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '6px',
              fontFamily: "'Helvetica Neue', sans-serif",
            }}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: 'clamp(12px, 2vw, 14px)',
                borderRadius: '4px',
                border: '2px solid #bdc3c7',
                background: '#ffffff',
                color: '#2c3e50',
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontFamily: "'Helvetica Neue', sans-serif",
                outline: 'none',
                transition: 'border-color 0.3s',
                width: '100%',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2c3e50')}
              onBlur={(e) => (e.target.style.borderColor = '#bdc3c7')}
            />
          </div>

          {error && <div style={{
            background: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '4px',
            fontSize: 'clamp(13px, 2vw, 14px)',
            textAlign: 'center',
            border: '1px solid #fcc',
          }}>{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: 'clamp(12px, 2vw, 14px)',
              borderRadius: '4px',
              border: 'none',
              background: submitting ? '#7f8c8d' : '#2c3e50',
              color: '#fff',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: 'clamp(14px, 2vw, 16px)',
              fontFamily: "'Helvetica Neue', sans-serif",
              transition: 'background 0.3s',
              marginTop: '8px',
              width: '100%',
            }}
            onMouseOver={(e) => !submitting && (e.target.style.background = '#1a252f')}
            onMouseOut={(e) => !submitting && (e.target.style.background = '#2c3e50')}
          >
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '18px',
          gap: '8px',
        }}>
          <Link
            to="/forgot-password"
            style={{
              color: '#304ffe',
              fontWeight: 600,
              textDecoration: 'none',
              fontFamily: "'Helvetica Neue', sans-serif",
              fontSize: 'clamp(13px, 2vw, 14px)',
            }}
            onMouseOver={e => (e.target.style.textDecoration = 'underline')}
            onMouseOut={e => (e.target.style.textDecoration = 'none')}
          >
            Forgot password?
          </Link>
          <Link
            to="/forgot-username"
            style={{
              color: '#304ffe',
              fontWeight: 600,
              textDecoration: 'none',
              fontFamily: "'Helvetica Neue', sans-serif",
              fontSize: 'clamp(13px, 2vw, 14px)',
            }}
            onMouseOver={e => (e.target.style.textDecoration = 'underline')}
            onMouseOut={e => (e.target.style.textDecoration = 'none')}
          >
            Forgot username?
          </Link>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: 'clamp(20px, 3vw, 24px)',
          paddingTop: '20px',
          borderTop: '1px solid #e0e0e0',
        }}>
          <p style={{
            fontSize: 'clamp(13px, 2vw, 14px)',
            color: '#546e7a',
            margin: 0,
            fontFamily: "'Helvetica Neue', sans-serif",
          }}>
            Don't have an account?
            <Link
              to="/signup"
              style={{
                color: '#34495e',
                textDecoration: 'none',
                fontWeight: '600',
                marginLeft: '6px',
              }}
              onMouseOver={e => (e.target.style.textDecoration = 'underline')}
              onMouseOut={e => (e.target.style.textDecoration = 'none')}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
