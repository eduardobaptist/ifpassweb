import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "../config/supabase"
import logo from "../assets/logo.png"
import { useAuth } from "./AuthContext"

type StatsAluno = {
  eventosAtivos: number
  meusEventos: number
}

export function HomeAluno() {
  const [stats, setStats] = useState<StatsAluno>({
    eventosAtivos: 0,
    meusEventos: 0,
  })
  const [erro, setErro] = useState("")

  const navigate = useNavigate()
  const { user, perfil, signOut } = useAuth()

  // carrega estatísticas do aluno
  useEffect(() => {
    async function carregarDadosAluno() {
      if (!user) return

      setErro("")

      const userId = user.id

      const [{ data: eventos, error: eventosError }, { data: inscricoes, error: inscError }] =
        await Promise.all([
          supabase.from("eventos").select("id, ativo, inscricao"),
          supabase.from("inscricao").select("id").eq("usuario_id", userId),
        ])

      if (eventosError || inscError) {
        console.error(eventosError || inscError)
        setErro("Erro ao carregar dados.")
      }

      const eventosAtivos =
        eventos?.filter(e => e.ativo === true && e.inscricao === true).length ?? 0

      const meusEventos = inscricoes?.length ?? 0

      setStats({
        eventosAtivos,
        meusEventos,
      })
    }

    carregarDadosAluno()
  }, [user])

  async function sair() {
    await signOut()
    navigate("/", { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Lateral */}
      <aside className="w-64 bg-emerald-700 text-emerald-50 flex flex-col">
        <div className="px-6 h-30 bg-white py-5 border-b border-white-600 flex items-center justify-center">
          <img src={logo} className="size-50" />
        </div>

        <nav className="flex-1 px-3 py-4 text-sm space-y-1">
          <button className="w-full text-left px-3 py-2 rounded-md bg-emerald-800">
            Início
          </button>

          <button
            className="w-full text-left px-3 py-2 rounded-md hover:bg-emerald-800/70"
            onClick={() => navigate("/MeusEventos")}
          >
            Meus eventos
          </button>

          <button
            className="w-full text-left px-3 py-2 rounded-md hover:bg-emerald-800/70"
            onClick={() => navigate("/Eventos")}
          >
            Eventos
          </button>

          <button
            className="w-full text-left px-3 py-2 rounded-md hover:bg-emerald-800/70"
            onClick={() => navigate("/Certificados")}
          >
            Certificados
          </button>

          <button
            className="w-full text-left px-3 py-2 rounded-md hover:bg-emerald-800/70"
            onClick={() => navigate("/Perfil")}
          >
            Meu perfil
          </button>
        </nav>

        <div className="px-6 py-4 border-t border-emerald-600 text-xs">
          <p className="font-medium">Logado como:</p>
          <p>{user?.email}</p>
          <p className="font-medium mt-2">Perfil:</p>
          <p>{perfil?.tipo ?? "Aluno"}</p>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 px-8 py-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Olá, {perfil?.nome || "Aluno"}
            </h2>
            <p className="text-sm text-slate-600">
              Bem-vindo ao Ifpass – Sistema de Eventos do IFFar.
            </p>
          </div>

          <Button variant="outline" onClick={sair}>
            Sair
          </Button>
        </div>

        {erro && (
          <p className="text-sm text-red-600">{erro}</p>
        )}

        {/* Cards de resumo */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Eventos com inscrição aberta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {stats.eventosAtivos}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Eventos disponíveis para você se inscrever.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Meus eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {stats.meusEventos}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Inscrições realizadas com seu usuário.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Certificados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                —
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Área de certificados emitidos (em desenvolvimento).
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Atalhos principais */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Acessos rápidos
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                className="rounded-full"
                onClick={() => navigate("/Eventos")}
              >
                Ver todos os eventos
              </Button>

              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => navigate("/MeusEventos")}
              >
                Meus eventos
              </Button>

              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => navigate("/Certificados")}
              >
                Meus certificados
              </Button>

              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => navigate("/Perfil")}
              >
                Editar perfil
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}