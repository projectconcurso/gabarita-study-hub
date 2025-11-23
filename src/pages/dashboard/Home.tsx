import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, FileText, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalSimulados: 0,
    mediaAcertos: 0,
    totalAmigos: 0,
  });
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Carregar perfil
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    setProfile(profileData);

    // Carregar estatísticas
    const { data: simulados } = await supabase
      .from("simulados")
      .select("percentual_acerto")
      .eq("user_id", user.id)
      .eq("status", "concluido");

    const { data: amizades } = await supabase
      .from("amizades")
      .select("id")
      .or(`user_id.eq.${user.id},amigo_id.eq.${user.id}`)
      .eq("status", "aceito");

    const totalSimulados = simulados?.length || 0;
    const mediaAcertos = simulados && simulados.length > 0
      ? simulados.reduce((acc, s) => acc + (s.percentual_acerto || 0), 0) / simulados.length
      : 0;

    setStats({
      totalSimulados,
      mediaAcertos: Math.round(mediaAcertos),
      totalAmigos: amizades?.length || 0,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Bem-vindo de volta, {profile?.nome || 'Estudante'}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Continue sua jornada rumo à aprovação
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Simulados Realizados</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSimulados}</div>
            <p className="text-xs text-muted-foreground">
              Continue praticando!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Acertos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mediaAcertos}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.mediaAcertos >= 70 ? 'Excelente!' : 'Continue estudando!'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amigos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAmigos}</div>
            <p className="text-xs text-muted-foreground">
              Conecte-se com outros estudantes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Perfil Incompleto */}
      {(!profile?.cargo_desejado || !profile?.area_forte || !profile?.area_fraca) && (
        <Card className="border-secondary">
          <CardHeader>
            <CardTitle>Complete seu Perfil</CardTitle>
            <CardDescription>
              Preencha suas informações para receber simulados personalizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/perfil">
              <Button className="bg-gradient-hero">
                <Brain className="w-4 h-4 mr-2" />
                Completar Perfil
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Ações Rápidas */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Novo Simulado</CardTitle>
            <CardDescription>
              Gere questões personalizadas com IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/simulados">
              <Button className="w-full bg-gradient-success">
                <FileText className="w-4 h-4 mr-2" />
                Iniciar Simulado
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conecte-se</CardTitle>
            <CardDescription>
              Encontre amigos e estude junto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/amigos">
              <Button className="w-full" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Ver Amigos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
