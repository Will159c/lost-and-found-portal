import { Link, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, token, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isLoggedIn = !!token && !!user

  return (
    <nav style={{
      background: '#2c3e50',
      padding: '16px 24px',
      color: '#fff',
      width: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      margin: 0,
    }}>
      <Link
        to="/"
        style={{
          color: 'white',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '15px',
          fontFamily: "'Helvetica Neue', sans-serif",
        }}
      >
        Home
      </Link>

      {isLoggedIn ? (
        <>
          <Link
            to="/messages"
            style={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '15px',
              fontFamily: "'Helvetica Neue', sans-serif",
            }}
          >
            Messages
          </Link>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '2px solid white',
              color: 'white',
              cursor: 'pointer',
              padding: '6px 14px',
              borderRadius: '4px',
              fontWeight: '600',
              fontSize: '14px',
              fontFamily: "'Helvetica Neue', sans-serif",
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            style={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '15px',
              fontFamily: "'Helvetica Neue', sans-serif",
            }}
          >
            Login
          </Link>
          <Link
            to="/signup"
            style={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '15px',
              fontFamily: "'Helvetica Neue', sans-serif",
            }}
          >
            Signup
          </Link>
        </>
      )}
    </nav>
  )
}

