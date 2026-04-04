import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Calendar, Trash2, Target } from "lucide-react";
import { toast } from "sonner";
import { listarConcursos, deletarConcurso, calcularProgressoConcurso, formatarDataProva } from "@/lib/meus-estudos";
import type { Concurso } from "@/types/meus-estudos";
import { getBgProgresso, getBorderProgresso, getCorProgresso } from "@/types/meus-estudos";
import { CriarConcursoDialog } from "@/components/meus-estudos/CriarConcursoDialog";

export default function MeusEstudos() {
  const navigate = useNavigate();
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [concursosComProgresso, setConcursosComProgresso] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    loadUserAndConcursos();
  }, []);

  const loadUserAndConcursos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    await loadConcursos(user.id);
  };

  const loadConcursos = async (uid: string) => {
    try {
      setLoading(true);
      const data = await listarConcursos(uid);
      setConcursos(data);

      const progressoMap = new Map<string, number>();
      for (const concurso of data) {
        const progresso = await calcularProgressoConcurso(uid, concurso.id);
        progressoMap.set(concurso.id, progresso);
      }
      setConcursosComProgresso(progressoMap);
    } catch (error) {
      toast.error("Erro ao carregar concursos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (concursoId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!confirm("Deseja realmente excluir este concurso?")) return;

    try {
      await deletarConcurso(concursoId);
      toast.success("Concurso excluído!");
      await loadConcursos(userId);
    } catch (error) {
      toast.error("Erro ao excluir concurso");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="inline-flex rounded-full border-2 border-border bg-[#f7cf3d] px-4 py-2 text-xs font-black uppercase tracking-wide text-foreground shadow-soft">
            Sistema de Estudos
          </div>
          <h1 className="text-4xl font-black uppercase">Meus Estudos</h1>
          <p className="text-lg font-semibold text-muted-foreground">
            Organize seus estudos para concursos e vestibulares
          </p>
        </div>

        <CriarConcursoDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          userId={userId}
          onSuccess={() => loadConcursos(userId)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {concursos.length === 0 ? (
          <Card className="rounded-[2rem] border-4 border-border bg-white shadow-medium md:col-span-2 xl:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-center text-base font-semibold text-muted-foreground">
                Você ainda não tem concursos cadastrados. Crie seu primeiro!
              </p>
            </CardContent>
          </Card>
        ) : (
          concursos.map((concurso) => {
            const progresso = concursosComProgresso.get(concurso.id) || 0;
            return (
              <Card
                key={concurso.id}
                className="cursor-pointer rounded-[2rem] border-4 border-border bg-white shadow-medium transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
                onClick={() => navigate(`/dashboard/meu-cronograma/${concurso.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <CardTitle className="text-xl font-black uppercase">{concurso.nome}</CardTitle>
                      {concurso.data_prova && (
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {formatarDataProva(concurso.data_prova)}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(concurso.id, e)}
                      className="rounded-full border-2 border-border hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>Progresso Geral</span>
                      <span className={`font-black ${getCorProgresso(progresso)}`}>
                        {progresso.toFixed(0)}%
                      </span>
                    </div>
                    <div className={`h-3 w-full overflow-hidden rounded-full border-2 ${getBorderProgresso(progresso)} ${getBgProgresso(progresso)}`}>
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                        style={{ width: `${progresso}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Target className="w-4 h-4" />
                    Clique para ver detalhes
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
