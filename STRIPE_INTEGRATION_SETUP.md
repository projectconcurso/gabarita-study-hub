# Integração Stripe - Guia de Configuração

## Resumo da Implementação

Este documento descreve a integração do sistema de pagamento Stripe com a plataforma gabarit.ai, incluindo trial de 3 dias, cobrança automática mensal de R$ 49,90 e bloqueio de acesso em caso de falha de pagamento.

## Arquitetura Implementada

### 1. Banco de Dados (Supabase)

#### Migration: `20250310_add_stripe_subscription_fields.sql`
Adiciona os seguintes campos à tabela `profiles`:
- `stripe_customer_id` (TEXT): ID do cliente no Stripe
- `stripe_subscription_id` (TEXT): ID da assinatura no Stripe
- `subscription_status` (TEXT): Status da assinatura ('trial', 'active', 'past_due', 'cancelled')
- `trial_ends_at` (TIMESTAMP): Data de término do período de teste
- `subscription_started_at` (TIMESTAMP): Data de início da assinatura

### 2. Edge Functions (Supabase)

#### `create-stripe-subscription/index.ts`
**Responsabilidade**: Criar cliente e assinatura no Stripe durante o signup
**Fluxo**:
1. Recebe `userId`, `email` e `name` do frontend
2. Cria um cliente no Stripe via API
3. Cria uma assinatura com trial de 3 dias
4. Atualiza o perfil do usuário no Supabase com IDs do Stripe
5. Retorna URL de checkout se pagamento for necessário

**Variáveis de Ambiente Necessárias**:
- `STRIPE_SECRET_KEY`: Chave secreta do Stripe
- `STRIPE_PRICE_ID`: ID do produto/preço mensal no Stripe (R$ 49,90)
- `SUPABASE_URL`: URL do Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase

#### `stripe-webhook/index.ts`
**Responsabilidade**: Processar webhooks do Stripe e atualizar status de assinatura
**Eventos Tratados**:
- `customer.subscription.created`: Assinatura criada
- `customer.subscription.updated`: Assinatura atualizada
- `customer.subscription.deleted`: Assinatura cancelada
- `invoice.payment_succeeded`: Pagamento bem-sucedido
- `invoice.payment_failed`: Pagamento falhou
- `customer.subscription.trial_will_end`: Aviso 3 dias antes do fim do trial

**Validação**: Verifica assinatura HMAC-SHA256 do webhook

#### `create-portal-session/index.ts`
**Responsabilidade**: Criar sessão do portal de cliente do Stripe
**Uso**: Permite que usuários gerenciem assinatura, atualizem método de pagamento ou cancelem

#### `create-checkout-session/index.ts`
**Responsabilidade**: Criar sessão de checkout para upgrade/reativação de assinatura
**Uso**: Redireciona usuários para checkout quando trial expira ou assinatura é cancelada

### 3. Frontend (React)

#### `Auth.tsx` - Modificações
- `handleSignup` agora chama `create-stripe-subscription` após signup bem-sucedido
- Redireciona para checkout do Stripe se pagamento for necessário
- Redireciona para dashboard se trial começar sem pagamento imediato

#### `Simulados.tsx` - Modificações
- `createSimulado` valida `subscription_status` antes de criar simulado
- Bloqueia acesso se:
  - Trial expirou (`subscription_status === 'trial'` e `trial_ends_at < now`)
  - Pagamento falhou (`subscription_status === 'past_due'`)
  - Assinatura cancelada (`subscription_status === 'cancelled'`)
- Redireciona para `/dashboard/billing` em caso de bloqueio

#### `gerar-questoes/index.ts` - Modificações
- Agora requer `userId` no body da requisição
- Valida `subscription_status` antes de gerar questões
- Bloqueia geração se trial expirou ou pagamento falhou

#### `Billing.tsx` - Nova Página
- Exibe status atual da assinatura
- Mostra dias restantes do trial
- Permite gerenciar assinatura (atualizar pagamento, cancelar)
- Permite fazer upgrade ou reativar assinatura
- Exibe detalhes do plano Premium

