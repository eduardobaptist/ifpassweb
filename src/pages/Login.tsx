import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "../config/supabase"
import { useAuth } from "./AuthContext"
import logo from "../assets/logo.png"

export function Login() {
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [carregando, setCarregando] = useState(false)
    const [erro, setErro] = useState("")

    const navigate = useNavigate()
    const { user, perfil } = useAuth()

    // Redireciona automaticamente se o usuário já estiver logado
    useEffect(() => {
        console.log("🔍 useEffect - user:", user, "perfil:", perfil)
        if (user && perfil) {
            const tipo = perfil.tipo
            console.log("✅ Usuário já logado, tipo:", tipo)

            if (tipo === "superuser" || tipo === "admin") {
                console.log("➡️ Navegando para DashboardAdmin")
                navigate("/DashboardAdmin", { replace: true })
            } else if (tipo === "aluno") {
                console.log("➡️ Navegando para HomeAluno")
                navigate("/HomeAluno", { replace: true })
            }
        }
    }, [user, perfil, navigate])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErro("")
        setCarregando(true)
        console.log("🚀 Iniciando login...")

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: senha,
        })

        console.log("📡 Resposta do login:", { data, error })

        if (error || !data?.user) {
            console.error("❌ Erro no login:", error)
            setErro("E-mail ou senha inválidos.")
            setCarregando(false)
            return
        }

        const user = data.user
        console.log("✅ Login bem-sucedido! User ID:", user.id)

        // Busca o perfil do usuário para determinar o redirecionamento
        console.log("🔍 Buscando perfil do usuário...")
        const { data: perfil, error: perfilError } = await supabase
            .from("usuarios")
            .select("*")
            .eq("id", user.id)
            .single()

        console.log("📡 Resposta da busca do perfil:", { perfil, perfilError })

        if (perfilError || !perfil) {
            console.error("❌ Erro ao buscar perfil:", perfilError)
            setErro("Erro ao carregar dados do usuário.")
            setCarregando(false)
            return
        }

        const tipo = perfil.tipo
        console.log("✅ Perfil carregado! Tipo:", tipo)

        // Navega para a página apropriada baseado no tipo de usuário
        if (tipo === "superuser" || tipo === "admin") {
            console.log("➡️ Navegando para DashboardAdmin")
            navigate("/DashboardAdmin", { replace: true })
        } else if (tipo === "aluno") {
            console.log("➡️ Navegando para HomeAluno")
            navigate("/HomeAluno", { replace: true })
        } else {
            console.error("❌ Tipo de usuário não reconhecido:", tipo)
            setErro("Tipo de usuário não reconhecido.")
            setCarregando(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        <img src={logo} alt="" />
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Input
                                id="email"
                                type="email"
                                placeholder="E-mail"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Input
                                id="senha"
                                type="password"
                                placeholder="Senha"
                                value={senha}
                                onChange={e => setSenha(e.target.value)}
                                required
                            />
                        </div>

                        {erro && (
                            <p className="text-sm text-red-600 text-center">{erro}</p>
                        )}

                        <Button type="submit" className="w-full" disabled={carregando}>
                            {carregando ? "Entrando..." : "Entrar"}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col gap-2 text-center text-sm text-slate-600">
                    <button type="button" className="underline">
                        Esqueci minha senha
                    </button>
                    <button type="button" className="underline">
                        Criar conta
                    </button>
                </CardFooter>
            </Card>
        </div>
    )
}
