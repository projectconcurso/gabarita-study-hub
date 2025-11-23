import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

export default function Chat() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chat</h1>
        <p className="text-muted-foreground mt-2">
          Converse com seus amigos em tempo real
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-accent" />
            Em breve!
          </CardTitle>
          <CardDescription>
            Aqui você poderá conversar com seus amigos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento. Em breve você poderá:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
            <li>Conversar em tempo real</li>
            <li>Enviar mensagens de texto</li>
            <li>Compartilhar resultados de simulados</li>
            <li>Receber notificações de novas mensagens</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
