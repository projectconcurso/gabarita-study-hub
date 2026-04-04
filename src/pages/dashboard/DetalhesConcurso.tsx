import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Clock, FileText, Play, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  buscarConcurso,
  listarMateriasConcurso,
  listarAssuntosMateria,
  buscarProgressoAssunto,
  buscarApostila,
  calcularProgressoMateria,
  listarSimuladosVinculados,
  contarSimuladosAssunto,
} from "@/lib/meus-estudos";
import type { Concurso, MateriaConcurso, AssuntoMateria, ProgressoEstudos, Apostila } from "@/types/meus-estudos";
import { getBgProgresso, getBorderProgresso, getCorProgresso } from "@/types/meus-estudos";
import { formatarDataProva, formatarTempoEstudo } from "@/lib/meus-estudos";
import { GerarApostilaDialog } from "@/components/meus-estudos/GerarApostilaDialog";
import { VisualizarApostilaDialog } from "@/components/meus-estudos/VisualizarApostilaDialog";
import { ListarSimuladosDialog } from "@/components/meus-estudos/ListarSimuladosDialog";
import { TempoEstudoCard } from "@/components/meus-estudos/TempoEstudoCard";

interface AssuntoComDados extends AssuntoMateria {
  progresso: ProgressoEstudos | null;
  apostila: Apostila | null;
  totalSimulados: number;
}

interface MateriaComDados extends MateriaConcurso {
  assuntos: AssuntoComDados[];
  progressoMateria: number;
}

