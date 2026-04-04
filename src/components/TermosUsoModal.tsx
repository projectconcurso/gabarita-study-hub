import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermosUsoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermosUsoModal({ open, onOpenChange }: TermosUsoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase">
            Termo de Uso – Plataforma Gabarit
          </DialogTitle>
          <DialogDescription className="font-semibold">
            Última atualização: 04 de abril de 2026
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="text-lg font-black uppercase mb-2">1. Aceitação dos Termos</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar ou utilizar a Plataforma Gabarit, você declara ter lido, compreendido e concordado integralmente com estes Termos de Uso e com a Política de Privacidade.
                Caso não concorde com qualquer disposição, você deve interromper imediatamente o acesso e a utilização da plataforma.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">2. Elegibilidade</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                A Plataforma Gabarit pode ser utilizada por:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Pessoas maiores de 18 (dezoito) anos; ou</li>
                <li>Menores de 18 (dezoito) anos, desde que devidamente autorizados e com o consentimento expresso de seus pais ou responsáveis legais.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                O responsável legal é integralmente responsável por todos os atos praticados pelo menor na plataforma, inclusive quanto a eventuais obrigações financeiras.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">3. Cadastro do Usuário</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Para utilizar as funcionalidades completas da Plataforma, é necessário realizar um cadastro, fornecendo informações verdadeiras, completas e atualizadas, tais como:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Nome completo</li>
                <li>Data de nascimento</li>
                <li>Cidade e Estado</li>
                <li>Nível de escolaridade</li>
                <li>Endereço de e-mail válido</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                É de sua exclusiva responsabilidade manter seus dados sempre atualizados. A Gabarit poderá, a qualquer momento, suspender ou excluir a conta de usuários que fornecerem informações falsas, incompletas ou inconsistentes.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">4. Funcionalidades da Plataforma</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                A Gabarit é uma plataforma educacional que oferece ferramentas de apoio aos estudos, incluindo:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Simulados e banco de questões</li>
                <li>Estatísticas e análises de desempenho</li>
                <li>Trilhas de aprendizagem personalizadas</li>
                <li>Outros recursos que venham a ser adicionados periodicamente</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2 mb-2">
                O acesso às funcionalidades pode ser realizado por meio de:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Plano Gratuito (com limitações)</li>
                <li>Planos de Assinatura pagos</li>
                <li>Compra de moedas virtuais ("Gabaritos")</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">5. Planos, Pagamentos e Moedas Virtuais ("Gabaritos")</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>5.1. Os "Gabaritos" são moedas virtuais de uso exclusivo dentro da Plataforma Gabarit.</p>
                <p>5.2. Os Gabaritos não possuem valor monetário fora da plataforma e não podem ser convertidos em dinheiro, transferidos ou resgatados.</p>
                <p>5.3. Eles podem ser adquiridos por compra avulsa ou como parte de planos de assinatura.</p>
                <p>5.4. Gabaritos utilizados ou expirados não serão reembolsados, independentemente do motivo.</p>
                <p>5.5. A Gabarit se reserva o direito de alterar os preços dos planos e pacotes de Gabaritos, mediante comunicação prévia ao usuário.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">6. Plano Gratuito e Publicidade</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>6.1. Os usuários do Plano Gratuito poderão visualizar anúncios durante a utilização da plataforma.</p>
                <p>6.2. Os anúncios poderão ser não personalizados ou personalizados, conforme o consentimento do usuário e as regras de privacidade vigentes.</p>
                <p>6.3. A exibição de publicidade é essencial para viabilizar a oferta do plano gratuito.</p>
                <p>6.4. Usuários de planos pagos (premium) poderão ter redução significativa ou remoção total de anúncios, conforme as condições do plano contratado.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">7. Cancelamento e Rescisão</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>7.1. O usuário poderá cancelar sua assinatura a qualquer momento por meio da própria plataforma. O acesso às funcionalidades pagas será mantido até o final do período já pago.</p>
                <p>7.2. A Gabarit poderá, a seu critério exclusivo, suspender ou encerrar a conta do usuário, sem direito a reembolso, nos seguintes casos:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Violação destes Termos de Uso ou da Política de Privacidade;</li>
                  <li>Uso fraudulento ou abusivo da plataforma;</li>
                  <li>Tentativa de manipulação, invasão ou exploração de falhas do sistema;</li>
                  <li>Conduta que cause prejuízo à Gabarit ou a outros usuários.</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">8. Obrigações e Responsabilidades do Usuário</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                O usuário se compromete a:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Utilizar a plataforma de forma ética, legal e em conformidade com estes Termos;</li>
                <li>Não compartilhar sua conta ou credenciais de acesso com terceiros;</li>
                <li>Não realizar engenharia reversa, descompilação ou qualquer tentativa de acesso ao código-fonte;</li>
                <li>Não utilizar meios automatizados (bots, scripts etc.) para acessar ou interagir com a plataforma;</li>
                <li>Manter a confidencialidade de sua senha e notificar imediatamente a Gabarit em caso de uso não autorizado de sua conta.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">9. Propriedade Intelectual</h3>
              <p className="text-muted-foreground leading-relaxed">
                Todo o conteúdo disponibilizado na Plataforma Gabarit (questões, simulados, textos, imagens, vídeos, design, software etc.) é protegido por direitos autorais e outras leis de propriedade intelectual. É expressamente proibida qualquer reprodução, distribuição, modificação ou uso comercial sem autorização prévia e por escrito da Gabarit.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">10. Limitação de Responsabilidade</h3>
              <p className="text-muted-foreground leading-relaxed">
                A Gabarit é uma ferramenta de apoio educacional e não garante, em hipótese alguma, aprovação em exames, vestibulares, concursos públicos ou qualquer outro certame.
                A plataforma é fornecida "no estado em que se encontra", sem garantias de que estará livre de interrupções, erros ou falhas técnicas.
                A Gabarit não se responsabiliza por eventuais danos diretos ou indiretos decorrentes do uso ou da impossibilidade de uso da plataforma.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">11. Alterações dos Termos de Uso</h3>
              <p className="text-muted-foreground leading-relaxed">
                A Gabarit poderá alterar estes Termos de Uso a qualquer momento. As alterações serão comunicadas por meio de aviso na própria plataforma ou por e-mail.
                O uso continuado da plataforma após a publicação das alterações implica aceitação automática dos novos Termos.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">12. Conteúdo Gerado pelo Usuário</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Caso a plataforma permita que você publique, envie, compartilhe ou carregue qualquer conteúdo (tais como comentários, sugestões, correções de questões, materiais complementares ou outros), você declara e garante que:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>É o titular dos direitos sobre esse conteúdo ou possui todas as autorizações necessárias para publicá-lo;</li>
                <li>O conteúdo não viola direitos de terceiros (incluindo direitos autorais, de imagem, privacidade ou honra);</li>
                <li>O conteúdo não contém material ofensivo, ilegal, discriminatório, difamatório, obsceno ou que incentive violência ou ódio.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Ao publicar conteúdo na plataforma, você concede à Gabarit uma licença mundial, não exclusiva, gratuita, sublicenciável e transferível para usar, reproduzir, modificar, adaptar, publicar, traduzir, distribuir e exibir tal conteúdo, na medida necessária para o funcionamento, promoção e melhoria da plataforma.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                A Gabarit não se obriga a publicar ou manter qualquer conteúdo gerado por usuários e poderá removê-lo a qualquer momento, sem aviso prévio, caso viole estes Termos ou o Código de Conduta.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">13. Código de Conduta</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Para manter um ambiente saudável, respeitoso e propício ao aprendizado, você se compromete a não:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Publicar ou transmitir conteúdo ofensivo, discriminatório, racista, xenofóbico, homofóbico, misógino, violento ou que incite ódio contra qualquer pessoa ou grupo;</li>
                <li>Assediar, ameaçar, intimidar ou praticar bullying contra outros usuários;</li>
                <li>Divulgar informações falsas, enganosas ou que possam prejudicar terceiros;</li>
                <li>Utilizar a plataforma para fins comerciais não autorizados, spam, publicidade não solicitada ou envio em massa de mensagens;</li>
                <li>Compartilhar ou solicitar dados pessoais de outros usuários;</li>
                <li>Realizar qualquer conduta que viole a lei brasileira ou estes Termos.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                O descumprimento do Código de Conduta poderá resultar em advertência, suspensão temporária ou exclusão definitiva da conta, sem direito a reembolso, a critério exclusivo da Gabarit.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">14. Contato</h3>
              <p className="text-muted-foreground leading-relaxed">
                Em caso de dúvidas sobre estes Termos de Uso, você pode entrar em contato conosco pelo e-mail: <a href="mailto:suporte@gabarit.com.br" className="text-primary hover:underline font-semibold">suporte@gabarit.com.br</a>
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black uppercase mb-2">15. Lei Aplicável e Foro</h3>
              <p className="text-muted-foreground leading-relaxed">
                Estes Termos de Uso são regidos e interpretados de acordo com as leis da República Federativa do Brasil.
                Para dirimir quaisquer controvérsias decorrentes destes Termos ou da utilização da Plataforma, fica eleito o foro da Comarca de Macapá – AP, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
