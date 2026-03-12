import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FocaLogo } from "@/components/FocaMascot";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          toast.error("Confirme seu email antes de entrar.");
          navigate("/confirm-email", { state: { email: data.email } });
        } else if (error.message.includes("Invalid login credentials")) {
          toast.error("Email ou senha incorretos");
        } else {
          toast.error("Erro ao fazer login: " + error.message);
        }
        return;
      }

      toast.success("Login realizado com sucesso!");
    } catch (_error) {
      toast.error("Erro inesperado ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error("Erro ao enviar email de redefinição: " + error.message);
        return;
      }

      toast.success("Enviamos um email para redefinir sua senha.");
      setResetDialogOpen(false);
      forgotPasswordForm.reset();
    } catch (_error) {
      toast.error("Erro inesperado ao solicitar redefinição de senha");
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="inline-flex items-center rounded-full border-2 border-border bg-[#f7cf3d] px-5 py-2 text-sm font-black uppercase tracking-wide text-foreground shadow-soft">
            Entre na sua jornada de aprovação
          </div>
          <h1 className="max-w-2xl text-5xl font-black uppercase leading-[0.95] text-foreground md:text-7xl">
            Entre e
            <span className="block text-primary">continue sua</span>
            <span className="block text-accent">evolução</span>
          </h1>
          <p className="max-w-xl text-lg font-semibold text-muted-foreground md:text-xl">
            Acesse seus simulados, seu plano e toda a experiência premium do Gabarit.
          </p>
        </section>

        <Card className="w-full border-4 border-border bg-white shadow-strong rounded-[2rem]">
          <CardHeader className="space-y-4 border-b-4 border-border bg-muted rounded-t-[1.7rem] px-6 py-6">
            <div className="flex justify-center">
              <FocaLogo />
            </div>
            <CardTitle className="text-center text-3xl font-black uppercase text-foreground">
              Entrar
            </CardTitle>
            <CardDescription className="text-center text-base font-semibold text-muted-foreground">
              Use seu email e senha para acessar a plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" className="h-12 rounded-2xl border-2 border-border bg-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••" className="h-12 rounded-2xl border-2 border-border bg-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-end">
                  <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="link" className="h-auto p-0 text-sm font-black uppercase text-primary">
                        Esqueci a senha
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="border-4 border-border bg-white rounded-[1.8rem]">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase">Redefinir senha</DialogTitle>
                        <DialogDescription className="font-semibold text-muted-foreground">
                          Informe seu email e enviaremos um link para trocar sua senha.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...forgotPasswordForm}>
                        <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                          <FormField
                            control={forgotPasswordForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="seu@email.com" className="h-12 rounded-2xl border-2 border-border bg-white" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" disabled={sendingReset} className="w-full h-12 rounded-full border-2 border-border bg-primary text-primary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                            {sendingReset ? "Enviando..." : "Enviar link de redefinição"}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                <Button type="submit" className="w-full h-12 rounded-full border-2 border-border bg-primary text-primary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Form>

            <div className="rounded-[1.5rem] border-2 border-border bg-muted px-5 py-4 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                Ainda não tem conta?
              </p>
              <Link to="/signup">
                <Button variant="link" className="h-auto p-0 text-sm font-black uppercase text-accent">
                  Criar conta
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
