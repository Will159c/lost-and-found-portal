import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from "../../api/axios.js";

export default function Signup() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const { firstName, email, phoneNumber, password, confirmPassword } = form

    if (!firstName.trim() || !email.trim() || !phoneNumber.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('All fields are required.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Invalid email.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setSubmitting(true)
      await api.post('/auth/register', {
        email,
        password,
        firstName,
        phoneNumber,
      })

      navigate('/login', { replace: true })
    } catch (e2) {
      const s = e2?.response?.status
      setError(
        s === 409
          ? 'Email already registered. Please log in.'
          : e2?.response?.data?.message || 'Signup failed.'
      )
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
            fontWeight: 600,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#7f8c8d',
            marginBottom: '8px',
            fontFamily: "'Helvetica Neue', sans-serif",
          }}>
            CSUN CAMPUS SERVICES
          </div>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 700,
            color: '#2c3e50',
            margin: '8px 0 0 0',
          }}>
            Create Account
          </h2>
        </header>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'clamp(16px, 2.5vw, 20px)' }}>
          <div style={{ display: 'grid', gap: '6px' }}>
            <label style={{
              fontSize: 'clamp(13px, 2vw, 14px)',
              fontWeight: 600,
              color: '#2c3e50',
              marginBottom: '6px',
              fontFamily: "'Helvetica Neue', sans-serif",
            }}>
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              placeholder="full name"
              value={form.firstName}
              onChange={onChange}
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
              fontWeight: 600,
              color: '#2c3e50',
              marginBottom: '6px',
              fontFamily: "'Helvetica Neue', sans-serif",
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="your.email@csun.edu"
              value={form.email}
              onChange={onChange}
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
              fontWeight: 600,
              color: '#2c3e50',
              marginBottom: '6px',
              fontFamily: "'Helvetica Neue', sans-serif",
            }}>
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="6613859843"
              value={form.phoneNumber}
              onChange={onChange}
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
              fontWeight: 600,
              color: '#2c3e50',
              marginBottom: '6px',
              fontFamily: "'Helvetica Neue', sans-serif",
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={form.password}
              onChange={onChange}
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
              fontWeight: 600,
              color: '#2c3e50',
              marginBottom: '6px',
              fontFamily: "'Helvetica Neue', sans-serif",
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={onChange}
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

          {error && (
            <div style={{
              background: '#fee',
              color: '#c33',
              padding: '12px',
              borderRadius: '4px',
              fontSize: 'clamp(13px, 2vw, 14px)',
              textAlign: 'center',
              border: '1px solid #fcc',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: 'clamp(12px, 2vw, 14px)',
              borderRadius: '4px',
              border: 'none',
              background: submitting ? '#7f8c8d' : '#2c3e50',
              color: '#fff',
              fontWeight: 600,
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
            {submitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

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
            Already have an account?
            <Link
              to="/login"
              style={{
                color: '#34495e',
                textDecoration: 'none',
                fontWeight: 600,
                marginLeft: '6px',
              }}
              onMouseOver={(e) => (e.target.style.textDecoration = 'underline')}
              onMouseOut={(e) => (e.target.style.textDecoration = 'none')}
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}