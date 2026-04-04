import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, Maximize2, Clock } from "lucide-react";
import { toast } from "sonner";
import { marcarApostilaComoLida } from "@/lib/meus-estudos";
import type { AssuntoMateria, Apostila } from "@/types/meus-estudos";
import ReactMarkdown from "react-markdown";
import { useStudyTimer } from "@/hooks/useStudyTimer";

interface VisualizarApostilaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  assunto: AssuntoMateria & { apostila: Apostila | null; progresso: any };
  onMarcarLida: () => void;
}

export function VisualizarApostilaDialog({
  open,
  onOpenChange,
  userId,
  assunto,
  onMarcarLida,
}: VisualizarApostilaDialogProps) {
  const navigate = useNavigate();
  const [marcandoLida, setMarcandoLida] = useState(false);
  const apostilaLida = assunto?.progresso?.apostila_lida || false;
  const apostila = assunto?.apostila;

  // Cronômetro de estudo
  const { isRunning, formattedTime } = useStudyTimer({
    userId,
    assuntoId: assunto.id,
    tipo: "apostila",
    isActive: open, // Ativo quando o dialog está aberto
  });

  const handleMarcarComoLida = async () => {
    try {
      setMarcandoLida(true);
      await marcarApostilaComoLida(userId, assunto.id);
      toast.success("Resumo marcado como lido! Progresso atualizado.");
      
      // Fecha o dialog antes de recarregar os dados
      onOpenChange(false);
      
      // Recarrega os dados
      await onMarcarLida();
    } catch (error) {
      console.error("Erro ao marcar apostila como lida:", error);
      toast.error("Erro ao marcar resumo como lido");
    } finally {
      setMarcandoLida(false);
    }
  };

  const handleAbrirTelaCheia = () => {
    onOpenChange(false);
    navigate(`/dashboard/apostila/${assunto.id}`);
  };

  // Não renderiza nada se não houver apostila
  if (!apostila?.conteudo) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border-4 border-border bg-white shadow-strong">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7cf3d] border-2 border-border">
              <BookOpen className="h-6 w-6 text-foreground" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-black uppercase">
                {assunto.nome}
              </DialogTitle>
              <DialogDescription className="font-semibold text-muted-foreground">
                Material de estudo gerado por IA
              </DialogDescription>
            </div>
            
            {/* Cronômetro */}
            <div className="flex items-center gap-2 rounded-full border-2 border-[#f7cf3d] bg-[#f7cf3d]/10 px-3 py-1">
              <Clock className={`h-4 w-4 ${isRunning ? 'text-[#f7cf3d] animate-pulse' : 'text-muted-foreground'}`} />
              <span className="text-sm font-bold text-foreground">
                {formattedTime}
              </span>
            </div>
            
            {apostilaLida && (
              <div className="flex items-center gap-2 rounded-full border-2 border-green-300 bg-green-50 px-3 py-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-xs font-bold text-green-700">Lida</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto rounded-[1.5rem] border-2 border-border bg-white p-8">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-black mb-6 mt-0 pb-3 border-b-2 border-[#f7cf3d] text-foreground">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold mb-4 mt-6 text-foreground bg-[#f7cf3d]/10 py-2 px-3 rounded-lg">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-bold mb-3 mt-5 text-foreground">
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
                  <li className="text-base text-foreground/90 pl-2 before:content-['•'] before:text-[#f7cf3d] before:font-bold before:mr-2">
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
                  <code className="rounded bg-[#f7cf3d]/20 px-1.5 py-0.5 text-sm font-mono text-foreground">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="rounded-lg bg-muted p-4 overflow-x-auto border border-border mb-4">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#f7cf3d] bg-[#f7cf3d]/5 pl-4 py-2 my-4 italic">
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

        <div className="flex gap-3 border-t-2 border-border pt-4">
          <Button
            variant="outline"
            onClick={handleAbrirTelaCheia}
            className="rounded-full border-2 border-border font-bold"
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Tela Cheia
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-full border-2 border-border font-bold"
          >
            Fechar
          </Button>
          {!apostilaLida && (
            <Button
              onClick={handleMarcarComoLida}
              className="flex-1 rounded-full border-2 border-border bg-green-600 text-white font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-green-700"
              disabled={marcandoLida}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {marcandoLida ? "Marcando..." : "Marcar como Lida"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
