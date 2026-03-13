import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Brain, Plus, CheckCircle, Share2, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Simulado {
  id: string;
  titulo: string;
  tema: string;
  materia: string;
  status: string;
  total_questoes: number;
  acertos: number;
  percentual_acerto: number | null;
  created_at: string;
}

interface TopicGroup {
  id: string;
  tema: string;
  materia: string;
  quantidade: string;
}

interface Friend {
  id: string;
  nome: string;
  sobrenome: string;
}

interface FriendshipRow {
  user_id: string;
  amigo_id: string;
}

const ESCOLARIDADES = [
  { value: "fundamental", label: "Fundamental" },
  { value: "medio", label: "Médio" },
  { value: "superior", label: "Superior" },
];

const DIFICULDADES = [
  { value: "facil", label: "Fácil" },
  { value: "medio", label: "Médio" },
  { value: "dificil", label: "Difícil" },
];

const ESTILOS_PROVA = [
  { value: "cebraspe", label: "Cebraspe" },
  { value: "fgv", label: "Fundação Getulio Vargas" },
  { value: "fcc", label: "Fundação Carlos Chagas" },
  { value: "aocp", label: "Instituto AOCP" },
  { value: "oab", label: "OAB" },
  { value: "enem", label: "ENEM" },
];

const createEmptyTopicGroup = (): TopicGroup => ({
  id: crypto.randomUUID(),
  tema: "",
  materia: "",
  quantidade: "5",
});

