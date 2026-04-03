import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './App.jsx'
import Login from './pages/Login.jsx'

// pantallas básicas (temporales)
const Dashboard = () => <h1>Dashboard</h1>
const Admin = () => <h1>Admin</h1>
const Director = () => <h1>Director</h1>

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/director" element={<Director />} />
    </Routes>
  </BrowserRouter>
)
