import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "../config/supabase"
import logo from "../assets/logo.png"

type Evento = {
  id: number
  titulo: string
  data: string | null
  total_vagas: number | null
  vagas_disponiveis: number | null
  inscricao: boolean | null
  ativo: boolean | null
}

export function Eventos() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userName, setUserName] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    async function carregarUsuario() {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        navigate("/login", { replace: true })
        return
      }

      setUserEmail(data.user.email ?? "")

      const { data: perfil } = await supabase
        .from("usuarios")
        .select("nome")
        .eq("id", data.user.id)
        .single()

      if (perfil?.nome) setUserName(perfil.nome)
    }

    async function carregarEventos() {
      setErro("")
      setLoading(true)

      const { data, error } = await supabase
        .from("eventos")
        .select("id, titulo, data, total_vagas, vagas_disponiveis, inscricao, ativo")
        .order("data", { ascending: true })

      if (error) {
        console.error(error)
        setErro("Erro ao carregar eventos.")
        setLoading(false)
        return
      }

      setEventos(data || [])
      setLoading(false)
    }

    carregarUsuario()
    carregarEventos()
  }, [navigate])

  function formatarData(d: string | null) {
    if (!d) return "-"
    const dt = new Date(d)
    if (Number.isNaN(dt.getTime())) return "-"
    return dt.toLocaleDateString("pt-BR")
  }

  function statusEvento(e: Evento) {
    if (e.ativo === false) return { label: "Evento encerrado", color: "bg-slate-200 text-slate-700" }
    if (e.inscricao === false) return { label: "Inscrições encerradas", color: "bg-amber-100 text-amber-800" }
    if ((e.vagas_disponiveis ?? 0) <= 0) return { label: "Vagas esgotadas", color: "bg-red-100 text-red-700" }
    return { label: "Vagas abertas", color: "bg-emerald-100 text-emerald-800" }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-emerald-700 text-emerald-50 flex flex-col">
        <div className="px-6 bg-white py-5 border-b border-white-600">
          <img src={logo} className="size-50 px-4 w-full flex-1 h-full" />
        </div>

        <nav className="flex-1 px-3 py-4 text-sm space-y-1">
          <button
            className="w-full text-left px-3 py-2 rounded-md hover:bg-emerald-800/70"
            onClick={() => navigate("/HomeAluno")}
          >
            Início
          </button>

          <button
            className="w-full text-left px-3 py-2 rounded-md hover:bg-emerald-800/70"
            onClick={() => navigate("/MeusEventos")}
          >
            Meus eventos
          </button>

          <button className="w-full text-left px-3 py-2 rounded-md bg-emerald-800">
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
          <p>{userEmail}</p>
          <p className="font-medium mt-2">Perfil:</p>
          <p>Aluno</p>
        </div>
      </aside>
      
      <main className="flex-1 px-8 py-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Eventos
            </h2>
            <p className="text-sm text-slate-600">
              Confira os eventos disponíveis no Ifpass.
            </p>
          </div>

          <Button variant="outline" onClick={() => navigate("/HomeAluno")}>
            Voltar para início
          </Button>
        </div>

        {erro && (
          <p className="text-sm text-red-600">{erro}</p>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Lista de eventos
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p>Carregando...</p>
            ) : eventos.length === 0 ? (
              <p className="text-sm text-slate-600">
                Nenhum evento cadastrado no momento.
              </p>
            ) : (
              <div className="space-y-4">
                {eventos.map(e => {
                  const status = statusEvento(e)
                  return (
                    <div
                      key={e.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl border border-emerald-100 bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-emerald-700">
                          {e.titulo}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Data:{" "}
                          <span className="font-medium text-slate-700">
                            {formatarData(e.data)}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500">
                          Vagas:{" "}
                          <span className="font-medium text-slate-700">
                            {e.vagas_disponiveis ?? 0} / {e.total_vagas ?? 0}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/Evento/${e.id}`)}
                          >
                            Detalhes
                          </Button>

                          {status.label === "Vagas abertas" && (
                            <Button
                              size="sm"
                              onClick={() => navigate(`/Evento/${e.id}`)}
                            >
                              Inscrever-se
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
