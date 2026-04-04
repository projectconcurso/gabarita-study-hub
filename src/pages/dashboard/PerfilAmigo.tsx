import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, MapPin, GraduationCap, BookOpen, Award, TrendingUp, FileText, ArrowLeft, User, Zap, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface FriendProfile {
  id: string;
  nome: string;
  sobrenome: string;
  foto_url: string | null;
  escolaridade: string | null;
  curso: string | null;
  data_nascimento: string | null;
  cidade: string | null;
  estado: string | null;
  area_forte: string | null;
  area_fraca: string | null;
}

interface UserXP {
  nivel: number;
  total_xp: number;
  xp_para_proximo_nivel: number;
  progresso_nivel: number;
}

interface FriendStats {
  totalSimulados: number;
  mediaAcertos: number;
}

interface FriendSimuladoStat {
  percentual_acerto: number | null;
  acertos: number | null;
  total_questoes: number | null;
}

const ESCOLARIDADE_LABELS: Record<string, string> = {
  fundamental: "Ensino Fundamental",
  medio: "Ensino Médio",
  superior: "Ensino Superior",
};

export default function PerfilAmigo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<FriendProfile | null>(null);
  const [stats, setStats] = useState<FriendStats>({ totalSimulados: 0, mediaAcertos: 0 });
  const [userXP, setUserXP] = useState<UserXP>({ nivel: 0, total_xp: 0, xp_para_proximo_nivel: 10, progresso_nivel: 0 });
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    void loadFriendProfile();
  }, [id]);

  const idade = useMemo(() => {
    if (!profile?.data_nascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(profile.data_nascimento);
    let value = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      value -= 1;
    }
    return value;
  }, [profile?.data_nascimento]);

  const loadFriendProfile = async () => {
    if (!id) return;

    setLoading(true);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;

      if (!user) {
        navigate("/login");
        return;
      }

      // Verificar se é amigo (mas não bloquear visualização)
      const { data: friendship } = await supabase
        .from("amizades")
        .select("id")
        .eq("status", "aceito")
        .or(`and(user_id.eq.${user.id},amigo_id.eq.${id}),and(user_id.eq.${id},amigo_id.eq.${user.id})`)
        .maybeSingle();

      setIsFriend(!!friendship);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, nome, sobrenome, foto_url, escolaridade, curso, data_nascimento, cidade, estado, area_forte, area_fraca")
        .eq("id", id)
        .single();

      if (profileError) {
        throw profileError;
      }

      const { data: simuladosData, error: simuladosError } = await supabase
        .from("simulados")
        .select("percentual_acerto, acertos, total_questoes")
        .eq("user_id", id)
        .eq("status", "concluido");

      if (simuladosError) {
        throw simuladosError;
      }

      const simuladoStats = (simuladosData ?? []) as FriendSimuladoStat[];
      const totalSimulados = simuladoStats.length;
      const mediaAcertos = totalSimulados > 0
        ? Math.round(
            simuladoStats.reduce((acc, item) => {
              if (typeof item.percentual_acerto === "number") {
                return acc + item.percentual_acerto;
              }

              if (
                typeof item.acertos === "number" &&
                typeof item.total_questoes === "number" &&
                item.total_questoes > 0
              ) {
                return acc + Math.round((item.acertos / item.total_questoes) * 100);
              }

              return acc;
            }, 0) / totalSimulados
          )
        : 0;

      // Buscar XP do usuário
      // @ts-ignore - RPC types will be available after full type generation
      const { data: xpData } = await supabase.rpc("buscar_xp_usuario", { p_user_id: id });
      if (xpData) {
        const xp = xpData as any;
        setUserXP({
          nivel: xp.nivel || 0,
          total_xp: xp.total_xp || 0,
          xp_para_proximo_nivel: xp.xp_para_proximo_nivel || 10,
          progresso_nivel: xp.progresso_nivel || 0,
        });
      }

      setProfile(profileData as FriendProfile);
      setStats({ totalSimulados, mediaAcertos });
    } catch (error) {
      console.error("Erro ao carregar perfil do amigo:", error);
      const message = error instanceof Error ? error.message : "Erro ao carregar perfil do amigo";
      toast.error(message);
      navigate("/dashboard/amigos");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = () => {
    if (!profile) return;
    navigate(`/dashboard/chat?friend=${profile.id}`);
  };

  const handleSendFriendRequest = async () => {
    if (!profile) return;

    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) return;

      // Verificar se já existe solicitação
      const { data: existingFriendships } = await supabase
        .from("amizades")
        .select("id, status, user_id, amigo_id")
        .or(`and(user_id.eq.${user.id},amigo_id.eq.${profile.id}),and(user_id.eq.${profile.id},amigo_id.eq.${user.id})`);

      const friendships = existingFriendships ?? [];
      
      // Se já existe amizade aceita
      if (friendships.some((f: any) => f.status === "aceito")) {
        toast.error("Vocês já são amigos");
        setIsFriend(true);
        return;
      }

      // Se já enviou solicitação
      if (friendships.some((f: any) => f.status === "pendente" && f.user_id === user.id)) {
        toast.info("Você já enviou uma solicitação para este usuário");
        return;
      }

      // Se tem solicitação reversa pendente, aceitar
      const reversePending = friendships.find(
        (f: any) => f.status === "pendente" && f.user_id === profile.id && f.amigo_id === user.id
      );

      if (reversePending) {
        await (supabase
          .from("amizades") as any)
          .update({ status: "aceito" })
          .eq("id", (reversePending as any).id);
        
        toast.success("Vocês agora são amigos!");
        setIsFriend(true);
        return;
      }

      // Enviar nova solicitação
      const { error } = await (supabase
        .from("amizades") as any)
        .insert({
          user_id: user.id,
          amigo_id: profile.id,
          status: "pendente",
        });

      if (error) {
        toast.error("Erro ao enviar solicitação");
      } else {
        toast.success("Solicitação de amizade enviada!");
      }
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      toast.error("Erro ao enviar solicitação");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="inline-flex rounded-full border-2 border-border bg-[#f7cf3d] px-4 py-2 text-xs font-black uppercase tracking-wide text-foreground shadow-soft">
            Perfil social
          </div>
          <h1 className="text-4xl font-black uppercase">Carregando perfil...</h1>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="inline-flex rounded-full border-2 border-border bg-[#f7cf3d] px-4 py-2 text-xs font-black uppercase tracking-wide text-foreground shadow-soft">
            Perfil social
          </div>
          <h1 className="text-4xl font-black uppercase">Perfil do Usuário</h1>
          <p className="text-lg font-semibold text-muted-foreground">
            Veja as informações públicas e o desempenho deste usuário.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-2 border-border bg-white font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            onClick={() => navigate("/dashboard/amigos")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          {isFriend ? (
            <Button
              type="button"
              className="rounded-full border-2 border-border bg-primary text-primary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              onClick={handleOpenChat}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Enviar mensagem
            </Button>
          ) : (
            <Button
              type="button"
              className="rounded-full border-2 border-border bg-secondary text-secondary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              onClick={handleSendFriendRequest}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Enviar solicitação
            </Button>
          )}
        </div>
      </div>

      <Card className="rounded-[2rem] border-4 border-border bg-white shadow-medium">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <Avatar className="h-24 w-24 border-4 border-border">
              {profile.foto_url ? (
                <img src={profile.foto_url} alt={`${profile.nome} ${profile.sobrenome}`} className="h-full w-full object-cover" />
              ) : (
                <AvatarFallback className="bg-secondary font-black text-secondary-foreground text-2xl">
                  {profile.nome[0]}{profile.sobrenome[0]}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase">
                {profile.nome} {profile.sobrenome}
              </h2>
              <div className="flex flex-wrap gap-3 text-sm font-semibold text-muted-foreground">
                {(profile.cidade || profile.estado) && (
                  <span className="inline-flex items-center gap-1 rounded-full border-2 border-border px-3 py-1">
                    <MapPin className="h-4 w-4" />
                    {[profile.cidade, profile.estado].filter(Boolean).join(", ")}
                  </span>
                )}
                {idade !== null && (
                  <span className="inline-flex items-center gap-1 rounded-full border-2 border-border px-3 py-1">
                    <User className="h-4 w-4" />
                    {idade} anos
                  </span>
                )}
                {profile.escolaridade && (
                  <span className="inline-flex items-center gap-1 rounded-full border-2 border-border px-3 py-1">
                    <GraduationCap className="h-4 w-4" />
                    {ESCOLARIDADE_LABELS[profile.escolaridade] || profile.escolaridade}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-[2rem] border-4 border-border bg-white shadow-medium lg:col-span-2">
          <CardHeader className="border-b-4 border-border bg-muted rounded-t-[1.7rem]">
            <CardTitle className="text-2xl font-black uppercase">Informações do perfil</CardTitle>
            <CardDescription className="font-semibold text-muted-foreground">
              Os principais dados públicos deste usuário.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-6 md:grid-cols-2">
            <div className="rounded-[1.2rem] border-2 border-border p-4 shadow-soft">
              <p className="mb-2 flex items-center gap-2 text-sm font-black uppercase text-muted-foreground">
                <GraduationCap className="h-4 w-4" /> Escolaridade
              </p>
              <p className="font-semibold">{profile.escolaridade ? (ESCOLARIDADE_LABELS[profile.escolaridade] || profile.escolaridade) : "Não informado"}</p>
            </div>
            <div className="rounded-[1.2rem] border-2 border-border p-4 shadow-soft">
              <p className="mb-2 flex items-center gap-2 text-sm font-black uppercase text-muted-foreground">
                <BookOpen className="h-4 w-4" /> O que está cursando
              </p>
              <p className="font-semibold">{profile.curso || "Não informado"}</p>
            </div>
            <div className="rounded-[1.2rem] border-2 border-border p-4 shadow-soft">
              <p className="mb-2 flex items-center gap-2 text-sm font-black uppercase text-muted-foreground">
                <Award className="h-4 w-4" /> Matéria forte
              </p>
              <p className="font-semibold">{profile.area_forte || "Não informado"}</p>
            </div>
            <div className="rounded-[1.2rem] border-2 border-border p-4 shadow-soft">
              <p className="mb-2 flex items-center gap-2 text-sm font-black uppercase text-muted-foreground">
                <BookOpen className="h-4 w-4" /> Matéria fraca
              </p>
              <p className="font-semibold">{profile.area_fraca || "Não informado"}</p>
            </div>
            <div className="rounded-[1.2rem] border-2 border-border p-4 shadow-soft md:col-span-2">
              <p className="mb-2 flex items-center gap-2 text-sm font-black uppercase text-muted-foreground">
                <MapPin className="h-4 w-4" /> Localização
              </p>
              <p className="font-semibold">{[profile.cidade, profile.estado].filter(Boolean).join(", ") || "Não informado"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-4 border-border bg-white shadow-medium">
          <CardHeader className="border-b-4 border-border bg-muted rounded-t-[1.7rem]">
            <CardTitle className="text-2xl font-black uppercase">Estatísticas</CardTitle>
            <CardDescription className="font-semibold text-muted-foreground">
              Desempenho e progresso do usuário.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {/* Level e XP */}
            <div className="rounded-[1.2rem] border-2 border-border bg-gradient-to-br from-blue-50 to-green-50 p-4 shadow-soft">
              <p className="mb-3 flex items-center gap-2 text-sm font-black uppercase text-muted-foreground">
                <Zap className="h-4 w-4" /> Progresso de Conta
              </p>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Level</p>
                  <p className="text-3xl font-black text-blue-500">{userXP.nivel}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-muted-foreground">XP Total</p>
                  <p className="text-3xl font-black text-green-500">{userXP.total_xp}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Próximo nível</p>
                <div className="h-2 w-full overflow-hidden rounded-full border border-border bg-gray-100">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                    style={{ width: `${userXP.progresso_nivel}%` }}
                  />
                </div>
                <p className="mt-1 text-xs font-semibold text-muted-foreground text-right">
                  {userXP.xp_para_proximo_nivel} XP restantes
                </p>
              </div>
            </div>

            <div className="rounded-[1.2rem] border-2 border-border p-4 shadow-soft">
              <p className="mb-2 flex items-center gap-2 text-sm font-black uppercase text-muted-foreground">
                <FileText className="h-4 w-4" /> Simulados concluídos
              </p>
              <p className="text-3xl font-black text-primary">{stats.totalSimulados}</p>
            </div>
            <div className="rounded-[1.2rem] border-2 border-border p-4 shadow-soft">
              <p className="mb-2 flex items-center gap-2 text-sm font-black uppercase text-muted-foreground">
                <TrendingUp className="h-4 w-4" /> Média de acerto
              </p>
              <p className="text-3xl font-black text-secondary">{stats.mediaAcertos}%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
