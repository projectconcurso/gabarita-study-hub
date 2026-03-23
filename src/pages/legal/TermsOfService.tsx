import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <h1 className="text-4xl font-black mb-8">Termos de Uso</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <p className="text-muted-foreground">
            <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o Gabarit, você concorda com estes Termos de Uso e nossa Política de Privacidade. 
              Se você não concorda com algum termo, não utilize nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">2. Descrição do Serviço</h2>
            <p>
              O Gabarit é uma plataforma educacional que oferece:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Banco de questões para concursos públicos</li>
              <li>Simulados personalizados</li>
              <li>Sistema de moeda virtual (Gabaritos)</li>
              <li>Plano Premium com recursos adicionais</li>
              <li>Conteúdo gratuito com exibição de anúncios</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Cadastro e Conta</h2>
            <p>
              Para usar nossos serviços, você deve:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ter pelo menos 18 anos ou consentimento dos pais/responsáveis</li>
              <li>Fornecer informações verdadeiras e atualizadas</li>
              <li>Manter a segurança de sua senha</li>
              <li>Não compartilhar sua conta com terceiros</li>
              <li>Notificar-nos imediatamente sobre uso não autorizado</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Sistema de Gabaritos (Moeda Virtual)</h2>
            <p>
              Gabaritos são a moeda virtual da plataforma:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Podem ser adquiridos através de compra ou assistindo vídeos recompensados</li>
              <li>São usados para criar simulados e acessar recursos</li>
              <li>Não possuem valor monetário real</li>
              <li>Não são transferíveis entre contas</li>
              <li>Não são reembolsáveis</li>
              <li>Podem expirar ou ser removidos conforme políticas da plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Plano Premium</h2>
            <p>
              O Plano Premium oferece:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acesso ilimitado a simulados</li>
              <li>Experiência sem anúncios</li>
              <li>Recursos exclusivos</li>
              <li>Cancelamento a qualquer momento</li>
            </ul>
            <p className="mt-4">
              <strong>Pagamento e Renovação:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cobranças processadas via Stripe</li>
              <li>Renovação automática até cancelamento</li>
              <li>Reembolsos conforme política de cancelamento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">6. Publicidade</h2>
            <p>
              Usuários não-premium visualizarão anúncios:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Exibidos via Google AdSense e outras redes</li>
              <li>Podem ser personalizados com base em seus interesses</li>
              <li>Você pode gerenciar preferências de anúncios nas configurações do Google</li>
              <li>Assinantes Premium não visualizam anúncios</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">7. Uso Aceitável</h2>
            <p>
              Você concorda em NÃO:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usar a plataforma para fins ilegais</li>
              <li>Compartilhar conteúdo protegido por direitos autorais</li>
              <li>Tentar hackear ou comprometer a segurança</li>
              <li>Criar múltiplas contas para burlar limitações</li>
              <li>Usar bots ou automação não autorizada</li>
              <li>Revender ou redistribuir conteúdo da plataforma</li>
              <li>Clicar fraudulentamente em anúncios</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">8. Propriedade Intelectual</h2>
            <p>
              Todo conteúdo da plataforma (questões, design, código, marca) é protegido por direitos autorais 
              e propriedade intelectual. Você não pode copiar, modificar ou distribuir sem autorização expressa.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">9. Limitação de Responsabilidade</h2>
            <p>
              O Gabarit é fornecido "como está". Não garantimos:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Aprovação em concursos</li>
              <li>Disponibilidade ininterrupta do serviço</li>
              <li>Ausência de erros no conteúdo</li>
            </ul>
            <p className="mt-4">
              Não nos responsabilizamos por danos indiretos, lucros cessantes ou perda de dados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">10. Cancelamento e Suspensão</h2>
            <p>
              Podemos suspender ou encerrar sua conta se:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violar estes Termos de Uso</li>
              <li>Usar a plataforma de forma fraudulenta</li>
              <li>Não pagar assinatura devida</li>
            </ul>
            <p className="mt-4">
              Você pode cancelar sua conta a qualquer momento nas configurações.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">11. Modificações</h2>
            <p>
              Reservamos o direito de modificar estes termos a qualquer momento. 
              Alterações significativas serão notificadas por e-mail ou aviso na plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">12. Lei Aplicável</h2>
            <p>
              Estes termos são regidos pelas leis brasileiras. 
              Qualquer disputa será resolvida no foro da comarca de [Sua Cidade], Brasil.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">13. Contato</h2>
            <p>
              Para dúvidas sobre estes Termos de Uso:
            </p>
            <ul className="list-none space-y-2">
              <li><strong>E-mail:</strong> contato@gabarit.com.br</li>
              <li><strong>Site:</strong> www.gabarit.com.br</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
