import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Check, Sparkles, Crown } from "lucide-react";
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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2">
              Loja de Gabaritos
            </h1>
            <p className="text-muted-foreground">
              Adquira Gabaritos para gerar seus simulados personalizados
            </p>
          </div>
          <GabaritosBalance size="lg" />
        </div>
      </div>

      {/* Como funciona */}
      <Card className="mb-8 border-2 border-border bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Como funcionam os Gabaritos?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold mb-2 text-sm">Custo por Simulado:</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• <strong>5 a 20 questões:</strong> 5 Gabaritos</li>
                <li>• <strong>21 a 40 questões:</strong> 10 Gabaritos</li>
                <li>• <strong>41 a 60 questões:</strong> 15 Gabaritos</li>
                <li>• <strong>61 a 80 questões:</strong> 20 Gabaritos</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-sm">Benefícios:</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                {benefits.slice(0, 5).map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plano Premium */}
      <Card className="mb-8 border-4 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-4 py-1 text-xs font-bold rounded-bl-lg">
          MELHOR VALOR
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Crown className="h-6 w-6 text-yellow-600" />
            Plano Premium
          </CardTitle>
          <CardDescription>
            500 Gabaritos mensais + Benefícios exclusivos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-4xl font-black text-gray-900">R$ 29,90</span>
            <span className="text-gray-600 mb-1">/mês</span>
          </div>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-600" />
              <span><strong>500 Gabaritos</strong> todo mês (não cumulativos)</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-600" />
              <span>Acesso a recursos exclusivos</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-600" />
              <span>Suporte prioritário</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-600" />
              <span>Sem anúncios</span>
            </li>
          </ul>
          <Button 
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold"
            size="lg"
          >
            <Crown className="h-5 w-5 mr-2" />
            Assinar Premium
          </Button>
        </CardContent>
      </Card>

      {/* Pacotes Avulsos */}
      <div className="mb-8">
        <h2 className="text-2xl font-black mb-4">Pacotes Avulsos</h2>
        <p className="text-muted-foreground mb-6">
          Compre Gabaritos avulsos sem compromisso. Seus Gabaritos não expiram!
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
                className="border-2 border-border hover:border-primary transition-all hover:shadow-lg"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-600" />
                    {pkg.amount} Gabaritos
                  </CardTitle>
                  <CardDescription>
                    {pkg.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black text-gray-900">
                        R$ {pkg.price_brl.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      R$ {(pkg.price_brl / pkg.amount).toFixed(2).replace('.', ',')} por Gabarito
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(pkg)}
                    disabled={purchasing === pkg.id}
                  >
                    {purchasing === pkg.id ? 'Processando...' : 'Comprar Agora'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Trial */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-600" />
            Período de Teste (Trial)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">
            Novos usuários recebem <strong>50 Gabaritos grátis</strong> para testar a plataforma por <strong>3 dias</strong>!
            Crie sua conta e comece a estudar agora mesmo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
