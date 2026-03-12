import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar, MapPin, GraduationCap, BookOpen, Award, Camera } from "lucide-react";
import { FocaLogo } from "@/components/FocaMascot";
import { isProfileComplete } from "@/lib/profileCompletion";

const ESTADOS_BRASIL = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" },
];

const ESCOLARIDADES = [
  { valor: "fundamental", label: "Ensino Fundamental" },
  { valor: "medio", label: "Ensino Médio" },
  { valor: "superior", label: "Ensino Superior" },
];

interface ProfileData {
  nome: string;
  sobrenome: string;
  foto_url: string;
  escolaridade: string;
  curso: string;
  data_nascimento: string;
  cidade: string;
  estado: string;
  area_forte: string;
  area_fraca: string;
  cargo_desejado: string;
}

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    nome: "",
    sobrenome: "",
    foto_url: "",
    escolaridade: "",
    curso: "",
    data_nascimento: "",
    cidade: "",
    estado: "",
    area_forte: "",
    area_fraca: "",
    cargo_desejado: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login", { replace: true });
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("nome, sobrenome, foto_url, escolaridade, curso, data_nascimento, cidade, estado, area_forte, area_fraca, cargo_desejado")
        .eq("id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        toast.error("Erro ao carregar dados do cadastro.");
        setLoading(false);
        return;
      }

      if (data && isProfileComplete(data)) {
        navigate("/dashboard", { replace: true });
        return;
      }

      if (data) {
        setProfile({
          nome: data.nome || "",
          sobrenome: data.sobrenome || "",
          foto_url: data.foto_url || "",
          escolaridade: data.escolaridade || "",
          curso: data.curso || "",
          data_nascimento: data.data_nascimento || "",
          cidade: data.cidade || "",
          estado: data.estado || "",
          area_forte: data.area_forte || "",
          area_fraca: data.area_fraca || "",
          cargo_desejado: data.cargo_desejado || "",
        });
      }

      setLoading(false);
    };

    void loadProfile();
  }, [navigate]);

  const validateRequiredFields = () => {
    const requiredFields = [
      { value: profile.nome, label: "Nome" },
      { value: profile.sobrenome, label: "Sobrenome" },
      { value: profile.escolaridade, label: "Escolaridade" },
      { value: profile.data_nascimento, label: "Data de nascimento" },
      { value: profile.cidade, label: "Cidade" },
      { value: profile.estado, label: "Estado" },
      { value: profile.area_forte, label: "Matéria forte" },
      { value: profile.area_fraca, label: "Matéria fraca" },
    ];

    const missingFields = requiredFields.filter((field) => !field.value.trim());

    if (missingFields.length > 0) {
      toast.error(`Preencha os campos obrigatórios: ${missingFields.map((field) => field.label).join(", ")}`);
      return false;
    }

    return true;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Usuário não autenticado.");
      navigate("/login", { replace: true });
      return;
    }

    try {
      setSaving(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) {
        toast.error(`Erro ao enviar foto: ${uploadError.message}`);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      setProfile((prev) => ({ ...prev, foto_url: publicUrl }));
      toast.success("Foto carregada com sucesso!");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRequiredFields()) {
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Usuário não autenticado.");
      setSaving(false);
      navigate("/login", { replace: true });
      return;
    }

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        ...profile,
        data_nascimento: profile.data_nascimento || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      toast.error(`Erro ao concluir cadastro: ${error.message}`);
      setSaving(false);
      return;
    }

    toast.success("Cadastro concluído com sucesso!");
    navigate("/dashboard", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="rounded-full border-4 border-border bg-[#f7cf3d] px-6 py-3 text-sm font-black uppercase text-foreground shadow-soft animate-pulse">
          Carregando seu cadastro...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="w-full space-y-6">
          <div className="flex justify-center">
            <FocaLogo />
          </div>

          <Card className="w-full rounded-[2rem] border-4 border-border bg-white shadow-strong">
            <CardHeader className="space-y-4 border-b-4 border-border bg-muted rounded-t-[1.7rem] px-6 py-6">
              <div className="inline-flex w-fit rounded-full border-2 border-border bg-[#f7cf3d] px-4 py-2 text-xs font-black uppercase tracking-wide text-foreground shadow-soft">
                Etapa final do cadastro
              </div>
              <CardTitle className="text-3xl font-black uppercase text-foreground">
                Complete seu perfil
              </CardTitle>
              <CardDescription className="text-base font-semibold text-muted-foreground">
                Falta só preencher os dados de seu perfil para você liberar o uso do Gabarit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="rounded-[1.8rem] border-2 border-border bg-white shadow-soft">
                  <CardHeader className="space-y-3 border-b-2 border-border bg-muted rounded-t-[1.6rem]">
                    <CardTitle className="text-2xl font-black uppercase text-foreground">Foto e apresentação</CardTitle>
                    <CardDescription className="font-semibold text-muted-foreground">
                      Deixe seu perfil completo, adicione uma foto ou imagem para seu pefil.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-border bg-secondary">
                          {profile.foto_url ? (
                            <img src={profile.foto_url} alt="Foto de perfil" className="h-full w-full object-cover" />
                          ) : (
                            <Camera className="h-10 w-10 text-muted-foreground" />
                          )}
                        </div>
                        <label
                          htmlFor="foto-complete"
                          className="absolute bottom-1 right-0 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-border bg-primary transition-colors hover:bg-primary/90"
                        >
                          <Camera className="h-5 w-5 text-primary-foreground" />
                        </label>
                        <input
                          id="foto-complete"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                          disabled={saving}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[1.8rem] border-2 border-border bg-white shadow-soft">
                  <CardHeader className="space-y-3 border-b-2 border-border bg-muted rounded-t-[1.6rem]">
                    <CardTitle className="text-2xl font-black uppercase text-foreground">Informações pessoais</CardTitle>
                    <CardDescription className="font-semibold text-muted-foreground">
                      Campos com * são obrigatórios nesta etapa.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="nome-complete">Nome *</Label>
                        <Input id="nome-complete" className="h-12 rounded-2xl border-2 border-border bg-white" value={profile.nome} onChange={(e) => setProfile({ ...profile, nome: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sobrenome-complete">Sobrenome *</Label>
                        <Input id="sobrenome-complete" className="h-12 rounded-2xl border-2 border-border bg-white" value={profile.sobrenome} onChange={(e) => setProfile({ ...profile, sobrenome: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="data-nascimento-complete" className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Data de nascimento *
                        </Label>
                        <Input id="data-nascimento-complete" type="date" className="h-12 rounded-2xl border-2 border-border bg-white" value={profile.data_nascimento} onChange={(e) => setProfile({ ...profile, data_nascimento: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="escolaridade-complete" className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          Escolaridade *
                        </Label>
                        <Select value={profile.escolaridade} onValueChange={(value) => setProfile({ ...profile, escolaridade: value })}>
                          <SelectTrigger id="escolaridade-complete" className="h-12 rounded-2xl border-2 border-border bg-white">
                            <SelectValue placeholder="Selecione sua escolaridade" />
                          </SelectTrigger>
                          <SelectContent>
                            {ESCOLARIDADES.map((item) => (
                              <SelectItem key={item.valor} value={item.valor}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[1.8rem] border-2 border-border bg-white shadow-soft">
                  <CardHeader className="space-y-3 border-b-2 border-border bg-muted rounded-t-[1.6rem]">
                    <CardTitle className="text-2xl font-black uppercase text-foreground">Localização e foco</CardTitle>
                    <CardDescription className="font-semibold text-muted-foreground">
                      Defina sua localização e organize sua jornada de estudos.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="curso-complete" className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          O que está cursando
                        </Label>
                        <Input id="curso-complete" className="h-12 rounded-2xl border-2 border-border bg-white" value={profile.curso} onChange={(e) => setProfile({ ...profile, curso: e.target.value })} placeholder="Ex: Direito, Medicina, etc." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cidade-complete" className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Cidade *
                        </Label>
                        <Input id="cidade-complete" className="h-12 rounded-2xl border-2 border-border bg-white" value={profile.cidade} onChange={(e) => setProfile({ ...profile, cidade: e.target.value })} placeholder="Sua cidade" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estado-complete" className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Estado *
                        </Label>
                        <Select value={profile.estado} onValueChange={(value) => setProfile({ ...profile, estado: value })}>
                          <SelectTrigger id="estado-complete" className="h-12 rounded-2xl border-2 border-border bg-white">
                            <SelectValue placeholder="Selecione seu estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {ESTADOS_BRASIL.map((estado) => (
                              <SelectItem key={estado.sigla} value={estado.sigla}>
                                {estado.nome} ({estado.sigla})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[1.8rem] border-2 border-border bg-white shadow-soft">
                  <CardHeader className="space-y-3 border-b-2 border-border bg-muted rounded-t-[1.6rem]">
                    <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase text-foreground">
                      <Award className="h-5 w-5" />
                      Desempenho e objetivos
                    </CardTitle>
                    <CardDescription className="font-semibold text-muted-foreground">
                      Essas informações são obrigatórias nesta etapa para personalizar sua experiência.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="cargo-complete">Cargo / Concurso desejado</Label>
                        <Input id="cargo-complete" className="h-12 rounded-2xl border-2 border-border bg-white" value={profile.cargo_desejado} onChange={(e) => setProfile({ ...profile, cargo_desejado: e.target.value })} placeholder="Ex: Auditor Fiscal, ENEM, etc." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="area-forte-complete">Matéria forte *</Label>
                        <Input id="area-forte-complete" className="h-12 rounded-2xl border-2 border-border bg-white" value={profile.area_forte} onChange={(e) => setProfile({ ...profile, area_forte: e.target.value })} placeholder="Ex: Matemática, Português, etc." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="area-fraca-complete">Matéria fraca *</Label>
                        <Input id="area-fraca-complete" className="h-12 rounded-2xl border-2 border-border bg-white" value={profile.area_fraca} onChange={(e) => setProfile({ ...profile, area_fraca: e.target.value })} placeholder="Ex: História, Física, etc." />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" disabled={saving} className="w-full h-12 rounded-full border-2 border-border bg-primary text-primary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                  {saving ? "Salvando..." : "Concluir cadastro"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
