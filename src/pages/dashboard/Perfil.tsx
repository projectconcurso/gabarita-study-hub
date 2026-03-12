import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { User, Camera, Calendar, MapPin, GraduationCap, BookOpen, Award, Shield, Mail, KeyRound, Eye, EyeOff, Trash2 } from "lucide-react";
import BillingOverview from "@/components/dashboard/BillingOverview";

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

export default function Perfil() {
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [showAccountEmail, setShowAccountEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [sendingPasswordReset, setSendingPasswordReset] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
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
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setAccountEmail(user.email ?? "");

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      const profileData = data as any;
      setProfile({
        nome: profileData.nome || "",
        sobrenome: profileData.sobrenome || "",
        foto_url: profileData.foto_url || "",
        escolaridade: profileData.escolaridade || "",
        curso: profileData.curso || "",
        data_nascimento: profileData.data_nascimento || "",
        cidade: profileData.cidade || "",
        estado: profileData.estado || "",
        area_forte: profileData.area_forte || "",
        area_fraca: profileData.area_fraca || "",
        cargo_desejado: profileData.cargo_desejado || "",
      });
    }
  };

  const calcularIdade = (dataNascimento: string): number | null => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      setProfile((prev) => ({ ...prev, foto_url: publicUrl }));
      toast.success("Foto atualizada!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao fazer upload da foto";
      toast.error(message);
      console.error(error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const validarCamposObrigatorios = (): boolean => {
    const camposObrigatorios = [
      { campo: profile.nome, nome: "Nome" },
      { campo: profile.sobrenome, nome: "Sobrenome" },
      { campo: profile.escolaridade, nome: "Escolaridade" },
      { campo: profile.data_nascimento, nome: "Data de Nascimento" },
      { campo: profile.cidade, nome: "Cidade" },
      { campo: profile.estado, nome: "Estado" },
      { campo: profile.area_forte, nome: "Matéria Forte" },
      { campo: profile.area_fraca, nome: "Matéria Fraca" },
    ];

    const camposVazios = camposObrigatorios.filter((item) => !item.campo.trim());

    if (camposVazios.length > 0) {
      const nomesCampos = camposVazios.map((item) => item.nome).join(", ");
      toast.error(`Campos obrigatórios não preenchidos: ${nomesCampos}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarCamposObrigatorios()) return;

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      id: user.id,
      ...profile,
      data_nascimento: profile.data_nascimento || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      toast.error(`Erro ao atualizar perfil: ${error.message}`);
    } else {
      toast.success("Perfil atualizado com sucesso!");
    }

    setLoading(false);
  };

  const maskEmail = (email: string) => {
    if (!email.includes("@")) {
      return "Email indisponível";
    }

    const [localPart, domain] = email.split("@");
    if (localPart.length <= 2) {
      return `${localPart[0] ?? "*"}***@${domain}`;
    }

    return `${localPart.slice(0, 2)}***@${domain}`;
  };

  const handleEmailUpdate = async () => {
    const normalizedEmail = newEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error("Informe o novo email.");
      return;
    }

    if (normalizedEmail === accountEmail.toLowerCase()) {
      toast.error("Informe um email diferente do atual.");
      return;
    }

    setUpdatingEmail(true);

    try {
      const { error } = await supabase.auth.updateUser({
        email: normalizedEmail,
      });

      if (error) {
        toast.error(`Erro ao solicitar troca de email: ${error.message}`);
        return;
      }

      toast.success("Enviamos a confirmação da troca de email para o novo endereço informado.");
      setNewEmail("");
    } catch (_error) {
      toast.error("Erro inesperado ao atualizar email.");
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!accountEmail) {
      toast.error("Não foi possível identificar o email da sua conta.");
      return;
    }

    setSendingPasswordReset(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(accountEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(`Erro ao enviar redefinição de senha: ${error.message}`);
        return;
      }

      toast.success("Enviamos um link seguro para você trocar sua senha.");
    } catch (_error) {
      toast.error("Erro inesperado ao solicitar troca de senha.");
    } finally {
      setSendingPasswordReset(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);

    try {
      const { error } = await supabase.functions.invoke("delete-account");

      if (error) {
        toast.error(`Erro ao apagar conta: ${error.message}`);
        return;
      }

      await supabase.auth.signOut();
      toast.success("Sua conta foi apagada com sucesso.");
      window.location.href = "/";
    } catch (_error) {
      toast.error("Erro inesperado ao apagar conta.");
    } finally {
      setDeletingAccount(false);
    }
  };

  const idade = calcularIdade(profile.data_nascimento);
  const escolaridadeLabel =
    ESCOLARIDADES.find((item) => item.valor === profile.escolaridade)?.label ?? profile.escolaridade;

  return (
    <div className="space-y-6 pb-6">
      <div className="space-y-3">
        <div className="inline-flex rounded-full border-2 border-border bg-[#f7cf3d] px-4 py-2 text-xs font-black uppercase tracking-wide text-foreground shadow-soft">
          Configuração pessoal
        </div>
        <h1 className="text-4xl font-black uppercase">Meu Perfil</h1>
        <p className="text-lg font-semibold text-muted-foreground">
          Complete suas informações para simulados personalizados
        </p>
      </div>

      <div className="mx-auto w-full max-w-7xl">
        <Tabs defaultValue="perfil" className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-1 gap-2 rounded-[1.5rem] border-2 border-border bg-white p-2 shadow-soft sm:grid-cols-3">
            <TabsTrigger value="perfil" className="rounded-full border-2 border-transparent font-black uppercase data-[state=active]:border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Perfil
            </TabsTrigger>
            <TabsTrigger value="conta" className="rounded-full border-2 border-transparent font-black uppercase data-[state=active]:border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Conta
            </TabsTrigger>
            <TabsTrigger value="plano" className="rounded-full border-2 border-transparent font-black uppercase data-[state=active]:border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Plano e Pagamento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil">
            <form onSubmit={handleSubmit} className="grid items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
              <Card className="h-fit rounded-[2rem] border-4 border-border bg-white shadow-medium xl:self-start">
                <CardHeader className="space-y-3 border-b-4 border-border bg-muted rounded-t-[1.7rem]">
                  <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase">
                    <User className="w-5 h-5" />
                    Meu Perfil
                  </CardTitle>
                  <CardDescription className="font-semibold text-muted-foreground">
                    Atualize sua foto e os dados principais da sua conta.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-border bg-secondary">
                        {profile.foto_url ? (
                          <img
                            src={profile.foto_url}
                            alt="Foto de perfil"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Camera className="w-10 h-10 text-muted-foreground" />
                        )}
                      </div>
                      <label
                        htmlFor="foto"
                        className="absolute bottom-1 right-0 flex h-11 w-11 items-center justify-center rounded-full border-2 border-border bg-primary cursor-pointer transition-colors hover:bg-primary/90"
                      >
                        <Camera className="w-5 h-5 text-primary-foreground" />
                      </label>
                      <input
                        id="foto"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto}
                      />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-lg font-black uppercase text-foreground">
                        {[profile.nome, profile.sobrenome].filter(Boolean).join(" ") || "Seu perfil"}
                      </p>
                      <p className="text-sm font-semibold text-muted-foreground">
                        {uploadingPhoto ? "Enviando foto..." : "Foto de perfil"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-[1.2rem] border-2 border-border bg-muted p-4">
                      <p className="text-xs font-black uppercase text-muted-foreground">Idade</p>
                      <p className="mt-2 text-lg font-black text-foreground">{idade !== null ? `${idade} anos` : "—"}</p>
                    </div>
                    <div className="rounded-[1.2rem] border-2 border-border bg-muted p-4">
                      <p className="text-xs font-black uppercase text-muted-foreground">Cidade / UF</p>
                      <p className="mt-2 text-lg font-black text-foreground">
                        {[profile.cidade, profile.estado].filter(Boolean).join(" / ") || "—"}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border-2 border-border bg-muted p-4">
                      <p className="text-xs font-black uppercase text-muted-foreground">Escolaridade</p>
                      <p className="mt-2 text-lg font-black text-foreground">{escolaridadeLabel || "—"}</p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-full border-2 border-border bg-primary text-primary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    disabled={loading}
                  >
                    {loading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="rounded-[2rem] border-4 border-border bg-white shadow-medium">
                  <CardHeader className="space-y-3 border-b-4 border-border bg-muted rounded-t-[1.7rem]">
                    <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase">
                      <User className="w-5 h-5" />
                      Informações Pessoais
                    </CardTitle>
                    <CardDescription className="font-semibold text-muted-foreground">
                      Mantenha seu perfil atualizado. Campos marcados com * são obrigatórios.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="nome" className="flex items-center gap-1">
                          Nome <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="nome"
                          className="h-12 rounded-2xl border-2 border-border bg-white"
                          value={profile.nome}
                          onChange={(e) => setProfile({ ...profile, nome: e.target.value })}
                          placeholder="Seu nome"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sobrenome" className="flex items-center gap-1">
                          Sobrenome <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="sobrenome"
                          className="h-12 rounded-2xl border-2 border-border bg-white"
                          value={profile.sobrenome}
                          onChange={(e) => setProfile({ ...profile, sobrenome: e.target.value })}
                          placeholder="Seu sobrenome"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="data_nascimento" className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Data de Nascimento <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="data_nascimento"
                          type="date"
                          className="h-12 rounded-2xl border-2 border-border bg-white"
                          value={profile.data_nascimento}
                          onChange={(e) => setProfile({ ...profile, data_nascimento: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="escolaridade" className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          Escolaridade <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={profile.escolaridade}
                          onValueChange={(value) => setProfile({ ...profile, escolaridade: value })}
                        >
                          <SelectTrigger className="h-12 rounded-2xl border-2 border-border bg-white">
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

                <Card className="rounded-[2rem] border-4 border-border bg-white shadow-medium">
                  <CardHeader className="space-y-3 border-b-4 border-border bg-muted rounded-t-[1.7rem]">
                    <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase">
                      <MapPin className="w-5 h-5" />
                      Localização e estudos
                    </CardTitle>
                    <CardDescription className="font-semibold text-muted-foreground">
                      Organize seus dados acadêmicos e localização em um bloco mais objetivo.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="curso" className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          O que está cursando <span className="text-muted-foreground text-sm">(opcional)</span>
                        </Label>
                        <Input
                          id="curso"
                          className="h-12 rounded-2xl border-2 border-border bg-white"
                          value={profile.curso}
                          onChange={(e) => setProfile({ ...profile, curso: e.target.value })}
                          placeholder="Ex: Direito, Medicina, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cidade" className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Cidade <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="cidade"
                          className="h-12 rounded-2xl border-2 border-border bg-white"
                          value={profile.cidade}
                          onChange={(e) => setProfile({ ...profile, cidade: e.target.value })}
                          placeholder="Sua cidade"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estado" className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Estado <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={profile.estado}
                          onValueChange={(value) => setProfile({ ...profile, estado: value })}
                        >
                          <SelectTrigger className="h-12 rounded-2xl border-2 border-border bg-white">
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
                      <div className="space-y-2">
                        <Label htmlFor="cargo_desejado" className="flex items-center gap-1">
                          Cargo / Concurso Desejado <span className="text-muted-foreground text-sm">(opcional)</span>
                        </Label>
                        <Input
                          id="cargo_desejado"
                          placeholder="Ex: Auditor Fiscal, ENEM, etc."
                          className="h-12 rounded-2xl border-2 border-border bg-white"
                          value={profile.cargo_desejado}
                          onChange={(e) => setProfile({ ...profile, cargo_desejado: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-4 border-border bg-white shadow-medium">
                  <CardHeader className="space-y-3 border-b-4 border-border bg-muted rounded-t-[1.7rem]">
                    <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase">
                      <Award className="w-5 h-5" />
                      Desempenho e objetivos
                    </CardTitle>
                    <CardDescription className="font-semibold text-muted-foreground">
                      Defina seus pontos fortes, fracos e a próxima prova.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="area_forte" className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          Matéria Forte <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="area_forte"
                          className="h-12 rounded-2xl border-2 border-border bg-white"
                          value={profile.area_forte}
                          onChange={(e) => setProfile({ ...profile, area_forte: e.target.value })}
                          placeholder="Ex: Matemática, Português, etc."
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="area_fraca" className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          Matéria Fraca <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="area_fraca"
                          className="h-12 rounded-2xl border-2 border-border bg-white"
                          value={profile.area_fraca}
                          onChange={(e) => setProfile({ ...profile, area_fraca: e.target.value })}
                          placeholder="Ex: História, Física, etc."
                          required
                        />
                      </div>
                    </div>

                  </CardContent>
                </Card>

              </div>
            </form>
          </TabsContent>

          <TabsContent value="conta">
            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="rounded-[2rem] border-4 border-border bg-white shadow-medium">
                <CardHeader className="space-y-3 border-b-4 border-border bg-muted rounded-t-[1.7rem]">
                  <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase">
                    <Mail className="w-5 h-5" />
                    Email da conta
                  </CardTitle>
                  <CardDescription className="font-semibold text-muted-foreground">
                    Revele seu email atual somente quando quiser e solicite a troca com confirmação no novo endereço.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="rounded-[1.2rem] border-2 border-border bg-muted p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase text-muted-foreground">Email atual</p>
                        <p className="mt-2 break-all text-base font-black text-foreground">
                          {showAccountEmail ? accountEmail || "—" : maskEmail(accountEmail)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAccountEmail((prev) => !prev)}
                        className="rounded-full border-2 border-border bg-white font-black uppercase"
                      >
                        {showAccountEmail ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                        {showAccountEmail ? "Ocultar" : "Revelar"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="novo-email" className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Novo email
                    </Label>
                    <Input
                      id="novo-email"
                      type="email"
                      className="h-12 rounded-2xl border-2 border-border bg-white"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="novoemail@exemplo.com"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={handleEmailUpdate}
                    disabled={updatingEmail}
                    className="w-full rounded-full border-2 border-border bg-primary text-primary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  >
                    {updatingEmail ? "Solicitando..." : "Trocar email"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-4 border-border bg-white shadow-medium">
                <CardHeader className="space-y-3 border-b-4 border-border bg-muted rounded-t-[1.7rem]">
                  <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase">
                    <Shield className="w-5 h-5" />
                    Segurança da conta
                  </CardTitle>
                  <CardDescription className="font-semibold text-muted-foreground">
                    Solicite um link seguro para trocar sua senha e gerencie o encerramento definitivo da conta.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-4 rounded-[1.5rem] border-2 border-border bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full border-2 border-border bg-[#f7cf3d] p-2">
                        <KeyRound className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase text-foreground">Trocar senha com segurança</p>
                        <p className="mt-1 text-sm font-semibold text-muted-foreground">
                          Enviaremos um link de redefinição para o email atual da conta.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePasswordReset}
                      disabled={sendingPasswordReset}
                      className="w-full rounded-full border-2 border-border bg-white font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    >
                      {sendingPasswordReset ? "Enviando..." : "Enviar link para trocar senha"}
                    </Button>
                  </div>

                  <div className="space-y-4 rounded-[1.5rem] border-2 border-destructive/30 bg-destructive/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full border-2 border-destructive bg-white p-2">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase text-foreground">Apagar conta</p>
                        <p className="mt-1 text-sm font-semibold text-muted-foreground">
                          Essa ação remove sua conta e você perderá todos os seus dados.
                        </p>
                      </div>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full rounded-full border-2 border-destructive bg-white font-black uppercase text-destructive"
                        >
                          Apagar conta
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border-4 border-border rounded-[1.8rem] bg-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-2xl font-black uppercase">Tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription className="font-semibold text-muted-foreground">
                            Se você apagar sua conta, perderá todos os seus dados, incluindo perfil, simulados, amizades e mensagens.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-full border-2 border-border font-black uppercase">
                            Voltar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="rounded-full border-2 border-border bg-destructive text-destructive-foreground font-black uppercase"
                            disabled={deletingAccount}
                          >
                            {deletingAccount ? "Apagando..." : "Sim, apagar conta"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="plano">
            <BillingOverview showPricing={false} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
