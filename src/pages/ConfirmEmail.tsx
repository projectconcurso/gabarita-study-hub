import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FocaLogo } from "@/components/FocaMascot";

export default function ConfirmEmail() {
  const location = useLocation();

  const email = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("email") || "seu email";
  }, [location.search]);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        <Card className="w-full border-4 border-border bg-white shadow-strong rounded-[2rem]">
          <CardHeader className="space-y-4 border-b-4 border-border bg-muted rounded-t-[1.7rem] px-6 py-6 text-center">
            <div className="flex justify-center">
              <FocaLogo />
            </div>
            <CardTitle className="text-3xl font-black uppercase text-foreground">
              Confirme seu email
            </CardTitle>
            <CardDescription className="text-base font-semibold text-muted-foreground">
              Finalize a ativação da sua conta para seguir para a etapa final do cadastro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6 text-center">
            <div className="rounded-[1.5rem] border-2 border-border bg-[#f7cf3d] px-6 py-5 shadow-soft">
              <p className="text-lg font-black uppercase text-foreground">Quase lá!</p>
              <p className="mt-2 text-sm font-semibold text-foreground/80">
                Enviamos um link de confirmação para <span className="font-black">{email}</span>.
              </p>
            </div>

            <div className="space-y-3 rounded-[1.5rem] border-2 border-border bg-white px-6 py-5 text-left shadow-soft">
              <p className="text-sm font-black uppercase text-foreground">Próximos passos</p>
              <ul>
                <li className="text-sm font-semibold text-muted-foreground">1. Abra o email de confirmação enviado pelo Gabarit.</li>
                <li className="text-sm font-semibold text-muted-foreground">2. Clique no link para validar sua conta.</li>
                <li className="text-sm font-semibold text-muted-foreground">3. Após confirmar, complete seu perfil para prosseguir com o acesso ao Gabarit.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/login">
                <Button className="w-full rounded-full border-2 border-border bg-primary text-primary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none sm:w-auto">
                  Ir para login
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" className="w-full rounded-full border-2 border-border bg-white font-black uppercase sm:w-auto">
                  Voltar ao cadastro
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
