import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { buscarApostila, marcarApostilaComoLida, buscarAssunto } from "@/lib/meus-estudos";
import { supabase } from "@/integrations/supabase/client";
import type { Apostila, AssuntoMateria } from "@/types/meus-estudos";
import ReactMarkdown from "react-markdown";
import { useStudyTimer } from "@/hooks/useStudyTimer";
import "../print-styles.css";

export default function VisualizarApostila() {
  const { assuntoId } = useParams<{ assuntoId: string }>();
  const navigate = useNavigate();
  const [apostila, setApostila] = useState<Apostila | null>(null);
  const [assunto, setAssunto] = useState<AssuntoMateria | null>(null);
  const [loading, setLoading] = useState(true);
  const [marcandoLida, setMarcandoLida] = useState(false);
  const [apostilaLida, setApostilaLida] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [isPageActive, setIsPageActive] = useState(true);

  // Hook do cronômetro automático
  const { isRunning, formattedTime } = useStudyTimer({
    userId,
    assuntoId: assuntoId || "",
    tipo: "apostila",
    isActive: isPageActive && !!assuntoId && !!userId,
  });

  useEffect(() => {
    loadData();
  }, [assuntoId]);

  // Detecta quando usuário sai da página (perde foco)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageActive(!document.hidden);
    };

    const handleBeforeUnload = () => {
      setIsPageActive(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const loadData = async () => {
    if (!assuntoId) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);

      const [apostilaData, assuntoData] = await Promise.all([
        buscarApostila(assuntoId),
        buscarAssunto(assuntoId),
      ]);

      setApostila(apostilaData);
      setAssunto(assuntoData);

      // Verificar se apostila foi lida
      const { data: progresso } = await supabase
        .from("progresso_estudos")
        .select("apostila_lida")
        .eq("user_id", user.id)
        .eq("assunto_id", assuntoId)
        .single();

      setApostilaLida(progresso && (progresso as any).apostila_lida ? (progresso as any).apostila_lida : false);
    } catch (error) {
      console.error("Erro ao carregar apostila:", error);
      toast.error("Erro ao carregar resumo");
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarComoLida = async () => {
    if (!assuntoId) return;

    try {
      setMarcandoLida(true);
      await marcarApostilaComoLida(userId, assuntoId);
      setApostilaLida(true);
      toast.success("Resumo marcado como lido! Progresso atualizado.");
    } catch (error) {
      console.error("Erro ao marcar apostila como lida:", error);
      toast.error("Erro ao marcar resumo como lido");
    } finally {
      setMarcandoLida(false);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleExportarPDF = () => {
    // Trigger print dialog que permite salvar como PDF
    window.print();
    toast.success("Use a opção 'Salvar como PDF' na janela de impressão");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-muted-foreground">Carregando resumo...</p>
        </div>
      </div>
    );
  }

  if (!apostila || !assunto) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-muted-foreground">Resumo não encontrado</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header - Oculto na impressão */}
      <div className="print:hidden sticky top-[60px] lg:top-0 z-20 border-b-4 border-border bg-white shadow-medium">
        <div className="px-4 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="rounded-full border-2 border-border font-bold shrink-0"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg lg:text-2xl font-black uppercase truncate">{assunto.nome}</h1>
                <p className="text-xs lg:text-sm font-semibold text-muted-foreground hidden sm:block">
                  Material de estudo gerado por IA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Cronômetro Automático */}
              <div className="flex items-center gap-2 rounded-full border-2 border-[#f7cf3d] bg-[#f7cf3d]/10 px-2 lg:px-3 py-1">
                <Clock className={`h-3 lg:h-4 w-3 lg:w-4 ${isRunning ? 'text-[#f7cf3d] animate-pulse' : 'text-muted-foreground'}`} />
                <span className="text-xs lg:text-sm font-bold text-foreground">
                  {formattedTime}
                </span>
                <span className="text-[10px] lg:text-xs text-muted-foreground hidden sm:inline">
                  {isRunning ? 'Estudando' : 'Pausado'}
                </span>
              </div>

              {apostilaLida && (
                <div className="flex items-center gap-1 lg:gap-2 rounded-full border-2 border-green-300 bg-green-50 px-2 lg:px-3 py-1">
                  <CheckCircle2 className="h-3 lg:h-4 w-3 lg:w-4 text-green-600" />
                  <span className="text-[10px] lg:text-xs font-bold text-green-700">Lida</span>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleImprimir}
                className="rounded-full border-2 border-border font-bold"
              >
                <Printer className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Imprimir</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportarPDF}
                className="rounded-full border-2 border-border font-bold"
              >
                <Download className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Salvar PDF</span>
              </Button>

              {!apostilaLida && (
                <Button
                  size="sm"
                  onClick={handleMarcarComoLida}
                  className="rounded-full border-2 border-border bg-green-600 text-white font-bold shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-green-700"
                  disabled={marcandoLida}
                >
                  <CheckCircle2 className="h-4 w-4 lg:mr-2" />
                  <span className="hidden sm:inline">{marcandoLida ? "Marcando..." : "Marcar como Lida"}</span>
                  <span className="sm:hidden">Lida</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo da Apostila */}
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4 py-8 print:px-0 print:py-0">
        <div className="mx-auto max-w-4xl rounded-[2rem] border-4 border-border bg-white p-8 shadow-strong print:border-0 print:shadow-none print:rounded-none">
          {/* Título para impressão */}
          <div className="hidden print:block mb-8 border-b-2 border-border pb-4">
            <h1 className="text-3xl font-black uppercase">{assunto.nome}</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Material de estudo - Gabarita Study Hub
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-black mb-6 mt-0 pb-3 border-b-2 border-[#f7cf3d] text-foreground print:break-after-avoid">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold mb-4 mt-6 text-foreground bg-[#f7cf3d]/10 py-2 px-3 rounded-lg print:break-after-avoid print:bg-transparent">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-bold mb-3 mt-5 text-foreground print:break-after-avoid">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-base leading-7 text-foreground/90 mb-4">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-2 mb-4 ml-4 list-none">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="space-y-2 mb-4 ml-4 list-decimal">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-base text-foreground/90 pl-2 before:content-['•'] before:text-[#f7cf3d] before:font-bold before:mr-2 print:before:text-black">
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-foreground">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-foreground">
                    {children}
                  </em>
                ),
                code: ({ children }) => (
                  <code className="rounded bg-[#f7cf3d]/20 px-1.5 py-0.5 text-sm font-mono text-foreground print:bg-gray-100">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="rounded-lg bg-muted p-4 overflow-x-auto border border-border mb-4 print:break-inside-avoid">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#f7cf3d] bg-[#f7cf3d]/5 pl-4 py-2 my-4 italic print:break-inside-avoid print:bg-transparent print:border-black">
                    {children}
                  </blockquote>
                ),
                hr: () => (
                  <hr className="my-6 border-t border-border" />
                ),
              }}
            >
              {apostila.conteudo}
            </ReactMarkdown>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
