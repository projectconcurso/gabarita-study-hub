import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Check, Sparkles, Crown, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GabaritosBalance } from "@/components/GabaritosBalance";

interface Package {
  id: string;
  name: string;
  amount: number;
  price_brl: number;
}

export default function LojaGabaritos() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadPackages();
    
    // Verificar parâmetros de URL para feedback de pagamento
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      toast.success('Pagamento realizado com sucesso! Seus Gabaritos foram adicionados.');
      // Limpar parâmetro da URL
      window.history.replaceState({}, '', '/dashboard/loja');
    } else if (urlParams.get('canceled') === 'true') {
      toast.info('Pagamento cancelado. Você pode tentar novamente quando quiser.');
      window.history.replaceState({}, '', '/dashboard/loja');
    }
  }, []);

  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('gabaritos_packages')
        .select('*')
        .eq('active', true)
        .order('amount', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Erro ao carregar pacotes:', error);
      toast.error('Erro ao carregar pacotes');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: Package) => {
    setPurchasing(pkg.id);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado para comprar');
        return;
      }

      toast.info('Criando sessão de pagamento...');

      // Chamar Edge Function para criar Stripe Checkout Session
      const { data, error } = await supabase.functions.invoke('create-checkout-gabaritos', {
        body: {
          packageId: pkg.id,
          userId: user.id,
        },
      });

      if (error) throw error;

      if (!data?.url) {
        throw new Error('Erro ao criar sessão de pagamento');
      }

      // Redirecionar para o Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Erro ao processar compra:', error);
      toast.error(error.message || 'Erro ao processar compra');
      setPurchasing(null);
    }
  };

  const benefits = [
    "Gere simulados ilimitados dentro do seu saldo",
    "Sem anúncios durante os simulados",
    "Acesso a todas as funcionalidades premium",
    "Suporte prioritário",
    "Gabaritos não expiram"
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black uppercase text-foreground mb-3 sm:text-5xl md:text-6xl">
          Loja de
          <span className="block text-primary">Gabaritos</span>
        </h1>
        <p className="text-lg font-semibold text-muted-foreground mb-6">
          Adquira Gabaritos e crie simulados ilimitados!
        </p>
        <div className="flex justify-center">
          <div className="rounded-[1.5rem] border-4 border-border bg-gradient-to-br from-yellow-100 to-orange-100 p-6 shadow-strong">
            <div className="text-center">
              <p className="text-sm font-black uppercase text-muted-foreground mb-2">Seu Saldo Atual</p>
              <GabaritosBalance size="lg" />
              <p className="text-xs font-semibold text-muted-foreground mt-2">
                Use seus Gabaritos para criar simulados personalizados!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Como funciona */}
      <Card className="mb-8 rounded-[1.5rem] border-4 border-border bg-[#f7cf3d] shadow-strong">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-xl font-black uppercase">
            <Sparkles className="h-5 w-5" />
            Como Funcionam os Gabaritos?
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-[1rem] border-2 border-border bg-white p-4">
              <h3 className="font-black uppercase mb-3 text-sm">Custo por Simulado:</h3>
              <div className="space-y-2">
                <div className="rounded-lg border-2 border-border bg-muted p-2">
                  <p className="font-bold text-xs">Cada questão = <span className="text-primary text-sm">2 Gabaritos</span></p>
                </div>
                <ul className="space-y-1 text-xs font-semibold">
                  <li className="flex items-center justify-between p-1 rounded bg-green-50 border border-green-200">
                    <span>5 questões</span>
                    <span className="text-green-700 font-black">10 Gabaritos</span>
                  </li>
                  <li className="flex items-center justify-between p-1 rounded bg-blue-50 border border-blue-200">
                    <span>10 questões</span>
                    <span className="text-blue-700 font-black">20 Gabaritos</span>
                  </li>
                  <li className="flex items-center justify-between p-1 rounded bg-purple-50 border border-purple-200">
                    <span>15 questões</span>
                    <span className="text-purple-700 font-black">30 Gabaritos</span>
                  </li>
                  <li className="flex items-center justify-between p-1 rounded bg-orange-50 border border-orange-200">
                    <span>20 questões</span>
                    <span className="text-orange-700 font-black">40 Gabaritos</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="rounded-[1rem] border-2 border-border bg-white p-4">
              <h3 className="font-black uppercase mb-3 text-sm">Benefícios:</h3>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="rounded-full border-2 border-border bg-green-100 p-0.5 flex-shrink-0">
                      <Check className="h-3 w-3 text-green-700" />
                    </div>
                    <span className="font-semibold text-xs">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pacotes Avulsos */}
      <div className="mb-8">
        <h2 className="text-3xl font-black uppercase mb-3 text-center">Pacotes Avulsos</h2>
        <p className="text-lg font-semibold text-muted-foreground mb-6 text-center">
          Compre Gabaritos sem compromisso. Seus Gabaritos não expiram!
        </p>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-10 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Card 
                key={pkg.id}
                className="rounded-[2rem] border-4 border-border bg-white shadow-strong hover:scale-[1.05] transition-transform"
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-4 border-yellow-600 bg-gradient-to-br from-yellow-400 to-orange-500 shadow-md">
                    <Coins className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-black uppercase">
                    {pkg.amount} Gabaritos
                  </CardTitle>
                  <CardDescription className="font-bold">
                    {pkg.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 text-center">
                    <div className="rounded-xl border-2 border-border bg-muted p-4">
                      <div className="flex items-end justify-center gap-2">
                        <span className="text-3xl font-black text-foreground">
                          R$ {pkg.price_brl.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-muted-foreground mt-1">
                        R$ {(pkg.price_brl / pkg.amount).toFixed(2).replace('.', ',')} por Gabarito
                      </div>
                    </div>
                  </div>
                  <Button
                    className="w-full rounded-full border-2 border-border bg-accent text-accent-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    onClick={() => handlePurchase(pkg)}
                    disabled={purchasing === pkg.id}
                  >
                    {purchasing === pkg.id ? 'Processando...' : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Comprar Agora
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Plano Premium */}
      <Card className="mb-8 rounded-[2rem] border-4 border-primary bg-white shadow-strong relative overflow-hidden transform hover:scale-[1.02] transition-transform">
        <div className="absolute -right-12 top-8 rotate-45 bg-primary px-16 py-2 text-xs font-black uppercase text-primary-foreground shadow-lg">
          Recomendado
        </div>
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-border bg-primary">
            <Crown className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-black uppercase">
            Plano Premium
          </CardTitle>
          <CardDescription className="text-lg font-bold">
            500 Gabaritos todo mês + Benefícios exclusivos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 text-center">
            <div className="rounded-[1.5rem] border-4 border-border bg-[#f7cf3d] p-6">
              <div className="flex items-end justify-center gap-2 mb-2">
                <span className="text-5xl font-black text-foreground">R$ 49,90</span>
                <span className="text-xl font-bold text-muted-foreground mb-2">/mês</span>
              </div>
              <p className="text-sm font-bold text-muted-foreground">7 dias grátis para testar!</p>
            </div>
          </div>
          <div className="rounded-[1.5rem] border-2 border-border bg-green-50 p-4 mb-6">
            <h4 className="font-black uppercase text-sm mb-3 text-center">Bônus de Boas-vindas:</h4>
            <div className="text-center">
              <p className="text-lg font-bold text-green-700 mb-1">
                <span className="text-2xl">100 Gabaritos</span> grátis
              </p>
              <p className="text-sm font-semibold text-green-600">
                Sem cobrança durante 7 dias de teste
              </p>
            </div>
          </div>
          <div className="rounded-[1.5rem] border-2 border-border bg-muted p-6 mb-6">
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="rounded-full border-2 border-border bg-green-100 p-1">
                  <Check className="h-5 w-5 text-green-700" />
                </div>
                <span className="font-bold"><span className="text-primary text-lg">500 Gabaritos</span> todo mês</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="rounded-full border-2 border-border bg-green-100 p-1">
                  <Check className="h-5 w-5 text-green-700" />
                </div>
                <span className="font-bold">Recursos exclusivos</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="rounded-full border-2 border-border bg-green-100 p-1">
                  <Check className="h-5 w-5 text-green-700" />
                </div>
                <span className="font-bold">Suporte prioritário</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="rounded-full border-2 border-border bg-green-100 p-1">
                  <Check className="h-5 w-5 text-green-700" />
                </div>
                <span className="font-bold">Sem anúncios</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="rounded-full border-2 border-border bg-green-100 p-1">
                  <Check className="h-5 w-5 text-green-700" />
                </div>
                <span className="font-bold">Cancele quando quiser</span>
              </li>
            </ul>
          </div>
          <Button 
            className="w-full rounded-full border-2 border-border bg-primary text-primary-foreground font-black uppercase text-lg py-6 shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <Crown className="h-5 w-5 mr-2" />
            Assinar Premium
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
