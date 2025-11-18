import { Routes, Route, Navigate } from "react-router-dom"
import { Login } from "./pages/Login.tsx"
import { DashboardAdmin } from "./pages/DashboardAdmin.tsx"
import { Usuarios } from "./pages/Usuarios.tsx"
import { HomeAluno } from "./pages/HomeAluno.tsx"
import { Eventos } from "./pages/Eventos.tsx"
import { useAuth } from "./pages/AuthContext"

function RotaProtegida({ children, tiposPermitidos }: { children: React.ReactNode; tiposPermitidos: string[] }) {
  const { user, perfil, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!user || !perfil) {
    return <Navigate to="/" replace />
  }

  if (!tiposPermitidos.includes(perfil.tipo || "")) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/DashboardAdmin"
        element={
          <RotaProtegida tiposPermitidos={["superuser", "admin"]}>
            <DashboardAdmin />
          </RotaProtegida>
        }
      />
      <Route
        path="/HomeAluno"
        element={
          <RotaProtegida tiposPermitidos={["aluno"]}>
            <HomeAluno />
          </RotaProtegida>
        }
      />
      <Route
        path="/Usuarios"
        element={
          <RotaProtegida tiposPermitidos={["superuser", "admin"]}>
            <Usuarios />
          </RotaProtegida>
        }
      />
      <Route
        path="/Eventos"
        element={
          <RotaProtegida tiposPermitidos={["superuser", "admin"]}>
            <Eventos />
          </RotaProtegida>
        }
      />
    </Routes>
  )
}