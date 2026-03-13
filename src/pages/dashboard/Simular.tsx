import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Questao {
  id: string;
  enunciado: string;
  alternativas: Record<string, string>;
  resposta_correta: string;
  explicacao: string | null;
  resposta_usuario: string | null;
  ordem: number;
}

interface Simulado {
  id: string;
  titulo: string;
  tema: string;
  materia: string;
  total_questoes: number;
  status: string;
  acertos: number;
  percentual_acerto: number | null;
}

interface SimuladoBlock {
  id: string;
  materia: string;
  tema: string;
  quantidade: number;
}

interface RawQuestao {
  id: string;
  enunciado: string;
  alternativas: Record<string, unknown> | null;
  resposta_correta: string;
  explicacao: string | null;
  resposta_usuario: string | null;
  ordem: number;
}

const normalizeAlternativas = (alternativas: Record<string, unknown> | null): Record<string, string> => {
  if (!alternativas || typeof alternativas !== "object" || Array.isArray(alternativas)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(alternativas).map(([key, value]) => [key, typeof value === "string" ? value : String(value ?? "")])
  );
};

const normalizeQuestao = (q: RawQuestao): Questao => ({
  id: q.id,
  enunciado: q.enunciado,
  alternativas: normalizeAlternativas(q.alternativas),
  resposta_correta: q.resposta_correta,
  explicacao: q.explicacao,
  resposta_usuario: q.resposta_usuario,
  ordem: q.ordem,
});

