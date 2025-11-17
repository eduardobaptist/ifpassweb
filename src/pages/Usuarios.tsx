import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "../config/supabase"
import logo from "../assets/logo.png"

type Usuario = {
    id: string
    nome: string | null
    tipo: string | null
    matricula: string | null
}

export function Usuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState("")
    const [userEmail, setUserEmail] = useState("")
    const [userType, setUserType] = useState("")
    const [userName, setUserName] = useState("")

    const navigate = useNavigate()

    useEffect(() => {
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

        async function carregarUsuarios() {
            setErro("")
            setLoading(true)

            const { data, error } = await supabase
                .from("usuarios")
                .select("id, nome, tipo, matricula")

            if (error) {
                console.error(error)
                setErro("Erro ao carregar usuários.")
                setLoading(false)
                return
            }

            setUsuarios(data || [])
            setLoading(false)
        }

        carregarUsuarioLogado()
        carregarUsuarios()
    }, [])

    function tipoVinculo(u: Usuario) {

        if (u.tipo === "admin" || u.tipo === "superuser") return "Servidor"

        if (u.matricula) return "Aluno"

        return "Externo"
    }


    async function excluirUsuario(id: string) {
        const confirma = window.confirm("Deseja realmente excluir este usuário?")
        if (!confirma) return

        const { error } = await supabase.from("usuarios").delete().eq("id", id)

        if (error) {
            console.error(error)
            setErro("Erro ao excluir usuário.")
            return
        }

        setUsuarios(prev => prev.filter(u => u.id !== id))
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <aside className="w-64 bg-emerald-700 text-emerald-50 flex flex-col">
                <div className="px-6 h-30 bg-white py-5 border-b border-white-600 flex items-center justify-center">
                    <img src={logo} className="size-50" />
                </div>

                <nav className="flex-1 px-3 py-4 text-sm space-y-1">
                    <button
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-emerald-800/70"
                        onClick={() => navigate("/Home")}
                    >
                        Visão geral
                    </button>

                    <button
                        className="w-full text-left px-3 py-2 rounded-md bg-emerald-800"
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
                            Usuários do sistema
                        </h2>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Lista de usuários</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {erro && (
                            <p className="text-sm text-red-600 mb-3">{erro}</p>
                        )}

                        {loading ? (
                            <p>Carregando...</p>
                        ) : usuarios.length === 0 ? (
                            <p className="text-sm text-slate-600">
                                Nenhum usuário cadastrado.
                            </p>
                        ) : (
                            <div className="border rounded-md overflow-hidden bg-white">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-100 text-left text-slate-700">
                                            <th className="px-3 py-2">Nome</th>
                                            <th className="px-3 py-2">Tipo de acesso</th>
                                            <th className="px-3 py-2">Vínculo</th>
                                            <th className="px-3 py-2 text-right">Ações</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y">
                                        {usuarios.map(u => (
                                            <tr key={u.id} className="hover:bg-slate-50">
                                                <td className="px-3 py-2">{u.nome ?? "Sem nome"}</td>

                                                <td className="px-3 py-2 text-emerald-700 font-medium">
                                                    {u.tipo ?? "-"}
                                                </td>

                                                <td className="px-3 py-2">
                                                    {tipoVinculo(u)}
                                                </td>

                                                <td className="px-3 py-2 text-right space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/EditarUsuario/${u.id}`)}
                                                    >
                                                        Editar
                                                    </Button>

                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => excluirUsuario(u.id)}
                                                    >
                                                        Excluir
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
