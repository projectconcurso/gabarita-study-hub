import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  Clock3,
  FileText,
  MessageCircle,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DashboardProfile {
  nome: string | null;
  sobrenome: string | null;
  foto_url: string | null;
  escolaridade: string | null;
  curso: string | null;
  data_nascimento: string | null;
  cidade: string | null;
  estado: string | null;
  area_forte: string | null;
  area_fraca: string | null;
  cargo_desejado: string | null;
}

interface DashboardSimulado {
  id: string;
  titulo: string;
  materia: string;
  tema: string;
  status: string;
  percentual_acerto: number | null;
  total_questoes: number;
  created_at: string;
}

interface DashboardFriend {
  id: string;
  nome: string | null;
  sobrenome: string | null;
  foto_url: string | null;
  cargo_desejado: string | null;
}

interface DashboardStats {
  totalSimuladosPendentes: number;
  mediaAcertos: number;
  melhorResultado: number;
  totalAmigos: number;
}

export default function DashboardHome() {
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalSimuladosPendentes: 0,
    mediaAcertos: 0,
    melhorResultado: 0,
    totalAmigos: 0,
  });
  const [recentSimulados, setRecentSimulados] = useState<DashboardSimulado[]>([]);
  const [friends, setFriends] = useState<DashboardFriend[]>([]);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: profileData }, { data: simuladosData }, { data: amizadesData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("simulados")
        .select("id, titulo, materia, tema, status, percentual_acerto, total_questoes, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("amizades")
        .select("id, user_id, amigo_id")
        .or(`user_id.eq.${user.id},amigo_id.eq.${user.id}`)
        .eq("status", "aceito"),
    ]);

    const profileValue = (profileData ?? null) as DashboardProfile | null;
    const simulados = (simuladosData ?? []) as DashboardSimulado[];
    const amizades = (amizadesData ?? []) as Array<{ id: string; user_id: string; amigo_id: string }>;
    const concluidos = simulados.filter((simulado) => simulado.status === "concluido");
    const pendentes = simulados.filter((simulado) => simulado.status !== "concluido");
    const mediaAcertos =
      concluidos.length > 0
        ? Math.round(
            concluidos.reduce((acc, simulado) => acc + (simulado.percentual_acerto ?? 0), 0) / concluidos.length
          )
        : 0;
    const melhorResultado =
      concluidos.length > 0
        ? Math.max(...concluidos.map((simulado) => simulado.percentual_acerto ?? 0))
        : 0;

    const friendIds = Array.from(
      new Set(amizades.map((amizade) => (amizade.user_id === user.id ? amizade.amigo_id : amizade.user_id)))
    );

    let resolvedFriends: DashboardFriend[] = [];
    if (friendIds.length > 0) {
      const { data: friendProfiles } = await supabase
        .from("profiles")
        .select("id, nome, sobrenome, foto_url, cargo_desejado")
        .in("id", friendIds);

      resolvedFriends = (friendProfiles ?? []) as DashboardFriend[];
    }

    setProfile(profileValue);
    setRecentSimulados(simulados.slice(0, 4));
    setFriends(resolvedFriends);
    setStats({
      totalSimuladosPendentes: pendentes.length,
      mediaAcertos,
      melhorResultado,
      totalAmigos: amizades.length,
    });
  };

  const welcomeName = profile?.nome || "Estudante";
  const firstPendingSimulado = recentSimulados.find((simulado) => simulado.status !== "concluido");
  const isFirstAccess = recentSimulados.length === 0 && stats.totalAmigos === 0;
  const strongestCTA =
    !profile?.cargo_desejado || !profile?.area_forte || !profile?.area_fraca
      ? {
          title: "Complete seu perfil",
          description: "Deixe suas preferências em dia para receber simulados mais personalizados.",
          href: "/dashboard/perfil",
          label: "Ajustar perfil",
          icon: UserRound,
        }
      : firstPendingSimulado
        ? {
            title: "Retome seu último simulado",
            description: "Você já tem um simulado em andamento esperando sua próxima sessão.",
            href: "/dashboard/simulados",
            label: "Continuar estudando",
            icon: Clock3,
          }
        : {
            title: "Gerar novo simulado",
            description: "Monte um novo treino com IA e continue evoluindo no seu ritmo.",
            href: "/dashboard/simulados",
            label: "Criar simulado",
            icon: Brain,
          };

  const CtaIcon = strongestCTA.icon;
  const heroTitle = isFirstAccess ? `Bem-vindo ao Gabarit, ${welcomeName}!` : `Bem-vindo de volta, ${welcomeName}!`;
  const heroDescription = isFirstAccess
    ? "Organize seus estudos, complete seu perfil e comece a construir seu desempenho na plataforma."
    : "Acompanhe o progresso de seus estudos com o resumo de seu desempenho.";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
        <Card className="rounded-[2rem] border-4 border-border bg-white shadow-medium">
          <CardHeader className="space-y-4">
            <div className="inline-flex w-fit rounded-full border-2 border-border bg-[#f7cf3d] px-4 py-2 text-xs font-black uppercase tracking-wide text-foreground shadow-soft">
              Painel de estudos
            </div>
            <div className="space-y-3">
              <CardTitle className="text-3xl font-black uppercase leading-tight md:text-5xl">
                {heroTitle}
              </CardTitle>
              <CardDescription className="max-w-2xl text-base font-semibold text-muted-foreground md:text-lg">
                {heroDescription}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-[1.5rem] border-2 border-border bg-muted p-4">
                <p className="text-xs font-black uppercase text-muted-foreground">Média de acertos</p>
                <p className="mt-2 text-3xl font-black text-primary">{stats.mediaAcertos}%</p>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">
                  {stats.mediaAcertos >= 70 ? "Você está mantendo um bom desempenho." : "Continue praticando para elevar sua média."}
                </p>
              </div>
              <div className="rounded-[1.5rem] border-2 border-border bg-muted p-4">
                <p className="text-xs font-black uppercase text-muted-foreground">Melhor resultado</p>
                <p className="mt-2 text-3xl font-black text-secondary">{stats.melhorResultado}%</p>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">
                  {stats.melhorResultado >= 70 ? "Ótimo desempenho recente." : "Há espaço claro para evolução."}
                </p>
              </div>
              <div className="rounded-[1.5rem] border-2 border-border bg-muted p-4">
                <p className="text-xs font-black uppercase text-muted-foreground">Foco atual</p>
                <p className="mt-2 text-lg font-black text-foreground">
                  {profile?.cargo_desejado || profile?.area_fraca || "Defina seu próximo objetivo"}
                </p>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">
                  {profile?.cargo_desejado ? "Objetivo principal salvo no perfil." : "Atualize seu perfil para personalizar melhor a jornada."}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link to="/dashboard/simulados" className="w-full">
                <Button className="w-full rounded-full border-2 border-border bg-secondary text-secondary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                  <FileText className="mr-2 h-4 w-4" />
                  Novo simulado
                </Button>
              </Link>
              <Link to="/dashboard/mural" className="w-full">
                <Button
                  variant="outline"
                  className="w-full rounded-full border-2 border-border bg-white font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Ver comunidade
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-4 border-border bg-white shadow-medium">
          <CardHeader className="space-y-3">
            <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase">
              <Target className="h-5 w-5" />
              Próximo passo
            </CardTitle>
            <CardDescription className="font-semibold text-muted-foreground">
              Atalho para suas próximas ações no Gabarit!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-[1.5rem] border-2 border-border bg-muted p-4">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-primary text-primary-foreground">
                <CtaIcon className="h-5 w-5" />
              </div>
              <p className="text-lg font-black uppercase text-foreground">{strongestCTA.title}</p>
              <p className="mt-2 text-sm font-semibold text-muted-foreground">{strongestCTA.description}</p>
            </div>
            <Link to={strongestCTA.href} className="block pt-1">
              <Button className="w-full rounded-full border-2 border-border bg-primary text-primary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                {strongestCTA.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <div className="rounded-[1.3rem] border-2 border-border bg-white p-4">
              <p className="text-xs font-black uppercase text-muted-foreground">Simulados pendentes</p>
              <p className="mt-2 text-2xl font-black text-foreground">{stats.totalSimuladosPendentes}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
        <Card className="h-full rounded-[2rem] border-4 border-border bg-white shadow-medium">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-black uppercase">Últimos simulados</CardTitle>
            <CardDescription className="font-semibold text-muted-foreground">
              Veja rapidamente o que você concluiu e o que ainda pode retomar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {recentSimulados.length === 0 ? (
              <div className="rounded-[1.5rem] border-2 border-dashed border-border bg-muted p-6 text-center">
                <p className="text-lg font-black uppercase text-foreground">Nenhum simulado ainda</p>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">
                  Gere o primeiro simulado para começar a construir seu histórico de desempenho.
                </p>
              </div>
            ) : (
              recentSimulados.map((simulado) => (
                <div
                  key={simulado.id}
                  className="rounded-[1.5rem] border-2 border-border bg-muted p-4 transition-transform hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-black uppercase text-foreground">{simulado.titulo}</p>
                      <p className="text-sm font-semibold text-muted-foreground">
                        {simulado.materia} · {simulado.tema}
                      </p>
                    </div>
                    <div
                      className={`inline-flex w-fit rounded-full border-2 border-border px-3 py-1 text-xs font-black uppercase ${
                        simulado.status === "concluido"
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-white text-foreground"
                      }`}
                    >
                      {simulado.status === "concluido" ? "Concluído" : "Não concluído"}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-black uppercase text-muted-foreground">Questões</p>
                      <p className="mt-1 text-base font-black text-foreground">{simulado.total_questoes}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-muted-foreground">Acerto</p>
                      <p className="mt-1 text-base font-black text-foreground">
                        {simulado.percentual_acerto !== null ? `${simulado.percentual_acerto}%` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-muted-foreground">Criado em</p>
                      <p className="mt-1 text-base font-black text-foreground">
                        {new Date(simulado.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <Link to="/dashboard/simulados" className="block pt-1">
              <Button
                variant="outline"
                className="w-full rounded-full border-2 border-border bg-white font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Ver todos os simulados
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="flex h-full flex-col gap-6">
          <Card className="flex min-h-0 flex-1 flex-col rounded-[2rem] border-4 border-border bg-white shadow-medium">
            <CardHeader className="space-y-3">
              <CardTitle className="flex items-center justify-between gap-3 text-2xl font-black uppercase">
                <span>Amigos</span>
                <span className="inline-flex rounded-full border-2 border-border bg-accent px-3 py-1 text-xs font-black text-accent-foreground">
                  {stats.totalAmigos}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <Link to="/dashboard/amigos" className="block">
                <Button
                  variant="outline"
                  className="w-full rounded-full border-2 border-border bg-white font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Encontrar novos amigos
                </Button>
              </Link>
              <div className="h-full max-h-[420px] space-y-3 overflow-y-auto pr-2 xl:max-h-none">
                {friends.length === 0 ? (
                  <div className="rounded-[1.5rem] border-2 border-dashed border-border bg-muted p-5 text-center">
                    <p className="text-sm font-black uppercase text-foreground">Nenhum amigo ainda</p>
                    <p className="mt-2 text-sm font-semibold text-muted-foreground">
                      Encontre estudantes na página de amigos para começar a montar sua rede.
                    </p>
                  </div>
                ) : (
                  friends.map((friend) => {
                    const fullName = [friend.nome, friend.sobrenome].filter(Boolean).join(" ") || "Usuário";
                    const initials = `${friend.nome?.[0] ?? ""}${friend.sobrenome?.[0] ?? ""}` || "U";

                    return (
                      <div key={friend.id} className="flex items-center gap-3 rounded-[1.3rem] border-2 border-border bg-muted p-4">
                        <Avatar className="h-12 w-12 border-2 border-border">
                          {friend.foto_url ? <img src={friend.foto_url} alt={fullName} className="h-full w-full object-cover" /> : null}
                          <AvatarFallback className="bg-secondary font-black text-secondary-foreground">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black uppercase text-foreground">{fullName}</p>
                          <p className="truncate text-sm font-semibold text-muted-foreground">
                            {friend.cargo_desejado || "Estudando com você no Gabarit"}
                          </p>
                        </div>
                        <Link to={`/dashboard/chat?friend=${friend.id}`} className="shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full border-2 border-border bg-white shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col rounded-[2rem] border-4 border-border bg-white shadow-medium">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl font-black uppercase">Ações rápidas</CardTitle>
              <CardDescription className="font-semibold text-muted-foreground">
                Acessos úteis sem transformar a home em uma página só de botões.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/dashboard/perfil" className="block">
                <Button className="w-full justify-between rounded-[1.2rem] border-2 border-border bg-white px-4 py-6 font-black uppercase text-foreground shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none" variant="outline">
                  Ajustar meu perfil
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard/chat" className="block">
                <Button className="w-full justify-between rounded-[1.2rem] border-2 border-border bg-white px-4 py-6 font-black uppercase text-foreground shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none" variant="outline">
                  Abrir chat
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard/mural" className="block">
                <Button className="w-full justify-between rounded-[1.2rem] border-2 border-border bg-white px-4 py-6 font-black uppercase text-foreground shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none" variant="outline">
                  Ir para o mural
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
