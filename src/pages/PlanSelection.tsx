import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { safeRedirect } from "@/lib/security";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FocaLogo } from "@/components/FocaMascot";
import { Check, Sparkles, Zap, Gift } from "lucide-react";
import { toast } from "sonner";

interface ProfileData {
  nome: string;
  sobrenome: string;
}

export default function PlanSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState<'premium' | 'free' | null>(null);
  const [userData, setUserData] = useState<{
    userId: string;
    email: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    // Obter dados do usuário da URL ou session
    const params = new URLSearchParams(location.search);
    const userId = params.get('userId');
    const email = params.get('email');
    const name = params.get('name');

    if (userId && email && name) {
      setUserData({ userId, email, name });
    } else {
      // Se não tem dados na URL, verificar sessão
      checkSession();
    }
  }, [location]);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('nome, sobrenome')
        .eq('id', session.user.id)
        .single<ProfileData>();

      setUserData({
        userId: session.user.id,
        email: session.user.email || '',
        name: profile ? `${profile.nome} ${profile.sobrenome}` : '',
      });
    }
  };

  const handlePremiumTrial = async () => {
    if (!userData) {
      toast.error('Dados do usuário não encontrados');
      return;
    }

    setLoading('premium');
    try {
      const successUrl = `${window.location.origin}/confirm-email?email=${encodeURIComponent(userData.email)}`;
      const cancelUrl = `${window.location.origin}/plan-selection?userId=${userData.userId}&email=${encodeURIComponent(userData.email)}&name=${encodeURIComponent(userData.name)}`;

      const { data: subscriptionData, error: subscriptionError } = await supabase.functions.invoke(
        "create-stripe-subscription",
        {
          body: {
            userId: userData.userId,
            email: userData.email,
            name: userData.name,
            successUrl,
            cancelUrl,
          },
        }
      );

      if (subscriptionError) {
        console.error("Subscription creation error:", subscriptionError);
        toast.error("Erro ao criar assinatura. Tente novamente.");
        setLoading(null);
        return;
      }

      if (subscriptionData?.checkoutUrl) {
        safeRedirect(subscriptionData.checkoutUrl, '/plan-selection');
        return;
      }

      toast.error("Erro ao redirecionar para checkout");
      setLoading(null);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Erro inesperado. Tente novamente.");
      setLoading(null);
    }
  };

  const handleFreePlan = async () => {
    if (!userData) {
      toast.error('Dados do usuário não encontrados');
      return;
    }

    setLoading('free');
    try {
      // Redirecionar direto para confirmação de email
      navigate(`/confirm-email?email=${encodeURIComponent(userData.email)}`);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Erro inesperado. Tente novamente.");
      setLoading(null);
    }
  };

  const premiumFeatures = [
    "7 dias GRÁTIS para testar (sem cobrança)",
    "100 Gabaritos durante o período de teste",
    "500 Gabaritos TODO MÊS após confirmação",
    "ZERO anúncios durante os estudos",
    "Suporte prioritário",
    "Cancele quando quiser, sem multa"
  ];

  const freeFeatures = [
    "Acesso básico à plataforma",
    "0 Gabaritos iniciais (compre conforme usar)",
    "Anúncios durante o uso",
    "Suporte padrão"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <FocaLogo />
          </div>
          <h1 className="mb-4 text-4xl font-black uppercase leading-tight text-foreground sm:text-5xl md:text-6xl">
            Escolha seu
            <span className="block text-primary">plano ideal</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-semibold text-muted-foreground">
            Gabaritos é a moeda oficial do app para criar simulados (custam de 10 a 40 Gabaritos, dependendo da quantidade de questões). Comece com 7 dias grátis e ganhe 600 Gabaritos, ou use gratuitamente com anúncios.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Premium Trial Plan - DESTAQUE */}
          <Card className="relative overflow-hidden border-4 border-primary bg-white shadow-strong rounded-[2rem] transform hover:scale-[1.02] transition-transform">
            {/* Badge "RECOMENDADO" */}
            <div className="absolute -right-12 top-8 rotate-45 bg-primary px-16 py-2 text-xs font-black uppercase text-primary-foreground shadow-lg">
              Recomendado
            </div>

            {/* Badge "7 DIAS GRÁTIS" */}
            <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full border-2 border-border bg-[#f7cf3d] px-4 py-2 shadow-soft">
              <Gift className="h-5 w-5" />
              <span className="text-sm font-black uppercase">7 dias grátis</span>
            </div>

            <CardContent className="p-8 pt-20">
              {/* Título */}
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-8 w-8 text-primary" />
                  <h2 className="text-3xl font-black uppercase text-foreground">Premium</h2>
                </div>
                <p className="text-base font-semibold text-muted-foreground">
                  Teste grátis por 7 dias, sem compromisso
                </p>
              </div>

              {/* Preço */}
              <div className="mb-6 rounded-[1.5rem] border-4 border-primary bg-primary/10 p-6 text-center">
                <div className="mb-2">
                  <span className="text-5xl font-black text-foreground">R$ 0</span>
                  <span className="ml-2 text-xl font-bold text-muted-foreground">por 7 dias</span>
                </div>
                <p className="text-sm font-black uppercase text-primary">
                  Depois R$ 49,90/mês
                </p>
                <p className="mt-2 text-xs font-semibold text-muted-foreground">
                  Cancele antes do fim do teste e não pague nada
                </p>
              </div>

              {/* Destaque Gabaritos */}
              <div className="mb-6 rounded-[1.5rem] border-2 border-border bg-gradient-to-r from-[#f7cf3d] to-[#ffd700] p-6 shadow-soft">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Zap className="h-6 w-6 text-foreground" />
                  <span className="text-2xl font-black uppercase text-foreground">600 Gabaritos</span>
                </div>
                <p className="text-center text-sm font-bold text-foreground/80">
                  100 no teste + 500 na primeira mensalidade
                </p>
              </div>

              {/* Features */}
              <div className="mb-8 space-y-3">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-primary p-1">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={handlePremiumTrial}
                disabled={loading !== null}
                className="h-auto w-full whitespace-normal rounded-full border-4 border-border bg-primary px-6 py-4 text-center text-lg font-black uppercase leading-tight text-primary-foreground shadow-strong hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-soft transition-all"
              >
                {loading === 'premium' ? (
                  "Redirecionando..."
                ) : (
                  <>
                    <Sparkles className="mr-2 inline h-5 w-5" />
                    Começar 7 dias grátis
                  </>
                )}
              </Button>

              <p className="mt-4 text-center text-xs font-semibold text-muted-foreground">
                🔒 Pagamento 100% seguro via Stripe
              </p>
            </CardContent>
          </Card>

          {/* Free Plan */}
          <Card className="border-4 border-border bg-white shadow-strong rounded-[2rem]">
            <CardContent className="p-8">
              {/* Título */}
              <div className="mb-6">
                <h2 className="mb-2 text-3xl font-black uppercase text-foreground">Gratuito</h2>
                <p className="text-base font-semibold text-muted-foreground">
                  Use sem compromisso, com anúncios
                </p>
              </div>

              {/* Preço */}
              <div className="mb-6 rounded-[1.5rem] border-2 border-border bg-muted p-6">
                <p className="text-center text-lg font-bold text-foreground mb-1">
                  Plano Gratuito
                </p>
                <p className="text-center text-sm font-semibold text-muted-foreground">
                  Sem custos • Sem cartão de crédito
                </p>
              </div>

              {/* Destaque Gabaritos */}
              <div className="mb-6 rounded-[1.5rem] border-2 border-border bg-muted p-6">
                <div className="text-center">
                  <span className="text-2xl font-black uppercase text-foreground">0 Gabaritos</span>
                  <p className="mt-2 text-sm font-semibold text-muted-foreground">
                    Compre conforme precisar
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="mb-8 space-y-3">
                {freeFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-muted p-1">
                      <Check className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleFreePlan}
                disabled={loading !== null}
                variant="outline"
                className="h-auto w-full whitespace-normal rounded-full border-4 border-border bg-white px-6 py-4 text-center text-lg font-black uppercase leading-tight shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                {loading === 'free' ? "Redirecionando..." : "Continuar grátis"}
              </Button>

              <p className="mt-4 text-center text-xs font-semibold text-muted-foreground">
                Você pode fazer upgrade a qualquer momento
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-sm font-semibold text-muted-foreground">
            💡 Dica: Com o plano Premium, você economiza tempo e estuda sem interrupções!
          </p>
        </div>
      </div>
    </div>
  );
}
