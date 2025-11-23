import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Plus } from "lucide-react";

export default function Simulados() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Simulados</h1>
          <p className="text-muted-foreground mt-2">
            Pratique com questões geradas por IA
          </p>
        </div>
        <Button className="bg-gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Novo Simulado
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Em breve!
          </CardTitle>
          <CardDescription>
            Aqui você poderá criar simulados personalizados com IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento. Em breve você poderá:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
            <li>Escolher tema, matéria e banca</li>
            <li>Gerar questões inéditas com IA</li>
            <li>Ver relatório detalhado de desempenho</li>
            <li>Acompanhar seu histórico</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
