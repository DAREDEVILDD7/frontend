import { useState, useEffect, useCallback } from 'react'
import Dashboard from './components/Dashboard.jsx'
import EmployeeDetail from './components/EmployeeDetail.jsx'
import LiveAnalysis from './components/LiveAnalysis.jsx'
import Header from './components/Header.jsx'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [view, setView] = useState('dashboard')   // 'dashboard' | 'employee' | 'live'
  const [selectedId, setSelectedId] = useState(null)
  const [dashData, setDashData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch(`${API}/api/dashboard`)
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      setDashData(data)
      setLastRefresh(new Date())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 30000)
    return () => clearInterval(interval)
  }, [fetchDashboard])

  const openEmployee = (id) => {
    setSelectedId(id)
    setView('employee')
  }

  return (
    <div className="min-h-screen relative z-10">
      <Header
        view={view}
        setView={setView}
        lastRefresh={lastRefresh}
        onRefresh={fetchDashboard}
      />

      <main className="pb-8">
        {view === 'dashboard' && (
          <Dashboard
            data={dashData}
            loading={loading}
            error={error}
            onSelectEmployee={openEmployee}
            onRefresh={fetchDashboard}
            api={API}
          />
        )}
        {view === 'employee' && selectedId && (
          <EmployeeDetail
            employeeId={selectedId}
            api={API}
            onBack={() => setView('dashboard')}
          />
        )}
        {view === 'live' && (
          <LiveAnalysis api={API} onSelectEmployee={openEmployee} />
        )}
      </main>
    </div>
  )
}
