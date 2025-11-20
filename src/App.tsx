import { Routes, Route, Navigate } from "react-router-dom"
import { Login } from "./pages/Login"
import { HomeAluno } from "./pages/HomeAluno"
import { DashboardAdmin } from "./pages/DashboardAdmin"
import { Eventos } from "./pages/Eventos"
import { Usuarios } from "./pages/Usuarios"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/HomeAluno" element={<HomeAluno />} />
      <Route path="/admin" element={<DashboardAdmin />} />
      <Route path="/Eventos" element={<Eventos />} />
      <Route path="/Users" element={<Usuarios />} />
    </Routes>
  )
}
