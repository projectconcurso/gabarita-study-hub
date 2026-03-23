import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
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

        <h1 className="text-4xl font-black mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <p className="text-muted-foreground">
            <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Informações que Coletamos</h2>
            <p>
              O Gabarit coleta informações para fornecer e melhorar nossos serviços. As informações coletadas incluem:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Informações de Conta:</strong> Nome, e-mail e senha (criptografada)</li>
              <li><strong>Dados de Uso:</strong> Questões respondidas, simulados realizados, desempenho e progresso</li>
              <li><strong>Informações de Pagamento:</strong> Processadas por terceiros (Stripe) - não armazenamos dados de cartão</li>
              <li><strong>Cookies e Tecnologias Similares:</strong> Para melhorar a experiência e exibir anúncios relevantes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">2. Como Usamos suas Informações</h2>
            <p>Utilizamos as informações coletadas para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer, manter e melhorar nossos serviços</li>
              <li>Personalizar sua experiência de estudo</li>
              <li>Processar pagamentos e gerenciar assinaturas</li>
              <li>Enviar notificações importantes sobre sua conta</li>
              <li>Exibir anúncios relevantes (apenas para usuários não-premium)</li>
              <li>Analisar o uso da plataforma para melhorias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Compartilhamento de Informações</h2>
            <p>
              Não vendemos suas informações pessoais. Podemos compartilhar informações apenas com:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Provedores de Serviço:</strong> Supabase (banco de dados), Stripe (pagamentos)</li>
              <li><strong>Redes de Publicidade:</strong> Google AdSense (apenas para usuários não-premium)</li>
              <li><strong>Requisitos Legais:</strong> Quando exigido por lei ou para proteger direitos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Cookies e Publicidade</h2>
            <p>
              Utilizamos cookies e tecnologias similares para:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Manter você conectado à sua conta</li>
              <li>Lembrar suas preferências</li>
              <li>Analisar o uso da plataforma</li>
              <li>Exibir anúncios personalizados via Google AdSense (usuários não-premium)</li>
            </ul>
            <p className="mt-4">
              <strong>Google AdSense:</strong> Utilizamos o Google AdSense para exibir anúncios. 
              O Google pode usar cookies para mostrar anúncios baseados em suas visitas a este e outros sites. 
              Você pode desativar anúncios personalizados em{" "}
              <a 
                href="https://www.google.com/settings/ads" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Configurações de Anúncios do Google
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Seus Direitos (LGPD)</h2>
            <p>
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Confirmar a existência de tratamento de dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados</li>
              <li>Solicitar a portabilidade de dados</li>
              <li>Revogar consentimento</li>
            </ul>
            <p className="mt-4">
              Para exercer seus direitos, entre em contato conosco através do e-mail: 
              <strong> contato@gabarit.com.br</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">6. Segurança</h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações, incluindo:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Criptografia de dados em trânsito (HTTPS)</li>
              <li>Criptografia de senhas</li>
              <li>Acesso restrito a dados pessoais</li>
              <li>Monitoramento de segurança contínuo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">7. Retenção de Dados</h2>
            <p>
              Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos 
              descritos nesta política, a menos que um período de retenção mais longo seja exigido por lei.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">8. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre 
              alterações significativas através do e-mail cadastrado ou por meio de aviso em nosso site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">9. Contato</h2>
            <p>
              Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato:
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
