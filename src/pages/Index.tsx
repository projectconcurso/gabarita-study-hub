import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp, Target, MessageCircle, Award, Sparkles, Brain } from "lucide-react";
import { FocaLogo } from "@/components/FocaMascot";
import featureAi from "@/assets/feature-ai.png";
import featureSocial from "@/assets/feature-social.png";
import featureProgress from "@/assets/feature-progress.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-4 z-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between rounded-[1.7rem] border-4 border-border bg-white/95 px-5 py-3 shadow-strong backdrop-blur-sm">
            <FocaLogo />
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-black uppercase text-foreground transition-colors hover:text-primary">
                Recursos
              </a>
              <a href="#how-it-works" className="text-sm font-black uppercase text-foreground transition-colors hover:text-primary">
                Como Funciona
              </a>
              <a href="#community" className="text-sm font-black uppercase text-foreground transition-colors hover:text-primary">
                Comunidade
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="outline" className="rounded-full border-2 border-border bg-white px-6 text-foreground hover:bg-muted hover:text-foreground font-black uppercase">
                  Entrar
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="rounded-full border-2 border-border bg-primary text-primary-foreground px-6 font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                  Começar Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        <div className="container mx-auto px-4 pb-20 pt-12 md:pb-32 md:pt-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground border-2 border-border rounded-full text-sm font-black uppercase tracking-wide shadow-soft">
                <Sparkles className="w-4 h-4" />
                Estude com estratégia
              </div>
              <h2 className="text-5xl md:text-7xl font-black leading-[0.95] text-foreground uppercase">
                O jeito mais
                <span className="block text-primary">
                  vibrante de
                </span>
                <span className="block text-accent">
                  estudar melhor
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-xl font-semibold">
                Simulados com IA, comunidade, progresso visual e uma experiência com personalidade para concursos e ENEM.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/signup">
                  <Button size="lg" className="text-lg h-14 px-8 rounded-full border-2 border-border bg-accent text-accent-foreground shadow-medium hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none">
                    Começar Agora
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" className="text-lg h-14 px-8 rounded-full border-2 border-border bg-white hover:bg-muted">
                    Como Funciona
                  </Button>
                </a>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-6 max-w-xl">
                <div className="rounded-[1.5rem] border-2 border-border bg-white px-4 py-5 shadow-soft">
                  <div className="text-3xl font-black text-primary">10k+</div>
                  <div className="text-sm font-semibold text-muted-foreground">Estudantes ativos</div>
                </div>
                <div className="rounded-[1.5rem] border-2 border-border bg-white px-4 py-5 shadow-soft">
                  <div className="text-3xl font-black text-secondary">50k+</div>
                  <div className="text-sm font-semibold text-muted-foreground">Simulados</div>
                </div>
                <div className="rounded-[1.5rem] border-2 border-border bg-white px-4 py-5 shadow-soft">
                  <div className="text-3xl font-black text-accent">95%</div>
                  <div className="text-sm font-semibold text-muted-foreground">Satisfação</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:pl-8">
              <div className="col-span-2 rounded-[2rem] border-4 border-border bg-primary p-5 shadow-strong">
                <div className="grid gap-4 rounded-[1.5rem] border-2 border-border bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="inline-flex rounded-full border-2 border-border bg-[#f7cf3d] px-3 py-1 text-xs font-black uppercase tracking-wide text-foreground">
                        Painel inteligente
                      </div>
                      <h3 className="text-3xl font-black uppercase leading-none text-foreground">
                        Estudo com ritmo, meta e clareza
                      </h3>
                    </div>
                    <div className="rounded-[1.2rem] border-2 border-border bg-secondary px-4 py-3 text-right shadow-soft">
                      <div className="text-xs font-black uppercase tracking-wide text-secondary-foreground">Hoje</div>
                      <div className="text-2xl font-black text-secondary-foreground">+18 pts</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-[1.3rem] border-2 border-border bg-accent p-4 text-accent-foreground shadow-soft">
                      <div className="text-xs font-black uppercase tracking-wide">Foco</div>
                      <div className="mt-2 text-3xl font-black leading-none">87%</div>
                      <div className="mt-2 text-xs font-semibold opacity-90">Ritmo semanal</div>
                    </div>
                    <div className="rounded-[1.3rem] border-2 border-border bg-[#f7cf3d] p-4 text-foreground shadow-soft">
                      <div className="text-xs font-black uppercase tracking-wide">Meta</div>
                      <div className="mt-2 text-3xl font-black leading-none">32</div>
                      <div className="mt-2 text-xs font-semibold">questões hoje</div>
                    </div>
                    <div className="rounded-[1.3rem] border-2 border-border bg-muted p-4 text-foreground shadow-soft">
                      <div className="text-xs font-black uppercase tracking-wide">Rede</div>
                      <div className="mt-2 text-3xl font-black leading-none">12</div>
                      <div className="mt-2 text-xs font-semibold">amigos ativos</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-[1.2fr_0.8fr] gap-3">
                    <div className="rounded-[1.3rem] border-2 border-border bg-foreground p-4 text-background shadow-soft">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wide">Próximo simulado</span>
                        <span className="rounded-full border-2 border-background px-3 py-1 text-[10px] font-black uppercase tracking-wide">IA ativa</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="h-3 w-3/4 rounded-full bg-background" />
                        <div className="h-3 w-1/2 rounded-full bg-background/80" />
                        <div className="h-3 w-2/3 rounded-full bg-background/60" />
                      </div>
                    </div>
                    <div className="rounded-[1.3rem] border-2 border-border bg-white p-4 shadow-soft">
                      <div className="text-xs font-black uppercase tracking-wide text-muted-foreground">Checklist</div>
                      <div className="mt-3 space-y-2">
                        <div className="rounded-full border-2 border-border bg-secondary px-3 py-2 text-xs font-black uppercase text-secondary-foreground">Revisão</div>
                        <div className="rounded-full border-2 border-border bg-accent px-3 py-2 text-xs font-black uppercase text-accent-foreground">Questões</div>
                        <div className="rounded-full border-2 border-border bg-[#f7cf3d] px-3 py-2 text-xs font-black uppercase text-foreground">Mural</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-[2rem] border-4 border-border bg-accent p-6 text-accent-foreground shadow-medium">
                <div className="text-sm font-black uppercase tracking-wide">IA</div>
                <div className="mt-3 text-3xl font-black leading-none">Questões novas</div>
                <div className="mt-3 text-sm font-semibold opacity-90">Personalizadas para o seu objetivo.</div>
              </div>
              <div className="rounded-[2rem] border-4 border-border bg-[#f7cf3d] p-6 text-foreground shadow-medium">
                <div className="text-sm font-black uppercase tracking-wide">Comunidade</div>
                <div className="mt-3 text-3xl font-black leading-none">Estude junto</div>
                <div className="mt-3 text-sm font-semibold">Troque metas, progresso e motivação.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h3 className="text-3xl md:text-5xl font-black uppercase">
              Recursos que fazem a diferença
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-semibold">
              Uma experiência visual forte, simples de usar e centrada na rotina de estudos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 space-y-4 bg-white border-4 border-border shadow-medium rounded-[2rem]">
              <div className="w-16 h-16 bg-primary rounded-[1.2rem] flex items-center justify-center border-2 border-border">
                <img src={featureAi} alt="IA" className="w-12 h-12" />
              </div>
              <h4 className="text-2xl font-black uppercase">Simulados Inteligentes</h4>
              <p className="text-muted-foreground font-semibold">
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

            <Card className="p-8 space-y-4 bg-white border-4 border-border shadow-medium rounded-[2rem]">
              <div className="w-16 h-16 bg-secondary rounded-[1.2rem] flex items-center justify-center border-2 border-border">
                <img src={featureSocial} alt="Social" className="w-12 h-12" />
              </div>
              <h4 className="text-2xl font-black uppercase">Comunidade Ativa</h4>
              <p className="text-muted-foreground font-semibold">
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

            <Card className="p-8 space-y-4 bg-white border-4 border-border shadow-medium rounded-[2rem]">
              <div className="w-16 h-16 bg-accent rounded-[1.2rem] flex items-center justify-center border-2 border-border">
                <img src={featureProgress} alt="Progresso" className="w-12 h-12" />
              </div>
              <h4 className="text-2xl font-black uppercase">Acompanhe sua Evolução</h4>
              <p className="text-muted-foreground font-semibold">
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
            <h3 className="text-3xl md:text-5xl font-black uppercase">Como funciona</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-semibold">
              Em 3 passos simples, comece sua preparação inteligente
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4 rounded-[2rem] border-4 border-border bg-white p-8 shadow-medium">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-2xl font-black text-white mx-auto border-2 border-border">
                1
              </div>
              <h4 className="text-xl font-black uppercase">Crie seu Perfil</h4>
              <p className="text-muted-foreground font-semibold">
                Cadastre-se e defina seu objetivo, cargo desejado e áreas de estudo
              </p>
            </div>

            <div className="text-center space-y-4 rounded-[2rem] border-4 border-border bg-white p-8 shadow-medium">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-2xl font-black text-white mx-auto border-2 border-border">
                2
              </div>
              <h4 className="text-xl font-black uppercase">Faça Simulados</h4>
              <p className="text-muted-foreground font-semibold">
                IA gera questões personalizadas e você recebe feedback instantâneo
              </p>
            </div>

            <div className="text-center space-y-4 rounded-[2rem] border-4 border-border bg-white p-8 shadow-medium">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-2xl font-black text-white mx-auto border-2 border-border">
                3
              </div>
              <h4 className="text-xl font-black uppercase">Evolua e Conecte-se</h4>
              <p className="text-muted-foreground font-semibold">
                Acompanhe seu progresso e interaja com a comunidade
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6 rounded-[2.5rem] border-4 border-border bg-primary px-8 py-14 text-white shadow-strong">
            <div className="mx-auto inline-flex rounded-full border-2 border-border bg-[#f7cf3d] px-5 py-2 text-sm font-black uppercase tracking-wide text-foreground">
              Tamo junto nos estudos
            </div>
            <h3 className="text-3xl md:text-5xl font-black uppercase leading-tight">
              Pronto para garantir sua aprovação?
            </h3>
            <p className="text-xl font-semibold text-white/90">
              Junte-se a milhares de estudantes que já estão transformando seus resultados com o Gabarit
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/signup">
                <Button size="lg" className="bg-[#f7cf3d] text-foreground border-2 border-border hover:bg-[#f7cf3d] text-lg h-14 px-8 shadow-medium hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none rounded-full">
                  Começar Gratuitamente
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-2 border-white text-white bg-transparent hover:bg-white/10 text-lg h-14 px-8 rounded-full">
                Falar com Especialista
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t-4 border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <FocaLogo />
              <p className="text-sm text-muted-foreground font-semibold">
                Plataforma inteligente de preparação para concursos e ENEM
              </p>
            </div>
            <div>
              <h5 className="font-black uppercase mb-4">Produto</h5>
              <ul className="space-y-2 text-sm text-muted-foreground font-semibold">
                <li><a href="#" className="hover:text-foreground transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Segurança</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-black uppercase mb-4">Empresa</h5>
              <ul className="space-y-2 text-sm text-muted-foreground font-semibold">
                <li><a href="#" className="hover:text-foreground transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Carreiras</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-black uppercase mb-4">Suporte</h5>
              <ul className="space-y-2 text-sm text-muted-foreground font-semibold">
                <li><a href="#" className="hover:text-foreground transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t-4 border-border mt-8 pt-8 text-center text-sm text-muted-foreground font-semibold">
            © 2025 Gabarit. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
