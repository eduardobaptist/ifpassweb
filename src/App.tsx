import { Routes, Route} from "react-router-dom"
import { Login } from "./pages/Login.tsx"
import { Home } from "./pages/Home.tsx"
import { Usuarios } from "./pages/Usuarios.tsx"

export function App() {

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/Usuarios" element={<Usuarios />} />
    </Routes>
  )
}
