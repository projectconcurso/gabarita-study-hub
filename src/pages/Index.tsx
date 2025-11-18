import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Users, TrendingUp, Target, MessageCircle, Award } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import featureAi from "@/assets/feature-ai.png";
import featureSocial from "@/assets/feature-social.png";
import featureProgress from "@/assets/feature-progress.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Gabarita
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              Como Funciona
            </a>
            <a href="#community" className="text-muted-foreground hover:text-foreground transition-colors">
              Comunidade
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost">Entrar</Button>
            <Button className="bg-gradient-hero hover:opacity-90 transition-opacity">
              Começar Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-block px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full text-secondary font-medium text-sm">
                ✨ Prepare-se com Inteligência Artificial
              </div>
              <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                Sua jornada para a
                <span className="block bg-gradient-success bg-clip-text text-transparent">
                  aprovação começa aqui
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Simulados personalizados, comunidade ativa e IA que te guia para o sucesso em concursos e ENEM.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="bg-gradient-hero hover:opacity-90 transition-opacity text-lg h-14 px-8 shadow-medium">
                  Começar Agora
                </Button>
                <Button size="lg" variant="outline" className="text-lg h-14 px-8">
                  Ver Como Funciona
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-6">
                <div>
                  <div className="text-3xl font-bold text-primary">10k+</div>
                  <div className="text-sm text-muted-foreground">Estudantes ativos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-secondary">50k+</div>
                  <div className="text-sm text-muted-foreground">Simulados realizados</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">95%</div>
                  <div className="text-sm text-muted-foreground">Taxa de satisfação</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-hero opacity-20 blur-3xl rounded-full"></div>
              <img
                src={heroImage}
                alt="Plataforma Gabarita"
                className="relative rounded-2xl shadow-strong w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h3 className="text-3xl md:text-4xl font-bold">
              Recursos que fazem a diferença
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tecnologia de ponta para potencializar seus estudos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 space-y-4 hover:shadow-medium transition-all hover:-translate-y-1 bg-gradient-card border-border/50">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <img src={featureAi} alt="IA" className="w-12 h-12" />
              </div>
              <h4 className="text-2xl font-bold">Simulados Inteligentes</h4>
              <p className="text-muted-foreground">
                IA gera questões inéditas personalizadas para seu nível e objetivo. Aprenda com feedback instantâneo e evolutivo.
              </p>
              <ul className="space-y-2 pt-2">
                <li className="flex items-start gap-2">
                  <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Questões adaptativas ao seu perfil</span>
                </li>
                <li className="flex items-start gap-2">
                  <Brain className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Explicações detalhadas da IA</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 space-y-4 hover:shadow-medium transition-all hover:-translate-y-1 bg-gradient-card border-border/50">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center">
                <img src={featureSocial} alt="Social" className="w-12 h-12" />
              </div>
              <h4 className="text-2xl font-bold">Comunidade Ativa</h4>
              <p className="text-muted-foreground">
                Conecte-se com outros estudantes, compartilhe conquistas e motive-se mutuamente na jornada.
              </p>
              <ul className="space-y-2 pt-2">
                <li className="flex items-start gap-2">
                  <Users className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Rede social de estudos</span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Chat em tempo real</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 space-y-4 hover:shadow-medium transition-all hover:-translate-y-1 bg-gradient-card border-border/50">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center">
                <img src={featureProgress} alt="Progresso" className="w-12 h-12" />
              </div>
              <h4 className="text-2xl font-bold">Acompanhe sua Evolução</h4>
              <p className="text-muted-foreground">
                Dashboards completos com métricas, gráficos e insights para otimizar seu desempenho.
              </p>
              <ul className="space-y-2 pt-2">
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Análise detalhada de performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <Award className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Gamificação e conquistas</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h3 className="text-3xl md:text-4xl font-bold">Como funciona</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Em 3 passos simples, comece sua preparação inteligente
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto shadow-medium">
                1
              </div>
              <h4 className="text-xl font-bold">Crie seu Perfil</h4>
              <p className="text-muted-foreground">
                Cadastre-se e defina seu objetivo, cargo desejado e áreas de estudo
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-success rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto shadow-medium">
                2
              </div>
              <h4 className="text-xl font-bold">Faça Simulados</h4>
              <p className="text-muted-foreground">
                IA gera questões personalizadas e você recebe feedback instantâneo
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto shadow-medium">
                3
              </div>
              <h4 className="text-xl font-bold">Evolua e Conecte-se</h4>
              <p className="text-muted-foreground">
                Acompanhe seu progresso e interaja com a comunidade
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6 text-white">
            <h3 className="text-3xl md:text-5xl font-bold">
              Pronto para garantir sua aprovação?
            </h3>
            <p className="text-xl opacity-90">
              Junte-se a milhares de estudantes que já estão transformando seus resultados com o Gabarita
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg h-14 px-8 shadow-strong">
                Começar Gratuitamente
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg h-14 px-8">
                Falar com Especialista
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold">Gabarita</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Plataforma inteligente de preparação para concursos e ENEM
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Produto</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Segurança</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Empresa</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Carreiras</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Suporte</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 Gabarita. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
