import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Brain, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
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

export default function Simulados() {
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    tema: "",
    materia: "",
    banca: "",
    numQuestoes: "10"
  });

  useEffect(() => {
    loadSimulados();
  }, []);

  const loadSimulados = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("simulados")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar simulados");
    } else {
      setSimulados(data || []);
    }
  };

  const createSimulado = async () => {
    if (!formData.titulo || !formData.tema || !formData.materia) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Criar o simulado
      const { data: simulado, error: simuladoError } = await supabase
        .from("simulados")
        .insert({
          user_id: user.id,
          titulo: formData.titulo,
          tema: formData.tema,
          materia: formData.materia,
          total_questoes: parseInt(formData.numQuestoes),
          status: "em_andamento"
        })
        .select()
        .single();

      if (simuladoError) throw simuladoError;

      // Chamar edge function para gerar questões
      const { data: questoesData, error: questoesError } = await supabase.functions.invoke("gerar-questoes", {
        body: {
          simuladoId: simulado.id,
          tema: formData.tema,
          materia: formData.materia,
          banca: formData.banca,
          numQuestoes: parseInt(formData.numQuestoes)
        }
      });

      if (questoesError) throw questoesError;

      toast.success("Simulado criado com sucesso!");
      setDialogOpen(false);
      loadSimulados();
      setFormData({ titulo: "", tema: "", materia: "", banca: "", numQuestoes: "10" });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar simulado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Simulados</h1>
          <p className="text-muted-foreground mt-2">
            Pratique com questões geradas por IA
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-hero">
              <Plus className="w-4 h-4 mr-2" />
              Novo Simulado
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Simulado</DialogTitle>
              <DialogDescription>
                Configure seu simulado personalizado com IA
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título do Simulado</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Simulado ENEM 2024"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tema">Tema</Label>
                <Input
                  id="tema"
                  placeholder="Ex: Física, História, etc."
                  value={formData.tema}
                  onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="materia">Matéria</Label>
                <Input
                  id="materia"
                  placeholder="Ex: Mecânica, Brasil Colonial, etc."
                  value={formData.materia}
                  onChange={(e) => setFormData({ ...formData, materia: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banca">Banca (opcional)</Label>
                <Input
                  id="banca"
                  placeholder="Ex: ENEM, CESPE, FGV, etc."
                  value={formData.banca}
                  onChange={(e) => setFormData({ ...formData, banca: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numQuestoes">Número de Questões</Label>
                <Input
                  id="numQuestoes"
                  type="number"
                  min="5"
                  max="50"
                  value={formData.numQuestoes}
                  onChange={(e) => setFormData({ ...formData, numQuestoes: e.target.value })}
                />
              </div>
              <Button 
                className="w-full bg-gradient-hero" 
                onClick={createSimulado}
                disabled={loading}
              >
                {loading ? "Gerando..." : "Criar Simulado"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {simulados.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Brain className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Você ainda não tem simulados. Crie seu primeiro!
              </p>
            </CardContent>
          </Card>
        ) : (
          simulados.map((sim) => (
            <Card key={sim.id} className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{sim.titulo}</CardTitle>
                    <CardDescription>
                      {sim.tema} • {sim.materia}
                    </CardDescription>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    sim.status === 'concluido' 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {sim.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                      <div className="flex justify-between text-sm">
                        <span>Taxa de Acerto</span>
                        <span className="font-bold">{sim.percentual_acerto}%</span>
                      </div>
                      <Progress value={sim.percentual_acerto} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
