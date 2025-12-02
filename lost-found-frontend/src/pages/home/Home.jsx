import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext.jsx'
import api from '../../api/axios.js'

export default function Home() {
  const [q, setQ] = useState('')
  const [items, setItems] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const nav = useNavigate()
  const { token } = useContext(AuthContext)
  const isLoggedIn = !!token

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
      padding: 'clamp(20px, 4vw, 40px)',
      paddingTop: '100px',
      fontFamily: "'Georgia', 'Times New Roman', serif",
    },
    container: {
      width: '100%',
      maxWidth: '1100px',
      margin: '0 auto',
    },
    header: {
      textAlign: 'center',
      marginBottom: 'clamp(32px, 5vw, 48px)',
      paddingBottom: 'clamp(16px, 3vw, 24px)',
      borderBottom: '3px solid #2c3e50',
    },
    universityName: {
      fontSize: 'clamp(11px, 1.5vw, 14px)',
      fontWeight: 600,
      letterSpacing: '2px',
      textTransform: 'uppercase',
      color: '#7f8c8d',
      marginBottom: '8px',
      fontFamily: "'Helvetica Neue', sans-serif",
    },
    mainTitle: {
      fontSize: 'clamp(28px, 5vw, 52px)',
      fontWeight: 700,
      color: '#2c3e50',
      margin: '12px 0',
      lineHeight: '1.2',
    },
    subtitle: {
      fontSize: 'clamp(14px, 2vw, 18px)',
      color: '#546e7a',
      fontStyle: 'italic',
      marginTop: '12px',
      padding: '0 16px',
    },
    hero: {
      background: 'white',
      borderRadius: '8px',
      padding: 'clamp(24px, 5vw, 48px) clamp(20px, 4vw, 40px)',
      marginBottom: 'clamp(24px, 4vw, 40px)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #e0e0e0',
    },
    sectionTitle: {
      fontSize: 'clamp(20px, 3vw, 24px)',
      fontWeight: 600,
      color: '#2c3e50',
      marginBottom: 'clamp(16px, 2.5vw, 20px)',
      textAlign: 'center',
      letterSpacing: '0.5px',
    },
    searchContainer: {
      maxWidth: '600px',
      margin: '0 auto 24px',
      width: '100%',
    },
    searchRow: {
      display: 'flex',
      gap: '12px',
      marginBottom: '16px',
      flexWrap: 'wrap',
    },
    input: {
      flex: 1,
      minWidth: '200px',
      padding: 'clamp(12px, 2vw, 14px) clamp(14px, 2.5vw, 18px)',
      borderRadius: '4px',
      border: '2px solid #bdc3c7',
      background: '#ffffff',
      color: '#2c3e50',
      fontSize: 'clamp(14px, 2vw, 16px)',
      fontFamily: "'Helvetica Neue', sans-serif",
      transition: 'border-color 0.3s',
      outline: 'none',
    },
    searchBtn: {
      padding: 'clamp(12px, 2vw, 14px) clamp(24px, 4vw, 32px)',
      borderRadius: '4px',
      border: 'none',
      background: '#2c3e50',
      color: '#fff',
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: 'clamp(14px, 2vw, 16px)',
      fontFamily: "'Helvetica Neue', sans-serif",
      transition: 'background 0.3s',
      whiteSpace: 'nowrap',
    },
    buttonGroup: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginTop: '16px',
    },
    btnPrimary: {
      background: '#34495e',
      border: '2px solid #2c3e50',
      color: '#fff',
      textDecoration: 'none',
      padding: 'clamp(10px, 1.5vw, 12px) clamp(20px, 3vw, 28px)',
      borderRadius: '4px',
      fontWeight: 600,
      fontSize: 'clamp(13px, 2vw, 15px)',
      fontFamily: "'Helvetica Neue', sans-serif",
      transition: 'all 0.3s',
      display: 'inline-block',
      cursor: 'pointer',
      textAlign: 'center',
    },
    btnSecondary: {
      background: 'transparent',
      border: '2px solid #34495e',
      color: '#34495e',
      textDecoration: 'none',
      padding: 'clamp(10px, 1.5vw, 12px) clamp(20px, 3vw, 28px)',
      borderRadius: '4px',
      fontWeight: 600,
      fontSize: 'clamp(13px, 2vw, 15px)',
      fontFamily: "'Helvetica Neue', sans-serif",
      transition: 'all 0.3s',
      display: 'inline-block',
      cursor: 'pointer',
      textAlign: 'center',
    },
    infoBox: {
      background: '#fff3cd',
      border: '1px solid #ffc107',
      borderRadius: '6px',
      padding: 'clamp(16px, 2.5vw, 20px)',
      marginBottom: '24px',
      textAlign: 'center',
    },
    infoText: {
      fontSize: 'clamp(13px, 2vw, 15px)',
      color: '#856404',
      margin: 0,
      fontFamily: "'Helvetica Neue', sans-serif",
      lineHeight: '1.6',
    },
    resultsWrapper: {
      marginTop: '8px',
      marginBottom: '8px',
    },
    resultsHeader: {
      fontSize: '14px',
      color: '#546e7a',
      marginBottom: '8px',
    },
    resultsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '16px',
    },
    resultCard: {
      background: '#ffffff',
      borderRadius: '6px',
      padding: '14px 16px',
      border: '1px solid #e0e0e0',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    resultTitle: {
      fontSize: '15px',
      fontWeight: 600,
      color: '#2c3e50',
    },
    resultDesc: {
      fontSize: '13px',
      color: '#7f8c8d',
    },
    resultMetaRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      fontSize: '12px',
      color: '#546e7a',
      marginTop: '4px',
    },
    resultDate: {
      fontSize: '12px',
      color: '#7f8c8d',
      marginTop: '4px',
    },
    errorBox: {
      background: '#fee',
      color: '#c33',
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid #fcc',
      fontSize: '13px',
      marginBottom: '10px',
      textAlign: 'center',
    },
    featuresSection: {
      marginTop: 'clamp(32px, 5vw, 48px)',
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
      gap: 'clamp(16px, 2.5vw, 24px)',
      marginTop: 'clamp(24px, 4vw, 32px)',
    },
    featureCard: {
      background: 'white',
      borderRadius: '6px',
      padding: 'clamp(24px, 4vw, 32px) clamp(20px, 3vw, 28px)',
      border: '1px solid #e0e0e0',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    featureNumber: {
      fontSize: 'clamp(24px, 4vw, 32px)',
      fontWeight: 700,
      color: '#bdc3c7',
      marginBottom: '12px',
    },
    featureTitle: {
      fontSize: 'clamp(16px, 2.5vw, 20px)',
      fontWeight: 600,
      color: '#2c3e50',
      marginBottom: '12px',
      lineHeight: '1.3',
    },
    featureDesc: {
      fontSize: 'clamp(13px, 2vw, 15px)',
      color: '#7f8c8d',
      lineHeight: '1.6',
    },
    policySection: {
      background: '#ecf0f1',
      borderRadius: '6px',
      padding: 'clamp(24px, 4vw, 32px)',
      marginTop: 'clamp(32px, 5vw, 48px)',
      border: '1px solid #d5dbdb',
    },
    policyTitle: {
      fontSize: 'clamp(16px, 2.5vw, 20px)',
      fontWeight: 600,
      color: '#2c3e50',
      marginBottom: '16px',
    },
    policyText: {
      fontSize: 'clamp(13px, 2vw, 15px)',
      color: '#546e7a',
      lineHeight: '1.7',
      margin: 0,
    },
  }

  const features = [
    {
      number: '01',
      title: 'Browse Lost & Found Items',
      desc: 'Search through posted items by school staff. Find detailed descriptions and location information for lost belongings.',
    },
    {
      number: '02',
      title: 'Contact Finder Directly',
      desc: 'Message users securely through our platform. Verify ownership and arrange safe meetups in public campus spaces.',
    },
    {
      number: '03',
      title: 'Staff-Verified Posts Only',
      desc: 'All posts are submitted by authorized school staff, ensuring legitimacy and preventing fake or malicious listings.',
    },
  ]

  const handleSearch = async () => {
    const query = q.trim()
    if (!query) {
      setError('Please enter a description to search.')
      setHasSearched(false)
      setResults([])
      return
    }

    setError('')
    setLoading(true)
    setHasSearched(true)

    try {
      // only fetch once; reuse if already fetched
      let allItems = items
      if (items.length === 0) {
        const res = await api.get('/api/items')
        allItems = res.data || []
        setItems(allItems)
      }

      const lower = query.toLowerCase()
      const matched = allItems.filter((item) => {
        const haystack =
          (item.itemName || '') +
          ' ' +
          (item.description || '') +
          ' ' +
          (item.category || '') +
          ' ' +
          (item.location || '')
        return haystack.toLowerCase().includes(lower)
      })

      setResults(matched)
    } catch (err) {
      setError(err?.response?.data?.message || 'Error searching items.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.universityName}>CSUN Campus Services</div>
          <h1 style={styles.mainTitle}>University Lost & Found</h1>
          <p style={styles.subtitle}>
            A centralized, staff-managed platform for the campus community
          </p>
        </header>

        <section style={styles.hero}>
          <h2 style={styles.sectionTitle}>Search Lost & Found Items</h2>

          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              ℹ️ <strong>Note:</strong> Only authorized school staff can post items. Students can
              browse and message about found items.
            </p>
          </div>

          <div style={styles.searchContainer}>
            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.searchRow}>
              <input
                placeholder="Describe what was lost (e.g., silver MacBook with stickers)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                style={styles.input}
              />
              <button
                style={styles.searchBtn}
                onClick={handleSearch}
                onMouseOver={(e) => (e.target.style.background = '#1a252f')}
                onMouseOut={(e) => (e.target.style.background = '#2c3e50')}
              >
                Search
              </button>
            </div>

            {/* Results appear here */}
            <div style={styles.resultsWrapper}>
              {loading && <div style={styles.resultsHeader}>Searching…</div>}

              {!loading && hasSearched && results.length === 0 && !error && (
                <div style={styles.resultsHeader}>No matching items found.</div>
              )}

              {!loading && results.length > 0 && (
                <>
                  <div style={styles.resultsHeader}>
                    Showing {results.length} matching item{results.length !== 1 ? 's' : ''}.
                  </div>
                  <div style={styles.resultsGrid}>
                    {results.map((item) => (
                      <div key={item._id} style={styles.resultCard}>
                        <div style={styles.resultTitle}>{item.itemName}</div>
                        {item.description && (
                          <div style={styles.resultDesc}>{item.description}</div>
                        )}
                        <div style={styles.resultMetaRow}>
                          {item.category && (
                            <span>
                              <strong>Category:</strong> {item.category}
                            </span>
                          )}
                          {item.location && (
                            <span>
                              <strong>Location:</strong> {item.location}
                            </span>
                          )}
                          {item.status && (
                            <span>
                              <strong>Status:</strong> {item.status}
                            </span>
                          )}
                        </div>
                        {item.date && (
                          <div style={styles.resultDate}>
                            Posted:{' '}
                            {new Date(item.date).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Below results: auth actions / messages button */}
            <div style={styles.buttonGroup}>
              {!isLoggedIn ? (
                <>
                  <Link
                    to="/signup"
                    style={styles.btnPrimary}
                    onMouseOver={(e) => (e.target.style.transform = 'translateY(-2px)')}
                    onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
                  >
                    Create Account
                  </Link>
                  <Link
                    to="/login"
                    style={styles.btnSecondary}
                    onMouseOver={(e) => {
                      e.target.style.background = '#34495e'
                      e.target.style.color = '#fff'
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'transparent'
                      e.target.style.color = '#34495e'
                    }}
                  >
                    Log In
                  </Link>
                </>
              ) : (
                <button
                  style={styles.btnPrimary}
                  onClick={() => nav('/messages')}
                  onMouseOver={(e) => (e.target.style.transform = 'translateY(-2px)')}
                  onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
                >
                  Go to Messages
                </button>
              )}
            </div>
          </div>
        </section>

        <section style={styles.featuresSection}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <div style={styles.featuresGrid}>
            {features.map((f) => (
              <div
                key={f.number}
                style={styles.featureCard}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
                }}
              >
                <div style={styles.featureNumber}>{f.number}</div>
                <h4 style={styles.featureTitle}>{f.title}</h4>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <aside style={styles.policySection}>
          <h3 style={styles.policyTitle}>Community Guidelines & Policy</h3>
          <p style={styles.policyText}>
            This platform is managed by CSUN Campus Services. Only authorized school staff members
            can post lost and found items to ensure authenticity and prevent fraudulent listings.
            All users must use university-appropriate language, meet in public campus spaces for
            item exchanges, and follow Student Conduct guidelines. For questions, contact Campus
            Life or University Police.
          </p>
        </aside>
      </div>
    </div>
  )
}