#### `App.tsx` - Modificações
- Adiciona rota `/dashboard/billing` para a página de Billing

### 4. Fluxo de Usuário

#### Signup (Novo Usuário)
1. Usuário preenche formulário de signup
2. Conta criada no Supabase Auth
3. Perfil criado automaticamente via trigger
4. Edge Function `create-stripe-subscription` é chamada
5. Cliente criado no Stripe
6. Assinatura criada com trial de 3 dias
7. Usuário redirecionado para checkout ou dashboard

#### Durante o Trial (3 dias)
- Usuário tem acesso completo a simulados
- `subscription_status = 'trial'`
- `trial_ends_at = now + 3 dias`

#### Fim do Trial
- Stripe tenta cobrar automaticamente
- Se bem-sucedido: `subscription_status = 'active'`
- Se falhar: `subscription_status = 'past_due'`
- Webhook atualiza status no Supabase

#### Usuário com Pagamento Falho
- Não consegue criar simulados
- Vê mensagem de erro
- Redirecionado para página de Billing
- Pode atualizar método de pagamento via portal do cliente

## Configuração Necessária

### 1. Stripe Dashboard
- [ ] Criar produto "Premium" com preço de R$ 49,90/mês
- [ ] Copiar `STRIPE_PRICE_ID` do produto
- [ ] Gerar `STRIPE_SECRET_KEY` (chave secreta da API)
- [ ] Configurar webhook endpoint para `https://seu-dominio.com/functions/v1/stripe-webhook`
- [ ] Copiar `STRIPE_WEBHOOK_SECRET` do webhook

### 2. Supabase
- [ ] Executar migration `20250310_add_stripe_subscription_fields.sql`
- [ ] Adicionar variáveis de ambiente:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PRICE_ID`
  - `STRIPE_WEBHOOK_SECRET`

### 3. Variáveis de Ambiente (.env)
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=seu-anon-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Testes Recomendados

### Teste 1: Signup com Trial
1. Criar nova conta
2. Verificar que `subscription_status = 'trial'` no Supabase
3. Verificar que `trial_ends_at` está 3 dias no futuro
4. Criar simulado (deve funcionar)

### Teste 2: Trial Expirado
1. Usar Stripe Test Clock para simular passagem de tempo
2. Verificar que `trial_ends_at` passou
3. Tentar criar simulado (deve bloquear)
4. Verificar mensagem de erro

### Teste 3: Pagamento Bem-Sucedido
1. Completar checkout após trial
2. Webhook `invoice.payment_succeeded` deve atualizar status para 'active'
3. Usuário deve conseguir criar simulados

### Teste 4: Pagamento Falho
1. Usar cartão de teste que falha (4000000000000002)
2. Webhook `invoice.payment_failed` deve atualizar status para 'past_due'
3. Usuário não deve conseguir criar simulados
4. Usuário deve conseguir atualizar método de pagamento via portal

## Cartões de Teste Stripe

- **Sucesso**: 4242 4242 4242 4242
- **Falha**: 4000 0000 0000 0002
- **Requer Autenticação**: 4000 0025 0000 3155

## Próximos Passos

1. [ ] Configurar Stripe Dashboard
2. [ ] Adicionar variáveis de ambiente
3. [ ] Executar migration no Supabase
4. [ ] Testar fluxo completo de signup
5. [ ] Testar trial expirado
6. [ ] Testar pagamento bem-sucedido
7. [ ] Testar pagamento falho
8. [ ] Configurar emails de notificação (opcional)
9. [ ] Implementar página de sucesso após checkout (opcional)
10. [ ] Adicionar analytics de conversão (opcional)

## Notas Importantes

- O Stripe tenta cobrar automaticamente quando o trial termina
- Se o pagamento falhar, o Stripe tenta novamente nos próximos dias (Smart Retries)
- O webhook é essencial para manter o status de assinatura sincronizado
- Sempre validar assinatura HMAC do webhook antes de processar
- Usar Test Mode do Stripe para testes antes de ir para produção
