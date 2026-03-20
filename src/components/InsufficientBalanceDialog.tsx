import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, ShoppingBag, AlertCircle } from "lucide-react";

interface InsufficientBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  required: number;
  available: number;
  questoesCount: number;
}

export function InsufficientBalanceDialog({
  open,
  onOpenChange,
  required,
  available,
  questoesCount
}: InsufficientBalanceDialogProps) {
  const navigate = useNavigate();

  const handleGoToStore = () => {
    onOpenChange(false);
    navigate("/dashboard/loja");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2rem] border-4 border-border bg-white shadow-strong sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-orange-100 border-4 border-red-200">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <DialogTitle className="text-2xl font-black uppercase text-center">
            Saldo Insuficiente
          </DialogTitle>
          <DialogDescription className="font-semibold text-muted-foreground text-center">
            Você não tem Gabaritos suficientes para criar este simulado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Informações do simulado */}
          <div className="rounded-xl border-2 border-border bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">Questões:</span>
                <span className="text-lg font-black text-gray-900">{questoesCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">Custo:</span>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <span className="text-lg font-black text-gray-900">{required}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Saldo atual vs necessário */}
          <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-red-700">Seu saldo:</span>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-red-600" />
                  <span className="text-lg font-black text-red-900">{available}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-red-700">Faltam:</span>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-red-600" />
                  <span className="text-lg font-black text-red-900">{required - available}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mensagem motivacional */}
          <div className="rounded-xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
            <p className="text-sm font-semibold text-gray-700 text-center">
              💡 Adquira mais Gabaritos na loja e continue seus estudos!
            </p>
          </div>

          {/* Botões */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="w-full rounded-full border-2 border-border bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              onClick={handleGoToStore}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Ir para a Loja
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full border-2 border-border bg-white font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              onClick={() => onOpenChange(false)}
            >
              Voltar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
