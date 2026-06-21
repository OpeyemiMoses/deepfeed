import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Terminal from './pages/Terminal'

export default function App() {
  const [page, setPage] = useState('landing')

  if (page === 'terminal') {
    return <Terminal onHome={() => setPage('landing')} />
  }

  return (
    <>
      <Navbar onLaunchApp={() => setPage('terminal')} onHome={() => setPage('landing')} />
      <Landing onLaunchApp={() => setPage('terminal')} />
    </>
  )
}
