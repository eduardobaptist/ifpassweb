// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "../config/supabase"

type Perfil = {
  id: string
  nome: string | null
  tipo: string | null
  matricula?: string | null
  cpf?: string | null
}

type AuthContextType = {
  user: User | null
  session: Session | null
  perfil: Perfil | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  perfil: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)

  async function carregarPerfil(userId: string) {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", userId)
      .single()

    if (!error && data) {
      setPerfil(data)
    } else {
      setPerfil(null)
    }
  }

  useEffect(() => {
    async function loadInitial() {
      setLoading(true)

      const { data, error } = await supabase.auth.getSession()

      if (!error && data.session) {
        setSession(data.session)
        setUser(data.session.user)
        await carregarPerfil(data.session.user.id)
      }

      setLoading(false)
    }

    loadInitial()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)

      if (newSession?.user) {
        await carregarPerfil(newSession.user.id)
      } else {
        setPerfil(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setPerfil(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        perfil,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
