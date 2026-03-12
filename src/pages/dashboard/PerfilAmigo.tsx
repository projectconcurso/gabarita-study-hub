import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, MapPin, GraduationCap, BookOpen, Award, TrendingUp, FileText, ArrowLeft, User } from "lucide-react";
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

      const { data: friendship, error: friendshipError } = await supabase
        .from("amizades")
        .select("id")
        .eq("status", "aceito")
        .or(`and(user_id.eq.${user.id},amigo_id.eq.${id}),and(user_id.eq.${id},amigo_id.eq.${user.id})`)
        .maybeSingle();

      if (friendshipError) {
        throw friendshipError;
      }

      if (!friendship) {
        toast.error("Você só pode visualizar o perfil de amigos adicionados");
        navigate("/dashboard/amigos");
        return;
      }

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
          <h1 className="text-4xl font-black uppercase">Perfil do Amigo</h1>
          <p className="text-lg font-semibold text-muted-foreground">
            Veja as informações públicas e o desempenho do seu amigo.
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
          <Button
            type="button"
            className="rounded-full border-2 border-border bg-primary text-primary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            onClick={handleOpenChat}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Enviar mensagem
          </Button>
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
              Os principais dados compartilhados pelo seu amigo.
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
              Desempenho do amigo nos simulados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
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
