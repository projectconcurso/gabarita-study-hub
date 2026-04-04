import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PoliticaPrivacidadeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PoliticaPrivacidadeModal({ open, onOpenChange }: PoliticaPrivacidadeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase">
            Política de Privacidade – Plataforma Gabarit
          </DialogTitle>
          <DialogDescription className="font-semibold">
            Em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD – Lei nº 13.709/2018)<br />
            Última atualização: 04 de abril de 2026
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="text-lg font-black uppercase mb-2">1. Controlador dos Dados</h3>
              <p className="text-muted-foreground leading-relaxed">
                A Gabarit atua como Controladora dos dados pessoais coletados por meio da plataforma, sendo responsável pelas decisões referentes ao tratamento desses dados.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">2. Dados Coletados</h3>
              
              <h4 className="text-base font-black uppercase mb-2 mt-4">2.1. Dados fornecidos pelo usuário</h4>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Ao se cadastrar ou utilizar a plataforma, podemos coletar:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Nome completo</li>
                <li>Data de nascimento</li>
                <li>Idade</li>
                <li>Cidade e Estado</li>
                <li>Nível de escolaridade</li>
                <li>Endereço de e-mail</li>
                <li>Outras informações que você voluntariamente fornecer</li>
              </ul>

              <h4 className="text-base font-black uppercase mb-2 mt-4">2.2. Dados coletados automaticamente</h4>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Durante a utilização da plataforma, coletamos automaticamente:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Desempenho em simulados e questões (acertos, erros, tempo de resposta)</li>
                <li>Estatísticas de uso e progresso nas trilhas de aprendizagem</li>
                <li>Interações com a plataforma (páginas acessadas, tempo de uso, cliques)</li>
                <li>Dados de dispositivo e navegação (IP, tipo de navegador, sistema operacional, identificadores de dispositivo)</li>
                <li>Dados de cookies e tecnologias semelhantes</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">3. Base Legal para o Tratamento dos Dados (LGPD)</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                O tratamento dos seus dados pessoais é realizado com base nas seguintes hipóteses legais:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Execução de contrato (quando necessário para prestar o serviço contratado);</li>
                <li>Consentimento do titular ou de seu responsável legal;</li>
                <li>Legítimo interesse da Gabarit (melhoria da plataforma, segurança, análise de desempenho e prevenção de fraudes);</li>
                <li>Cumprimento de obrigação legal ou regulatória.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">4. Finalidades do Tratamento</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Utilizamos seus dados pessoais para as seguintes finalidades:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Criar e gerenciar sua conta de usuário;</li>
                <li>Personalizar sua experiência de aprendizado;</li>
                <li>Fornecer estatísticas de desempenho e recomendações de estudo;</li>
                <li>Melhorar continuamente a plataforma e desenvolver novos recursos;</li>
                <li>Realizar comunicações importantes (como confirmações, atualizações e suporte);</li>
                <li>Processar pagamentos e gerenciar assinaturas;</li>
                <li>Garantir a segurança da plataforma e prevenir fraudes;</li>
                <li>Exibir anúncios (personalizados ou não), especialmente para usuários do plano gratuito;</li>
                <li>Cumprir obrigações legais e exercer nossos direitos.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">5. Tratamento de Dados de Menores de Idade</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                A Gabarit permite o uso por menores de 18 anos apenas com o consentimento expresso de um dos pais ou responsável legal.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-2">
                O tratamento dos dados de menores será realizado com medidas reforçadas de proteção, conforme exigido pela LGPD e pelo Estatuto da Criança e do Adolescente.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Não realizaremos publicidade comportamental direcionada a menores sem o consentimento prévio e específico do responsável legal.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">6. Compartilhamento de Dados</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                A Gabarit poderá compartilhar seus dados pessoais apenas com terceiros nas seguintes situações:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Prestadores de serviços essenciais (plataformas de pagamento, hospedagem em nuvem, serviços de tecnologia e análise de dados);</li>
                <li>Ferramentas de análise e marketing (quando autorizado);</li>
                <li>Redes de publicidade, respeitando as regras de consentimento;</li>
                <li>Autoridades judiciais, policiais ou regulatórias, quando exigido por lei.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                A Gabarit não comercializa dados pessoais de seus usuários.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">7. Publicidade e Uso de Dados para Marketing</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>7.1. Usuários do plano gratuito poderão visualizar anúncios na plataforma.</p>
                <p>7.2. Os anúncios podem ser não personalizados ou personalizados, conforme o seu consentimento e a legislação vigente.</p>
                <p>7.3. Você pode, a qualquer momento:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Solicitar a não utilização de seus dados para fins de publicidade personalizada;</li>
                  <li>Revogar seu consentimento para tratamento de dados.</li>
                </ul>
                <p className="mt-2">
                  Para menores de idade, priorizamos a exibição de publicidade não personalizada, e qualquer publicidade comportamental dependerá de consentimento específico do responsável legal.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">8. Cookies e Tecnologias Semelhantes</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Utilizamos cookies e tecnologias semelhantes para:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Melhorar a navegação e o funcionamento da plataforma;</li>
                <li>Personalizar conteúdo e recomendações;</li>
                <li>Analisar o uso e o desempenho da plataforma;</li>
                <li>Medir a efetividade de anúncios.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Você pode gerenciar suas preferências de cookies nas configurações do seu navegador ou na própria plataforma.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">9. Armazenamento e Medidas de Segurança</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Seus dados são armazenados em servidores seguros, localizados no Brasil ou em países que oferecem nível adequado de proteção, conforme a LGPD.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Adotamos medidas técnicas e administrativas razoáveis para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">10. Seus Direitos como Titular dos Dados (LGPD)</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Você pode exercer os seguintes direitos a qualquer momento:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Confirmar a existência de tratamento de seus dados;</li>
                <li>Acessar seus dados pessoais;</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
                <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;</li>
                <li>Solicitar a portabilidade dos dados;</li>
                <li>Revogar o consentimento, quando este for a base legal do tratamento;</li>
                <li>Solicitar informações sobre as entidades com as quais compartilhamos seus dados;</li>
                <li>Apresentar petição contra o controlador perante a ANPD.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">11. Retenção de Dados</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Manteremos seus dados pessoais pelo tempo necessário para cumprir as finalidades para as quais foram coletados, ou pelo período exigido por lei.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Após o encerramento da conta ou quando não forem mais necessários, os dados serão eliminados ou anonimizados de forma segura.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">12. Alterações nesta Política de Privacidade</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                A Gabarit poderá atualizar esta Política de Privacidade periodicamente.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                As alterações serão comunicadas por meio de aviso na plataforma ou por e-mail. O uso continuado da plataforma após a atualização implica aceitação das novas condições.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">13. Contato e Encarregado de Proteção de Dados (DPO)</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Para exercer seus direitos, tirar dúvidas ou fazer reclamações relacionadas ao tratamento de dados pessoais, entre em contato com nosso Encarregado de Proteção de Dados (DPO):
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>E-mail:</strong> <a href="mailto:suporte@gabarit.com.br" className="text-primary hover:underline font-semibold">suporte@gabarit.com.br</a>
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
