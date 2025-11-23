import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";

export default function Amigos() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Amigos</h1>
          <p className="text-muted-foreground mt-2">
            Conecte-se com outros estudantes
          </p>
        </div>
        <Button className="bg-gradient-success">
          <UserPlus className="w-4 h-4 mr-2" />
          Adicionar Amigo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            Em breve!
          </CardTitle>
          <CardDescription>
            Aqui você poderá gerenciar suas amizades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento. Em breve você poderá:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
            <li>Buscar usuários por nome ou email</li>
            <li>Enviar solicitações de amizade</li>
            <li>Aceitar ou recusar convites</li>
            <li>Ver perfis dos amigos</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
