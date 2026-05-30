import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Submit from './pages/Submit'
import { MainLayout } from './layouts/MainLayout'

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/submit" element={<Submit />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
