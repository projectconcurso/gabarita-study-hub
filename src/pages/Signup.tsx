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
import { FocaLogo } from "@/components/FocaMascot";

const signupSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  sobrenome: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      nome: "",
      sobrenome: "",
      email: "",
      password: "",
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
  }, [navigate]);

  const handleSignup = async (data: SignupFormData) => {
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            nome: data.nome,
            sobrenome: data.sobrenome,
          },
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast.error("Este email já está cadastrado");
        } else {
          toast.error("Erro ao criar conta: " + error.message);
        }
        return;
      }

      if (!authData.user) {
        toast.error("Não foi possível iniciar o cadastro.");
        return;
      }

      const successUrl = `${window.location.origin}/confirm-email?email=${encodeURIComponent(data.email)}`;
      const cancelUrl = `${window.location.origin}/signup`;

      const { data: subscriptionData, error: subscriptionError } = await supabase.functions.invoke(
        "create-stripe-subscription",
        {
          body: {
            userId: authData.user.id,
            email: data.email,
            name: `${data.nome} ${data.sobrenome}`,
            successUrl,
            cancelUrl,
          },
        }
      );

      if (subscriptionError) {
        console.error("Subscription creation error:", subscriptionError);
        const errorMessage =
          typeof subscriptionError.context === "string"
            ? subscriptionError.context
            : subscriptionError.message || "Erro ao criar assinatura.";
        toast.error(errorMessage);
        return;
      }

      toast.success("Conta criada! Agora finalize o checkout para ativar seu plano.");

      if (subscriptionData?.checkoutUrl) {
        window.location.href = subscriptionData.checkoutUrl;
        return;
      }

      navigate(`/confirm-email?email=${encodeURIComponent(data.email)}`);
    } catch (signupError) {
      console.error("Unexpected signup error:", signupError);
      if (signupError instanceof Error) {
        toast.error(signupError.message);
      } else {
        toast.error("Erro inesperado ao criar conta");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-4 sm:py-6 lg:py-10">
      <div className="mx-auto grid min-h-[calc(100svh-2rem)] max-w-6xl items-start gap-6 sm:min-h-[calc(100svh-3rem)] sm:gap-8 lg:min-h-[calc(100vh-5rem)] lg:items-center lg:gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4 sm:space-y-6">
          <div className="inline-flex items-center rounded-full border-2 border-border bg-[#f7cf3d] px-4 py-2 text-xs font-black uppercase tracking-wide text-foreground shadow-soft sm:px-5 sm:text-sm">
            Comece seu período premium com segurança
          </div>
          <h1 className="max-w-2xl text-4xl font-black uppercase leading-[0.95] text-foreground sm:text-5xl md:text-7xl">
            Crie sua
            <span className="block text-primary">conta</span>
            <span className="block text-accent">premium</span>
          </h1>
          <p className="max-w-xl text-base font-semibold text-muted-foreground sm:text-lg md:text-xl">
            Você cria sua conta, cadastra o pagamento no Stripe e depois confirma o email para acessar a dashboard.
          </p>
        </section>

        <Card className="w-full border-4 border-border bg-white shadow-strong rounded-[2rem]">
          <CardHeader className="space-y-3 border-b-4 border-border bg-muted rounded-t-[1.7rem] px-4 py-4 sm:space-y-4 sm:px-6 sm:py-6">
            <div className="flex justify-center">
              <FocaLogo />
            </div>
            <CardTitle className="text-center text-2xl font-black uppercase text-foreground sm:text-3xl">
              Criar conta
            </CardTitle>
            <CardDescription className="text-center text-sm font-semibold text-muted-foreground sm:text-base">
              Preencha seus dados e siga para o checkout seguro do Stripe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 p-4 sm:space-y-6 sm:p-6">
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={signupForm.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="João" className="h-12 rounded-2xl border-2 border-border bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="sobrenome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sobrenome</FormLabel>
                        <FormControl>
                          <Input placeholder="Silva" className="h-12 rounded-2xl border-2 border-border bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={signupForm.control}
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
                  control={signupForm.control}
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
                <Button type="submit" className="h-auto min-h-12 w-full whitespace-normal rounded-full border-2 border-border bg-accent px-4 py-3 text-center font-black uppercase leading-tight text-accent-foreground shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none" disabled={loading}>
                  {loading ? "Criando conta..." : "Criar conta e seguir para pagamento"}
                </Button>
              </form>
            </Form>

            <div className="rounded-[1.5rem] border-2 border-border bg-muted px-5 py-4 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                Já tem conta?
              </p>
              <Link to="/login">
                <Button variant="link" className="h-auto p-0 text-sm font-black uppercase text-primary">
                  Entrar agora
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