const parseSimuladoItems = (value: string) =>
  Array.from(
    new Set(
      value
        .split("•")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );

const buildSimuladoBlocks = (
  materias: string,
  temas: string,
  totalQuestoes: number
) => {
  const parsedMaterias = materias
    .split("•")
    .map((item) => item.trim())
    .filter(Boolean);
  const parsedTemas = temas
    .split("•")
    .map((item) => item.trim())
    .filter(Boolean);

  const totalBlocks = Math.max(parsedMaterias.length, parsedTemas.length);

  return Array.from({ length: totalBlocks }, (_, index) => ({
    id: `${parsedMaterias[index] ?? ""}-${parsedTemas[index] ?? ""}-${index}`,
    materia: parsedMaterias[index] ?? "—",
    tema: parsedTemas[index] ?? "—",
    quantidade: totalBlocks === 1 ? totalQuestoes : 0,
  }));
};

const getOtherFriendId = (friendship: FriendshipRow, currentUserId: string) =>
  friendship.user_id === currentUserId ? friendship.amigo_id : friendship.user_id;

const buildChatShareMessage = (sim: Simulado, mode: "simulado" | "resultado") =>
  JSON.stringify({
    type: "shared_simulado",
    shareMode: mode,
    simulado: {
      id: sim.id,
      titulo: sim.titulo,
      tema: sim.tema,
      materia: sim.materia,
      total_questoes: sim.total_questoes,
      percentual_acerto: sim.percentual_acerto,
    },
    text: mode === "resultado"
      ? `Concluí o simulado "${sim.titulo}" em ${sim.materia} com ${sim.percentual_acerto ?? 0}% de acerto!`
      : `Compartilhei o simulado "${sim.titulo}" de ${sim.materia} para você testar também.`,
  });

export default function Simulados() {
  const navigate = useNavigate();
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [loading, setLoading] = useState(false);
  const [generationStage, setGenerationStage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareTarget, setShareTarget] = useState<"mural" | "chat" | "ambos">("mural");
  const [shareMode, setShareMode] = useState<"simulado" | "resultado">("simulado");
  const [shareSimulado, setShareSimulado] = useState<Simulado | null>(null);
  const [shareFriendId, setShareFriendId] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [formData, setFormData] = useState({
    titulo: "",
    escolaridade: "",
    dificuldade: "",
    banca: "",
    topicGroups: [createEmptyTopicGroup()],
  });

  const totalQuestoes = formData.topicGroups.reduce((total, group) => {
    const quantidade = Number.parseInt(group.quantidade, 10);
    return total + (Number.isNaN(quantidade) ? 0 : quantidade);
  }, 0);

  useEffect(() => {
    loadSimulados();
  }, []);

  useEffect(() => {
    void loadFriends();
  }, []);

  const buildShareMessage = (sim: Simulado, mode: "simulado" | "resultado") =>
    mode === "resultado"
      ? `Concluí o simulado "${sim.titulo}" em ${sim.materia} com ${sim.percentual_acerto ?? 0}% de acerto!`
      : `Compartilhei o simulado "${sim.titulo}" de ${sim.materia} para você testar também.`;

  const loadFriends = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("amizades")
      .select("user_id, amigo_id")
      .eq("status", "aceito")
      .or(`user_id.eq.${user.id},amigo_id.eq.${user.id}`);

    if (error) {
      return;
    }

    const friendships = (data ?? []) as FriendshipRow[];
    const friendIds = Array.from(new Set(friendships.map((friendship) => getOtherFriendId(friendship, user.id))));

    if (friendIds.length === 0) {
      setFriends([]);
      return;
    }

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, nome, sobrenome")
      .in("id", friendIds);

    if (profilesError) {
      return;
    }

    setFriends((profiles ?? []) as Friend[]);
  };

  const openShareDialog = (
    sim: Simulado,
    event: React.MouseEvent<HTMLButtonElement>,
    shareMode: "simulado" | "resultado"
  ) => {
    event.stopPropagation();
    setShareSimulado(sim);
    setShareMode(shareMode);
    setShareTarget("mural");
    setShareFriendId("");
    setShareDialogOpen(true);
  };

  const handleShareSubmit = async () => {
    if (!shareSimulado) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if ((shareTarget === "chat" || shareTarget === "ambos") && !shareFriendId) {
      toast.error("Selecione um amigo para compartilhar no chat");
      return;
    }

    setShareLoading(true);

    const message = buildShareMessage(shareSimulado, shareMode);
    let muralShared = false;
    let chatShared = false;

    if (shareTarget === "mural" || shareTarget === "ambos") {
      const { error } = await supabase
        .from("posts_mural")
        .insert({
          user_id: user.id,
          conteudo: message,
          tipo: shareMode,
          simulado_id: shareSimulado.id,
        });

      if (error) {
        setShareLoading(false);
        toast.error("Erro ao compartilhar no mural");
        return;
      }

      muralShared = true;
    }

    if (shareTarget === "chat" || shareTarget === "ambos") {
      const chatMessage = buildChatShareMessage(shareSimulado, shareMode);
      const { error } = await supabase
        .from("mensagens")
        .insert({
          remetente_id: user.id,
          destinatario_id: shareFriendId,
          mensagem: chatMessage,
        });

      if (error) {
        setShareLoading(false);
        toast.error("Erro ao compartilhar no chat");
        return;
      }

      chatShared = true;
    }

    setShareLoading(false);
    setShareDialogOpen(false);
    setShareFriendId("");

    if (muralShared && chatShared) {
      toast.success("Compartilhado no mural e no chat!");
      return;
    }

    if (muralShared) {
      toast.success("Compartilhado no mural!");
      navigate("/dashboard/mural");
      return;
    }

    if (chatShared) {
      toast.success("Compartilhado no chat!");
      navigate(`/dashboard/chat?friend=${shareFriendId}`);
    }
  };

  const deleteSimulado = (simId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    void (async () => {
      event.stopPropagation();

      if (!confirm("Deseja realmente excluir este simulado?")) {
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("simulados")
        .delete()
        .eq("id", simId)
        .eq("user_id", user.id)
        .select("id");

      if (error) {
        toast.error("Erro ao excluir simulado");
        return;
      }

      if (!data || data.length === 0) {
        toast.error("O simulado não foi excluído no servidor");
        void loadSimulados();
        return;
      }

      setSimulados((current) => current.filter((sim) => sim.id !== simId));
      toast.success("Simulado excluído!");
    })();
  };

  const loadSimulados = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("simulados")
      .select("id, titulo, tema, materia, status, total_questoes, acertos, percentual_acerto, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar simulados");
    } else {
      setSimulados(data || []);
    }
  };

  const addTopicGroup = () => {
    setFormData((current) => ({
      ...current,
      topicGroups: [...current.topicGroups, createEmptyTopicGroup()],
    }));
  };

  const removeTopicGroup = (groupId: string) => {
    setFormData((current) => ({
      ...current,
      topicGroups: current.topicGroups.length === 1
        ? current.topicGroups
        : current.topicGroups.filter((group) => group.id !== groupId),
    }));
  };

  const updateTopicGroup = (groupId: string, field: keyof Omit<TopicGroup, "id">, value: string) => {
    setFormData((current) => ({
      ...current,
      topicGroups: current.topicGroups.map((group) =>
        group.id === groupId
          ? { ...group, [field]: value }
          : group
      ),
    }));
  };

  const createSimulado = async () => {
    const validTopicGroups = formData.topicGroups.filter(
      (group) =>
        group.tema.trim() &&
        group.materia.trim() &&
        Number.parseInt(group.quantidade, 10) > 0
    );

    if (!formData.titulo || !formData.escolaridade || !formData.dificuldade || validTopicGroups.length === 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (validTopicGroups.length !== formData.topicGroups.length) {
      toast.error("Preencha corretamente todos os blocos de assunto, matéria e quantidade");
      return;
    }

    if (totalQuestoes < 5 || totalQuestoes > 50) {
      toast.error("O total de questões deve ficar entre 5 e 50");
      return;
    }

    setLoading(true);
    setGenerationStage("Preparando seu simulado...");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      setGenerationStage("Validando seu acesso...");
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("subscription_status, trial_ends_at")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) {
        toast.error("Perfil não encontrado");
        return;
      }

      // Check if trial has expired or payment failed
      if (profile.subscription_status === "trial" && profile.trial_ends_at) {
        const trialEndDate = new Date(profile.trial_ends_at);
        if (new Date() > trialEndDate) {
          toast.error("Seu período de teste expirou. Atualize seu plano para continuar.");
          navigate("/dashboard/perfil");
          return;
        }
      } else if (profile.subscription_status === "past_due") {
        toast.error("Seu pagamento foi recusado. Atualize seu método de pagamento para continuar.");
        navigate("/dashboard/perfil");
        return;
      } else if (profile.subscription_status === "cancelled") {
        toast.error("Sua assinatura foi cancelada. Assine novamente para continuar.");
        navigate("/dashboard/perfil");
        return;
      }

      // Criar o simulado
      setGenerationStage("Montando a estrutura do simulado...");
      const { data: simulado, error: simuladoError } = await supabase
        .from("simulados")
        .insert({
          user_id: user.id,
          titulo: formData.titulo,
          tema: validTopicGroups.map((group) => group.tema.trim()).join(" • "),
          materia: validTopicGroups.map((group) => group.materia.trim()).join(" • "),
          total_questoes: totalQuestoes,
          status: "em_andamento"
        })
        .select("id, titulo, tema, materia, status, total_questoes, acertos, percentual_acerto, created_at")
        .single();

      if (simuladoError) throw simuladoError;

      // Chamar edge function para gerar questões
      setDialogOpen(false);
      setGenerationStage("Gerando questões com IA...");
      const { data: questoesData, error: questoesError } = await supabase.functions.invoke("gerar-questoes", {
        body: {
          simuladoId: simulado.id,
          titulo: formData.titulo,
          escolaridade: formData.escolaridade,
          dificuldade: formData.dificuldade,
          banca: formData.banca,
          numQuestoes: totalQuestoes,
          topicGroups: validTopicGroups.map((group) => ({
            tema: group.tema.trim(),
            materia: group.materia.trim(),
            quantidade: Number.parseInt(group.quantidade, 10),
          })),
          userId: user.id
        }
      });

      if (questoesError) throw questoesError;

      toast.success("Simulado criado com sucesso!");
      setFormData({
        titulo: "",
        escolaridade: "",
        dificuldade: "",
        banca: "",
        topicGroups: [createEmptyTopicGroup()],
      });
      navigate(`/dashboard/simular/${simulado.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar simulado");
    } finally {
      setGenerationStage("");
      setLoading(false);
    }
  };

  if (loading && generationStage) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="w-full max-w-2xl rounded-[2rem] border-4 border-border bg-white shadow-strong">
          <CardContent className="flex flex-col items-center gap-6 p-8 text-center md:p-10">
            <div className="inline-flex rounded-full border-2 border-border bg-[#f7cf3d] px-4 py-2 text-xs font-black uppercase tracking-wide text-foreground shadow-soft">
              Criando simulado
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black uppercase md:text-3xl">Estamos elaborando sua prova</h2>
              <p className="text-base font-semibold text-muted-foreground md:text-lg">
                {generationStage}
              </p>
            </div>
            <div className="w-full space-y-3">
              <Progress value={75} className="h-4 border-2 border-border" />
              <p className="text-sm font-semibold text-muted-foreground">
                Isso pode levar alguns segundos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="inline-flex rounded-full border-2 border-border bg-[#f7cf3d] px-4 py-2 text-xs font-black uppercase tracking-wide text-foreground shadow-soft">
            Biblioteca de prática
          </div>
          <h1 className="text-4xl font-black uppercase">Simulados</h1>
          <p className="text-lg font-semibold text-muted-foreground">
            Pratique com questões geradas por IA
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full border-2 border-border bg-primary text-primary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
              <Plus className="w-4 h-4 mr-2" />
              Novo Simulado
            </Button>
          </DialogTrigger>
          <DialogContent className="flex max-h-[90svh] flex-col overflow-hidden rounded-[2rem] border-4 border-border bg-white shadow-strong sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase">Criar Novo Simulado</DialogTitle>
              <DialogDescription className="font-semibold text-muted-foreground">
                Configure seu simulado personalizado com IA
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 space-y-4 overflow-y-auto py-4 pr-1">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título do Simulado</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Simulado ENEM 2024"
                  className="h-12 rounded-2xl border-2 border-border bg-white"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Escolaridade</Label>
                  <Select value={formData.escolaridade} onValueChange={(value) => setFormData({ ...formData, escolaridade: value })}>
                    <SelectTrigger className="h-12 rounded-2xl border-2 border-border bg-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESCOLARIDADES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nível de dificuldade</Label>
                  <Select value={formData.dificuldade} onValueChange={(value) => setFormData({ ...formData, dificuldade: value })}>
                    <SelectTrigger className="h-12 rounded-2xl border-2 border-border bg-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFICULDADES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Estilo da prova (opcional)</Label>
                <Select value={formData.banca} onValueChange={(value) => setFormData({ ...formData, banca: value })}>
                  <SelectTrigger className="h-12 rounded-2xl border-2 border-border bg-white">
                    <SelectValue placeholder="Selecione o estilo da prova" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTILOS_PROVA.map((item) => (
                      <SelectItem key={item.value} value={item.label}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3 rounded-[1.5rem] border-2 border-border bg-muted p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label>Distribuição das questões por assunto e matéria</Label>
                    <p className="text-sm font-semibold text-muted-foreground">
                      Adicione um ou mais blocos e defina quantas questões cada um deve ter.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTopicGroup}
                    className="rounded-full border-2 border-border bg-white font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar bloco
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.topicGroups.map((group, index) => (
                    <div key={group.id} className="rounded-[1.25rem] border-2 border-border bg-white p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-black uppercase">Bloco {index + 1}</p>
                        {formData.topicGroups.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeTopicGroup(group.id)}
                            className="rounded-full border-2 border-border bg-white font-black uppercase shadow-soft hover:bg-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor={`tema-${group.id}`}>Assunto</Label>
                          <Input
                            id={`tema-${group.id}`}
                            placeholder="Ex: Física"
                            className="h-12 rounded-2xl border-2 border-border bg-white"
                            value={group.tema}
                            onChange={(e) => updateTopicGroup(group.id, "tema", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`materia-${group.id}`}>Matéria</Label>
                          <Input
                            id={`materia-${group.id}`}
                            placeholder="Ex: Mecânica"
                            className="h-12 rounded-2xl border-2 border-border bg-white"
                            value={group.materia}
                            onChange={(e) => updateTopicGroup(group.id, "materia", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`quantidade-${group.id}`}>Número de questões</Label>
                          <Input
                            id={`quantidade-${group.id}`}
                            type="number"
                            min="1"
                            max="50"
                            className="h-12 rounded-2xl border-2 border-border bg-white"
                            value={group.quantidade}
                            onChange={(e) => updateTopicGroup(group.id, "quantidade", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-[1rem] border-2 border-border bg-[#f7cf3d] px-4 py-3 text-sm font-black uppercase text-foreground">
                  Total de questões: {totalQuestoes}
                </div>
              </div>
              <Button 
                className="w-full rounded-full border-2 border-border bg-accent text-accent-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none" 
                onClick={createSimulado}
                disabled={loading}
              >
                {loading ? "Gerando..." : "Criar Simulado"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {simulados.length === 0 ? (
          <Card className="rounded-[2rem] border-4 border-border bg-white shadow-medium">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Brain className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-center text-base font-semibold text-muted-foreground">
                Você ainda não tem simulados. Crie seu primeiro!
              </p>
            </CardContent>
          </Card>
        ) : (
          simulados.map((sim) => (
            <Card
              key={sim.id}
              className="cursor-pointer rounded-[2rem] border-4 border-border bg-white shadow-medium transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
              onClick={() => navigate(`/dashboard/simular/${sim.id}`)}
            >
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <CardTitle className="text-xl font-black uppercase">{sim.titulo}</CardTitle>
                    <div className="space-y-2 font-semibold text-muted-foreground">
                      {buildSimuladoBlocks(sim.materia, sim.tema, sim.total_questoes).map((block, index) => (
                        <CardDescription
                          key={`${sim.id}-${block.id}`}
                          className="break-words text-sm leading-relaxed"
                        >
                          <span className="font-black text-foreground">Bloco {index + 1}:</span>{" "}
                          <span className="font-black text-foreground">Matéria:</span> {block.materia},{" "}
                          <span className="font-black text-foreground">Assunto:</span> {block.tema}
                        </CardDescription>
                      ))}
                    </div>
                  </div>
                  <div className={`w-fit rounded-full border-2 border-border px-3 py-1 text-xs font-black uppercase ${
                    sim.status === 'concluido' 
                      ? 'bg-secondary text-secondary-foreground' 
                      : 'bg-[#f7cf3d] text-foreground'
                  }`}>
                    {sim.status === 'concluido' ? 'Concluído' : 'Não concluído'}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Brain className="w-4 h-4" />
                      {sim.total_questoes} questões
                    </div>
                    {sim.status === 'concluido' && (
                      <>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {sim.acertos} acertos
                        </div>
                        <div className="flex items-center gap-1">
                          <XCircle className="w-4 h-4 text-red-500" />
                          {sim.total_questoes - sim.acertos} erros
                        </div>
                      </>
                    )}
                  </div>
                  {sim.percentual_acerto !== null && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Taxa de Acerto</span>
                        <span className="font-black">{sim.percentual_acerto}%</span>
                      </div>
                      <Progress value={sim.percentual_acerto} className="h-3 border-2 border-border" />
                    </div>
                  )}
                  <div className="grid gap-2 md:grid-cols-2">
                    <Button
                      variant="outline"
                      className="h-auto min-h-12 w-full whitespace-normal break-words px-4 py-3 text-center leading-tight rounded-full border-2 border-border bg-white font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                      onClick={(event) => openShareDialog(sim, event, "simulado")}
                    >
                      <span className="flex items-center justify-center gap-2 text-center">
                        <Share2 className="h-4 w-4 shrink-0" />
                        <span className="break-words">Compartilhar simulado</span>
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      disabled={sim.status !== "concluido"}
                      className="h-auto min-h-12 w-full whitespace-normal break-words px-4 py-3 text-center leading-tight rounded-full border-2 border-border bg-white font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={(event) => openShareDialog(sim, event, "resultado")}
                    >
                      <span className="flex items-center justify-center gap-2 text-center">
                        <Share2 className="h-4 w-4 shrink-0" />
                        <span className="break-words">
                          {sim.status === "concluido" ? "Compartilhar resultado" : "Resultado indisponível"}
                        </span>
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-full border-2 border-border bg-white font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none md:col-span-2"
                      onClick={(event) => deleteSimulado(sim.id, event)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir simulado
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="rounded-[2rem] border-4 border-border bg-white shadow-strong sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase">Compartilhar</DialogTitle>
            <DialogDescription className="font-semibold text-muted-foreground">
              Escolha onde você quer compartilhar este {shareMode === "resultado" ? "resultado" : "simulado"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-black uppercase">Destino</Label>
              <RadioGroup
                value={shareTarget}
                onValueChange={(value) => setShareTarget(value as "mural" | "chat" | "ambos")}
                className="gap-3"
              >
                <label className="flex items-center gap-3 rounded-[1.2rem] border-2 border-border bg-white p-3 font-semibold">
                  <RadioGroupItem value="mural" />
                  <span>Mural</span>
                </label>
                <label className="flex items-center gap-3 rounded-[1.2rem] border-2 border-border bg-white p-3 font-semibold">
                  <RadioGroupItem value="chat" />
                  <span>Chat</span>
                </label>
                <label className="flex items-center gap-3 rounded-[1.2rem] border-2 border-border bg-white p-3 font-semibold">
                  <RadioGroupItem value="ambos" />
                  <span>Mural e Chat</span>
                </label>
              </RadioGroup>
            </div>

            {(shareTarget === "chat" || shareTarget === "ambos") && (
              <div className="space-y-2">
                <Label className="text-sm font-black uppercase">Amigo</Label>
                <Select value={shareFriendId} onValueChange={setShareFriendId}>
                  <SelectTrigger className="h-12 rounded-2xl border-2 border-border bg-white">
                    <SelectValue placeholder={friends.length > 0 ? "Selecione um amigo" : "Nenhum amigo disponível"} />
                  </SelectTrigger>
                  <SelectContent>
                    {friends.map((friend) => (
                      <SelectItem key={friend.id} value={friend.id}>
                        {friend.nome} {friend.sobrenome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-2 border-border bg-white font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                onClick={() => setShareDialogOpen(false)}
                disabled={shareLoading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="rounded-full border-2 border-border bg-primary text-primary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                onClick={handleShareSubmit}
                disabled={shareLoading}
              >
                {shareLoading ? "Compartilhando..." : "Confirmar compartilhamento"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