export default function DetalhesConcurso() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [concurso, setConcurso] = useState<Concurso | null>(null);
  const [materias, setMaterias] = useState<MateriaComDados[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [assuntoSelecionado, setAssuntoSelecionado] = useState<AssuntoComDados | null>(null);
  const [materiaSelecionada, setMateriaSelecionada] = useState<MateriaConcurso | null>(null);
  const [dialogGerarOpen, setDialogGerarOpen] = useState(false);
  const [dialogVisualizarOpen, setDialogVisualizarOpen] = useState(false);
  const [dialogSimuladosOpen, setDialogSimuladosOpen] = useState(false);
  const [simuladosAssunto, setSimuladosAssunto] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const concursoData = await buscarConcurso(id);
      setConcurso(concursoData);

      const materiasData = await listarMateriasConcurso(id);
      
      const materiasComDados: MateriaComDados[] = [];
      for (const materia of materiasData) {
        const assuntos = await listarAssuntosMateria(materia.id);
        
        const assuntosComDados: AssuntoComDados[] = [];
        for (const assunto of assuntos) {
          const progresso = await buscarProgressoAssunto(user.id, assunto.id);
          const apostila = await buscarApostila(assunto.id);
          const totalSimulados = await contarSimuladosAssunto(user.id, materia.nome, assunto.nome, assunto.id);
          assuntosComDados.push({ ...assunto, progresso, apostila, totalSimulados });
        }

        const progressoMateria = await calcularProgressoMateria(user.id, materia.id);
        materiasComDados.push({ ...materia, assuntos: assuntosComDados, progressoMateria });
      }

      setMaterias(materiasComDados);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar concurso");
    } finally {
      setLoading(false);
    }
  };

  const handleGerarApostila = (assunto: AssuntoComDados, materia: MateriaConcurso) => {
    setAssuntoSelecionado(assunto);
    setMateriaSelecionada(materia);
    setDialogGerarOpen(true);
  };

  const handleVisualizarApostila = (assunto: AssuntoComDados) => {
    console.log('📖 Abrindo apostila:', assunto);
    console.log('📄 Dados da apostila:', assunto.apostila);
    
    if (!assunto.apostila) {
      toast.error("Apostila não encontrada");
      return;
    }
    
    setAssuntoSelecionado(assunto);
    setDialogVisualizarOpen(true);
  };

  const handleCriarSimulado = (assunto: AssuntoComDados, materia: MateriaConcurso) => {
    const params = new URLSearchParams({
      concurso_id: concurso!.id,
      materia_id: materia.id,
      assunto_id: assunto.id,
      escolaridade: concurso!.escolaridade || "medio",
      materia_nome: materia.nome,
      assunto_nome: assunto.nome,
    });
    navigate(`/dashboard/simulados?${params.toString()}`);
  };

  const handleVerSimulados = async (assunto: AssuntoComDados, materia: MateriaConcurso) => {
    try {
      const simulados = await listarSimuladosVinculados(
        userId,
        materia.nome,
        assunto.nome,
        assunto.id
      );
      
      if (simulados && simulados.length > 0) {
        setAssuntoSelecionado(assunto);
        setMateriaSelecionada(materia);
        setSimuladosAssunto(simulados);
        setDialogSimuladosOpen(true);
      } else {
        toast.info("Nenhum simulado encontrado para este assunto");
      }
    } catch (error) {
      console.error("Erro ao buscar simulados:", error);
      toast.error("Erro ao buscar simulados");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="rounded-full border-4 border-border bg-[#f7cf3d] px-6 py-3 text-sm font-black uppercase text-foreground shadow-soft animate-pulse">
          Carregando...
        </div>
      </div>
    );
  }

  if (!concurso) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/meu-cronograma")}
          className="rounded-full border-2 border-border font-bold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Card className="rounded-[2rem] border-4 border-border bg-white shadow-medium">
          <CardContent className="py-12 text-center">
            <p className="text-lg font-semibold text-muted-foreground">Concurso não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/meu-cronograma")}
          className="rounded-full border-2 border-border font-bold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      <div className="space-y-3">
        <div className="inline-flex rounded-full border-2 border-border bg-[#f7cf3d] px-4 py-2 text-xs font-black uppercase tracking-wide text-foreground shadow-soft">
          Plano de Estudos
        </div>
        <h1 className="text-4xl font-black uppercase">{concurso.nome}</h1>
        {concurso.data_prova && (
          <p className="text-lg font-semibold text-muted-foreground">
            📅 {formatarDataProva(concurso.data_prova)}
          </p>
        )}
        {concurso.descricao && (
          <p className="text-base font-medium text-muted-foreground">{concurso.descricao}</p>
        )}
      </div>

      {/* Card de Tempo de Estudo */}
      <TempoEstudoCard userId={userId} concurso={concurso} />

      <div className="space-y-6">
        {materias.map((materia) => (
          <Card key={materia.id} className="rounded-[2rem] border-4 border-border bg-white shadow-medium">
            <CardHeader>
              <div className="space-y-3">
                <CardTitle className="text-2xl font-black uppercase">{materia.nome}</CardTitle>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>Progresso da Matéria</span>
                    <span className={`font-black ${getCorProgresso(materia.progressoMateria)}`}>
                      {materia.progressoMateria.toFixed(0)}%
                    </span>
                  </div>
                  <div className={`h-3 w-full overflow-hidden rounded-full border-2 ${getBorderProgresso(materia.progressoMateria)} ${getBgProgresso(materia.progressoMateria)}`}>
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                      style={{ width: `${materia.progressoMateria}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {materia.assuntos.map((assunto) => {
                const percentual = assunto.progresso?.percentual_conclusao || 0;
                const temApostila = !!assunto.apostila;
                const apostilaLida = assunto.progresso?.apostila_lida || false;
                const simuladosConcluidos = assunto.progresso?.simulados_concluidos || 0;
                const tempoEstudo = assunto.progresso?.tempo_estudo_segundos || 0;

                return (
                  <div
                    key={assunto.id}
                    className="space-y-3 rounded-[1.5rem] border-2 border-border bg-muted p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <h4 className="text-lg font-black uppercase">{assunto.nome}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                          {temApostila && (
                            <span className={`flex items-center gap-1 ${apostilaLida ? 'text-green-600' : 'text-blue-600'}`}>
                              <BookOpen className="w-3 h-3" />
                              {apostilaLida ? 'Resumo lido' : 'Resumo disponível'}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {simuladosConcluidos} simulado{simuladosConcluidos !== 1 ? 's' : ''}
                          </span>
                          {tempoEstudo > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatarTempoEstudo(tempoEstudo)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${getBorderProgresso(percentual)} ${getBgProgresso(percentual)}`}>
                        <span className={`text-sm font-black ${getCorProgresso(percentual)}`}>
                          {percentual.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {!temApostila ? (
                        <Button
                          size="sm"
                          onClick={() => handleGerarApostila(assunto, materia)}
                          className="rounded-full border-2 border-border bg-[#f7cf3d] text-foreground font-bold shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                        >
                          <BookOpen className="w-4 h-4 mr-1" />
                          Gerar Resumo (5 Gabaritos)
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVisualizarApostila(assunto)}
                          className="rounded-full border-2 border-border font-bold"
                        >
                          <BookOpen className="w-4 h-4 mr-1" />
                          {apostilaLida ? 'Revisar Resumo' : 'Ler Resumo'}
                        </Button>
                      )}

                      {assunto.totalSimulados > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerSimulados(assunto, materia)}
                          className="rounded-full border-2 border-border font-bold"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Ver Simulados ({assunto.totalSimulados})
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCriarSimulado(assunto, materia)}
                        className="rounded-full border-2 border-border font-bold"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Criar Simulado
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {assuntoSelecionado && materiaSelecionada && (
        <GerarApostilaDialog
          open={dialogGerarOpen}
          onOpenChange={setDialogGerarOpen}
          userId={userId}
          assuntoId={assuntoSelecionado.id}
          nomeAssunto={assuntoSelecionado.nome}
          nomeMateria={materiaSelecionada.nome}
          onSuccess={loadData}
        />
      )}
      
      {assuntoSelecionado && (
        <VisualizarApostilaDialog
          open={dialogVisualizarOpen}
          onOpenChange={setDialogVisualizarOpen}
          userId={userId}
          assunto={assuntoSelecionado}
          onMarcarLida={loadData}
        />
      )}

      {assuntoSelecionado && materiaSelecionada && (
        <ListarSimuladosDialog
          open={dialogSimuladosOpen}
          onOpenChange={setDialogSimuladosOpen}
          simulados={simuladosAssunto}
          assuntoNome={assuntoSelecionado.nome}
          materiaNome={materiaSelecionada.nome}
        />
      )}
    </div>
  );
}
