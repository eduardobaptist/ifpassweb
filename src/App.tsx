import { Routes, Route} from "react-router-dom"
import { Login } from "./pages/Login.tsx"
import { DashboardAdmin } from "./pages/DashboardAdmin.tsx"
import { Usuarios } from "./pages/Usuarios.tsx"
import { HomeAluno } from "./pages/HomeAluno.tsx"
import { Eventos } from "./pages/Eventos.tsx"

export function App() {

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/DashboardAdmin" element={<DashboardAdmin />} />
      <Route path="/HomeAluno" element={<HomeAluno />} />
      <Route path="/Usuarios" element={<Usuarios />} />
      <Route path="/Eventos" element={<Eventos />} />
    </Routes>
  )
}
