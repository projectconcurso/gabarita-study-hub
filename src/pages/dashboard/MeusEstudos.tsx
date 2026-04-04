import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Calendar, Zap } from "lucide-react";

export default function MeusEstudos() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="inline-flex rounded-full border-2 border-border bg-[#f7cf3d] px-4 py-2 text-xs font-black uppercase tracking-wide text-foreground shadow-soft">
          Área de estudos
        </div>
        <h1 className="text-4xl font-black uppercase">Meus Estudos</h1>
        <p className="text-lg font-semibold text-muted-foreground">
          Escolha como você quer estudar hoje
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Meu Cronograma de Estudos */}
        <Card 
          className="group cursor-pointer rounded-[2rem] border-4 border-border bg-white shadow-medium transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-soft"
          onClick={() => navigate("/dashboard/meu-cronograma")}
        >
          <CardHeader className="border-b-4 border-border bg-gradient-to-br from-blue-50 to-green-50 rounded-t-[1.7rem]">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-green-500 border-4 border-border">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black uppercase">Meu Cronograma</CardTitle>
                <CardDescription className="font-semibold text-muted-foreground">
                  Estudos organizados
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-base font-semibold text-muted-foreground">
                Acesse seus concursos cadastrados, acompanhe seu progresso em cada matéria e assunto, 
                leia resumos e faça simulados vinculados ao seu cronograma de estudos.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span>Resumos organizados por concurso</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Brain className="h-4 w-4 text-green-500" />
                  <span>Simulados vinculados ao cronograma</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Acompanhamento de progresso</span>
                </div>
              </div>
              <Button 
                className="w-full rounded-full border-2 border-border bg-gradient-to-r from-blue-500 to-green-500 text-white font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/dashboard/meu-cronograma");
                }}
              >
                Acessar Cronograma
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Simulados Livres */}
        <Card 
          className="group cursor-pointer rounded-[2rem] border-4 border-border bg-white shadow-medium transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-soft"
          onClick={() => navigate("/dashboard/simulados")}
        >
          <CardHeader className="border-b-4 border-border bg-gradient-to-br from-purple-50 to-pink-50 rounded-t-[1.7rem]">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-4 border-border">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black uppercase">Simulados Livres</CardTitle>
                <CardDescription className="font-semibold text-muted-foreground">
                  Treino independente
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-base font-semibold text-muted-foreground">
                Crie simulados personalizados sem vínculo com cronogramas. Ideal para treinar 
                temas específicos, testar conhecimentos ou estudar de forma mais livre.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span>Simulados personalizados</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Zap className="h-4 w-4 text-pink-500" />
                  <span>Sem vínculo com cronograma</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BookOpen className="h-4 w-4 text-purple-500" />
                  <span>Treino livre e flexível</span>
                </div>
              </div>
              <Button 
                className="w-full rounded-full border-2 border-border bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/dashboard/simulados");
                }}
              >
                Criar Simulado Livre
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