const buildSimuladoBlocks = (
  materias: string,
  temas: string,
  totalQuestoes: number
): SimuladoBlock[] => {
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

export default function Simular() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [simulado, setSimulado] = useState<Simulado | null>(null);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [finalizando, setFinalizando] = useState(false);
  const [resultado, setResultado] = useState<{ acertos: number; percentual: number } | null>(null);

  useEffect(() => {
    loadSimulado();
  }, [id]);

  const loadSimulado = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Carregar simulado
    const { data: simData, error: simError } = await supabase
      .from("simulados")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (simError || !simData) {
      toast.error("Simulado não encontrado");
      navigate("/dashboard/simulados");
      return;
    }

    setSimulado(simData);

    // Se já estiver concluído, mostrar resultado
    if (simData.status === "concluido") {
      calcularResultado(simData);
      setLoading(false);
      return;
    }

    // Carregar questões
    const { data: questData, error: questError } = await supabase
      .from("questoes")
      .select("*")
      .eq("simulado_id", id)
      .order("ordem", { ascending: true });

    if (questError) {
      toast.error("Erro ao carregar questões");
    } else {
      const questoesNormalizadas = (questData || []).map((q) => normalizeQuestao(q as RawQuestao));
      setQuestoes(questoesNormalizadas);
      // Carregar respostas já salvas
      const respostasSalvas: Record<string, string> = {};
      questoesNormalizadas.forEach((q) => {
        if (q.resposta_usuario) {
          respostasSalvas[q.id] = q.resposta_usuario;
        }
      });
      setRespostas(respostasSalvas);
    }

    setLoading(false);
  };

  const salvarResposta = async (questaoId: string, resposta: string) => {
    const { error } = await supabase
      .from("questoes")
      .update({ resposta_usuario: resposta })
      .eq("id", questaoId);

    if (error) {
      console.error("Erro ao salvar resposta:", error);
    }
  };

  const handleResposta = async (resposta: string) => {
    const questaoAtual = questoes[currentIndex];
    setRespostas({ ...respostas, [questaoAtual.id]: resposta });
    await salvarResposta(questaoAtual.id, resposta);
  };

  const proximaQuestao = () => {
    if (currentIndex < questoes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const questaoAnterior = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const finalizarSimulado = async () => {
    const naoRespondidas = questoes.filter(q => !respostas[q.id]).length;
    if (naoRespondidas > 0) {
      if (!confirm(`Você não respondeu ${naoRespondidas} questão(ões). Deseja finalizar mesmo assim?`)) {
        return;
      }
    }

    setFinalizando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Calcular acertos
    let acertos = 0;
    questoes.forEach(q => {
      if (respostas[q.id] === q.resposta_correta) {
        acertos++;
      }
    });

    const percentual = Math.round((acertos / questoes.length) * 100);

    // Atualizar simulado
    const { error } = await supabase
      .from("simulados")
      .update({
        status: "concluido",
        acertos: acertos,
        percentual_acerto: percentual,
        finished_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao finalizar simulado");
    } else {
      setResultado({ acertos, percentual });
      toast.success("Simulado finalizado!");
    }

    setFinalizando(false);
  };

  const calcularResultado = async (sim: Simulado) => {
    const { data: questData } = await supabase
      .from("questoes")
      .select("*")
      .eq("simulado_id", id)
      .order("ordem", { ascending: true });

    if (questData) {
      const questoesNormalizadas = questData.map((q) => normalizeQuestao(q as RawQuestao));
      setQuestoes(questoesNormalizadas);
      const respostasSalvas: Record<string, string> = {};
      questoesNormalizadas.forEach((q) => {
        if (q.resposta_usuario) {
          respostasSalvas[q.id] = q.resposta_usuario;
        }
      });
      setRespostas(respostasSalvas);
      setResultado({ 
        acertos: sim.acertos, 
        percentual: sim.percentual_acerto || 0 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="rounded-full border-4 border-border bg-[#f7cf3d] px-6 py-3 text-sm font-black uppercase text-foreground shadow-soft animate-pulse">
          Carregando...
        </div>
      </div>
    );
  }

  if (!simulado || questoes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-lg font-semibold text-muted-foreground">Nenhuma questão encontrada para este simulado.</p>
        <Button className="rounded-full border-2 border-border bg-primary text-primary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none" onClick={() => navigate("/dashboard/simulados")}>
          Voltar
        </Button>
      </div>
    );
  }

  // Mostrar resultado se finalizado
  if (resultado) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="rounded-[2rem] border-4 border-border bg-white shadow-strong">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto inline-flex rounded-full border-2 border-border bg-[#f7cf3d] px-4 py-2 text-xs font-black uppercase tracking-wide text-foreground shadow-soft">
              Resultado final
            </div>
            <CardTitle className="text-2xl font-black uppercase md:text-3xl">Simulado Concluído!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-5xl font-black text-primary md:text-6xl">
                {resultado.percentual}%
              </div>
              <p className="text-base font-semibold text-muted-foreground md:text-lg">
                {resultado.acertos} de {questoes.length} questões corretas
              </p>
            </div>

            <Progress value={resultado.percentual} className="h-4 border-2 border-border" />

            <div className="flex justify-center">
              {resultado.percentual >= 70 ? (
                <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border-2 border-border bg-secondary px-4 py-2 text-center text-base font-black text-secondary-foreground shadow-soft md:text-lg">
                  <CheckCircle className="w-6 h-6" />
                  Excelente resultado!
                </div>
              ) : resultado.percentual >= 50 ? (
                <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border-2 border-border bg-[#f7cf3d] px-4 py-2 text-center text-base font-black text-foreground shadow-soft md:text-lg">
                  <Clock className="w-6 h-6" />
                  Bom, mas pode melhorar!
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border-2 border-border bg-accent px-4 py-2 text-center text-base font-black text-accent-foreground shadow-soft md:text-lg">
                  <XCircle className="w-6 h-6" />
                  Continue estudando!
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t-4 border-border">
              <h3 className="text-lg font-black uppercase md:text-xl">Revisão das Questões</h3>
              {questoes.map((q, index) => {
                const acertou = respostas[q.id] === q.resposta_correta;
                return (
                  <Card key={q.id} className={`rounded-[1.5rem] border-4 shadow-soft ${acertou ? "border-secondary bg-secondary/10" : "border-accent bg-accent/10"}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        {acertou ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <p className="font-black uppercase">Questão {index + 1}</p>
                          <p className="text-sm font-semibold text-muted-foreground">{q.enunciado}</p>
                        </div>
                      </div>
                      <div className="space-y-1 pl-0 text-sm md:pl-8">
                        <p><span className="font-black">Sua resposta:</span> {respostas[q.id] || "Não respondida"} - {q.alternativas[respostas[q.id]] || "-"}</p>
                        <p><span className="font-black text-green-600">Resposta correta:</span> {q.resposta_correta} - {q.alternativas[q.resposta_correta]}</p>
                        {q.explicacao && (
                          <p className="text-muted-foreground mt-2 rounded-[1rem] border-2 border-border bg-white p-3 font-semibold">
                            <span className="font-black">Explicação:</span> {q.explicacao}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <Button 
                variant="outline" 
                className="flex-1 rounded-full border-2 border-border bg-white font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                onClick={() => navigate("/dashboard/simulados")}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar aos Simulados
              </Button>
              <Button 
                className="flex-1 rounded-full border-2 border-border bg-secondary text-secondary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                onClick={() => {
                  void (async () => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const { error } = await supabase
                      .from("posts_mural")
                      .insert({
                        user_id: user.id,
                        conteudo: `Concluí o simulado "${simulado.titulo}" em ${simulado.materia} com ${resultado.percentual}% de acerto (${resultado.acertos}/${questoes.length})!`,
                        tipo: "resultado",
                        simulado_id: simulado.id,
                      });

                    if (error) {
                      toast.error("Erro ao compartilhar no mural");
                      return;
                    }

                    toast.success("Compartilhado no mural!");
                    navigate("/dashboard/mural");
                  })();
                }}
              >
                Compartilhar no Mural
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const questaoAtual = questoes[currentIndex];
  const progresso = ((currentIndex + 1) / questoes.length) * 100;
  const totalRespondidas = Object.keys(respostas).length;
  const simuladoBlocks = buildSimuladoBlocks(
    simulado.materia,
    simulado.tema,
    simulado.total_questoes
  );
  const chunkedQuestionIndexes = Array.from(
    { length: Math.ceil(questoes.length / 10) },
    (_, chunkIndex) => questoes.slice(chunkIndex * 10, chunkIndex * 10 + 10).map((_, index) => chunkIndex * 10 + index)
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="inline-flex rounded-full border-2 border-border bg-[#f7cf3d] px-4 py-2 text-xs font-black uppercase tracking-wide text-foreground shadow-soft">
            Sessão ativa
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase md:text-3xl">{simulado.titulo}</h1>
            <div className="space-y-1 text-base font-semibold text-muted-foreground">
              {simuladoBlocks.map((block, index) => (
                <p key={block.id} className="leading-relaxed">
                  <span className="font-black text-foreground">Bloco {index + 1}:</span>{" "}
                  <span className="font-black text-foreground">Matéria:</span> {block.materia} •{" "}
                  <span className="font-black text-foreground">Assunto:</span> {block.tema}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-[1.5rem] border-4 border-border bg-white px-5 py-4 text-left shadow-soft md:text-right">
          <p className="text-sm font-black uppercase text-foreground">
            Questão {currentIndex + 1} de {questoes.length}
          </p>
          <p className="text-sm font-semibold text-muted-foreground">
            {totalRespondidas} respondidas
          </p>
        </div>
      </div>

      <Progress value={progresso} className="h-3 border-2 border-border" />

      <Card className="rounded-[2rem] border-4 border-border bg-white shadow-medium">
        <CardHeader>
          <CardTitle className="text-lg font-black leading-relaxed md:text-xl">
            {currentIndex + 1}. {questaoAtual.enunciado}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={respostas[questaoAtual.id] || ""}
            onValueChange={handleResposta}
            className="space-y-3"
          >
            {Object.entries(questaoAtual.alternativas).map(([letra, texto]) => (
              <div key={letra} className="cursor-pointer rounded-[1.2rem] border-2 border-border bg-white p-4 shadow-soft transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value={letra} id={`${questaoAtual.id}-${letra}`} />
                  <Label
                    htmlFor={`${questaoAtual.id}-${letra}`}
                    className="flex-1 cursor-pointer font-semibold"
                  >
                    <span className="font-black mr-2">{letra})</span>
                    {texto}
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Button
          variant="outline"
          className="rounded-full border-2 border-border bg-white font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          onClick={questaoAnterior}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <div className="flex-1 space-y-2">
          {chunkedQuestionIndexes.map((chunk, chunkIndex) => (
            <div key={`chunk-${chunkIndex}`} className="grid grid-cols-10 gap-2">
              {chunk.map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-10 w-full rounded-[0.9rem] border-2 border-border px-2 text-sm font-black transition-all shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${
                    index === currentIndex
                      ? "bg-primary text-primary-foreground"
                      : respostas[questoes[index].id]
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-white text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          ))}
        </div>

        {currentIndex < questoes.length - 1 ? (
          <Button className="rounded-full border-2 border-border bg-primary text-primary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none" onClick={proximaQuestao}>
            Próxima
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={finalizarSimulado}
            disabled={finalizando}
            className="rounded-full border-2 border-border bg-accent text-accent-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            {finalizando ? "Finalizando..." : "Finalizar"}
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
