import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User } from "lucide-react";

export default function Perfil() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    nome: "",
    sobrenome: "",
    cargo_desejado: "",
    data_prova: "",
    area_forte: "",
    area_fraca: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile({
        nome: data.nome || "",
        sobrenome: data.sobrenome || "",
        cargo_desejado: data.cargo_desejado || "",
        data_prova: data.data_prova || "",
        area_forte: data.area_forte || "",
        area_fraca: data.area_fraca || "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", user.id);

    if (error) {
      toast.error("Erro ao atualizar perfil");
    } else {
      toast.success("Perfil atualizado com sucesso!");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground mt-2">
          Complete suas informações para simulados personalizados
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>
            Mantenha seu perfil atualizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={profile.nome}
                  onChange={(e) => setProfile({ ...profile, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sobrenome">Sobrenome</Label>
                <Input
                  id="sobrenome"
                  value={profile.sobrenome}
                  onChange={(e) => setProfile({ ...profile, sobrenome: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo / Concurso Desejado</Label>
              <Input
                id="cargo"
                placeholder="Ex: Auditor Fiscal, ENEM, etc."
                value={profile.cargo_desejado}
                onChange={(e) => setProfile({ ...profile, cargo_desejado: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_prova">Data da Prova (opcional)</Label>
              <Input
                id="data_prova"
                type="date"
                value={profile.data_prova}
                onChange={(e) => setProfile({ ...profile, data_prova: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area_forte">Área Forte</Label>
              <Input
                id="area_forte"
                placeholder="Ex: Matemática, Português, etc."
                value={profile.area_forte}
                onChange={(e) => setProfile({ ...profile, area_forte: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area_fraca">Área Fraca</Label>
              <Input
                id="area_fraca"
                placeholder="Ex: História, Física, etc."
                value={profile.area_fraca}
                onChange={(e) => setProfile({ ...profile, area_fraca: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-hero" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
