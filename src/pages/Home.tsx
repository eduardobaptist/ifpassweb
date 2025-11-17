import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { supabase } from "../config/supabase"
import logo from "../assets/logo.png"

type Role = "superuser" | "admin" | "aluno"

type Usuario = {
  id: string
  nome: string | null
  tipo: string | null
}

type Stats = {
  totalUsuarios: number
  totalAdmins: number
  eventosAtivos: number
}

export function Home() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [matricula, setMatricula] = useState("")
  const [cpf, setCpf] = useState("")
  const [role, setRole] = useState<Role>("admin")
  const [stats, setStats] = useState<Stats>({
    totalUsuarios: 0,
    totalAdmins: 0,
    eventosAtivos: 0,
  })
  const [admins, setAdmins] = useState<Usuario[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userType, setUserType] = useState("")
  const [userName, setUserName] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    async function carregarDados() {
      setErro("")
      const [{ data: usuarios, error: usuariosError }, { data: eventos, error: eventosError }] =
        await Promise.all([
          supabase.from("usuarios").select("id, nome, tipo"),
          supabase.from("eventos").select("id, ativo"),
        ])

      if (usuariosError || eventosError) {
        console.error(usuariosError || eventosError)
        setErro("Erro ao carregar dados do painel.")
        return
      }

      const totalUsuarios = usuarios?.length ?? 0
      const adminsLista =
        usuarios?.filter(
          u => u.tipo === "admin" || u.tipo === "superuser"
        ) ?? []
      const totalAdmins = adminsLista.length

      const eventosAtivos =
        eventos?.filter(e => e.ativo === true).length ?? 0

      setStats({
        totalUsuarios,
        totalAdmins,
        eventosAtivos,
      })
      setAdmins(adminsLista)
    }

    async function carregarUsuarioLogado() {
      const { data, error } = await supabase.auth.getUser()

      if (error || !data?.user) return

      const user = data.user

      setUserEmail(user.email ?? "")

      const { data: perfil, error: perfilError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single()

      if (!perfilError && perfil) {
        setUserType(perfil.tipo ?? "")
        setUserName(perfil.nome ?? "")
      }
    }

    carregarDados()
    carregarUsuarioLogado()
  }, [])

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    setMensagem("")
    setCarregando(true)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
    })

    if (authError || !authData.user) {
      console.error(authError)
      setErro("Erro ao criar usuário de autenticação.")
      setCarregando(false)
      return
    }

    const userId = authData.user.id

    const { error: insertError } = await supabase.from("usuarios").insert([
      {
        id: userId,
        nome,
        tipo: role,
        matricula: matricula || null,
        cpf: cpf || null,
      },
    ])

    if (insertError) {
      console.error(insertError)
      setErro("Usuário criado no auth, mas houve erro ao salvar na tabela usuarios.")
      setCarregando(false)
      return
    }

    setMensagem("Usuário criado com sucesso.")
    setNome("")
    setEmail("")
    setSenha("")
    setMatricula("")
    setCpf("")

    const { data: usuariosAtualizados } = await supabase
      .from("usuarios")
      .select("id, nome, tipo")

    const adminsLista =
      usuariosAtualizados?.filter(
        u => u.tipo === "admin" || u.tipo === "superuser"
      ) ?? []

    setAdmins(adminsLista)
    setStats(prev => ({
      ...prev,
      totalUsuarios: usuariosAtualizados?.length ?? prev.totalUsuarios,
      totalAdmins: adminsLista.length,
    }))

    setCarregando(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-emerald-700 text-emerald-50 flex flex-col">
        <div className="px-6 h-30 bg-white py-5 border-b border-white-600 flex items-center justify-center">
          <img src={logo} className="size-50" />
        </div>

        <nav className="flex-1 px-3 py-4 text-sm space-y-1">
          <button className="w-full text-left px-3 py-2 rounded-md bg-emerald-800">
            Visão geral
          </button>
          <button
            className="w-full text-left px-3 py-2 rounded-md hover:bg-emerald-800/70"
            onClick={() => navigate("/Usuarios")}
          >
            Usuários
          </button>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-emerald-800/70">
            Tipos de acesso
          </button>
          <button
            type="button"
            className="w-full text-left px-3 py-2 rounded-md hover:bg-emerald-800/70"
            onClick={() => navigate("/NovoEvento")}
          >
            Novo Evento
          </button>
        </nav>

        <div className="px-6 py-4 border-t border-emerald-600 text-xs">
          <p className="font-medium">Logado como:</p>
          <p>{userType}</p>
        </div>
      </aside>

      <main className="flex-1 px-8 py-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Olá, {userName}
            </h2>
          </div>

          <Button variant="outline">Sair</Button>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Usuários cadastrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stats.totalUsuarios}</p>
              <p className="text-xs text-slate-500 mt-1">
                Inclui participantes, admins e superuser.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Admins de eventos / sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stats.totalAdmins}</p>
              <p className="text-xs text-slate-500 mt-1">
                Usuários com permissão elevada.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Eventos ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stats.eventosAtivos}</p>
              <p className="text-xs text-slate-500 mt-1">
                Eventos com inscrições abertas ou em andamento.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Cadastrar usuário com acesso a eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateUser}>
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="nome">
                    Nome completo
                  </label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Nome do usuário"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="email">
                    E-mail institucional
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="usuario@if.com"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="matricula">
                    Matrícula (opcional)
                  </label>
                  <Input
                    id="matricula"
                    value={matricula}
                    onChange={e => setMatricula(e.target.value)}
                    placeholder="Ex.: 20231234"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="cpf">
                    CPF (opcional)
                  </label>
                  <Input
                    id="cpf"
                    value={cpf}
                    onChange={e => setCpf(e.target.value)}
                    placeholder="Somente números"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="role">
                    Tipo de acesso
                  </label>
                  <select
                    id="role"
                    className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    value={role}
                    onChange={e => setRole(e.target.value as Role)}
                  >
                    <option value="admin">Admin de eventos</option>
                    <option value="superuser">Superuser</option>
                    <option value="aluno">Aluno / participante</option>
                  </select>
                </div>

                {erro && (
                  <p className="text-sm text-red-600 text-center">{erro}</p>
                )}
                {mensagem && (
                  <p className="text-sm text-emerald-700 text-center">
                    {mensagem}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={carregando}
                >
                  {carregando ? "Salvando..." : "Criar usuário"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Usuários com acesso administrador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <div className="grid grid-cols-[2fr_1fr] bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">
                  <span>Nome</span>
                  <span className="text-right">Tipo</span>
                </div>

                <div className="divide-y text-sm">
                  {admins.map(u => (
                    <div
                      key={u.id}
                      className="grid grid-cols-[2fr_1fr] px-3 py-2"
                    >
                      <span>{u.nome ?? "Sem nome"}</span>
                      <span className="text-right text-emerald-700 font-medium">
                        {u.tipo}
                      </span>
                    </div>
                  ))}

                  {admins.length === 0 && (
                    <div className="px-3 py-4 text-sm text-slate-500">
                      Nenhum usuário administrador cadastrado ainda.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
