import { Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { Layout } from './components/common/Layout'
import { Home } from './pages/Home'
import { CVBuilder } from './pages/CVBuilder'
import { Dashboard } from './pages/Dashboard'
import { Templates } from './pages/Templates'
import { About } from './pages/About'
import { NotFound } from './pages/NotFound'

function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/builder" element={<CVBuilder />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  )
}

export default App