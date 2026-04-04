import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, Play, XCircle, TrendingUp } from "lucide-react";

interface Simulado {
  id: string;
  titulo: string;
  status: string;
  total_questoes: number;
  acertos: number;
  percentual_acerto: number | null;
  created_at: string;
}

interface ListarSimuladosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  simulados: Simulado[];
  assuntoNome: string;
  materiaNome: string;
}

export function ListarSimuladosDialog({
  open,
  onOpenChange,
  simulados,
  assuntoNome,
  materiaNome,
}: ListarSimuladosDialogProps) {
  const navigate = useNavigate();

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusInfo = (simulado: Simulado) => {
    if (simulado.status === "concluido") {
      const percentual = simulado.percentual_acerto ?? 0;
      return {
        icon: CheckCircle2,
        label: "Concluído",
        color: "text-green-700",
        bgColor: "bg-green-100",
        borderColor: "border-green-400",
        percentual: `${percentual.toFixed(0)}% de acerto`,
      };
    }
    return {
      icon: Clock,
      label: "Em andamento",
      color: "text-blue-700",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-400",
      percentual: `${simulado.acertos}/${simulado.total_questoes} respondidas`,
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden bg-[#FFFBEA] rounded-[1.5rem] border-4 border-border p-6">
        <div className="mb-6">
          <DialogTitle className="text-xl sm:text-2xl font-black uppercase text-center mb-2">
            Simulados - {assuntoNome}
          </DialogTitle>
          <DialogDescription className="font-semibold text-muted-foreground text-center">
            {materiaNome} • {simulados.length} simulado{simulados.length !== 1 ? "s" : ""}
          </DialogDescription>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
          <div className="space-y-3">
            {simulados.map((simulado) => {
              const statusInfo = getStatusInfo(simulado);
              const StatusIcon = statusInfo.icon;

              return (
                <Card
                  key={simulado.id}
                  className={`rounded-[1.5rem] border-4 ${statusInfo.borderColor} ${statusInfo.bgColor} shadow-medium hover:shadow-soft transition-all cursor-pointer`}
                  onClick={() => {
                    navigate(`/dashboard/simular/${simulado.id}`);
                    onOpenChange(false);
                  }}
                >
                  <CardContent className="p-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                      <h4 className="font-black uppercase text-base">
                        {simulado.titulo}
                      </h4>
                    </div>
                      
                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatarData(simulado.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Play className="h-4 w-4" />
                        {simulado.total_questoes} questões
                      </span>
                      {simulado.status === "concluido" && (
                        <span className={`flex items-center gap-1 font-black ${statusInfo.color}`}>
                          <TrendingUp className="h-4 w-4" />
                          {statusInfo.percentual}
                        </span>
                      )}
                    </div>

                    {simulado.status === "em_andamento" && (
                      <div>
                        <div className="h-3 w-full overflow-hidden rounded-full border-2 border-border bg-white">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                            style={{
                              width: `${(simulado.acertos / simulado.total_questoes) * 100}%`,
                            }}
                          />
                        </div>
                        <p className="mt-2 text-xs font-bold text-muted-foreground">
                          {statusInfo.percentual}
                        </p>
                      </div>
                    )}

                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full rounded-full border-4 border-border font-black uppercase text-sm bg-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-soft transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/simular/${simulado.id}`);
                        onOpenChange(false);
                      }}
                    >
                      {simulado.status === "concluido" ? "Ver Resultado" : "Continuar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>

          {simulados.length === 0 && (
            <div className="py-12 text-center">
              <XCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-4 text-lg font-semibold text-muted-foreground">
                Nenhum simulado encontrado
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
