import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SuporteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuporteModal({ open, onOpenChange }: SuporteModalProps) {
  const [tipo, setTipo] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [mensagem, setMensagem] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tipo || !email || !mensagem) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, insira um email válido");
      return;
    }

    setLoading(true);

    try {
      // Buscar nome do usuário se estiver logado
      const { data: { user } } = await supabase.auth.getUser();
      let userName = "";

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("nome, sobrenome")
          .eq("id", user.id)
          .single();

        if (profile) {
          userName = `${(profile as any).nome} ${(profile as any).sobrenome}`.trim();
        }
      }

      // Chamar edge function para enviar email
      const { data, error } = await supabase.functions.invoke("enviar-suporte", {
        body: {
          tipo,
          email,
          mensagem,
          userName,
        },
      });

      if (error) {
        console.error("Erro ao enviar mensagem:", error);
        toast.error("Erro ao enviar mensagem. Tente novamente.");
        return;
      }

      if (data?.success) {
        toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
        // Limpar formulário
        setTipo("");
        setEmail("");
        setMensagem("");
        onOpenChange(false);
      } else {
        toast.error("Erro ao enviar mensagem. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase">
            Suporte e Feedback
          </DialogTitle>
          <DialogDescription className="text-sm">
            Envie sua dúvida, sugestão ou reporte um problema. Responderemos em breve!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo" className="font-semibold">
              Tipo de Mensagem *
            </Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="rounded-xl border-2 border-border">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dúvida">Dúvida</SelectItem>
                <SelectItem value="Sugestão">Sugestão</SelectItem>
                <SelectItem value="Problema Técnico">Problema Técnico</SelectItem>
                <SelectItem value="Feedback">Feedback</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold">
              Seu E-mail *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border-2 border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensagem" className="font-semibold">
              Mensagem *
            </Label>
            <Textarea
              id="mensagem"
              placeholder="Descreva sua dúvida, sugestão ou problema..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="min-h-[150px] rounded-xl border-2 border-border resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-full border-2 border-border font-black uppercase"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-full border-2 border-border bg-primary font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
