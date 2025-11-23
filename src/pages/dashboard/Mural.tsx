import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";

export default function Mural() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mural</h1>
        <p className="text-muted-foreground mt-2">
          Veja as conquistas dos seus amigos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Em breve!
          </CardTitle>
          <CardDescription>
            Aqui você verá a timeline social com resultados dos amigos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento. Em breve você poderá:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
            <li>Ver simulados concluídos pelos amigos</li>
            <li>Comentar nos resultados</li>
            <li>Reagir com emoticons</li>
            <li>Compartilhar suas conquistas</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
