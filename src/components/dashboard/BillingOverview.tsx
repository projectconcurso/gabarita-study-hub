import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle, Clock, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type BillingInfo = {
  subscription: {
    status: string | null;
    trialEndsAt: string | null;
    subscriptionStartedAt: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    hasStripeSubscription: boolean;
  };
  paymentMethod: {
    brand: string | null;
    last4: string | null;
    expMonth: number | null;
    expYear: number | null;
  } | null;
};

type BillingOverviewProps = {
  showPricing?: boolean;
};

const normalizeStatus = (status: string | null | undefined) => {
  if (!status) return "free";
  if (status === "trialing") return "trial";
  if (status === "premium") return "active";
  return status;
};

export default function BillingOverview({ showPricing = true }: BillingOverviewProps) {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadBillingInfo = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase.functions.invoke("get-billing-info", {
        body: { userId: user.id },
      });

      if (error) {
        throw error;
      }

      setBillingInfo(data as BillingInfo);
    } catch (error) {
      console.error("Error loading billing info:", error);
      toast.error("Erro ao carregar informações do plano");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBillingInfo();
  }, []);

  const status = normalizeStatus(billingInfo?.subscription.status);
  const hasStripeCustomer = Boolean(billingInfo?.paymentMethod) || status !== "free";
  const hasCancelableSubscription = Boolean(billingInfo?.subscription.hasStripeSubscription);

  const planLabel = useMemo(() => {
    if (status === "active") return "Premium ativo";
    if (status === "trial") return "Trial em andamento";
    if (status === "past_due") return "Pagamento pendente";
    if (status === "cancelled") return "Premium cancelado";
    return "Free";
  }, [status]);

  const handlePortalSession = async () => {
    setRedirecting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData?.stripe_customer_id) {
        throw new Error("Cliente Stripe não encontrado");
      }

      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: {
          customerId: profileData.stripe_customer_id,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("Não foi possível abrir o portal Stripe");

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao abrir gerenciamento da assinatura");
      setRedirecting(false);
    }
  };

  const handleUpgrade = async () => {
    setRedirecting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { userId: user.id },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("Checkout indisponível no momento");

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao iniciar checkout");
      setRedirecting(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.functions.invoke("cancel-subscription", {
        body: { userId: user.id },
      });

      if (error) throw error;

      toast.success("Assinatura programada para cancelamento ao fim do período atual.");
      await loadBillingInfo();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cancelar assinatura");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "trial":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 border-2">
            <Clock className="w-4 h-4 mr-2" />
            Trial
          </Badge>
        );
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300 border-2">
            <CheckCircle className="w-4 h-4 mr-2" />
            Premium ativo
          </Badge>
        );
      case "past_due":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300 border-2">
            <AlertCircle className="w-4 h-4 mr-2" />
            Pagamento pendente
          </Badge>
        );
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300 border-2">Cancelado</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 border-slate-300 border-2">Free</Badge>;
    }
  };

  const formatDate = (value: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-4 border-border bg-white shadow-soft rounded-[1.5rem]">
          <CardHeader className="border-b-4 border-border bg-muted rounded-t-[1.2rem]">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Plano e assinatura
            </CardTitle>
            <CardDescription>Veja o status do seu acesso e datas importantes.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Plano atual</p>
              <div className="flex items-center gap-3">
                {getStatusBadge()}
                <span className="text-lg font-black text-foreground">{planLabel}</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border-2 border-border bg-muted p-4">
                <p className="text-xs font-black uppercase text-muted-foreground">Trial termina em</p>
                <p className="mt-2 text-lg font-black text-foreground">{formatDate(billingInfo?.subscription.trialEndsAt ?? null)}</p>
              </div>
              <div className="rounded-2xl border-2 border-border bg-muted p-4">
                <p className="text-xs font-black uppercase text-muted-foreground">Cobrança / período atual</p>
                <p className="mt-2 text-lg font-black text-foreground">{formatDate(billingInfo?.subscription.currentPeriodEnd ?? null)}</p>
              </div>
            </div>

            {billingInfo?.subscription.cancelAtPeriodEnd && (
              <div className="rounded-2xl border-2 border-orange-300 bg-orange-50 p-4">
                <p className="text-sm font-semibold text-orange-800">
                  Sua assinatura está programada para encerrar ao fim do período atual.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-4 border-border bg-white shadow-soft rounded-[1.5rem]">
          <CardHeader className="border-b-4 border-border bg-muted rounded-t-[1.2rem]">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Forma de pagamento
            </CardTitle>
            <CardDescription>Cartão salvo no Stripe para cobrança do seu plano.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            {billingInfo?.paymentMethod ? (
              <div className="rounded-2xl border-2 border-border bg-muted p-4 space-y-2">
                <p className="text-sm font-black uppercase text-foreground">
                  {billingInfo.paymentMethod.brand?.toUpperCase()} final {billingInfo.paymentMethod.last4}
                </p>
                <p className="text-sm font-semibold text-muted-foreground">
                  Expira em {billingInfo.paymentMethod.expMonth?.toString().padStart(2, "0")}/{billingInfo.paymentMethod.expYear}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-border bg-muted p-4">
                <p className="text-sm font-semibold text-muted-foreground">
                  Nenhuma forma de pagamento encontrada no momento.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {(status === "free" || status === "past_due" || status === "cancelled") && (
                <Button onClick={handleUpgrade} disabled={redirecting} className="w-full h-12 rounded-full border-2 border-border bg-primary text-primary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                  {redirecting ? "Redirecionando..." : "Assinar / reativar premium"}
                </Button>
              )}

              {hasStripeCustomer && (
                <Button onClick={handlePortalSession} disabled={redirecting} className="w-full h-12 rounded-full border-2 border-border bg-secondary text-secondary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                  {redirecting ? "Abrindo..." : "Editar forma de pagamento"}
                </Button>
              )}

              {hasCancelableSubscription && !billingInfo?.subscription.cancelAtPeriodEnd && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full h-12 rounded-full border-2 border-destructive text-destructive font-black uppercase">
                      Cancelar assinatura
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-4 border-border rounded-[1.8rem] bg-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-black uppercase">Cancelar assinatura?</AlertDialogTitle>
                      <AlertDialogDescription className="font-semibold text-muted-foreground">
                        Sua assinatura ficará ativa até o fim do período pago e depois será encerrada.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-full border-2 border-border font-black uppercase">Voltar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelSubscription}
                        className="rounded-full border-2 border-border bg-destructive text-destructive-foreground font-black uppercase"
                        disabled={cancelling}
                      >
                        {cancelling ? "Cancelando..." : "Confirmar cancelamento"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showPricing && (
        <Card className="border-4 border-border bg-white shadow-soft rounded-[1.5rem]">
          <CardHeader className="border-b-4 border-border bg-muted rounded-t-[1.2rem]">
            <CardTitle>Plano Premium</CardTitle>
            <CardDescription>Acesso completo a todas as funcionalidades</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-primary">R$ 49,90</span>
                <span className="text-muted-foreground font-semibold">/mês</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" /><span className="font-semibold">Simulados ilimitados</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" /><span className="font-semibold">Questões geradas por IA</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" /><span className="font-semibold">Comunidade de estudos</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" /><span className="font-semibold">Suporte prioritário</span></li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
